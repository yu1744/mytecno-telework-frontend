"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted || !isAuthenticated) {
    return null; // Or a loading spinner
  }

  const userRole = user?.role?.name;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // 権限がない場合はダッシュボードにリダイレクト
    router.push('/dashboard');
    return null; // リダイレクト中に何も表示しない
  }

  // 権限チェックを通過した場合、子コンポーネントをレンダリング
  return <>{children}</>;
};

export default PrivateRoute;
