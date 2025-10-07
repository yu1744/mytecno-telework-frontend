"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Modal, TextField } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationMenu from '../components/NavigationMenu';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Application } from '../types/application';
import PrivateRoute from '../components/PrivateRoute';

// ダミーデータ
const dummyApplications: Application[] = [
  { id: 1, user: { id: 1, name: '山田 太郎', email: 'yamada@example.com', hired_date: '2020-04-01', role_id: 3, department_id: 1 }, start_date: '2025-10-20', end_date: '2025-10-20', reason: '私用のため', application_status_id: 1, created_at: '2025-10-19T10:00:00Z', updated_at: '2025-10-19T10:00:00Z' },
  { id: 2, user: { id: 2, name: '鈴木 花子', email: 'suzuki@example.com', hired_date: '2021-04-01', role_id: 3, department_id: 1 }, start_date: '2025-10-21', end_date: '2025-10-21', reason: '通院のため', application_status_id: 1, created_at: '2025-10-20T11:00:00Z', updated_at: '2025-10-20T11:00:00Z' },
];

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
  const [applications, setApplications] = useState<Application[]>(dummyApplications);
  const [open, setOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [comment, setComment] = useState('');

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
    if (selectedApp) {
      console.log(`Reject application ${selectedApp.id} with comment: ${comment}`);
      // 機能ロジックは実装しない
      handleClose();
    }
  };


  return (
    <PrivateRoute allowedRoles={['admin', 'approver']}>
      <Box sx={{ display: 'flex' }}>
        <Header />
        <NavigationMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, maxWidth: '1200px', mx: 'auto' }}>
          <Typography variant="h4" sx={{ mb: 4 }}>承認待ち一覧</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>申請者</TableCell>
                  <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>日付</TableCell>
                  <TableCell sx={{ backgroundColor: (theme) => theme.palette.grey[100], fontWeight: 'bold' }}>理由</TableCell>
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
                    <TableCell>{app.reason}</TableCell>
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
        </Box>
        <Footer />
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
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>キャンセル</Button>
            <Button onClick={handleReject} variant="contained" color="secondary">
              却下する
            </Button>
          </Box>
        </Box>
      </Modal>
    </PrivateRoute>
  );
};

export default ApprovalsPage;