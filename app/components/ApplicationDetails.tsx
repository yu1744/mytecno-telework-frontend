"use client";

import React from "react";
import { Application } from "@/app/types/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ApplicationDetailsProps {
	applications: Application[];
	selectedDate: Date | null;
}

const statusBadgeVariant = (status: string) => {
	switch (status) {
		case "pending":
			return "default";
		case "approved":
			return "outline";
		case "rejected":
			return "destructive";
		default:
			return "secondary";
	}
};

export const ApplicationDetails = ({
	applications,
	selectedDate,
}: ApplicationDetailsProps) => {
	if (!selectedDate) {
		return (
			<Card className="h-full">
				<CardHeader>
					<CardTitle>申請詳細</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-full min-h-[200px]">
						<p className="text-muted-foreground">
							カレンダーで日付を選択してください。
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>
					{selectedDate.toLocaleDateString("ja-JP", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}{" "}
					の申請
				</CardTitle>
			</CardHeader>
			<CardContent>
				{applications.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>申請者</TableHead>
								<TableHead>勤務形態</TableHead>
								<TableHead>ステータス</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{applications.map((app) => (
								<TableRow key={app.id}>
									<TableCell>{app.user.name}</TableCell>
									<TableCell>{app.work_style || "N/A"}</TableCell>
									<TableCell>
										<Badge
											variant={statusBadgeVariant(
												app.application_status?.name || ""
											)}
										>
											{app.application_status?.name || "不明"}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				) : (
					<div className="flex items-center justify-center h-full min-h-[200px]">
						<p className="text-muted-foreground">
							この日付の申請はありません。
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
