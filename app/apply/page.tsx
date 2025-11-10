"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';
import ApplicationForm from '../components/ApplicationForm';
import PrivateRoute from '../components/PrivateRoute';

const ApplyPage = () => {
  return (
    <PrivateRoute allowedRoles={['admin', 'approver', 'applicant']}>
      <Box sx={{ display: 'flex' }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
          <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
            <h1 className="text-2xl font-bold mb-6">在宅勤務申請</h1>
            <ApplicationForm />
          </Box>
        </Box>
      </Box>
    </PrivateRoute>
  );
};

export default ApplyPage;