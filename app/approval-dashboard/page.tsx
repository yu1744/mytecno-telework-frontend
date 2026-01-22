"use client";
import { StatCard } from "@/app/components/StatCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { getPendingApprovals, getPendingApprovalsCount } from "@/app/lib/api";
import { Application } from "@/app/types/application";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import PrivateRoute from "@/app/components/PrivateRoute";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const getStatusBadge = (statusId?: number) => {
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

const ApprovalDashboardContent = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const [recentPendingApprovals, setRecentPendingApprovals] = useState<
        Application[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let pendingCountRes = null;
                let pendingApprovalsRes = null;

                try {
                    pendingCountRes = await getPendingApprovalsCount();
                } catch (err) {
                    console.error("Failed to fetch pending approvals count:", err);
                }

                try {
                    pendingApprovalsRes = await getPendingApprovals({});
                } catch (err) {
                    console.error("Failed to fetch pending approvals:", err);
                }

                setPendingCount(pendingCountRes?.data?.pending_count || 0);
                // 最近の5件のみ表示
                setRecentPendingApprovals(
                    (pendingApprovalsRes?.data || []).slice(0, 5)
                );
                setError(null);
            } catch (err) {
                setError("データの取得に失敗しました。");
                console.error("Approval Dashboard fetch error:", err);
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
        <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b pb-4">
                <h1 className="text-3xl font-extrabold tracking-tight">承認ダッシュボード</h1>
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/approvals">承認待ち一覧へ</Link>
                </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mb-8">
                <StatCard
                    title="承認待ち件数"
                    value={pendingCount}
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>最近の承認待ち申請</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentPendingApprovals.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>申請日</TableHead>
                                    <TableHead>申請者</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        申請対象日
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        申請理由
                                    </TableHead>
                                    <TableHead>ステータス</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentPendingApprovals.map((application) => (
                                    <TableRow key={application.id}>
                                        <TableCell>
                                            {application.created_at
                                                ? format(new Date(application.created_at), "yyyy/MM/dd")
                                                : "-"}
                                        </TableCell>
                                        <TableCell>{application.user?.name || "-"}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {application.date
                                                ? format(new Date(application.date), "yyyy/MM/dd")
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {application.reason || "-"}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(application.application_status_id)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground">承認待ちの申請はありません</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const ApprovalDashboardPage = () => {
    return (
        <PrivateRoute allowedRoles={["admin", "approver"]}>
            <ApprovalDashboardContent />
        </PrivateRoute>
    );
};

export default ApprovalDashboardPage;
