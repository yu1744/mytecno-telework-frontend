import React from 'react';
import { User } from '@/app/types/user';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDetailModal: React.FC<Props> = ({ open, onClose, user }) => {
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ユーザー詳細</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">ID</p>
            <p className="col-span-2">{user.id}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">名前</p>
            <p className="col-span-2">{user.name}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">メールアドレス</p>
            <p className="col-span-2">{user.email}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">入社日</p>
            <p className="col-span-2">{user.hired_date ? new Date(user.hired_date).toLocaleDateString() : "未設定"}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">部署</p>
            <p className="col-span-2">{user.department?.name}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">グループ</p>
            <p className="col-span-2">{user.group?.name || "未設定"}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">役職</p>
            <p className="col-span-2">{user.position || "未設定"}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">権限</p>
            <div className="col-span-2">
              <Badge variant="outline">{user.role?.name}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-right font-semibold">育児・介護</p>
            <div className="col-span-2 flex flex-col">
              <p>育児: {user.has_child_under_elementary ? "あり" : "なし"}</p>
              <p>介護: {user.is_caregiver ? "あり" : "なし"}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;