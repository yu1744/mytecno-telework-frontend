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
	getWeeklyLimitStatus,
	WeeklyLimitStatus,
} from "@/app/lib/api";
import { Application } from "@/app/types/application";
import { useAuthStore } from "@/app/store/auth";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { ApplicationDetails } from "@/app/components/ApplicationDetails";

interface Stats {
	pending: number;
	approved: number;
	rejected: number;
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
	const [weeklyLimitStatus, setWeeklyLimitStatus] = useState<WeeklyLimitStatus>({
		weekly_limit: 1,
		weekly_count: 0,
		years_of_service: 0,
	});

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

				let weeklyLimitRes = null;
				try {
					weeklyLimitRes = await getWeeklyLimitStatus();
				} catch (err) {
					console.error("Failed to fetch weekly limit status:", err);
				}

				setStats(statsRes?.data || { pending: 0, approved: 0, rejected: 0 });
				setRecentApplications(recentRes?.data || []);
				if (weeklyLimitRes?.data) {
					setWeeklyLimitStatus(weeklyLimitRes.data);
				}
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
	}, []);

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
				<h1 className="text-2xl font-bold">申請ダッシュボード</h1>
				<Button asChild className="w-full sm:w-auto">
					<Link href="/apply">新規申請</Link>
				</Button>
			</div>
			<Card className="mb-6">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg">今週の在宅勤務状況</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<div className="text-3xl font-bold">
							{weeklyLimitStatus.weekly_count} / {weeklyLimitStatus.weekly_limit}
						</div>
						<div className="text-sm text-muted-foreground">日</div>
						{weeklyLimitStatus.weekly_count >= weeklyLimitStatus.weekly_limit && (
							<span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
								上限到達
							</span>
						)}
					</div>
					<p className="text-xs text-muted-foreground mt-2">
						勤続{weeklyLimitStatus.years_of_service}年（週{weeklyLimitStatus.weekly_limit}日まで）
					</p>
				</CardContent>
			</Card>
			<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mb-6">
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
