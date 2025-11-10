"use client";

import React, { useEffect, useState } from 'react';
import ApplicationListTable from '../components/ApplicationListTable';
import LoadingSpinner from '../components/LoadingSpinner';
import PrivateRoute from '../components/PrivateRoute';
import { useAuthStore } from '../store/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">申請履歴</h1>
      <ApplicationListTable isAdmin={user?.role?.name === 'admin'} />
    </div>
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