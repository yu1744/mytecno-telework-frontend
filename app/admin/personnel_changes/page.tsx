"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import api, {
	adminGetUsers,
	getDepartments,
	getRoles,
	adminCreateInfoChange,
} from "@/app/lib/api";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import PrivateRoute from "@/app/components/PrivateRoute";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Department {
	id: number;
	name: string;
}

interface Role {
	id: number;
	name: string;
}

interface User {
	id: number;
	name: string;
	department?: Department;
	role?: Role;
}

interface PersonnelChangeResponse {
	id: number;
	user: User;
	new_department: Department;
	new_role: Role;
	effective_date: string;
}

interface PersonnelChange {
	id: number;
	user_name: string;
	old_department: string;
	new_department: string;
	old_role: string;
	new_role: string;
	effective_date: string;
}

const PersonnelChangesPage = () => {
	const [changes, setChanges] = useState<PersonnelChange[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [newChange, setNewChange] = useState({
		user_id: "",
		new_department_id: "",
		new_role_id: "",
		effective_date: "",
	});

	const fetchData = async () => {
		try {
			setLoading(true);
			const [changesRes, usersRes, deptsRes, rolesRes] = await Promise.all([
				api.get<PersonnelChangeResponse[]>("/admin/user_info_changes"),
				adminGetUsers(),
				getDepartments(),
				getRoles(),
			]);

			const formattedData = changesRes.data.map((item) => ({
				id: item.id,
				user_name: item.user.name,
				old_department: item.user.department?.name || "N/A",
				new_department: item.new_department?.name || "N/A",
				old_role: item.user.role?.name || "N/A",
				new_role: item.new_role?.name || "N/A",
				effective_date: item.effective_date,
			}));
			setChanges(formattedData);
			setUsers(usersRes.data);
			setDepartments(deptsRes.data);
			setRoles(rolesRes.data as { id: number; name: string }[]); // roles API might return different structure
			setError(null);
		} catch (error) {
			setError("データの取得に失敗しました。");
			console.error("Failed to fetch data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleCreate = async () => {
		if (
			!newChange.user_id ||
			!newChange.new_department_id ||
			!newChange.new_role_id ||
			!newChange.effective_date
		) {
			toast.error("すべての項目を入力してください");
			return;
		}

		try {
			await adminCreateInfoChange({
				user_id: Number(newChange.user_id),
				new_department_id: Number(newChange.new_department_id),
				new_role_id: Number(newChange.new_role_id),
				effective_date: newChange.effective_date,
			});
			toast.success("予約を作成しました");
			setIsCreateModalOpen(false);
			setNewChange({
				user_id: "",
				new_department_id: "",
				new_role_id: "",
				effective_date: "",
			});
			fetchData();
		} catch (error) {
			console.error("Failed to create change:", error);
			toast.error("予約の作成に失敗しました");
		}
	};

	const handleEdit = (id: number) => {
		// TODO: 編集機能の実装
		console.log(`Edit change with id: ${id}`);
	};

	const handleDelete = async (id: number) => {
		if (window.confirm("この予約を取り消しますか？")) {
			try {
				await api.delete(`/admin/user_info_changes/${id}`);
				setChanges(changes.filter((change) => change.id !== id));
				toast.success("予約を取り消しました");
			} catch (error) {
				console.error("Failed to delete personnel change:", error);
				toast.error("予約の取消に失敗しました");
			}
		}
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<PrivateRoute allowedRoles={["admin"]}>
			<div className="container mx-auto py-10">
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-2xl font-bold">人事異動の予約・管理</h1>
					<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="mr-2 h-4 w-4" /> 新規予約作成
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>新規人事異動予約</DialogTitle>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="user">対象ユーザー</Label>
									<Select
										value={newChange.user_id}
										onValueChange={(value) =>
											setNewChange({ ...newChange, user_id: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="ユーザーを選択" />
										</SelectTrigger>
										<SelectContent>
											{users.map((user) => (
												<SelectItem key={user.id} value={user.id.toString()}>
													{user.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="department">新部署</Label>
									<Select
										value={newChange.new_department_id}
										onValueChange={(value) =>
											setNewChange({ ...newChange, new_department_id: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="部署を選択" />
										</SelectTrigger>
										<SelectContent>
											{departments.map((dept) => (
												<SelectItem key={dept.id} value={dept.id.toString()}>
													{dept.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="role">新役職</Label>
									<Select
										value={newChange.new_role_id}
										onValueChange={(value) =>
											setNewChange({ ...newChange, new_role_id: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="役職を選択" />
										</SelectTrigger>
										<SelectContent>
											{roles.map((role) => (
												<SelectItem key={role.id} value={role.id.toString()}>
													{role.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="date">変更反映日</Label>
									<Input
										id="date"
										type="date"
										value={newChange.effective_date}
										onChange={(e) =>
											setNewChange({
												...newChange,
												effective_date: e.target.value,
											})
										}
									/>
								</div>
								<Button onClick={handleCreate}>予約作成</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
				{error && <p className="text-red-500">{error}</p>}
				{!error && changes.length === 0 ? (
					<EmptyState message="予約されている人事異動はありません。" />
				) : (
					<Card>
						<CardHeader>
							<CardTitle>予約一覧</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>対象ユーザー</TableHead>
										<TableHead>変更前</TableHead>
										<TableHead>変更後</TableHead>
										<TableHead>変更反映日</TableHead>
										<TableHead>操作</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{changes.map((change) => (
										<TableRow key={change.id}>
											<TableCell>{change.user_name}</TableCell>
											<TableCell>
												所属: {change.old_department}
												<br />
												権限: {change.old_role}
											</TableCell>
											<TableCell>
												所属: {change.new_department}
												<br />
												権限: {change.new_role}
											</TableCell>
											<TableCell>{change.effective_date}</TableCell>
											<TableCell className="flex items-center">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEdit(change.id)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleDelete(change.id)}
													className="text-red-500 hover:text-red-600"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				)}
			</div>
		</PrivateRoute>
	);
};

export default PersonnelChangesPage;
