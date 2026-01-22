"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Home,
	LayoutDashboard,
	FileText,
	History,
	User,
	CheckSquare,
	Shield,
	FileSearch,
	Users,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// 申請機能メニュー（全ユーザー）
const applicationMenuItems = [
	{
		href: "/dashboard",
		icon: Home,
		label: "申請ダッシュボード",
	},
	{
		href: "/apply",
		icon: FileText,
		label: "新規申請",
	},
	{
		href: "/history",
		icon: History,
		label: "申請履歴",
	},
	{
		href: "/profile",
		icon: User,
		label: "プロフィール",
	},
];

// 承認機能メニュー（承認者・管理者）
const approvalMenuItems = [
	{
		href: "/approval-dashboard",
		icon: LayoutDashboard,
		label: "承認ダッシュボード",
		roles: ["approver", "admin"],
	},
	{
		href: "/approvals",
		icon: CheckSquare,
		label: "承認待ち",
		roles: ["approver", "admin"],
	},
	{
		href: "/admin/applications",
		icon: FileSearch,
		label: "全申請一覧",
		roles: ["admin", "approver"],
	},
];

// 管理機能メニュー（管理者のみ）
const adminMenuItems = [
	{
		href: "/admin",
		icon: Shield,
		label: "管理ダッシュボード",
		roles: ["admin"],
	},
	{
		href: "/admin/users",
		icon: Users,
		label: "ユーザー管理",
		roles: ["admin"],
	},
];

const NavigationMenu = () => {
	const user = useAuthStore((state) => state.user);
	const pathname = usePathname();

	if (!user) {
		return null;
	}

	const role = user?.role?.name;

	// 承認機能と管理機能をフィルタ
	const filteredApprovalMenuItems = approvalMenuItems.filter((item) =>
		role ? item.roles.includes(role) : false
	);

	const filteredAdminMenuItems = adminMenuItems.filter((item) =>
		role ? item.roles.includes(role) : false
	);

	const renderMenuItem = (item: {
		href: string;
		icon: React.ElementType;
		label: string;
		description?: string;
	}) => {
		const isActive = pathname === item.href;
		const Icon = item.icon;

		return (
			<Link href={item.href} key={item.href} passHref>
				<Button
					variant={isActive ? "secondary" : "ghost"}
					className={`w-full justify-start h-auto py-3 px-4 ${isActive ? "bg-primary/10 text-primary" : "hover:bg-gray-100 dark:hover:bg-gray-800"
						}`}
				>
					<div className="flex items-start gap-3 w-full">
						<Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
						<div className="flex flex-col items-start text-left">
							<span className="font-medium">{item.label}</span>
							{item.description && (
								<span className="text-xs text-muted-foreground mt-0.5">
									{item.description}
								</span>
							)}
						</div>
					</div>
				</Button>
			</Link>
		);
	};

	return (
		<nav className="w-64 h-full border-r bg-white dark:bg-gray-950 overflow-y-auto mobile-scroll">
			<div className="flex flex-col gap-2 p-3">
				{/* 申請機能セクション */}
				<div>
					<div className="px-3 py-2">
						<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							申請機能
						</h3>
					</div>
					<div className="flex flex-col gap-1">
						{applicationMenuItems.map(renderMenuItem)}
					</div>
				</div>

				{/* 承認機能セクション */}
				{filteredApprovalMenuItems.length > 0 && (
					<>
						<Separator className="my-2" />
						<div>
							<div className="px-3 py-2">
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									承認機能
								</h3>
							</div>
							<div className="flex flex-col gap-1">
								{filteredApprovalMenuItems.map(renderMenuItem)}
							</div>
						</div>
					</>
				)}

				{/* 管理機能セクション */}
				{filteredAdminMenuItems.length > 0 && (
					<>
						<Separator className="my-2" />
						<div>
							<div className="px-3 py-2">
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									管理機能
								</h3>
							</div>
							<div className="flex flex-col gap-1">
								{filteredAdminMenuItems.map(renderMenuItem)}
							</div>
						</div>
					</>
				)}
			</div>
		</nav>
	);
};

export default NavigationMenu;
