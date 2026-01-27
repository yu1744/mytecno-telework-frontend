"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/store/auth";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentTrendChart from "@/app/components/DepartmentTrendChart";
import MonthlyComparisonChart from "@/app/components/MonthlyComparisonChart";
import { Department } from "@/app/types/department";

interface UsageStats {
  total_users: number;
  users_by_department: { name: string; count: number }[];
  applications_by_type: { application_type: string; count: number }[];
  applications_by_month: { month: string; count: number }[];
  users_by_group: { name: string; count: number }[];
}

const AdminUsagePage = () => {
  const { user, accessToken, client, uid } = useAuthStore();
  const router = useRouter();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [usersByGroup, setUsersByGroup] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (user && user.role.name !== "admin") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchUsageStats = async () => {
      if (!accessToken || !client || !uid) {
        setError("認証情報がありません。");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/usage_stats`,
          {
            headers: {
              "Content-Type": "application/json",
              "access-token": accessToken,
              client: client,
              uid: uid,
            },
          }
        );

        if (!response.ok) {
          throw new Error("データの取得に失敗しました。");
        }

        const data = await response.json();
        setUsageStats(data);
        if (data.users_by_group) {
          setUsersByGroup(data.users_by_group);
        }
        if (data.users_by_department) {
          setDepartments(data.users_by_department.map((d: { name: string; id?: number }, index: number) => ({ 
            id: d.id || index, 
            name: d.name 
          })));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました。"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role.name === "admin") {
      fetchUsageStats();
    }
  }, [user, accessToken, client, uid]);

  const handleExportCsv = async () => {
    console.log("handleExportCsv called");
    console.log("Auth info:", { accessToken: !!accessToken, client: !!client, uid: !!uid });

    if (!accessToken || !client || !uid) {
      setError("認証情報がありません。");
      console.error("Missing auth info");
      return;
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/usage_stats/export`;
      console.log("Fetching:", url);

      const response = await fetch(url, {
        headers: {
          "access-token": accessToken,
          client: client,
          uid: uid,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error("CSVエクスポートに失敗しました。");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "usage_stats.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      console.log("CSV download triggered");
    } catch (err) {
      console.error("Export error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "CSVエクスポートに失敗しました。"
      );
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!usageStats) {
    return <div>データを表示できません。</div>;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">利用状況</h1>
        <Button onClick={handleExportCsv}>CSVエクスポート</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>総ユーザー数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{usageStats.total_users}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>部署ごとのユーザー数</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageStats.users_by_department}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="ユーザー数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>申請種別ごとの申請数</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageStats.applications_by_type}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="application_type"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {usageStats.applications_by_type.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>グループごとのユーザー数</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usersByGroup}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {usersByGroup.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>月別の申請数</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageStats.applications_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="申請数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>高度な分析</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="trend" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="trend">部署別の推移 (時系列)</TabsTrigger>
                <TabsTrigger value="monthly">月別の部署比較 (断面)</TabsTrigger>
              </TabsList>

              <TabsContent value="trend" className="space-y-4">
                <div className="p-4 border rounded-lg bg-slate-50/50">
                  <h3 className="text-lg font-medium mb-4">特定の部署を選択して推移を確認</h3>
                  <DepartmentTrendChart
                    departments={departments}
                    accessToken={accessToken!}
                    client={client!}
                    uid={uid!}
                  />
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                <div className="p-4 border rounded-lg bg-slate-50/50">
                  <h3 className="text-lg font-medium mb-4">特定の月の申請数バランスを確認</h3>
                  <MonthlyComparisonChart
                    accessToken={accessToken!}
                    client={client!}
                    uid={uid!}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsagePage;