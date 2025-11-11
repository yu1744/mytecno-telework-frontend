"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  History,
  User,
  CheckSquare,
  Shield,
  FileSearch,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const personalMenuItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "ダッシュボード",
    roles: ["applicant", "approver", "admin"],
  },
  {
    href: "/apply",
    icon: FileText,
    label: "在宅勤務申請",
    roles: ["applicant", "approver", "admin"],
  },
  {
    href: "/history",
    icon: History,
    label: "申請履歴",
    roles: ["applicant", "approver", "admin"],
  },
  {
    href: "/profile",
    icon: User,
    label: "プロフィール",
    roles: ["applicant", "approver", "admin"],
  },
];

const adminMenuItems = [
  {
    href: "/approvals",
    icon: CheckSquare,
    label: "承認待ち一覧",
    roles: ["approver", "admin"],
  },
  {
    href: "/admin/applications",
    icon: FileSearch,
    label: "申請一覧",
    roles: ["admin"],
  },
  {
    href: "/admin",
    icon: Shield,
    label: "管理者画面",
    roles: ["admin"],
  },
];

const NavigationMenu = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name;
  const pathname = usePathname();

  const filteredPersonalMenuItems = personalMenuItems.filter((item) =>
    role ? item.roles.includes(role) : false
  );

  const filteredAdminMenuItems = adminMenuItems.filter((item) =>
    role ? item.roles.includes(role) : false
  );

  return (
    <div className="w-64 h-full border-r">
      <div className="p-4">
        <h2 className="text-lg font-semibold tracking-tight">メニュー</h2>
      </div>
      <Separator />
      <nav className="flex flex-col p-2 space-y-1">
        <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground">
          自分用メニュー
        </h3>
        {filteredPersonalMenuItems.map((item) => (
          <Link href={item.href} key={item.href} passHref>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
        {role === "admin" && filteredAdminMenuItems.length > 0 && (
          <>
            <Separator className="my-2" />
            <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground">
              管理者用メニュー
            </h3>
            {filteredAdminMenuItems.map((item) => (
              <Link href={item.href} key={item.href} passHref>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </>
        )}
      </nav>
    </div>
  );
};

export default NavigationMenu;
