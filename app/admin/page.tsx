"use client";

import React, { useEffect, useState } from "react";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Select,
	MenuItem,
	Button,
	Tabs,
	Tab,
	Card,
	CardContent,
	CardHeader,
	Modal,
	TextField,
} from "@mui/material";
import Link from "next/link";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { ja } from "date-fns/locale";
import toast, { Toaster } from "react-hot-toast";
import api from "../lib/api";
import { User, Role, Department } from "../types/user";
import PrivateRoute from "../components/PrivateRoute";
import UsageAnalytics from "../components/UsageAnalytics";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import RegisterUserModal from "../components/RegisterUserModal";
import DeleteUserModal from "../components/DeleteUserModal";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ mt: 3 }}>{children}</Box>}
		</div>
	);
}

const AdminPageContent = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [tabValue, setTabValue] = useState(0);
	const [open, setOpen] = useState(false);
	const [registerModalOpen, setRegisterModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);

	useEffect(() => {
		const dummyUsers: User[] = [
			{ id: 1, name: '山田 太郎', email: 'yamada@example.com', hired_date: '2020-04-01', role_id: 1, department_id: 1, role: { id: 1, name: '管理者' }, department: { id: 1, name: '開発部' } },
			{ id: 2, name: '鈴木 一郎', email: 'suzuki@example.com', hired_date: '2021-04-01', role_id: 2, department_id: 2, role: { id: 2, name: '承認者' }, department: { id: 2, name: '営業部' } },
			{ id: 3, name: '佐藤 花子', email: 'sato@example.com', hired_date: '2019-04-01', role_id: 3, department_id: 1, role: { id: 3, name: '申請者' }, department: { id: 1, name: '開発部' } },
		];
		const dummyRoles: Role[] = [
			{ id: 1, name: '管理者' },
			{ id: 2, name: '承認者' },
			{ id: 3, name: '申請者' },
		];
		const dummyDepartments: Department[] = [
			{ id: 1, name: '開発部' },
			{ id: 2, name: '営業部' },
			{ id: 3, name: '人事部' },
		];
		setUsers(dummyUsers);
		setRoles(dummyRoles);
		setDepartments(dummyDepartments);
		setLoading(false);
	}, []);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleRoleChange = (userId: number, newRoleId: number) => {
		setUsers(
			users.map((user) =>
				user.id === userId ? { ...user, role_id: newRoleId } : user
			)
		);
	};

	const handleOpenModal = (user: User) => {
		setSelectedUser(user);
		setOpen(true);
	};

	const handleCloseModal = () => {
		setSelectedUser(null);
		setOpen(false);
		setEffectiveDate(null);
	};

	const handleUpdateUser = async () => {
		if (!selectedUser) return;

		const params = {
			user_id: selectedUser.id,
			new_department_id: selectedUser.department_id,
			new_role_id: selectedUser.role_id,
			effective_date: effectiveDate
				? effectiveDate.toISOString().split("T")[0]
				: null,
		};

		try {
			await api.post("/admin/user_info_changes", params);
			toast.success("ユーザー情報の更新を予約しました。");
			handleCloseModal();
		} catch (error) {
			console.error("Failed to update user info", error);
			toast.error("更新予約に失敗しました。");
		}
	};

	const handleExportCsv = () => {
		console.log("Export CSV");
		// 機能ロジックは実装しない
	};

	const handleOpenDeleteModal = (user: User) => {
		setUserToDelete(user);
		setDeleteModalOpen(true);
	};

	const handleCloseDeleteModal = () => {
		setUserToDelete(null);
		setDeleteModalOpen(false);
	};

	const handleDeleteUser = () => {
		if (!userToDelete) return;
		setUsers(users.filter((user) => user.id !== userToDelete.id));
		toast.success(`${userToDelete.name}さんを削除しました。`);
		handleCloseDeleteModal();
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
			<Box>
				<Toaster />
				<Typography variant="h4" sx={{ mb: 4 }}>
					管理者ページ
				</Typography>

				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						aria-label="admin tabs"
						indicatorColor="secondary"
						textColor="inherit"
					>
						<Tab label="ユーザー管理" />
						<Tab label="利用状況" />
					</Tabs>
				</Box>

				<TabPanel value={tabValue} index={0}>
					<Box
						sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 2 }}
					>
						<Button variant="contained" color="success">
							新規登録
						</Button>
						<Button
							variant="contained"
							color="success"
							onClick={() => setRegisterModalOpen(true)}
						>
							新規登録
						</Button>
						<Button
							component={Link}
							href="/admin/integrations"
							variant="contained"
							color="primary"
						>
							外部連携設定
						</Button>
						<Button
							component={Link}
							href="/admin/personnel_changes"
							variant="contained"
							color="secondary"
						>
							人事異動の予約・管理
						</Button>
					</Box>
					{error && <Typography color="error">{error}</Typography>}
					{!error && users.length === 0 ? (
						<EmptyState message="表示できるユーザーがいません。" />
					) : (
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell
											sx={{
												backgroundColor: (theme) => theme.palette.grey[100],
												fontWeight: "bold",
											}}
										>
											名前
										</TableCell>
										<TableCell
											sx={{
												backgroundColor: (theme) => theme.palette.grey[100],
												fontWeight: "bold",
											}}
										>
											部署
										</TableCell>
										<TableCell
											sx={{
												backgroundColor: (theme) => theme.palette.grey[100],
												fontWeight: "bold",
											}}
										>
											権限
										</TableCell>
										<TableCell
											sx={{
												backgroundColor: (theme) => theme.palette.grey[100],
												fontWeight: "bold",
											}}
										>
											アクション
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{users.map((user) => (
										<TableRow
											key={user.id}
											sx={{
												"&:last-child td, &:last-child th": { border: 0 },
												"& td, & th": {
													borderBottom: (theme) =>
														`1px solid ${theme.palette.divider}`,
												},
											}}
										>
											<TableCell>{user.name}</TableCell>
											<TableCell>{user.department?.name}</TableCell>
											<TableCell>
												<Select
													value={user.role_id}
													onChange={(e) =>
														handleRoleChange(user.id, e.target.value as number)
													}
													size="small"
												>
													{roles.map((role) => (
														<MenuItem key={role.id} value={role.id}>
															{role.name}
														</MenuItem>
													))}
												</Select>
											</TableCell>
											<TableCell>
												<Box sx={{ display: "flex", gap: 1 }}>
													<Button
														variant="contained"
														color="primary"
														size="small"
														onClick={() => handleOpenModal(user)}
													>
														更新
													</Button>
													<Button
														variant="contained"
														color="error"
														size="small"
														onClick={() => handleOpenDeleteModal(user)}
													>
														削除
													</Button>
												</Box>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</TabPanel>

				<TabPanel value={tabValue} index={1}>
					<UsageAnalytics />
				</TabPanel>

				<Modal
					open={open}
					onClose={handleCloseModal}
					aria-labelledby="modal-title"
					aria-describedby="modal-description"
				>
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							width: 400,
							bgcolor: "background.paper",
							border: "2px solid #000",
							boxShadow: 24,
							p: 4,
						}}
					>
						<Typography id="modal-title" variant="h6" component="h2">
							変更反映日設定
						</Typography>
						<Typography id="modal-description" sx={{ mt: 2 }}>
							{selectedUser?.name} さんの情報を更新します。
						</Typography>
						<Box sx={{ mt: 2 }}>
							<DatePicker
								label="変更反映日"
								value={effectiveDate}
								onChange={(newValue) => setEffectiveDate(newValue)}
							/>
						</Box>
						<Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
							<Button onClick={handleCloseModal}>キャンセル</Button>
							<Button
								variant="contained"
								onClick={handleUpdateUser}
								sx={{ ml: 1 }}
							>
								予約
							</Button>
						</Box>
					</Box>
				</Modal>
				<RegisterUserModal
					open={registerModalOpen}
					onClose={() => setRegisterModalOpen(false)}
					roles={roles}
					departments={departments}
				/>
				<DeleteUserModal
					open={deleteModalOpen}
					onClose={handleCloseDeleteModal}
					user={userToDelete}
					onDelete={handleDeleteUser}
				/>
			</Box>
		</LocalizationProvider>
	);
};

const AdminPage = () => {
	return (
		<PrivateRoute allowedRoles={["admin"]}>
			<AdminPageContent />
		</PrivateRoute>
	);
};

export default AdminPage;
