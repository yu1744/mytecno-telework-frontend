import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '../types/application';
import { adminGetApplications, getApplications, cancelApplication, updateApprovalStatus, ApplicationRequestParams } from '../lib/api';
import { useAuthStore } from '../store/auth';
import ConfirmationModal from './ConfirmationModal';
import { useModalStore } from '../store/modal';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { User } from '../types/user';
import { adminGetUsers } from '../lib/api';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import ApprovalCommentModal from './ApprovalCommentModal';
import { ArrowUpDown } from "lucide-react";

interface ApplicationListTableProps {
  isAdmin: boolean;
}

const getStatusBadge = (statusId: number) => {
  switch (statusId) {
    case 1: return <Badge variant="outline">申請中</Badge>;
    case 2: return <Badge className="bg-green-100 text-green-800">承認済み</Badge>;
    case 3: return <Badge variant="destructive">却下</Badge>;
    case 4: return <Badge variant="secondary">キャンセル</Badge>;
    default: return <Badge variant="secondary">不明</Badge>;
  }
};

const ApplicationListTable: React.FC<ApplicationListTableProps> = ({ isAdmin }) => {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<ApplicationRequestParams['sort_by']>('created_at');
  const [sortOrder, setSortOrder] = useState<ApplicationRequestParams['sort_order']>('desc');
  const [filterByStatus, setFilterByStatus] = useState<string>('');
  const [filterByUser, setFilterByUser] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const showModal = useModalStore((state) => state.showModal);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected' | null>(null);
 
   const handleOpenDetailModal = (application: Application) => {
     setSelectedApplication(application);
     setIsDetailModalOpen(true);
   };

  const handleCloseDetailModal = () => {
    setSelectedApplication(null);
    setIsDetailModalOpen(false);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: ApplicationRequestParams = {
        sort_by: sortBy,
        sort_order: sortOrder,
        filter_by_status: filterByStatus,
        filter_by_user: filterByUser,
      };
      // 空のパラメータを削除
      Object.keys(params).forEach(key => (params[key as keyof ApplicationRequestParams] === '' || params[key as keyof ApplicationRequestParams] === undefined) && delete params[key as keyof ApplicationRequestParams]);

      const response = isAdmin ? await adminGetApplications(params) : await getApplications(params);
      setApplications(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('申請データの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (isAdmin) {
      try {
        const response = await adminGetUsers();
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchUsers();
  }, [sortBy, sortOrder, filterByStatus, filterByUser, isAdmin]);

  const handleSort = (property: ApplicationRequestParams['sort_by']) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelApplication(id);
      fetchApplications();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        showModal({ title: '権限エラー', message: 'この操作を行う権限がありません。', onConfirm: () => {} });
      } else {
        console.error('Failed to cancel application:', error);
      }
    }
  };

  const handleApprovalAction = (id: number, status: 'approved' | 'rejected') => {
    setSelectedApplicationId(id);
    setApprovalStatus(status);
    setIsCommentModalOpen(true);
  };

  const handleConfirmApprovalAction = async (comment: string, status: 'approved' | 'rejected') => {
    if (!selectedApplicationId) return;

    try {
      await updateApprovalStatus(selectedApplicationId, status, comment);
      fetchApplications();
    } catch (error) {
      console.error(`Failed to ${status} application:`, error);
    } finally {
      setIsCommentModalOpen(false);
      setSelectedApplicationId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{isAdmin ? '申請管理' : '申請履歴'}</CardTitle>
      </CardHeader>
      <CardContent>
        <>
          <div className="flex flex-col sm:flex-row mb-2 gap-2">
            <Select value={filterByStatus || "all"} onValueChange={(value) => setFilterByStatus(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="1">申請中</SelectItem>
                <SelectItem value="2">承認済み</SelectItem>
                <SelectItem value="3">却下</SelectItem>
                <SelectItem value="4">キャンセル</SelectItem>
              </SelectContent>
            </Select>
            {isAdmin && (
              <Select value={filterByUser || "all"} onValueChange={(value) => setFilterByUser(value === "all" ? "" : value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="申請者" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">
                    <Button variant="ghost" onClick={() => handleSort('created_at')}>
                      申請日
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('date')}>
                      申請対象日
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>申請者</TableHead>
                  <TableHead className="hidden md:table-cell">部署</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('status')}>
                      ステータス
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">承認者コメント</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      対象の申請はありません。
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="hidden md:table-cell">{new Date(application.created_at).toLocaleDateString('ja-JP')}</TableCell>
                      <TableCell>{new Date(application.date).toLocaleDateString('ja-JP')}</TableCell>
                      <TableCell>{application.user.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{application.user.department?.name}</TableCell>
                      <TableCell>{getStatusBadge(application.application_status_id)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{application.approver_comment}</TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(application)}>
                            詳細
                          </Button>
                          {application.application_status_id === 1 && !isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => handleCancel(application.id)}>
                              キャンセル
                            </Button>
                          )}
                          {isAdmin && application.application_status_id === 1 && (
                           <>
                             <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprovalAction(application.id, 'approved')}>
                               承認
                             </Button>
                             <Button variant="destructive" size="sm" onClick={() => handleApprovalAction(application.id, 'rejected')}>
                               否認
                             </Button>
                           </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={async () => {
            if (selectedApplicationId) {
              try {
                await updateApprovalStatus(selectedApplicationId, 'approved');
                fetchApplications();
              } catch (error) {
                console.error(`Failed to approve application:`, error);
              }
            }
            setIsModalOpen(false);
            setSelectedApplicationId(null);
          }}
          title="承認確認"
          message="他の部署の申請です。本当に承認しますか？"
        />
        {selectedApplication && (
          <ApplicationDetailModal
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetailModal}
            date={selectedApplication.date}
            applications={[{id: selectedApplication.id, user_name: selectedApplication.user.name, status: selectedApplication.application_status?.name || '不明'}]}
          />
        )}
       <ApprovalCommentModal
         isOpen={isCommentModalOpen}
         onClose={() => {
           setIsCommentModalOpen(false);
           setApprovalStatus(null);
         }}
         onConfirm={handleConfirmApprovalAction}
         applicationId={selectedApplicationId}
         status={approvalStatus}
       />
      </CardContent>
    </Card>
  );
};

export default ApplicationListTable;