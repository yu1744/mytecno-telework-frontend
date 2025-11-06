"use client";

import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Popover, List, ListItem, ListItemText, Typography, Divider, Box, ListItemButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationAsRead } from '@/app/lib/api';
import { AppNotification } from '@/app/types/application';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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