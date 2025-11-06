"use client";
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Tooltip, TextField } from '@mui/material';
import { Application } from '../types/application';
import PrivateRoute from '../components/PrivateRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import api from "@/app/lib/api";
import axios from 'axios';
import ReusableModal from '../components/ReusableModal';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';



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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchApprovals = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/v1/approvals');
        
        console.log('Fetched applications:', response.data);
        
        setApplications(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching approvals:', err);
        setError('データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
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

  const handleApprove = async (appId: number) => {
    try {
      const response = await api.patch(`/api/v1/approvals/${appId}`, {
        status: 'approved',
        comment: '' 
      });

      console.log('Approval response:', response.data);
      
      setApplications(prevApps => prevApps.filter(app => app.id !== appId));
      alert('承認しました。');

    } catch (err: unknown) {
      console.error('Error approving application:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`承認処理に失敗しました: ${err.response.data.error || err.message}`);
      } else if (err instanceof Error) {
        setError(`承認処理に失敗しました: ${err.message}`);
      } else {
        setError('予期せぬエラーが発生しました。');
      }
      alert('承認処理に失敗しました。');
    }
  };
  
  const handleReject = async () => {
    if (selectedApp && comment.trim() !== '') {
      try {
        const response = await api.patch(`/api/v1/approvals/${selectedApp.id}`, {
          status: 'rejected',
          comment: comment
        });

        console.log('Rejection response:', response.data);
        
        setApplications(prevApps => prevApps.filter(app => app.id !== selectedApp.id));
        alert('却下しました。');
        handleClose();

      } catch (err: unknown) {
        console.error('Error rejecting application:', err);
        if (axios.isAxiosError(err) && err.response) {
          setError(`却下処理に失敗しました: ${err.response.data.error || err.message}`);
        } else if (err instanceof Error) {
          setError(`却下処理に失敗しました: ${err.message}`);
        } else {
          setError('予期せぬエラーが発生しました。');
        }
        alert('却下処理に失敗しました。');
        handleClose();
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PrivateRoute allowedRoles={['admin', 'approver']}>
      <Box sx={{ display: 'flex' }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, maxWidth: '1200px', mx: 'auto' }}>
          <Typography variant="h4" sx={{ mb: 4 }}>承認待ち一覧</Typography>
          {error && <Typography color="error" gutterBottom>エラー: {error}</Typography>}
          {!error && applications.length === 0 ? (
            <EmptyState message="承認待ちの申請はありません。" />
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
            <ReusableModal
              open={open}
              onClose={handleClose}
              title="却下理由を入力"
              content={
                <TextField
                  autoFocus
                  margin="dense"
                  id="comment"
                  label="却下理由"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              }
              actions={[
                {
                  text: "キャンセル",
                  onClick: handleClose,
                  color: "secondary",
                },
                {
                  text: "却下する",
                  onClick: handleReject,
                  color: "error",
                },
              ]}
            />
          </Box>
        </Box>
    </PrivateRoute>
  );
};

export default ApprovalsPage;