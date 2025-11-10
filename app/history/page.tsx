"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import * as api from '../lib/api';
import ApplicationListTable from '../components/ApplicationListTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import FilterComponent from '../components/FilterComponent';
import { Application } from '../types/application';
import PrivateRoute from '../components/PrivateRoute';
import { useAuthStore } from '../store/auth';

const HistoryPageContent = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is just to avoid a blank page on initial load.
    // The actual data fetching is in ApplicationListTable.
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <h1 className="text-2xl font-bold mb-6">
          申請履歴
        </h1>
        <ApplicationListTable isAdmin={user?.role?.name === 'admin'} />
      </Box>
    </Box>
  );
}


const HistoryPage = () => {
  return (
    <PrivateRoute allowedRoles={['admin', 'approver', 'applicant']}>
      <HistoryPageContent />
    </PrivateRoute>
  );
};

export default HistoryPage;