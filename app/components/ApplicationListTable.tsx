import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip } from '@mui/material';
import { Application } from '../types/application';
import { cancelApplication, updateApprovalStatus } from '../lib/api';
import { useAuthStore } from '../store/auth';
import ConfirmationModal from './ConfirmationModal';
import { useModalStore } from '../store/modal';
import axios from 'axios';

interface ApplicationListTableProps {
  applications: Application[];
  onApplicationUpdate: () => void;
  showApplicant?: boolean;
  isApprovalMode?: boolean;
}

const getStatusChip = (statusId: number) => {
  switch (statusId) {
    case 1:
      return <Chip label="申請中" color="primary" />;
    case 2:
      return <Chip label="承認済み" color="success" />;
    case 3:
      return <Chip label="却下" color="error" />;
    case 4:
      return <Chip label="キャンセル" color="default" />;
    default:
      return <Chip label="不明" />;
  }
};

const ApplicationListTable: React.FC<ApplicationListTableProps> = ({ applications, onApplicationUpdate, showApplicant = false, isApprovalMode = false }) => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const showModal = useModalStore((state) => state.showModal);

  const handleCancel = async (id: number) => {
    try {
      await cancelApplication(id);
      onApplicationUpdate();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        showModal({
          title: '権限エラー',
          message: 'この操作を行う権限がありません。',
          onConfirm: () => {},
        });
      } else {
        console.error('Failed to cancel application:', error);
      }
    }
  };

  const handleApprovalAction = async (id: number, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      try {
        await updateApprovalStatus(id, status);
        onApplicationUpdate();
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
        onApplicationUpdate();
      } catch (error) {
        console.error(`Failed to ${status} application:`, error);
      }
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>申請日</TableCell>
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>申請対象日</TableCell>
              {showApplicant && <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>申請者</TableCell>}
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>ステータス</TableCell>
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>承認者コメント</TableCell>
              <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow
                key={application.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td, & th': { borderBottom: (theme) => `1px solid ${theme.palette.divider}` } }}
              >
                <TableCell component="th" scope="row">
                  {new Date(application.created_at).toLocaleDateString('ja-JP')}
                </TableCell>
                <TableCell>
                  {new Date(application.date).toLocaleDateString('ja-JP')}
                </TableCell>
                {showApplicant && <TableCell>{application.user.name}</TableCell>}
                <TableCell>{getStatusChip(application.application_status_id)}</TableCell>
                <TableCell>{application.approver_comment}</TableCell>
                <TableCell>
                  {application.application_status_id === 1 && (
                    <Button variant="outlined" color="secondary" size="small" onClick={() => handleCancel(application.id)}>
                      キャンセル
                    </Button>
                  )}
                 {isApprovalMode && application.application_status_id === 1 && (
                   <>
                     <Button
                       variant="contained"
                       color="primary"
                       size="small"
                       onClick={() => handleApprovalAction(application.id, 'approved')}
                       sx={{ mr: 1 }}
                     >
                       承認
                     </Button>
                     <Button
                       variant="contained"
                       color="error"
                       size="small"
                       onClick={() => handleApprovalAction(application.id, 'rejected')}
                     >
                       否認
                     </Button>
                   </>
                 )}
               </TableCell>
             </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async () => {
          if (selectedApplicationId) {
            try {
              await updateApprovalStatus(selectedApplicationId, 'approved');
              onApplicationUpdate();
            } catch (error) {
              console.error(`Failed to approved application:`, error);
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