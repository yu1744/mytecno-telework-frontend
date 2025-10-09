"use client";

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuthStore } from '@/app/store/auth';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import Cookies from 'js-cookie';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.delete('/auth/sign_out');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearAuth();
      Cookies.remove('access-token');
      Cookies.remove('client');
      Cookies.remove('uid');
      router.push('/login');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - 240px)`,
        ml: `240px`,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          在宅勤務申請システム
        </Typography>
        {isAuthenticated && user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: 2 }}>{user.email}</Typography>
            <NotificationBell />
            <Button color="inherit" onClick={handleLogout}>
              ログアウト
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;