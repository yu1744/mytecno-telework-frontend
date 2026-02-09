'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getNotifications, getUnreadNotifications, markNotificationAsRead } from '@/app/lib/api';
import type { AppNotification } from '@/app/types/application';
import Link from 'next/link';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const notificationAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.debug('[NotificationBell] Fetching notifications...');
        const response = await getNotifications();
        console.debug('[NotificationBell] Success:', {
          status: response.status,
          dataCount: Array.isArray(response.data) ? response.data.length : 'not an array'
        });
        // 最近の10件に制限
        const recentNotifications = Array.isArray(response.data)
          ? response.data.slice(0, 10)
          : [];
        setNotifications(recentNotifications);
      } catch (error: any) {
        console.error('[NotificationBell] Fetch failed:', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url
        });
        setNotifications([]);
      }
    };

    fetchNotifications();

    // 定期的に通知を更新（30秒ごと）
    const interval = setInterval(fetchNotifications, 30000);
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

  const handleNotificationClick = async (id: number) => {
    try {
      // 楽観的更新: ステータスを既読に変更
      setNotifications((prev: AppNotification[]) =>
        prev.map((n: AppNotification) => n.id === id ? { ...n, read: true } : n)
      );

      // バックエンドAPIを呼び出し
      await markNotificationAsRead(id);
      console.debug(`[NotificationBell] Notification ${id} marked as read`);
    } catch (error) {
      console.error(`[NotificationBell] Failed to mark notification ${id} as read:`, error);
      // エラーが発生した場合は再取得して状態を最新にする
      const response = await getNotifications();
      setNotifications(Array.isArray(response.data) ? response.data.slice(0, 10) : []);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
              通知
            </div>
            <div className="border-t border-gray-200"></div>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Link
                  href={notification.link || '#'}
                  key={notification.id}
                  onClick={() => {
                    if (!notification.read) {
                      handleNotificationClick(notification.id);
                    }
                    setIsOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm transition-colors duration-200 ${notification.read
                    ? 'text-gray-400 bg-gray-50/50'
                    : 'text-gray-800 font-medium hover:bg-blue-50'
                    } hover:bg-gray-100`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                    <span className={notification.read ? '' : 'pl-0'}>
                      {notification.message}
                    </span>
                  </div>
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