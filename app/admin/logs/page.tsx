"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import * as api from "../../lib/api";
import type { OperationLog, OperationLogParams } from "../../lib/api";
import PrivateRoute from "../../components/PrivateRoute";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ACTION_TYPES = [
    { value: "", label: "すべて" },
    { value: "login", label: "ログイン" },
    { value: "logout", label: "ログアウト" },
    { value: "create_application", label: "申請作成" },
    { value: "cancel_application", label: "申請取消" },
    { value: "approve", label: "承認" },
    { value: "reject", label: "却下" },
    { value: "create_user", label: "ユーザー作成" },
    { value: "update_user", label: "ユーザー更新" },
    { value: "delete_user", label: "ユーザー削除" },
    { value: "import_users", label: "ユーザー一括登録" },
];

const LogsPageContent = () => {
    const [logs, setLogs] = useState<OperationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [perPage] = useState(20);
    const [filters, setFilters] = useState<OperationLogParams>({
        action_type: "",
        start_date: "",
        end_date: "",
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const params: OperationLogParams = {
                ...filters,
                page,
                per_page: perPage,
            };
            const response = await api.getOperationLogs(params);
            setLogs(response.data.logs);
            setTotal(response.data.total);
        } catch (err) {
            toast.error("ログの取得に失敗しました。");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, page, perPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFilterChange = (key: keyof OperationLogParams, value: string) => {
        const adjustedValue = value === "all" ? "" : value;
        setFilters((prev) => ({ ...prev, [key]: adjustedValue }));
        setPage(1);
    };

    const handleExport = async () => {
        try {
            const response = await api.exportOperationLogs(filters);
            const blob = new Blob([response.data as BlobPart], { type: "text/csv;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `operation_logs_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success("CSVをダウンロードしました。");
        } catch (err) {
            toast.error("CSVのエクスポートに失敗しました。");
            console.error(err);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <main className="p-6">
            <Toaster />
            <div className="mb-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        管理者ページに戻る
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>操作ログ</CardTitle>
                        <Button onClick={handleExport} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            CSVエクスポート
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-sm font-medium mb-1 block">操作種別</label>
                            <Select
                                value={filters.action_type || ""}
                                onValueChange={(value) => handleFilterChange("action_type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="すべて" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTION_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value || "all"}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-[160px]">
                            <label className="text-sm font-medium mb-1 block">開始日</label>
                            <Input
                                type="date"
                                value={filters.start_date || ""}
                                onChange={(e) => handleFilterChange("start_date", e.target.value)}
                            />
                        </div>
                        <div className="min-w-[160px]">
                            <label className="text-sm font-medium mb-1 block">終了日</label>
                            <Input
                                type="date"
                                value={filters.end_date || ""}
                                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">日時</TableHead>
                                        <TableHead className="font-bold">ユーザー</TableHead>
                                        <TableHead className="font-bold">操作</TableHead>
                                        <TableHead className="font-bold">対象</TableHead>
                                        <TableHead className="font-bold">IPアドレス</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                ログがありません
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {formatDate(log.created_at)}
                                                </TableCell>
                                                <TableCell>{log.user_name}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary">
                                                        {log.action_label}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {log.target_type && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {log.target_type} #{log.target_id}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {log.ip_address}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        全{total}件中 {(page - 1) * perPage + 1} - {Math.min(page * perPage, total)}件を表示
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage((p) => p - 1)}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <span className="text-sm">
                                            {page} / {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === totalPages}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </main>
    );
};

const LogsPage = () => {
    return (
        <PrivateRoute allowedRoles={["admin"]}>
            <LogsPageContent />
        </PrivateRoute>
    );
};

export default LogsPage;
