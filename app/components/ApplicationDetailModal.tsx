'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import { Application } from '@/app/types/application';

interface ModalApplication {
  id: number;
  user_name: string;
  status: string;
}

interface Props {
  date: string;
  applications: ModalApplication[];
  isOpen: boolean;
  onClose: () => void;
}

const statusColorMap: { [key: string]: string } = {
  '申請中': 'bg-yellow-500',
  '承認': 'bg-green-500',
  '却下': 'bg-red-500',
};

export function ApplicationDetailModal({ date, applications, isOpen, onClose }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{date} の申請詳細</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between p-2 border rounded-md">
              <div>
                <p className="font-semibold">{app.user_name}</p>
              </div>
              <Badge className={statusColorMap[app.status]}>{app.status}</Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}