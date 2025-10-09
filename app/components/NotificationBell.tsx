"use client";

import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Popover, List, ListItem, ListItemText, Typography, Divider, Box, ListItemButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  link: string;
}

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: APIエンドポイントが実装されたら差し替える
        // const response = await api.get('/notifications');
        // setNotifications(response.data);

        // ダミーデータで代用
        const dummyNotifications: Notification[] = [
          { id: 1, message: '2023-10-26の在宅勤務申請が承認されました。', read: false, link: '/history' },
          { id: 2, message: '山田太郎さんから新たな在宅勤務申請がありました。', read: false, link: '/approvals' },
          { id: 3, message: '2023-10-25の在宅勤務申請が却下されました。', read: true, link: '/history' },
        ];
        setNotifications(dummyNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    // ポーリング実装の例（必要に応じて有効化）
    // const interval = setInterval(fetchNotifications, 60000); // 60秒ごと
    // return () => clearInterval(interval);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // TODO: APIエンドポイントが実装されたら差し替える
      // await api.patch(`/notifications/${notification.id}/read`);
      const newNotifications = notifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      );
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
    
    // 関連ページに遷移
    if (notification.link) {
      router.push(notification.link);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 360 }}>
          <Typography sx={{ p: 2, fontWeight: 'bold' }}>通知</Typography>
          <Divider />
          <List sx={{ p: 0 }}>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    disablePadding
                    key={notification.id}
                  >
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{ backgroundColor: notification.read ? 'inherit' : 'action.hover' }}
                    >
                      <ListItemText primary={notification.message} />
                    </ListItemButton>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="新しい通知はありません。" />
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>
    </div>
  );
};

export default NotificationBell;