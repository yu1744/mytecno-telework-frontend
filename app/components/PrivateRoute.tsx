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

  const userRole = user?.role?.name;

  useEffect(() => {
    if (isMounted) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // 権限がない場合はダッシュボードにリダイレクト
        router.push('/dashboard');
      }
    }
  }, [isMounted, isAuthenticated, userRole, allowedRoles, router]);

  if (!isMounted || !isAuthenticated || (allowedRoles && userRole && !allowedRoles.includes(userRole))) {
    return null; // Or a loading spinner
  }

  // 権限チェックを通過した場合、子コンポーネントをレンダリング
  return <>{children}</>;
};

export default PrivateRoute;
