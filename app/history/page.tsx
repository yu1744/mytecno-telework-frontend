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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let response;
      if (user?.role?.name === 'admin') {
        response = await api.adminGetApplications();
      } else {
        response = await api.getApplications();
      }
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((application) => {
    const applicationDate = new Date(application.created_at);
    if (startDate && applicationDate < startDate) {
      return false;
    }
    if (endDate && applicationDate > endDate) {
      return false;
    }
    if (status !== 'all' && application.application_status?.name !== status) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <h1 className="text-2xl font-bold mb-6">
          申請履歴
        </h1>
        <FilterComponent
          startDate={startDate}
          endDate={endDate}
          status={status}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStatusChange={setStatus}
        />
        {filteredApplications.length === 0 ? (
          <EmptyState message="表示できる申請はありません。" />
        ) : (
          <ApplicationListTable
            applications={filteredApplications}
            onApplicationUpdate={fetchApplications}
            showApplicant={user?.role?.name === 'admin' || user?.role?.name === 'approver'}
          />
        )}
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