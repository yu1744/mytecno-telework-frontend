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
import { toast } from "sonner";
import {
  User as UserIcon,
  Building,
  Mail,
  Briefcase,
  CreditCard,
  Train,
  ArrowRight,
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
      toast.success("プロフィールを更新しました。");
      fetchProfile();
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("プロフィールの更新に失敗しました。");
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
        <Card>
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
              <Button onClick={() => setIsModalOpen(true)}>
                プロフィールを編集する
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>通勤経路情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.transport_routes && user.transport_routes.length > 0 ? (
              <>
                {user.transport_routes.map((route, index) => (
                  <Card key={route.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold mb-2">
                            経路{index + 1}
                          </h3>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <span>{route.departure_station}</span>
                            <ArrowRight className="h-4 w-4" />
                            {route.via_station && (
                              <>
                                <span>{route.via_station}</span>
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                            <span>{route.arrival_station}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Train className="h-5 w-5 text-gray-500" />
                            <span>{route.transport_type}</span>
                          </div>
                          <p className="font-semibold text-lg">
                            {route.fare.toLocaleString()}円
                            <span className="text-sm text-gray-500">/月</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="mt-6 flex justify-end">
                  <Button>編集する</Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4">通勤経路情報は登録されていません。</p>
                <Button>登録する</Button>
              </div>
            )}
          </CardContent>
        </Card>
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