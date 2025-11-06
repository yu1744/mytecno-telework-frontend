"use client";
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Avatar } from '@mui/material';
import LoadingSpinner from '../components/LoadingSpinner';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PrivateRoute from '../components/PrivateRoute';
import Link from 'next/link';
import { useAuthStore } from '../store/auth';
import api from '../lib/api';

interface ApplicationLimit {
  weekly_count: number;
  weekly_limit: number;
  monthly_count: number | null;
  monthly_limit: number | null;
  is_child_caregiver: boolean;
  is_caregiver: boolean;
}

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [limitData, setLimitData] = useState<ApplicationLimit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ダミーデータ
  const applicationStatus = {
    approved: 5,
    pending: 2,
    rejected: 1,
  };

  useEffect(() => {
    // API連携実装までのダミーデータ設定
    const dummyLimitData: ApplicationLimit = {
      weekly_count: 2,
      weekly_limit: 5,
      monthly_count: 8,
      monthly_limit: 20,
      is_child_caregiver: true,
      is_caregiver: false,
    };
    setLimitData(dummyLimitData);
    setLoading(false);
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PrivateRoute allowedRoles={['admin', 'approver', 'applicant']}>
      <Box sx={{ display: 'flex' }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>ダッシュボード</Typography>
            <Button variant="contained" color="primary" component={Link} href="/apply">
              新規申請
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* 申請状況サマリー */}
            <Box sx={{ flex: '1 1 300px' }}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[2] }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>申請状況サマリー</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <CheckCircleOutlineIcon />
                    </Avatar>
                    <Typography variant="body1">承認済み:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 'auto' }}>{applicationStatus.approved}件</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <HourglassEmptyIcon />
                    </Avatar>
                    <Typography variant="body1">申請中:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 'auto' }}>{applicationStatus.pending}件</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                      <CancelIcon />
                    </Avatar>
                    <Typography variant="body1">却下:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 'auto' }}>{applicationStatus.rejected}件</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* 在宅勤務回数 */}
            <Box sx={{ flex: '1 1 300px' }}>
              <Card sx={{ boxShadow: (theme) => theme.shadows[2] }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>在宅勤務申請</Typography>
                  {error ? (
                    <Typography color="error">{error}</Typography>
                  ) : limitData && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                          <HomeWorkIcon />
                        </Avatar>
                        <Typography variant="body1">
                          今週の申請回数:
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', ml: 'auto' }}>
                          {limitData.weekly_count} / {limitData.weekly_limit} 回
                        </Typography>
                      </Box>
                      {(limitData.is_child_caregiver || limitData.is_caregiver) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                           <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                            <HomeWorkIcon />
                          </Avatar>
                          <Typography variant="body1">
                            今月の申請回数:
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', ml: 'auto' }}>
                            {limitData.monthly_count} / {limitData.monthly_limit} 回
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
          </Box>
        </Box>
      </Box>
    </PrivateRoute>
  );
};

export default DashboardPage;