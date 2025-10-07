import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip } from '@mui/material';
import { Application } from '../types/application';

interface ApplicationListTableProps {
  applications: Application[];
}

const getStatusChip = (statusId: number) => {
  switch (statusId) {
    case 1:
      return <Chip label="申請中" color="primary" />;
    case 2:
      return <Chip label="承認済み" color="success" />;
    case 3:
      return <Chip label="却下" color="error" />;
    default:
      return <Chip label="不明" />;
  }
};

// ダミーデータ
const dummyApplications: Application[] = [
  { id: 1, start_date: '2025-10-20', end_date: '2025-10-20', reason: '私用のため', application_status_id: 1, approver_comment: '', created_at: '2025-10-19T10:00:00Z', updated_at: '2025-10-19T10:00:00Z' },
  { id: 2, start_date: '2025-10-21', end_date: '2025-10-21', reason: '通院のため', application_status_id: 2, approver_comment: 'お大事に', created_at: '2025-10-20T11:00:00Z', updated_at: '2025-10-20T11:00:00Z' },
  { id: 3, start_date: '2025-10-22', end_date: '2025-10-22', reason: '家庭の事情', application_status_id: 3, approver_comment: '承知しました', created_at: '2025-10-21T12:00:00Z', updated_at: '2025-10-21T12:00:00Z' },
];


const ApplicationListTable: React.FC<ApplicationListTableProps> = ({ applications }) => {
  const displayApplications = applications.length > 0 ? applications : dummyApplications;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>日付</TableCell>
            <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>ステータス</TableCell>
            <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>承認者コメント</TableCell>
            <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayApplications.map((application) => (
            <TableRow
              key={application.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td, & th': { borderBottom: (theme) => `1px solid ${theme.palette.divider}` } }}
            >
              <TableCell component="th" scope="row">
                {new Date(application.start_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{getStatusChip(application.application_status_id)}</TableCell>
              <TableCell>{application.approver_comment}</TableCell>
              <TableCell>
                {application.application_status_id === 1 && (
                  <Button variant="outlined" color="secondary" size="small">
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