"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';
import PrivateRoute from '../components/PrivateRoute';
import ApplicationListTable from '../components/ApplicationListTable';

const ApprovalsPage = () => {
  return (
    <PrivateRoute allowedRoles={['admin', 'approver']}>
      <Box sx={{ display: 'flex' }}>
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: { xs: 6, sm: 8 }, maxWidth: '1200px', mx: 'auto' }}>
          <h1 className="text-2xl font-bold mb-6">申請一覧</h1>
          <ApplicationListTable isAdmin={true} />
        </Box>
      </Box>
    </PrivateRoute>
  );
};

export default ApprovalsPage;