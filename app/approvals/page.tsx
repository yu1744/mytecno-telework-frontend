"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';
import PrivateRoute from '../components/PrivateRoute';
import ApplicationListTable from '../components/ApplicationListTable';

const ApprovalsPage = () => {
  return (
    <PrivateRoute allowedRoles={['admin', 'approver']}>
      <Box sx={{ display: 'flex' }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, maxWidth: '1200px', mx: 'auto' }}>
          <Typography variant="h4" sx={{ mb: 4 }}>申請一覧</Typography>
          <ApplicationListTable isAdmin={true} />
        </Box>
      </Box>
    </PrivateRoute>
  );
};

export default ApprovalsPage;