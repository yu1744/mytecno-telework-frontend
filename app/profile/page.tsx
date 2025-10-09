'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import PrivateRoute from '../components/PrivateRoute';
import { useAuthStore } from '../store/auth';
import api from '../lib/api';

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    department: '',
    yearsOfService: 0,
    weeklyLimit: 0,
    monthlyLimit: 0,
  });
  const [settings, setSettings] = useState({
    outlook連携: false,
    commuteRoutes: [''],
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const [profileRes, limitRes] = await Promise.all([
          api.get(`/users/${user.id}/profile`),
          api.get(`/users/${user.id}/application_limit`),
        ]);

        const profileData = profileRes.data;
        const limitData = limitRes.data;

        setUserInfo({
          department: user.department?.name || 'N/A',
          yearsOfService: profileData.years_of_service || 0,
          weeklyLimit: limitData.weekly_limit || 0,
          monthlyLimit: limitData.monthly_limit || 0,
        });

        setSettings({
          outlook連携: profileData.outlook_setting?.enabled || false,
          commuteRoutes: profileData.commute_routes?.length > 0 ? profileData.commute_routes : [''],
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setSnackbar({ open: true, message: 'データの表示に失敗しました。時間をおいてページを再読み込みしてください。問題が解決しない場合は、システム管理者にお問い合わせください。', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSettingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [event.target.name]: event.target.checked,
    });
  };

  const handleRouteChange = (index: number, value: string) => {
    const newRoutes = [...settings.commuteRoutes];
    newRoutes[index] = value;
    setSettings({ ...settings, commuteRoutes: newRoutes });
  };

  const handleRouteAdd = () => {
    setSettings({ ...settings, commuteRoutes: [...settings.commuteRoutes, ''] });
  };

  const handleRouteRemove = (index: number) => {
    const newRoutes = settings.commuteRoutes.filter((_, i) => i !== index);
    setSettings({ ...settings, commuteRoutes: newRoutes });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    try {
      await api.put(`/users/${user.id}/profile`, {
        outlook_setting: { enabled: settings.outlook連携 },
        commute_routes: settings.commuteRoutes.filter(route => route.trim() !== ''),
      });
      setSnackbar({ open: true, message: '設定を保存しました。', severity: 'success' });
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSnackbar({ open: true, message: '設定の保存に失敗しました。', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PrivateRoute>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4 }}>
          ユーザープロファイル
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            社員情報
          </Typography>
          <Box sx={{ '& > *': { mb: 1 } }}>
            <Typography><strong>所属部署:</strong> {userInfo.department}</Typography>
            <Typography><strong>勤続年数:</strong> {userInfo.yearsOfService}年</Typography>
            <Typography><strong>申請上限（週）:</strong> {userInfo.weeklyLimit}回</Typography>
            <Typography><strong>申請上限（月）:</strong> {userInfo.monthlyLimit}回</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            設定
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.outlook連携}
                  onChange={handleSettingsChange}
                  name="outlook連携"
                />
              }
              label="Outlookカレンダー連携"
            />
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              通勤経路（路線）
            </Typography>
            {settings.commuteRoutes.map((route, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={route}
                  onChange={(e) => handleRouteChange(index, e.target.value)}
                  placeholder={`路線 ${index + 1}`}
                />
                <IconButton onClick={() => handleRouteRemove(index)} disabled={settings.commuteRoutes.length <= 1}>
                  <RemoveCircleOutline />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddCircleOutline />}
              onClick={handleRouteAdd}
              sx={{ mt: 1 }}
            >
              路線を追加
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2, display: 'block' }}
            >
              設定を保存
            </Button>
          </Box>
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </PrivateRoute>
  );
};

export default ProfilePage;