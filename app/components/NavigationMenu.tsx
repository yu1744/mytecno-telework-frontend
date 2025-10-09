"use client";

import React from "react";
import {
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Divider,
} from "@mui/material";
import Link from "next/link";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import ApprovalIcon from "@mui/icons-material/Approval";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuthStore } from "@/app/store/auth";

const drawerWidth = 240;

const NavigationMenu = () => {
	const user = useAuthStore((state) => state.user);
	const role = user?.role?.name;

	const applicantMenuItems = (
		<>
			<ListItem disablePadding>
				<ListItemButton component={Link} href="/dashboard">
					<ListItemIcon>
						<HomeIcon />
					</ListItemIcon>
					<ListItemText primary="ダッシュボード" />
				</ListItemButton>
			</ListItem>
			<ListItem disablePadding>
				<ListItemButton component={Link} href="/apply">
					<ListItemIcon>
						<DescriptionIcon />
					</ListItemIcon>
					<ListItemText primary="在宅勤務申請" />
				</ListItemButton>
			</ListItem>
			<ListItem disablePadding>
				<ListItemButton component={Link} href="/history">
					<ListItemIcon>
						<HistoryIcon />
					</ListItemIcon>
					<ListItemText primary="申請履歴" />
				</ListItemButton>
			</ListItem>
			<ListItem disablePadding>
				<ListItemButton component={Link} href="/profile">
					<ListItemIcon>
						<AccountCircleIcon />
					</ListItemIcon>
					<ListItemText primary="プロフィール" />
				</ListItemButton>
			</ListItem>
		</>
	);

	const approverMenuItems = (
		<>
			{applicantMenuItems}
			<ListItem disablePadding>
				<ListItemButton component={Link} href="/approvals">
					<ListItemIcon>
						<ApprovalIcon />
					</ListItemIcon>
					<ListItemText primary="承認待ち一覧" />
				</ListItemButton>
			</ListItem>
		</>
	);

	const adminMenuItems = (
		<>
			{approverMenuItems}
			<ListItem disablePadding>
				<ListItemButton component={Link} href="/admin">
					<ListItemIcon>
						<AdminPanelSettingsIcon />
					</ListItemIcon>
					<ListItemText primary="管理者画面" />
				</ListItemButton>
			</ListItem>
		</>
	);

	return (
		<Drawer
			variant="permanent"
			sx={{
				width: drawerWidth,
				flexShrink: 0,
				[`& .MuiDrawer-paper`]: {
					width: drawerWidth,
					boxSizing: "border-box",
					bgcolor: "#f5f5f5",
				},
			}}
		>
			<Toolbar />
			<Divider />
			<List>
				{role === "admin" && adminMenuItems}
				{role === "approver" && approverMenuItems}
				{role === "applicant" && applicantMenuItems}
			</List>
		</Drawer>
	);
};

export default NavigationMenu;
