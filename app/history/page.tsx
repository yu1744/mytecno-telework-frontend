"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import api from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationMenu from '../components/NavigationMenu';
import ApplicationListTable from '../components/ApplicationListTable';
import { Application } from '../types/application';
import PrivateRoute from '../components/PrivateRoute';

const HistoryPageContent = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications');
        setApplications(response.data);
      } catch (error) {
        console.error('申請履歴の取得に失敗しました。', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <NavigationMenu />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, maxWidth: '1200px', mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          申請履歴
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <ApplicationListTable applications={applications} />
        )}
      </Box>
      <Footer />
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