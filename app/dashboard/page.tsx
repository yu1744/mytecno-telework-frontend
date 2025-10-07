"use client";
import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Avatar } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationMenu from '../components/NavigationMenu';
import PrivateRoute from '../components/PrivateRoute';
import Link from 'next/link';

const DashboardPage = () => {
  // ダミーデータ
  const applicationStatus = {
    approved: 5,
    pending: 2,
    rejected: 1,
  };

  const weeklyLimit = 3;
  const currentCount = 1;

  return (
    <PrivateRoute allowedRoles={['admin', 'approver', 'applicant']}>
      <Box sx={{ display: 'flex' }}>
        <Header />
        <NavigationMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px', maxWidth: '1200px', mx: 'auto' }}>
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
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>今週の在宅勤務</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <HomeWorkIcon />
                    </Avatar>
                    <Typography variant="body1">
                      今週の申請回数:
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', ml: 'auto' }}>
                      {currentCount} / {weeklyLimit} 回
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
        <Footer />
      </Box>
    </PrivateRoute>
  );
};

export default DashboardPage;