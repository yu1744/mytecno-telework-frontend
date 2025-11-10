"use client";

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationAsRead } from '@/app/lib/api';
import { AppNotification } from '@/app/types/application';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 60秒ごとに通知をポーリング
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: AppNotification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
        const newNotifications = notifications.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        );
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
    
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>通知</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              {notification.message}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>新しい通知はありません。</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;