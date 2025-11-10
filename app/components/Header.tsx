"use client";

import React from 'react';
import { useAuthStore } from '@/app/store/auth';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api';
import NotificationBell from './NotificationBell';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
      localStorage.removeItem('access-token');
      localStorage.removeItem('client');
      localStorage.removeItem('uid');
      router.push('/login');
    }
  };

  return (
    <header className="bg-card text-card-foreground">
      <div className="flex items-center justify-between h-full border-b px-8 py-4">
        <h2 className="text-xl font-bold">在宅勤務申請システム</h2>
        {isAuthenticated && user && (
          <div className="flex items-center space-x-4">
            <Label>{user.email}</Label>
            <NotificationBell />
            <Button variant="outline" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;