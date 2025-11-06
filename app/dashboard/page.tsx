"use client";
import { StatCard } from "@/app/components/StatCard";
import { RecentApplicationsTable } from "@/app/components/RecentApplicationsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getApplicationStats, getRecentApplications } from "@/app/lib/api";
import { Application } from "@/app/types/application";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
}

const DashboardPage = () => {
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0 });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, recentRes] = await Promise.all([
          getApplicationStats(),
          getRecentApplications(),
        ]);
        setStats(statsRes.data);
        setRecentApplications(recentRes.data);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button asChild>
          <Link href="/apply">新規申請</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard title="未処理" value={stats.pending} />
        <StatCard title="承認済み" value={stats.approved} />
        <StatCard title="却下済み" value={stats.rejected} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近の申請</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentApplicationsTable applications={recentApplications} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;