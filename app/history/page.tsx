"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import api from '../lib/api';
import ApplicationListTable from '../components/ApplicationListTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import FilterComponent from '../components/FilterComponent';
import { Application } from '../types/application';
import PrivateRoute from '../components/PrivateRoute';

const HistoryPageContent = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const dummyApplications: Application[] = [
      { id: 1, user: { id: 1, name: '山田 太郎', email: 'yamada@example.com', hired_date: '2020-04-01', role_id: 3, department_id: 1 }, start_date: '2023-10-01', end_date: '2023-10-01', reason: '私用のため', application_status_id: 1, application_status: { id: 1, name: '承認済み' }, created_at: '2023-09-28T10:00:00Z', updated_at: '2023-09-28T10:00:00Z' },
      { id: 2, user: { id: 1, name: '山田 太郎', email: 'yamada@example.com', hired_date: '2020-04-01', role_id: 3, department_id: 1 }, start_date: '2023-10-05', end_date: '2023-10-05', reason: '通院のため', application_status_id: 2, application_status: { id: 2, name: '申請中' }, created_at: '2023-10-02T11:00:00Z', updated_at: '2023-10-02T11:00:00Z' },
      { id: 3, user: { id: 1, name: '山田 太郎', email: 'yamada@example.com', hired_date: '2020-04-01', role_id: 3, department_id: 1 }, start_date: '2023-09-25', end_date: '2023-09-25', reason: '家庭の事情', application_status_id: 3, application_status: { id: 3, name: '却下' }, created_at: '2023-09-20T15:00:00Z', updated_at: '2023-09-20T15:00:00Z' },
    ];
    setApplications(dummyApplications);
    setLoading(false);
  }, []);

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
        <Typography variant="h4" sx={{ mb: 4 }}>
          申請履歴
        </Typography>
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
          <ApplicationListTable applications={filteredApplications} />
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