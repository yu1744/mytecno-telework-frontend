"use client";
import { StatCard } from "@/app/components/StatCard";
import { RecentApplicationsTable } from "@/app/components/RecentApplicationsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCalendar } from "@/app/components/DashboardCalendar";
import { useEffect, useState } from "react";
import { getApplicationStats, getRecentApplications, getCalendarApplications, getApplicationsByDate } from "@/app/lib/api";
import { Application } from "@/app/types/application";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { ApplicationDetailModal } from "@/app/components/ApplicationDetailModal";
import { toast } from "sonner";

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0 });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [calendarApplications, setCalendarApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const [statsRes, recentRes, calendarRes] = await Promise.all([
          getApplicationStats(),
          getRecentApplications(),
          getCalendarApplications(year, month),
        ]);
        setStats(statsRes.data || { pending: 0, approved: 0, rejected: 0 });
        setRecentApplications(recentRes.data || []);
        setCalendarApplications(calendarRes.data || []);
        setError(null);
      } catch (err) {
        setError("データの取得に失敗しました。");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDateSelect = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    try {
      const res = await getApplicationsByDate(dateStr);
      if (res.data && res.data.length > 0) {
        setSelectedDate(dateStr);
        setSelectedApplications(res.data);
        setIsModalOpen(true);
      } else {
        toast.info("この日付の申請はありません。");
      }
    } catch (error) {
      console.error("Failed to fetch applications for date:", error);
      toast.error("申請データの取得に失敗しました。");
    }
  };

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
        <StatCard title="未処理" value={stats.pending} />
        <StatCard title="承認済み" value={stats.approved} />
        <StatCard title="却下済み" value={stats.rejected} />
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>申請カレンダー</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCalendar
              applications={calendarApplications}
              onDateSelect={handleDateSelect}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
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
      {selectedDate && (
        <ApplicationDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          applications={selectedApplications.map(app => ({
            id: app.id,
            user_name: app.user.name,
            status: app.application_status?.name || 'unknown',
          }))}
        />
      )}
    </div>
  );
};

export default DashboardPage;