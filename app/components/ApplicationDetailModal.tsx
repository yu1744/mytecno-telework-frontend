"use client";
import React from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/app/types/application";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";

interface Props {
	application: Application | null;
	isOpen: boolean;
	onClose: () => void;
}

const getStatusBadge = (statusName: string) => {
	switch (statusName) {
		case "申請中":
			return <Badge variant="outline">申請中</Badge>;
		case "承認":
			return <Badge className="bg-green-100 text-green-800">承認済み</Badge>;
		case "却下":
			return <Badge variant="destructive">却下</Badge>;
		case "キャンセル":
			return <Badge variant="secondary">キャンセル</Badge>;
		default:
			return <Badge variant="secondary">不明</Badge>;
	}
};

const formatTimeValue = (value?: string | null) => {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleTimeString("ja-JP", {
		hour: "2-digit",
		minute: "2-digit",
	});
};

export function ApplicationDetailModal({
	application,
	isOpen,
	onClose,
}: Props) {
	if (!application) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{new Date(application.date).toLocaleDateString("ja-JP")} の申請詳細
					</DialogTitle>
				</DialogHeader>
				<div className="mt-4 space-y-4">
					<Table>
						<TableBody>
							<TableRow>
								<TableCell className="font-semibold w-1/4">申請者</TableCell>
								<TableCell>{application.user.name}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-semibold">ステータス</TableCell>
								<TableCell>
									{getStatusBadge(application.application_status.name)}
								</TableCell>
							</TableRow>
							<TableRow>
								<TableCell className="font-semibold">勤務形態</TableCell>
								<TableCell>{application.work_option}</TableCell>
							</TableRow>
							{application.start_time && (
								<TableRow>
									<TableCell className="font-semibold">勤務時間</TableCell>
									<TableCell>
										{formatTimeValue(application.start_time) ?? "---"}
										{application.end_time
											? ` - ${formatTimeValue(application.end_time) ?? "---"}`
											: ""}
									</TableCell>
								</TableRow>
							)}
							{application.break_time && (
								<TableRow>
									<TableCell className="font-semibold">休憩時間</TableCell>
									<TableCell>{application.break_time}分</TableCell>
								</TableRow>
							)}
							<TableRow>
								<TableCell className="font-semibold">申請理由</TableCell>
								<TableCell className="whitespace-pre-wrap">
									{application.reason}
								</TableCell>
							</TableRow>
							{application.is_special && (
								<TableRow>
									<TableCell className="font-semibold">特任申請理由</TableCell>
									<TableCell className="whitespace-pre-wrap">
										{application.special_reason || "記載なし"}
									</TableCell>
								</TableRow>
							)}
							{application.is_overtime && (
								<TableRow className="bg-slate-50/50">
									<TableCell colSpan={2} className="p-0">
										<div className="p-4 space-y-3 border-l-4 border-slate-300">
											<div className="flex items-center gap-2 text-slate-900 font-bold">
												<Clock className="w-4 h-4 text-slate-500" />
												<span>残業申請あり</span>
											</div>
											<div className="grid grid-cols-4 gap-4">
												<div className="text-sm font-semibold text-slate-500 italic">
													終了予定:
												</div>
												<div className="col-span-3 text-lg font-bold text-slate-700">
													{formatTimeValue(application.overtime_end) ?? "---"}
												</div>
											</div>
											<div className="grid grid-cols-4 gap-4 border-t border-slate-100 pt-2">
												<div className="text-sm font-semibold text-slate-500">
													残業理由:
												</div>
												<div className="col-span-3 text-sm whitespace-pre-wrap text-slate-700/80">
													{application.overtime_reason}
												</div>
											</div>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{application.approvals && application.approvals.length > 0 && (
						<div>
							<h4 className="font-semibold mb-2">承認情報</h4>
							<Table>
								<TableBody>
									{application.approvals.map((approval) => (
										<React.Fragment key={approval.id}>
											<TableRow>
												<TableCell className="font-semibold w-1/4">
													承認者
												</TableCell>
												<TableCell>{approval.approver.name}</TableCell>
											</TableRow>
											<TableRow>
												<TableCell className="font-semibold">
													ステータス
												</TableCell>
												<TableCell>{approval.status}</TableCell>
											</TableRow>
											{approval.comment && (
												<TableRow>
													<TableCell className="font-semibold">
														コメント
													</TableCell>
													<TableCell className="whitespace-pre-wrap">
														{approval.comment}
													</TableCell>
												</TableRow>
											)}
										</React.Fragment>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
