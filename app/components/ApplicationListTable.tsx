import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip } from '@mui/material';
import { Application } from '../types/application';
import { cancelApplication } from '../lib/api';
import { mutate } from 'swr';
import { useAuthStore } from '../store/auth';

interface ApplicationListTableProps {
  applications: Application[];
  onApplicationUpdate: () => void;
  showApplicant?: boolean;
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

const ApplicationListTable: React.FC<ApplicationListTableProps> = ({ applications, onApplicationUpdate, showApplicant = false }) => {
  const { user } = useAuthStore();

  const handleCancel = async (id: number) => {
    try {
      await cancelApplication(id);
      onApplicationUpdate();
    } catch (error) {
      console.error('Failed to cancel application:', error);
    }
  };

  return (
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApplicationListTable;