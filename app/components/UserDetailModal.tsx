import React from 'react';
import { User } from '@/app/types/user';
import ReusableModal from './ReusableModal';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

  const content = (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>ユーザー情報</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <span className="font-semibold text-right">ID</span>
          <span>{user.id}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <span className="font-semibold text-right">名前</span>
          <span>{user.name}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <span className="font-semibold text-right">メールアドレス</span>
          <span>{user.email}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <span className="font-semibold text-right">入社日</span>
          <span>{user.hired_date ? new Date(user.hired_date).toLocaleDateString() : "未設定"}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <span className="font-semibold text-right">部署</span>
          <span>{user.department?.name}</span>
        </div>
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <span className="font-semibold text-right">役職</span>
          <Badge variant="outline">{user.role?.name}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="ユーザー詳細"
      content={content}
      actions={[{ text: '閉じる', onClick: onClose }]}
    />
  );
};

export default UserDetailModal;