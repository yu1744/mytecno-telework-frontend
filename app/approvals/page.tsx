"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Modal, TextField, Chip, Tooltip } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Application } from '../types/application';
import PrivateRoute from '../components/PrivateRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from '../lib/api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';


// 申請種別に応じてアイコンを返すヘルパー関数
const getApplicationTypeIcon = (type: string | undefined) => {
  switch (type) {
    case 'over_8_hours':
      return (
        <Tooltip title="8時間超勤務">
          <Chip icon={<MoreTimeIcon />} label="8h超" color="warning" size="small" />
        </Tooltip>
      );
    case 'late_night_early_morning':
      return (
        <Tooltip title="早朝/深夜勤務">
          <Chip icon={<AccessTimeIcon />} label="早朝/深夜" color="secondary" size="small" />
        </Tooltip>
      );
    default:
      return null;
  }
};


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ApprovalsPage = () => {
  const [applications, setApplications] = useState<(Application & { weekly_application_count?: number, application_type?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const dummyApprovals: (Application & { weekly_application_count?: number, application_type?: string })[] = [
      { id: 1, user: { id: 2, name: '鈴木 一郎', email: 'suzuki@example.com', hired_date: '2021-04-01', role_id: 3, department_id: 2 }, start_date: '2023-10-10', end_date: '2023-10-10', reason: '体調不良のため', application_status_id: 2, application_status: { id: 2, name: '申請中' }, created_at: '2023-10-09T09:00:00Z', updated_at: '2023-10-09T09:00:00Z', weekly_application_count: 3, application_type: 'over_8_hours' },
      { id: 2, user: { id: 3, name: '佐藤 花子', email: 'sato@example.com', hired_date: '2019-04-01', role_id: 3, department_id: 1 }, start_date: '2023-10-11', end_date: '2023-10-11', reason: '役所手続きのため', application_status_id: 2, application_status: { id: 2, name: '申請中' }, created_at: '2023-10-09T14:00:00Z', updated_at: '2023-10-09T14:00:00Z', weekly_application_count: 1, application_type: 'late_night_early_morning' },
      { id: 3, user: { id: 4, name: '田中 太郎', email: 'tanaka@example.com', hired_date: '2022-04-01', role_id: 3, department_id: 3 }, start_date: '2023-10-12', end_date: '2023-10-12', reason: '子供の送迎', application_status_id: 2, application_status: { id: 2, name: '申請中' }, created_at: '2023-10-10T08:30:00Z', updated_at: '2023-10-10T08:30:00Z', weekly_application_count: 2 },
    ];
    setApplications(dummyApprovals);
    setLoading(false);
  }, []);

  const handleOpen = (app: Application) => {
    setSelectedApp(app);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedApp(null);
    setComment('');
  };

  const handleApprove = (appId: number) => {
    console.log(`Approve application ${appId}`);
    // 機能ロジックは実装しない
  };

  const handleReject = () => {
    if (selectedApp && comment.trim() !== '') {
      console.log(`Reject application ${selectedApp.id} with comment: ${comment}`);
      // 機能ロジックは実装しない
      handleClose();
    }
  };


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PrivateRoute allowedRoles={['admin', 'approver']}>
      <Box sx={{ display: 'flex' }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 4 }}>承認待ち一覧</Typography>
            {error && <Typography color="error">{error}</Typography>}
            {!error && applications.length === 0 ? (
              <EmptyState message="承認待ちの申請はありません。" />
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>申請者</TableCell>
                      <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>日付</TableCell>
                      <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>申請種別</TableCell>
                      <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>理由</TableCell>
                      <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>今週の申請回数</TableCell>
                      <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow
                        key={app.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td, & th': { borderBottom: (theme) => `1px solid ${theme.palette.divider}` } }}
                      >
                        <TableCell component="th" scope="row">
                          {app.user?.name}
                        </TableCell>
                        <TableCell>{new Date(app.start_date).toLocaleDateString()}</TableCell>
                        <TableCell>{getApplicationTypeIcon(app.application_type)}</TableCell>
                        <TableCell>{app.reason}</TableCell>
                        <TableCell align="center">{app.weekly_application_count ?? 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={() => handleApprove(app.id)}>
                            承認
                          </Button>
                          <Button variant="outlined" color="error" onClick={() => handleOpen(app)}>
                            却下
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="reject-modal-title"
      >
        <Box sx={style}>
          <Typography id="reject-modal-title" variant="h6" component="h2">
            却下理由入力
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            label="却下理由やコメント"
            margin="normal"
            required
            error={comment.trim() === ''}
            helperText={comment.trim() === '' ? '却下理由は必須です' : ''}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>キャンセル</Button>
            <Button onClick={handleReject} variant="contained" color="secondary" disabled={comment.trim() === ''}>
              却下する
            </Button>
          </Box>
        </Box>
      </Modal>
    </PrivateRoute>
  );
};

export default ApprovalsPage;