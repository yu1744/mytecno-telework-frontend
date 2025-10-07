"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavigationMenu from '../components/NavigationMenu';
import ApplicationForm from '../components/ApplicationForm';
import PrivateRoute from '../components/PrivateRoute';

const ApplyPage = () => {
  return (
    <PrivateRoute allowedRoles={['admin', 'approver', 'applicant']}>
      <Box sx={{ display: 'flex' }}>
        <Header />
        <NavigationMenu />
        <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px', maxWidth: '1200px', mx: 'auto' }}>
          <Typography variant="h4" sx={{ mb: 4 }}>在宅勤務申請</Typography>
          <ApplicationForm />
        </Box>
        <Footer />
      </Box>
    </PrivateRoute>
  );
};

export default ApplyPage;