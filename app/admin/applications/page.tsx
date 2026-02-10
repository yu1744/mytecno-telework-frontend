"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../../store/auth";
import PrivateRoute from "../../components/PrivateRoute";
import { CommonTable, ColumnDef } from "../../components/CommonTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Application } from "../../types/application";
import { User } from "../../types/user";
import {
	adminGetApplications,
	getApplication,
	adminGetUsers,
	ApplicationRequestParams,
} from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import { ApplicationDetailModal } from "../../components/ApplicationDetailModal";

const getStatusBadge = (statusId: number) => {
	switch (statusId) {
		case 1:
			return <Badge variant="outline">申請中</Badge>;
		case 2:
			return <Badge className="bg-green-100 text-green-800">承認済み</Badge>;
		case 3:
			return <Badge variant="destructive">却下</Badge>;
		case 4:
			return <Badge variant="secondary">キャンセル</Badge>;
		default:
			return <Badge variant="secondary">不明</Badge>;
	}
};

const AdminApplicationsPageContent = () => {
	const { user } = useAuthStore();
	const [applications, setApplications] = useState<Application[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sortBy, setSortBy] =
		useState<ApplicationRequestParams["sort_by"]>("created_at");
	const [sortOrder, setSortOrder] =
		useState<ApplicationRequestParams["sort_order"]>("desc");
	const [filterByStatus, setFilterByStatus] = useState<string>("");
	const [filterByUser, setFilterByUser] = useState<string>("");
	const [filterByMonth, setFilterByMonth] = useState<string>("");

	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [selectedApplication, setSelectedApplication] =
		useState<Application | null>(null);

	const fetchApplications = async () => {
		setLoading(true);
		try {
			const params: ApplicationRequestParams = {
				sort_by: sortBy,
				sort_order: sortOrder,
			};
			if (filterByStatus) {
				params.status = filterByStatus;
			}
			if (filterByUser) {
				params.filter_by_user = filterByUser;
			}
			if (filterByMonth) {
				params.filter_by_month = filterByMonth;
			}
			const response = await adminGetApplications(params);
			setApplications(response.data);
			setError(null);
		} catch (err) {
			console.error("Failed to fetch applications:", err);
			setError("申請データの取得に失敗しました。");
		} finally {
			setLoading(false);
		}
	};

	const fetchUsers = async () => {
		try {
			const response = await adminGetUsers();
			setUsers(response.data);
		} catch (err) {
			console.error("Failed to fetch users:", err);
		}
	};

	useEffect(() => {
		fetchApplications();
		if (user?.role?.name === "admin") {
			fetchUsers();
		}
	}, [sortBy, sortOrder, filterByStatus, filterByUser, filterByMonth]);

	const handleSort = (sortKey: keyof Application | (string & {})) => {
		const key = sortKey as ApplicationRequestParams["sort_by"];
		const isAsc = sortBy === key && sortOrder === "asc";
		setSortOrder(isAsc ? "desc" : "asc");
		setSortBy(key);
	};

	const handleOpenDetailModal = async (applicationId: number) => {
		try {
			const response = await getApplication(applicationId);
			setSelectedApplication(response.data);
			setIsDetailModalOpen(true);
		} catch (error) {
			console.error("Failed to fetch application details:", error);
		}
	};

	const handleCloseDetailModal = () => {
		setSelectedApplication(null);
		setIsDetailModalOpen(false);
	};

	const columns: ColumnDef<Application>[] = useMemo(
		() => [
			{
				accessorKey: "created_at",
				header: "申請日",
				enableSorting: true,
				cell: ({ row }) => {
					if (!row.created_at) return "-";
					const date = new Date(row.created_at);
					return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("ja-JP");
				},
			},
			{
				accessorKey: "date",
				header: "申請対象日",
				enableSorting: true,
				cell: ({ row }) => {
					if (!row.date) return "-";
					const date = new Date(row.date);
					return isNaN(date.getTime()) ? "-" : date.toLocaleDateString("ja-JP");
				},
			},
			{
				accessorKey: "user",
				header: "申請者",
				cell: ({ row }) => row.user.name,
			},
			{
				accessorKey: "user", // userオブジェクト全体を渡す
				header: "部署",
				cell: ({ row }) => {
					return row.user.department?.name || "部署なし";
				},
			},
			{
				accessorKey: "reason",
				header: "申請理由",
				cell: ({ row }) => (
					<span className="whitespace-pre-wrap">{row.reason}</span>
				),
			},
			{
				accessorKey: "application_status_id",
				header: "ステータス",
				enableSorting: true,
				cell: ({ row }) => getStatusBadge(row.application_status_id ?? 0),
			},
			{
				accessorKey: "actions",
				header: "操作",
				cell: ({ row }) => (
					<div className="flex flex-col sm:flex-row gap-1">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleOpenDetailModal(row.id)}
						>
							詳細
						</Button>
					</div>
				),
			},
		],
		[users, applications]
	);

	const monthOptions = Array.from({ length: 12 }, (_, i) => {
		const date = new Date();
		date.setDate(1);
		date.setMonth(date.getMonth() - i);
		return {
			value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
				2,
				"0"
			)}`,
			label: `${date.getFullYear()}年${date.getMonth() + 1}月`,
		};
	});

	const getRowClassName = (row: Application) => {
		const isSpecial = row.is_special;
		const workHoursExceeded = row.work_hours_exceeded;

		if (workHoursExceeded && isSpecial) {
			return "bg-purple-100";
		}
		if (workHoursExceeded) {
			return "bg-red-100";
		}
		if (isSpecial) {
			return "bg-blue-100";
		}
		return "";
	};

	if (loading) return <LoadingSpinner />;
	if (error) return <p className="text-red-500">{error}</p>;

	return (
		<div className="container mx-auto p-4 md:p-6">
			<h1 className="text-2xl font-bold mb-6">全申請一覧</h1>
			<div className="flex flex-col sm:flex-row items-center mb-4 gap-4">
				<div className="flex items-center gap-2">
					<label htmlFor="status-filter" className="text-sm font-medium">
						ステータス:
					</label>
					<Select
						value={filterByStatus || "all"}
						onValueChange={(value) =>
							setFilterByStatus(value === "all" ? "" : value)
						}
					>
						<SelectTrigger id="status-filter" className="w-[150px]">
							<SelectValue placeholder="すべて" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">すべて</SelectItem>
							<SelectItem value="1">申請中</SelectItem>
							<SelectItem value="2">承認済み</SelectItem>
							<SelectItem value="3">却下</SelectItem>
							<SelectItem value="4">キャンセル</SelectItem>
						</SelectContent>
					</Select>
				</div>
				{user?.role?.name === "admin" && (
					<div className="flex items-center gap-2">
						<label htmlFor="user-filter" className="text-sm font-medium">
							申請者:
						</label>
						<Select
							value={filterByUser || "all"}
							onValueChange={(value) =>
								setFilterByUser(value === "all" ? "" : value)
							}
						>
							<SelectTrigger id="user-filter" className="w-[200px]">
								<SelectValue placeholder="すべて" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">すべて</SelectItem>
								{users.map((user) => (
									<SelectItem key={user.id} value={user.id.toString()}>
										{user.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				<div className="flex items-center gap-2">
					<label htmlFor="month-filter" className="text-sm font-medium">
						申請月:
					</label>
					<Select
						value={filterByMonth || "all"}
						onValueChange={(value) =>
							setFilterByMonth(value === "all" ? "" : value)
						}
					>
						<SelectTrigger id="month-filter" className="w-[180px]">
							<SelectValue placeholder="すべて" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">すべて</SelectItem>
							{monthOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<CommonTable
				columns={columns}
				data={applications}
				title="全申請一覧"
				onSort={handleSort}
				sortKey={sortBy}
				sortOrder={sortOrder}
				getRowClassName={getRowClassName}
			/>
			{selectedApplication && (
				<ApplicationDetailModal
					isOpen={isDetailModalOpen}
					onClose={handleCloseDetailModal}
					application={selectedApplication}
				/>
			)}
		</div>
	);
};

const AdminApplicationsPage = () => {
	return (
		<PrivateRoute allowedRoles={["admin", "approver"]}>
			<AdminApplicationsPageContent />
		</PrivateRoute>
	);
};

export default AdminApplicationsPage;
