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
import * as api from "../lib/api";
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

const TAB_VALUES = {
	USER_MANAGEMENT: 0,
	USAGE_ANALYTICS: 1,
};

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
		const fetchData = async () => {
			try {
				setLoading(true);
				const [usersRes, rolesRes, departmentsRes] = await Promise.all([
					api.adminGetUsers(),
					api.getRoles(),
					api.getDepartments(),
				]);
				setUsers(usersRes.data);
				setRoles(rolesRes.data);
				setDepartments(departmentsRes.data);
			} catch (err) {
				setError("データの取得に失敗しました。");
				toast.error("データの取得に失敗しました。");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleUserUpdate = async (
		userId: number,
		field: "role_id" | "department_id",
		value: number
	) => {
		const originalUsers = [...users];
		const updatedUsers = users.map((user) =>
			user.id === userId ? { ...user, [field]: value } : user
		);
		setUsers(updatedUsers);

		const userToUpdate = updatedUsers.find((u) => u.id === userId);
		if (!userToUpdate) return;

		try {
			const { id, name, email, role_id, department_id } = userToUpdate;
			await api.adminUpdateUser(id, {
				name,
				email,
				role_id,
				department_id,
			});
			toast.success("ユーザー情報を更新しました。");
		} catch (error) {
			setUsers(originalUsers);
			// 失敗した場合、モーダル用に選択されているユーザー情報も元に戻す
			if (selectedUser && selectedUser.id === userId) {
				setSelectedUser(originalUsers.find((u) => u.id === userId) || null);
			}
			toast.error("ユーザー情報の更新に失敗しました。");
			console.error("Failed to update user", error);
		}
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
		if (!effectiveDate) {
			toast.error("変更反映日を選択してください。");
			return;
		}

		const params = {
			user_id: selectedUser.id,
			new_department_id: selectedUser.department_id,
			new_role_id: selectedUser.role_id,
			effective_date: effectiveDate.toISOString().split("T")[0],
		};

		try {
			await api.adminCreateInfoChange(params);
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

	const handleDeleteUser = async () => {
		if (!userToDelete) return;
		try {
			await api.adminDeleteUser(userToDelete.id);
			setUsers(users.filter((user) => user.id !== userToDelete.id));
			toast.success(`${userToDelete.name}さんを削除しました。`);
		} catch (error) {
			toast.error("ユーザーの削除に失敗しました。");
			console.error("Failed to delete user", error);
		} finally {
			handleCloseDeleteModal();
		}
	};

	const handleRegisterUser = async (newUser: api.CreateUserParams) => {
		try {
			const res = await api.adminCreateUser(newUser);
			setUsers([...users, res.data]);
			toast.success("新しいユーザーを登録しました。");
			setRegisterModalOpen(false);
		} catch (error) {
			console.error("Failed to register user", error);
			toast.error("ユーザー登録に失敗しました。");
		}
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

				<TabPanel value={tabValue} index={TAB_VALUES.USER_MANAGEMENT}>
					<Box
						sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 2 }}
					>
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
											<TableCell>
												<Select
													value={user.department_id}
													onChange={(e) =>
														handleUserUpdate(
															user.id,
															"department_id",
															e.target.value as number
														)
													}
													size="small"
													sx={{ minWidth: 120 }}
												>
													{departments.map((department) => (
														<MenuItem key={department.id} value={department.id}>
															{department.name}
														</MenuItem>
													))}
												</Select>
											</TableCell>
											<TableCell>
												<Select
													value={user.role_id}
													onChange={(e) =>
														handleUserUpdate(
															user.id,
															"role_id",
															e.target.value as number
														)
													}
													size="small"
													sx={{ minWidth: 120 }}
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

				<TabPanel value={tabValue} index={TAB_VALUES.USAGE_ANALYTICS}>
					<UsageAnalytics />
				</TabPanel>

				<RegisterUserModal
					open={registerModalOpen}
					onClose={() => setRegisterModalOpen(false)}
					roles={roles}
					departments={departments}
					onRegister={handleRegisterUser}
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
