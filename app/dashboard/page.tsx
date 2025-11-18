"use client";
import { StatCard } from "@/app/components/StatCard";
import { RecentApplicationsTable } from "@/app/components/RecentApplicationsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCalendar } from "@/app/components/DashboardCalendar";
import React, { useEffect, useState } from "react";
import {
	getApplicationStats,
	getRecentApplications,
	getCalendarApplications,
	getPendingApprovalsCount,
} from "@/app/lib/api";
import { Application } from "@/app/types/application";
import { useAuthStore } from "@/app/store/auth";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { ApplicationDetails } from "@/app/components/ApplicationDetails";

interface Stats {
	pending: number;
	approved: number;
	rejected: number;
	pendingApprovals?: number;
}

const DashboardPage = () => {
	const { user } = useAuthStore();
	const [stats, setStats] = useState<Stats>({
		pending: 0,
		approved: 0,
		rejected: 0,
	});
	const [recentApplications, setRecentApplications] = useState<Application[]>(
		[]
	);
	const [calendarApplications, setCalendarApplications] = useState<
		Application[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const today = new Date();
				const year = today.getFullYear();
				const month = today.getMonth() + 1;

				// 各APIを個別にエラーハンドリングで呼び出し
				let statsRes = null;
				let recentRes = null;
				let calendarRes = null;
				let pendingApprovalsCountRes = null;

				try {
					statsRes = await getApplicationStats();
				} catch (err) {
					console.error("Failed to fetch stats:", err);
				}

				try {
					recentRes = await getRecentApplications();
				} catch (err) {
					console.error("Failed to fetch recent applications:", err);
				}

				try {
					calendarRes = await getCalendarApplications(year, month);
				} catch (err) {
					console.error("Failed to fetch calendar applications:", err);
				}

				if (user?.role?.name === "approver" || user?.role?.name === "admin") {
					try {
						pendingApprovalsCountRes = await getPendingApprovalsCount();
					} catch (err) {
						console.error("Failed to fetch pending approvals count:", err);
					}
				}

				setStats({
					...(statsRes?.data || { pending: 0, approved: 0, rejected: 0 }),
					pendingApprovals: pendingApprovalsCountRes?.data?.pending_count as
						| number
						| undefined,
				});
				setRecentApplications(recentRes?.data || []);
				const calendarData = calendarRes?.data || {};
				const flattenedApplications: Application[] = [];
				for (const date in calendarData) {
					const dayData = calendarData[date];
					if (dayData && Array.isArray(dayData.applications)) {
						dayData.applications.forEach((app: any) => {
							flattenedApplications.push({
								id: app.id,
								date: date,
								user: {
									id: 0, // APIからuser.idが返されないためダミーデータ
									name: app.user_name,
									transport_routes: [],
								},
								application_status: { name: app.status, id: 0 },
								work_style: app.work_style || "",
								// Application 型が要求する他の必須プロパティ
								reason: "",
								work_option: "",
								start_time: null,
								end_time: null,
								is_special: false,
								is_overtime: false,
								overtime_reason: null,
								overtime_end: null,
								project: null,
								break_time: null,
								approvals: [],
								application_type: "",
							});
						});
					}
				}
				setCalendarApplications(flattenedApplications);
				setError(null);
			} catch (err) {
				setError("データの取得に失敗しました。");
				console.error("Dashboard fetch error:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user]);

	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);
	};

	const applicationsForSelectedDate = calendarApplications.filter(
		(app: Application) => {
			if (!selectedDate) return false;

			// selectedDate (ローカルタイムゾーン) を 'YYYY-MM-DD' 形式の文字列に変換
			const year = selectedDate.getFullYear();
			const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
			const day = String(selectedDate.getDate()).padStart(2, "0");
			const selectedDateStr = `${year}-${month}-${day}`;

			// app.date は 'YYYY-MM-DD' 形式の文字列なので、時差を考慮せず直接比較
			// app.date は 'YYYY-MM-DD' 形式の文字列なので、時差を考慮せず直接比較
			const appDateStr = app.date.split("T")[0];

			return appDateStr === selectedDateStr;
		}
	);

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return <div className="text-red-500 text-center mt-10">{error}</div>;
	}

	return (
		<div className="p-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
				<h1 className="text-2xl font-bold">ダッシュボード</h1>
				<Button asChild className="w-full sm:w-auto">
					<Link href="/apply">新規申請</Link>
				</Button>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mb-6">
				{(user?.role?.name === "approver" || user?.role?.name === "admin") && (
					<StatCard
						title="承認待ち件数"
						value={stats.pendingApprovals ?? 0}
						description="あなたが承認する必要がある申請"
					/>
				)}
				<StatCard
					title="未処理"
					value={stats.pending}
					description="自分の申請状況"
				/>
				<StatCard
					title="承認済み"
					value={stats.approved}
					description="自分の申請状況"
				/>
				<StatCard
					title="却下済み"
					value={stats.rejected}
					description="自分の申請状況"
				/>
			</div>
			<div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
				<Card className="xl:col-span-3 flex flex-col">
					<CardHeader>
						<CardTitle>申請カレンダーと詳細</CardTitle>
					</CardHeader>
					<CardContent className="flex-grow">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
							<div className="md:col-span-1 h-full">
								<DashboardCalendar
									applications={calendarApplications}
									onDateSelect={handleDateSelect}
								/>
							</div>
							<div className="md:col-span-1 h-full">
								<ApplicationDetails
									selectedDate={selectedDate}
									applications={applicationsForSelectedDate}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="xl:col-span-2">
					<CardHeader>
						<CardTitle>最近の申請</CardTitle>
					</CardHeader>
					<CardContent>
						{recentApplications.length > 0 ? (
							<RecentApplicationsTable applications={recentApplications} />
						) : (
							<p>最近の申請はありません</p>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default DashboardPage;
