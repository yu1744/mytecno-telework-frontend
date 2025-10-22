"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Application } from '../types/application';
import PrivateRoute from '../components/PrivateRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getPendingApprovals } from '../lib/api';
import ApplicationListTable from '../components/ApplicationListTable';

const ApprovalsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await getPendingApprovals();
      setApplications(response.data);
      setError(null);
    } catch (err) {
      setError('データの取得に失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

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
              <ApplicationListTable
                applications={applications}
                onApplicationUpdate={fetchApprovals}
                showApplicant={true}
                isApprovalMode={true}
              />
            )}
          </Box>
        </Box>
      </Box>
    </PrivateRoute>
  );
};

export default ApprovalsPage;