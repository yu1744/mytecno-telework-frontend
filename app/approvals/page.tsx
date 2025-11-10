"use client";
import React from 'react';
import PrivateRoute from '../components/PrivateRoute';
import ApplicationListTable from '../components/ApplicationListTable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ApprovalsPage = () => {
  return (
    <PrivateRoute allowedRoles={['admin', 'approver']}>
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">申請一覧</h1>
        <ApplicationListTable isAdmin={true} />
      </div>
    </PrivateRoute>
  );
};

export default ApprovalsPage;