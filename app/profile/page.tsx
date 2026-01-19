"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProfile, updateUser, UpdateUserParams } from "@/app/lib/api";
import { User } from "@/app/types/user";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import EditProfileModal from "@/app/components/EditProfileModal";
import { NotificationSettings } from "@/app/components/NotificationSettings";
import { toast } from "sonner";
import {
  User as UserIcon,
  Building,
  Mail,
  Briefcase,
  CreditCard,
  KeyRound,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      toast.error("プロフィールの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateUser = async (params: UpdateUserParams) => {
    try {
      await updateUser(params.id, params);
      toast.success("パスワードを更新しました。");
      fetchProfile();
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("パスワードの更新に失敗しました。");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <div>ユーザー情報の取得に失敗しました。</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">プロフィール</h1>

      <div className="space-y-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <UserIcon className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">氏名</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CreditCard className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">社員番号</p>
                  <p className="font-semibold">{user.employee_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Building className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">部署</p>
                  <p className="font-semibold">{user.department.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Briefcase className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">役職</p>
                  <p className="font-semibold">{user.role.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 md:col-span-2">
                <Mail className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">メールアドレス</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsModalOpen(true)} variant="outline">
                <KeyRound className="h-4 w-4 mr-2" />
                パスワードを変更
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* プッシュ通知設定 */}
        <NotificationSettings />
      </div>
      <EditProfileModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onUpdate={handleUpdateUser}
      />
    </div>
  );
}
