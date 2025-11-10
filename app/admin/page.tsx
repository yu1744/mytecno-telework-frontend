"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import * as api from "../lib/api";
import { User, Role, Department } from "../types/user";
import PrivateRoute from "../components/PrivateRoute";
import UsageAnalytics from "../components/UsageAnalytics";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import RegisterUserModal from "../components/RegisterUserModal";
import DeleteUserModal from "../components/DeleteUserModal";
import ReusableModal from "../components/ReusableModal";
import UserDetailModal from "../components/UserDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker"; // Assuming you have a custom DatePicker component

const AdminPageContent = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [registerModalOpen, setRegisterModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [userDetail, setUserDetail] = useState<User | null>(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	// Department Management State
	const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
	const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
	const [departmentName, setDepartmentName] = useState("");
	const [isDeleteDepartmentModalOpen, setIsDeleteDepartmentModalOpen] = useState(false);

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

	const handleUserUpdate = async (
		userId: number,
		field: "role_id" | "department_id",
		value: string
	) => {
		const numericValue = Number(value);
		const originalUsers = [...users];
		const updatedUsers = users.map((user) =>
			user.id === userId ? { ...user, [field]: numericValue } : user
		);
		setUsers(updatedUsers);

		const userToUpdate = updatedUsers.find((u) => u.id === userId);
		if (!userToUpdate) return;

		try {
			const { id, name, email, employee_number, role_id, department_id, hired_date } = userToUpdate;
			await api.adminUpdateUser(id, {
				name,
				email,
				employee_number,
				role_id,
				department_id,
				hired_date,
			});
			const updatedUser = updatedUsers.find((u) => u.id === userId);
			if (updatedUser) {
				if (field === "role_id") {
					const roleName = roles.find((r) => r.id === numericValue)?.name;
					toast.success(`${updatedUser.name}さんの権限を${roleName}に変更しました。`);
				} else {
					toast.success(`${updatedUser.name}さんの情報を更新しました。`);
				}
			}
		} catch (error) {
			setUsers(originalUsers);
			if (selectedUser && selectedUser.id === userId) {
				setSelectedUser(originalUsers.find((u) => u.id === userId) || null);
			}
			toast.error("ユーザー情報の更新に失敗しました。");
			console.error("Failed to update user", error);
		}
	};

	const handleOpenDetailModal = async (userId: number) => {
		try {
			const res = await api.adminGetUser(userId);
			setUserDetail(res.data);
			setIsDetailModalOpen(true);
		} catch (error) {
			toast.error("ユーザー情報の取得に失敗しました。");
			console.error("Failed to fetch user details", error);
		}
	};

	const handleCloseDetailModal = () => {
		setIsDetailModalOpen(false);
		setUserDetail(null);
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

	// Department handlers
	const handleOpenDepartmentModal = (department: Department | null) => {
		setSelectedDepartment(department);
		setDepartmentName(department ? department.name : "");
		setIsDepartmentModalOpen(true);
	};

	const handleCloseDepartmentModal = () => {
		setSelectedDepartment(null);
		setDepartmentName("");
		setIsDepartmentModalOpen(false);
	};

	const handleSaveDepartment = async () => {
		if (!departmentName) {
			toast.error("部署名を入力してください。");
			return;
		}

		try {
			if (selectedDepartment) {
				const res = await api.updateDepartment(selectedDepartment.id, { name: departmentName });
				setDepartments(departments.map(d => d.id === selectedDepartment.id ? res.data : d));
				toast.success("部署を更新しました。");
			} else {
				const res = await api.createDepartment({ name: departmentName });
				setDepartments([...departments, res.data]);
				toast.success("部署を新規作成しました。");
			}
			handleCloseDepartmentModal();
		} catch (error) {
			toast.error("部署の保存に失敗しました。");
			console.error("Failed to save department", error);
		}
	};

	const handleOpenDeleteDepartmentModal = (department: Department) => {
		setSelectedDepartment(department);
		setIsDeleteDepartmentModalOpen(true);
	};

	const handleCloseDeleteDepartmentModal = () => {
		setSelectedDepartment(null);
		setIsDeleteDepartmentModalOpen(false);
	};

	const handleDeleteDepartment = async () => {
		if (!selectedDepartment) return;
		try {
			await api.deleteDepartment(selectedDepartment.id);
			setDepartments(departments.filter(d => d.id !== selectedDepartment.id));
			toast.success("部署を削除しました。");
			handleCloseDeleteDepartmentModal();
		} catch (error) {
			toast.error("部署の削除に失敗しました。");
			console.error("Failed to delete department", error);
		}
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<main className="flex-grow p-3 mt-16">
			<Toaster />
			<div className="max-w-6xl mx-auto">
				<h1 className="text-2xl font-bold mb-6">管理者ページ</h1>

				<Tabs defaultValue="user-management">
					<TabsList>
						<TabsTrigger value="user-management">ユーザー管理</TabsTrigger>
						<TabsTrigger value="usage-analytics">利用状況</TabsTrigger>
						<TabsTrigger value="department-management">部署管理</TabsTrigger>
					</TabsList>

					<TabsContent value="user-management" className="mt-4">
						<Card>
							<CardHeader>
								<div className="flex justify-between items-center">
									<CardTitle>ユーザー一覧</CardTitle>
									<div className="flex gap-2">
										<Button onClick={() => setRegisterModalOpen(true)}>
											新規登録
										</Button>
										<Button asChild variant="outline">
											<Link href="/admin/integrations">外部連携設定</Link>
										</Button>
										<Button asChild variant="outline">
											<Link href="/admin/personnel_changes">人事異動の予約・管理</Link>
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{error && <p className="text-red-500">{error}</p>}
								{!error && users.length === 0 ? (
									<EmptyState message="表示できるユーザーがいません。" />
								) : (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="font-bold">名前</TableHead>
												<TableHead className="font-bold">部署</TableHead>
												<TableHead className="font-bold">権限</TableHead>
												<TableHead className="font-bold">アクション</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{users.map((user) => (
												<TableRow key={user.id}>
													<TableCell>{user.name}</TableCell>
													<TableCell>
														<Select
															value={String(user.department_id)}
															onValueChange={(value) =>
																handleUserUpdate(user.id, "department_id", value)
															}
														>
															<SelectTrigger className="w-[180px]">
																<SelectValue placeholder="部署を選択" />
															</SelectTrigger>
															<SelectContent>
																{departments.map((department) => (
																	<SelectItem key={department.id} value={String(department.id)}>
																		{department.name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</TableCell>
													<TableCell>
														<Select
															value={String(user.role_id)}
															onValueChange={(value) =>
																handleUserUpdate(user.id, "role_id", value)
															}
														>
															<SelectTrigger className="w-[180px]">
																<SelectValue placeholder="権限を選択" />
															</SelectTrigger>
															<SelectContent>
																{roles.map((role) => (
																	<SelectItem key={role.id} value={String(role.id)}>
																		{role.name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</TableCell>
													<TableCell>
														<div className="flex gap-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() => handleOpenDetailModal(user.id)}
															>
																詳細
															</Button>
															<Button
																variant="destructive"
																size="sm"
																onClick={() => handleOpenDeleteModal(user)}
															>
																削除
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="usage-analytics" className="mt-4">
						<UsageAnalytics />
					</TabsContent>

					<TabsContent value="department-management" className="mt-4">
						<Card>
							<CardHeader>
								<div className="flex justify-between items-center">
									<CardTitle>部署一覧</CardTitle>
									<Button onClick={() => handleOpenDepartmentModal(null)}>
										新規部署作成
									</Button>
								</div>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="font-bold">部署名</TableHead>
											<TableHead className="font-bold">アクション</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{departments.map((department) => (
											<TableRow key={department.id}>
												<TableCell>{department.name}</TableCell>
												<TableCell>
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleOpenDepartmentModal(department)}
														>
															編集
														</Button>
														<Button
															variant="destructive"
															size="sm"
															onClick={() => handleOpenDeleteDepartmentModal(department)}
														>
															削除
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

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
				<UserDetailModal
					open={isDetailModalOpen}
					onClose={handleCloseDetailModal}
					user={userDetail}
				/>

				{/* Department Modals */}
				<ReusableModal
					open={isDepartmentModalOpen}
					onClose={handleCloseDepartmentModal}
					title={selectedDepartment ? "部署の編集" : "部署の新規作成"}
					content={
						<Input
							autoFocus
							placeholder="部署名"
							value={departmentName}
							onChange={(e) => setDepartmentName(e.target.value)}
						/>
					}
					actions={[
						{ text: "キャンセル", onClick: handleCloseDepartmentModal, variant: "ghost" },
						{ text: "保存", onClick: handleSaveDepartment },
					]}
				/>

				<ReusableModal
					open={isDeleteDepartmentModalOpen}
					onClose={handleCloseDeleteDepartmentModal}
					title="部署の削除"
					content={`本当に${selectedDepartment?.name}を削除しますか？`}
					actions={[
						{ text: "キャンセル", onClick: handleCloseDeleteDepartmentModal, variant: "ghost" },
						{ text: "削除", onClick: handleDeleteDepartment, variant: "destructive" },
					]}
				/>
			</div>
		</main>
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
