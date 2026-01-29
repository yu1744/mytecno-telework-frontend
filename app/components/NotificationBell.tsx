'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { getUnreadNotifications, markNotificationAsRead } from '@/app/lib/api';
import type { AppNotification } from '@/app/types/application';

const NotificationBell = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 通知を取得
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getUnreadNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(target) &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // clickイベントを使用（mousedownではなく）
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  // 通知をクリック
  const handleNotificationClick = useCallback(async (notification: AppNotification) => {
    console.log('[NotificationBell] Notification clicked:', notification.id);

    // 先にローカルステートを更新
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    setIsOpen(false);

    // バックグラウンドでAPI呼び出し
    try {
      await markNotificationAsRead(notification.id);
      console.log('[NotificationBell] Marked as read');
    } catch (error) {
      console.error('[NotificationBell] Failed to mark as read:', error);
      // 失敗しても通知を再取得
      fetchNotifications();
    }

    // ページ遷移
    if (notification.link) {
      router.push(notification.link);
    }
  }, [router, fetchNotifications]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative"
        type="button"
      >
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
          ref={dropdownRef}
          className="notification-area notification-area-open absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10"
        >
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 font-semibold">
              未読の通知
            </div>
            <div className="border-t border-gray-200"></div>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {notification.message}
                </button>
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