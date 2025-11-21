"use client";
import React, { useState, useEffect, useMemo } from "react";
import { CommonTable, ColumnDef } from "../../components/CommonTable";
import { User } from "../../types/user";
import { adminGetUsers } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import PrivateRoute from "../../components/PrivateRoute";
import { Badge } from "@/components/ui/badge";

const AdminUsersPageContent = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await adminGetUsers();
				setUsers(response.data);
			} catch (err) {
				console.error("Failed to fetch users:", err);
				setError("ユーザー一覧の取得に失敗しました。");
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const columns: ColumnDef<User>[] = useMemo(
		() => [
			{
				accessorKey: "id",
				header: "ID",
				cell: ({ row }: { row: User }) => row.id,
			},
			{
				accessorKey: "employee_number",
				header: "社員番号",
				cell: ({ row }: { row: User }) => row.employee_number,
			},
			{
				accessorKey: "name",
				header: "氏名",
				cell: ({ row }: { row: User }) => row.name,
			},
			{
				accessorKey: "email",
				header: "メールアドレス",
				cell: ({ row }: { row: User }) => row.email,
			},
			{
				accessorKey: "department",
				header: "部署",
				cell: ({ row }: { row: User }) => row.department?.name || "-",
			},
			{
				accessorKey: "role",
				header: "役職/権限",
				cell: ({ row }: { row: User }) => (
					<Badge variant="outline">{row.role?.name || "-"}</Badge>
				),
			},
		],
		[]
	);

	if (loading) return <LoadingSpinner />;
	if (error) return <p className="text-red-500">{error}</p>;

	return (
		<div className="container mx-auto p-4 md:p-6">
			<h1 className="text-2xl font-bold mb-6">ユーザー管理</h1>
			<CommonTable columns={columns} data={users} title="ユーザー一覧" />
		</div>
	);
};

const AdminUsersPage = () => {
	return (
		<PrivateRoute allowedRoles={["admin"]}>
			<AdminUsersPageContent />
		</PrivateRoute>
	);
};

export default AdminUsersPage;
