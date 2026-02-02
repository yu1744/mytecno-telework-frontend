"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PrivateRoute from "../components/PrivateRoute";
import { CommonTable, ColumnDef } from "../components/CommonTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Application } from "../types/application";
import {
	getApplications,
	getApplication,
	cancelApplication,
	ApplicationRequestParams,
} from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { ApplicationDetailModal } from "../components/ApplicationDetailModal";
import { useModalStore } from "../store/modal";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNotificationStore } from "../store/notificationStore";

const formatTimeValue = (value?: string | null) => {
	if (!value) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toLocaleTimeString("ja-JP", {
		hour: "2-digit",
		minute: "2-digit",
	});
};

const formatTimeRange = (application: Application) => {
	const start = formatTimeValue(application.start_time);
	const end = formatTimeValue(application.end_time);
	if (start && end) {
		return `${start}〜${end}`;
	}
	if (application.work_option === "full_day") {
		return "終日";
	}
	return "-";
};

const renderSpecialNote = (application: Application) => {
	const isExceeded = application.work_hours_exceeded;
	const isSpecial = application.is_special;

	if (isExceeded && isSpecial) {
		return (
			<div className="flex gap-1">
				<Badge className="bg-red-100 text-red-800 hover:bg-red-100/80">
					特任
				</Badge>
				<Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
					超過
				</Badge>
			</div>
		);
	}
	if (isExceeded) {
		return (
			<Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
				8h超過
			</Badge>
		);
	}
	if (isSpecial) {
		return (
			<Badge className="bg-red-100 text-red-800 hover:bg-red-100/80">
				特任
			</Badge>
		);
	}
	return null;
};

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

const HistoryPageContent = () => {
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sortBy, setSortBy] =
		useState<ApplicationRequestParams["sort_by"]>("created_at");
	const [sortOrder, setSortOrder] =
		useState<ApplicationRequestParams["sort_order"]>("desc");
	const [filterByStatus, setFilterByStatus] = useState<string>("");
	const [filterByMonth, setFilterByMonth] = useState<string>("");

	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [selectedApplication, setSelectedApplication] =
		useState<Application | null>(null);
	const showModal = useModalStore((state) => state.showModal);
	const { message, clearMessage } = useNotificationStore();

	const handleOpenDetailModal = async (applicationId: number) => {
		try {
			const response = await getApplication(applicationId);
			setSelectedApplication(response.data);
			setIsDetailModalOpen(true);
		} catch (error) {
			console.error("Failed to fetch application details:", error);
			toast.error("申請詳細の取得に失敗しました");
		}
	};

	const handleCloseDetailModal = () => {
		setSelectedApplication(null);
		setIsDetailModalOpen(false);
	};

	const fetchApplications = async () => {
		setLoading(true);
		try {
			const params: ApplicationRequestParams = {
				sort_by: sortBy,
				sort_order: sortOrder,
				filter_by_status: filterByStatus,
				filter_by_month: filterByMonth,
			};
			Object.keys(params).forEach(
				(key) =>
					(params[key as keyof ApplicationRequestParams] === "" ||
						params[key as keyof ApplicationRequestParams] === undefined) &&
					delete params[key as keyof ApplicationRequestParams]
			);
			const response = await getApplications(params);
			setApplications(response.data);
			setError(null);
		} catch (err) {
			console.error("Failed to fetch applications:", err);
			setError("申請データの取得に失敗しました。");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchApplications();
	}, [sortBy, sortOrder, filterByStatus, filterByMonth]);

	const searchParams = useSearchParams();
	const router = useRouter();

	// useEffect(() => {
	// 	if (searchParams.get("submitted") === "true") {
	// 		toast.success("申請を送信しました");
	// 		router.replace("/history");
	// 	}
	// }, [searchParams, router]);

	useEffect(() => {
		if (message) {
			toast.success(message);
			clearMessage();
		}
	}, [message, clearMessage]);

	const handleSort = (sortKey: keyof Application | (string & {})) => {
	};

	const handleCancel = async (id: number) => {
		showModal({
			title: "申請取り消しの確認",
			message: "この申請を取り消してもよろしいですか？この操作は取り消せません。",
			onConfirm: async () => {
				try {
					await cancelApplication(id);
					toast.success("申請を取り消しました");
					fetchApplications();
				} catch (error) {
					if (axios.isAxiosError(error) && error.response?.status === 403) {
						toast.error("この操作を行う権限がありません");
					} else {
						console.error("Failed to cancel application:", error);
						toast.error("申請の取り消しに失敗しました");
					}
				}
			},
		});
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
				accessorKey: "start_time",
				header: "勤務時間",
				cell: ({ row }) => formatTimeRange(row),
			},
			{
				accessorKey: "user",
				header: "申請者",
				cell: ({ row }) => row.user.name,
			},
			{
				accessorKey: "application_status_id",
				header: "ステータス",
				enableSorting: true,
				cell: ({ row }) => getStatusBadge(row.application_status_id ?? 0),
			},
			{
				accessorKey: "approver_comment",
				header: "承認者コメント",
				cell: ({ row }) => row.approver_comment,
			},
			{
				accessorKey: "special_reason",
				header: "特記事項",
				cell: ({ row }) => renderSpecialNote(row),
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
						{row.application_status_id === 1 && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => handleCancel(row.id)}
							>
								申請取り消し
							</Button>
						)}
					</div>
				),
			},
		],
		[]
	);

	const monthOptions = Array.from({ length: 12 }, (_, i) => {
		const date = new Date();
		date.setMonth(date.getMonth() - i);
		return {
			value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
				2,
				"0"
			)}`,
			label: `${date.getFullYear()}年${date.getMonth() + 1}月`,
		};
	});

	if (loading) return <LoadingSpinner />;
	if (error) return <p className="text-red-500">{error}</p>;

	return (
		<div className="container mx-auto p-2 sm:p-4">
			<Toaster />
			<h1 className="text-xl sm:text-2xl font-bold mb-4">申請履歴</h1>
			<div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center mb-4 gap-3 sm:gap-4">
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<label htmlFor="month-filter" className="text-sm font-medium whitespace-nowrap">
						申請月:
					</label>
					<Select
						value={filterByMonth || "all"}
						onValueChange={(value) =>
							setFilterByMonth(value === "all" ? "" : value)
						}
					>
						<SelectTrigger id="month-filter" className="w-full sm:w-[180px]">
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
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<label htmlFor="status-filter" className="text-sm font-medium whitespace-nowrap">
						ステータス:
					</label>
					<Select
						value={filterByStatus || "all"}
						onValueChange={(value) =>
							setFilterByStatus(value === "all" ? "" : value)
						}
					>
						<SelectTrigger id="status-filter" className="w-full sm:w-[150px]">
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
			</div>
			<CommonTable
				columns={columns}
				data={applications}
				title="申請履歴"
				onSort={handleSort}
				sortKey={sortBy}
				sortOrder={sortOrder}
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

const HistoryPage = () => {
	return (
		<PrivateRoute allowedRoles={["admin", "approver", "applicant", "user"]}>
			<HistoryPageContent />
		</PrivateRoute>
	);
};

export default HistoryPage;
