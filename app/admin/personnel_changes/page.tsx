"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";

import api from "@/app/lib/api";
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
}

interface PersonnelChangeResponse {
	id: number;
	user: User;
	old_department: Department | null;
	new_department: Department;
	old_role: Role | null;
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
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPersonnelChanges = async () => {
			try {
				setLoading(true);
				const response = await api.get<PersonnelChangeResponse[]>(
					"/admin/user_info_changes"
				);
				const formattedData = response.data.map((item) => ({
					id: item.id,
					user_name: item.user.name,
					old_department: item.old_department?.name || "N/A",
					new_department: item.new_department.name,
					old_role: item.old_role?.name || "N/A",
					new_role: item.new_role.name,
					effective_date: item.effective_date,
				}));
				setChanges(formattedData);
				setError(null);
			} catch (error) {
				setError("データの表示に失敗しました。");
				console.error("Failed to fetch personnel changes:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPersonnelChanges();
	}, []);

	const handleEdit = (id: number) => {
		// TODO: 編集機能の実装
		console.log(`Edit change with id: ${id}`);
	};

	const handleDelete = async (id: number) => {
		if (window.confirm("この予約を取り消しますか？")) {
			try {
				await api.delete(`/admin/user_info_changes/${id}`);
				setChanges(changes.filter((change) => change.id !== id));
				alert("予約を取り消しました。");
			} catch (error) {
				console.error("Failed to delete personnel change:", error);
				alert("予約の取消に失敗しました。");
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
					<Button>新規予約作成</Button>
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
