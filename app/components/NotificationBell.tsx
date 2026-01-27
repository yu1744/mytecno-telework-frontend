'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadNotifications } from '@/app/lib/api';
import type { AppNotification } from '@/app/types/application';
import Link from 'next/link';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const notificationAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        console.debug('[NotificationBell] Fetching unread notifications...');
        const response = await getUnreadNotifications();
        console.debug('[NotificationBell] Success:', response);
        console.debug('[NotificationBell] response.data:', response.data);
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } catch (error: unknown) {
        // APIエラーは既にコンソールに出力されているので、ここでは静かに処理する
        // 通知の取得に失敗してもUIは表示し続ける
        console.debug('[NotificationBell] Fetch failed:', {
          message: error instanceof Error ? error.message : String(error),
          status: (error instanceof Error && 'response' in error && (error as { response?: { status?: number } }).response?.status) || null,
          data: error.response?.data,
        });
        setNotifications([]);
      }
    };

    fetchUnreadNotifications();
    
    // 定期的に通知を更新（30秒ごと）
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationAreaRef.current &&
        !notificationAreaRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={notificationAreaRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <div className={unreadCount > 0 ? 'bell-shake' : ''}>
          <Bell className="h-6 w-6 text-gray-600" />
        </div>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          className={`notification-area z-10 bg-white rounded-md shadow-lg
            fixed left-4 right-4 top-20 w-auto
            md:absolute md:right-0 md:left-auto md:top-full md:mt-2 md:w-80
            ${isOpen ? 'notification-area-open' : 'notification-area-closed'}
          `}
        >
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 font-semibold">
              未読の通知
            </div>
            <div className="border-t border-gray-200"></div>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link
                  href={notification.link || '#'}
                  key={notification.id}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {notification.message}
                </Link>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                新しい通知はありません
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;