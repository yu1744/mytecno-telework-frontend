"use client";
import React, { useState, useEffect, useMemo } from "react";
import { CommonTable, ColumnDef } from "../../components/CommonTable";
import { User, Role, Department, Group } from "../../types/user";
import * as api from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import PrivateRoute from "../../components/PrivateRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Download, Upload, Plus } from "lucide-react";
import RegisterUserModal from "../../components/RegisterUserModal";
import EditUserModal from "../../components/EditUserModal";
import DeleteUserModal from "../../components/DeleteUserModal";
import UserDetailModal from "../../components/UserDetailModal";
import ImportResultModal from "@/app/components/ImportResultModal";

const AdminUsersPageContent = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal States
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [importResult, setImportResult] = useState<{
        successCount: number;
        errors: string[];
    } | null>(null);
    const [isImportResultModalOpen, setIsImportResultModalOpen] = useState(false);
    const [userDetail, setUserDetail] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes, departmentsRes, groupsRes] = await Promise.all([
                api.adminGetUsers(),
                api.getRoles(),
                api.getDepartments(),
                api.getGroups(),
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
            setDepartments(departmentsRes.data);
            setGroups(groupsRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("データの取得に失敗しました。");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await api.adminImportUsers(formData);
            setImportResult({
                successCount: parseInt(response.data.message.replace(/[^0-9]/g, ""), 10) || 0,
                errors: response.data.errors || [],
            });
            setIsImportResultModalOpen(true);
            fetchData();
        } catch (error) {
            console.error("CSV import error:", error);
            toast.error("CSVインポートに失敗しました");
        } finally {
            setLoading(false);
            e.target.value = "";
        }
    };

    const handleDownloadTemplate = () => {
        const headers = [
            "name",
            "email",
            "employee_number",
            "department_id",
            "role_id",
            "manager_id",
            "hired_date",
            "group_id",
            "position",
        ];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "user_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // User Management Handlers
    const handleRegisterUser = async (newUser: api.CreateUserParams) => {
        try {
            const res = await api.adminCreateUser(newUser);
            setUsers([...users, res.data]);
            toast.success("新しいユーザーを登録しました。");
            setRegisterModalOpen(false);
        } catch (error) {
            console.error("Failed to register user", error);
            toast.error("ユーザー登録に失敗しました。");
        }
    };

    const handleUserUpdate = async (params: api.UpdateUserParams) => {
        try {
            await api.adminUpdateUser(params.id, params);
            toast.success("ユーザー情報を更新しました。");
            fetchData();
        } catch (error) {
            toast.error("ユーザー情報の更新に失敗しました。");
            console.error("Failed to update user", error);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.adminDeleteUser(userToDelete.id);
            setUsers(users.filter((user) => user.id !== userToDelete.id));
            toast.success(`${userToDelete.name}さんを削除しました。`);
        } catch (error) {
            toast.error("ユーザーの削除に失敗しました。");
            console.error("Failed to delete user", error);
        } finally {
            setUserToDelete(null);
            setDeleteModalOpen(false);
        }
    };

    const handleOpenDetailModal = async (userId: number) => {
        try {
            const res = await api.adminGetUser(userId);
            setUserDetail(res.data);
            setIsDetailModalOpen(true);
        } catch (error) {
            toast.error("ユーザー情報の取得に失敗しました。");
        }
    };

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row }: { row: User }) => row.id,
            },
            {
                accessorKey: "employee_number",
                header: "社員番号",
                cell: ({ row }: { row: User }) => row.employee_number,
            },
            {
                accessorKey: "name",
                header: "氏名",
                cell: ({ row }: { row: User }) => row.name,
            },
            {
                accessorKey: "email",
                header: "メールアドレス",
                cell: ({ row }: { row: User }) => row.email,
            },
            {
                accessorKey: "department",
                header: "部署",
                cell: ({ row }: { row: User }) => row.department?.name || "-",
            },
            {
                accessorKey: "role",
                header: "役職/権限",
                cell: ({ row }: { row: User }) => (
                    <Badge variant="outline">{row.role?.name || "-"}</Badge>
                ),
            },
            {
                accessorKey: "actions",
                header: "アクション",
                cell: ({ row }: { row: User }) => (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetailModal(row.id)}
                        >
                            詳細
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setSelectedUser(row);
                                setIsEditModalOpen(true);
                            }}
                        >
                            編集
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setUserToDelete(row);
                                setDeleteModalOpen(true);
                            }}
                        >
                            削除
                        </Button>
                    </div>
                ),
            },
        ],
        []
    );

    if (loading) return <LoadingSpinner />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">ユーザー管理</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            className="whitespace-nowrap"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            テンプレート
                        </Button>
                        <div className="relative">
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="csv-upload"
                            />
                            <Button asChild variant="secondary">
                                <label htmlFor="csv-upload" className="cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" />
                                    CSVインポート
                                </label>
                            </Button>
                        </div>
                    </div>
                    <Button onClick={() => setRegisterModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        新規登録
                    </Button>
                </div>
            </div>

            <CommonTable columns={columns} data={users} title="ユーザー一覧" />

            <RegisterUserModal
                open={registerModalOpen}
                onClose={() => setRegisterModalOpen(false)}
                roles={roles}
                departments={departments}
                groups={groups}
                onRegister={handleRegisterUser}
            />
            <DeleteUserModal
                open={deleteModalOpen}
                onClose={() => {
                    setUserToDelete(null);
                    setDeleteModalOpen(false);
                }}
                user={userToDelete}
                onDelete={handleDeleteUser}
            />
            {selectedUser && (
                <UserDetailModal
                    open={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    user={selectedUser}
                />
            )}

            <ImportResultModal
                open={isImportResultModalOpen}
                onClose={() => setIsImportResultModalOpen(false)}
                result={importResult}
            />
            <EditUserModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                users={users}
                roles={roles}
                departments={departments}
                groups={groups}
                onUpdate={handleUserUpdate}
            />
        </div>
    );
};

const AdminUsersPage = () => {
    return (
        <PrivateRoute allowedRoles={["admin"]}>
            <AdminUsersPageContent />
        </PrivateRoute>
    );
};

export default AdminUsersPage;
