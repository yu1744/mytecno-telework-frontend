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
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const menuItems = [
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
  {
    href: "/approvals",
    icon: CheckSquare,
    label: "承認待ち一覧",
    roles: ["approver", "admin"],
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

  const filteredMenuItems = menuItems.filter((item) =>
    role ? item.roles.includes(role) : false
  );

  return (
    <div className="w-64 h-full border-r">
      <div className="p-4">
        <h2 className="text-lg font-semibold tracking-tight">メニュー</h2>
      </div>
      <Separator />
      <nav className="flex flex-col p-2 space-y-1">
        {filteredMenuItems.map((item) => (
          <Link href={item.href} key={item.href} passHref>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default NavigationMenu;
