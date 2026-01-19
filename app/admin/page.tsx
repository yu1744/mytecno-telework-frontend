"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import * as api from "../lib/api";
import { Department } from "../types/user";
import PrivateRoute from "../components/PrivateRoute";
import UsageAnalytics from "../components/UsageAnalytics";
import LoadingSpinner from "../components/LoadingSpinner";
import ReusableModal from "../components/ReusableModal";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const AdminPageContent = () => {
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Department Management State
	const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
	const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
	const [departmentName, setDepartmentName] = useState("");
	const [isDeleteDepartmentModalOpen, setIsDeleteDepartmentModalOpen] = useState(false);

	const fetchData = async () => {
		try {
			setLoading(true);
			const departmentsRes = await api.getDepartments();
			setDepartments(departmentsRes.data);
		} catch (err) {
			setError("データの取得に失敗しました。");
			toast.error("データの取得に失敗しました。");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

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
		<main className="p-6">
			<Toaster />
			<div>
				<h1 className="text-2xl font-bold mb-6">管理者ページ</h1>

				<Tabs defaultValue="usage-analytics">
					<TabsList>
						<TabsTrigger value="usage-analytics">利用状況</TabsTrigger>
						<TabsTrigger value="department-management">部署管理</TabsTrigger>
						<TabsTrigger value="system-settings">システム設定</TabsTrigger>
					</TabsList>

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

					<TabsContent value="system-settings" className="mt-4">
						<div className="grid gap-4 md:grid-cols-2">
							<Card className="hover:shadow-md transition-shadow">
								<CardHeader>
									<CardTitle className="text-lg">人事異動の予約・管理</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">
										社員の部署異動や役職変更を予約し、指定日に自動反映します。
									</p>
									<Button asChild>
										<Link href="/admin/personnel_changes">管理画面へ</Link>
									</Button>
								</CardContent>
							</Card>
							<Card className="hover:shadow-md transition-shadow">
								<CardHeader>
									<CardTitle className="text-lg">操作ログ</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground mb-4">
										システム内の操作履歴を確認し、CSVエクスポートできます。
									</p>
									<Button asChild>
										<Link href="/admin/logs">ログを確認</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>

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
