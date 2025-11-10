import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip,
  Box, TextField, MenuItem, TableSortLabel, Typography
} from '@mui/material';
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

interface ApplicationListTableProps {
  isAdmin?: boolean;
}

const getStatusChip = (statusId: number) => {
  switch (statusId) {
    case 1: return <Chip label="申請中" color="primary" />;
    case 2: return <Chip label="承認済み" color="success" />;
    case 3: return <Chip label="却下" color="error" />;
    case 4: return <Chip label="キャンセル" color="default" />;
    default: return <Chip label="不明" />;
  }
};

const ApplicationListTable: React.FC<ApplicationListTableProps> = ({ isAdmin = false }) => {
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

  const handleApprovalAction = async (id: number, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      try {
        await updateApprovalStatus(id, status);
        fetchApplications();
      } catch (error) {
        console.error(`Failed to ${status} application:`, error);
      }
      return;
    }

    const application = applications.find(app => app.id === id);
    if (!application || !user) return;

    if (user.department_id !== application.user.department_id) {
      setSelectedApplicationId(id);
      setIsModalOpen(true);
    } else {
      try {
        await updateApprovalStatus(id, status);
        fetchApplications();
      } catch (error) {
        console.error(`Failed to ${status} application:`, error);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <TextField
          select
          label="ステータス"
          value={filterByStatus}
          onChange={(e) => setFilterByStatus(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">すべて</MenuItem>
          <MenuItem value="1">申請中</MenuItem>
          <MenuItem value="2">承認済み</MenuItem>
          <MenuItem value="3">却下</MenuItem>
          <MenuItem value="4">キャンセル</MenuItem>
        </TextField>
        {isAdmin && (
          <TextField
            select
            label="申請者"
            value={filterByUser}
            onChange={(e) => setFilterByUser(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">すべて</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
            ))}
          </TextField>
        )}
      </Box>
      {applications.length === 0 ? (
        <EmptyState message="対象の申請はありません。" />
      ) : (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 'auto' }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>
                <TableSortLabel active={sortBy === 'created_at'} direction={sortBy === 'created_at' ? sortOrder : 'asc'} onClick={() => handleSort('created_at')}>
                  申請日
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>
                 <TableSortLabel active={sortBy === 'date'} direction={sortBy === 'date' ? sortOrder : 'asc'} onClick={() => handleSort('date')}>
                  申請対象日
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>申請者</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>部署</TableCell>
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>
                <TableSortLabel active={sortBy === 'status'} direction={sortBy === 'status' ? sortOrder : 'asc'} onClick={() => handleSort('status')}>
                  ステータス
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' }, backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>承認者コメント</TableCell>
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{new Date(application.created_at).toLocaleDateString('ja-JP')}</TableCell>
                <TableCell>{new Date(application.date).toLocaleDateString('ja-JP')}</TableCell>
                <TableCell>{application.user.name}</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{application.user.department?.name}</TableCell>
                <TableCell>{getStatusChip(application.application_status_id)}</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{application.approver_comment}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    {application.application_status_id === 1 && !isAdmin && (
                      <Button variant="outlined" color="secondary" size="small" onClick={() => handleCancel(application.id)}>
                        キャンセル
                      </Button>
                    )}
                    {isAdmin && application.application_status_id === 1 && (
                     <>
                       <Button variant="contained" color="primary" size="small" onClick={() => handleApprovalAction(application.id, 'approved')}>
                         承認
                       </Button>
                       <Button variant="contained" color="error" size="small" onClick={() => handleApprovalAction(application.id, 'rejected')}>
                         否認
                       </Button>
                     </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      )}
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
    </>
  );
};

export default ApplicationListTable;