"use client";

import React from 'react';
import { useAuthStore } from '@/app/store/auth';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import api from '@/app/lib/api';
import NotificationBell from './NotificationBell';
import MobileNavigation from './MobileNavigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LogOut } from 'lucide-react';

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

      // NextAuthのセッションもクリア
      await signOut({ redirect: false });

      router.push('/login');
    }
  };

  return (
    <header className="bg-card text-card-foreground">
      <div className="flex items-center justify-between h-full border-b px-4 md:px-8 py-3 md:py-4">
        <h2 className="text-lg md:text-xl font-bold truncate">在宅勤務申請システム</h2>
        {isAuthenticated && user && (
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:block">
              <Label>{user.email}</Label>
            </div>
            <NotificationBell />
            <Button variant="outline" onClick={handleLogout} className="hidden sm:inline-flex">
              ログアウト
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout} className="sm:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
            <MobileNavigation />
          </div>
        )}
      </div>
    </header >
  );
};

export default Header;