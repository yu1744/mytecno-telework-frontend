'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import PrivateRoute from '@/app/components/PrivateRoute';
import LoadingSpinner from '@/app/components/LoadingSpinner';

// API通信を想定したダミー関数
const fetchTenantSettings = async () => {
  console.log('Fetching tenant settings...');
  // TODO: APIから設定を取得するロジックを実装
  // await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    outlook: { apiKey: '', tenantId: '' },
    transportation: { apiKey: '' },
  };
};

interface Settings {
  outlook: {
    apiKey: string;
    tenantId: string;
  };
  transportation: {
    apiKey: string;
  };
}

const updateTenantSettings = async (settings: Settings) => {
  console.log('Updating tenant settings...', settings);
  // TODO: APIへ設定を保存するロジックを実装
  // await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};


function IntegrationsPage() {
  const [outlookApiKey, setOutlookApiKey] = useState('');
  const [outlookTenantId, setOutlookTenantId] = useState('');
  const [transportApiKey, setTransportApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        // APIから設定を読み込む
        const settings = await fetchTenantSettings();
        setOutlookApiKey(settings.outlook.apiKey || '');
        setOutlookTenantId(settings.outlook.tenantId || '');
        setTransportApiKey(settings.transportation.apiKey || '');
      } catch (err) {
        setError('設定の読み込みに失敗しました。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const settings = {
        outlook: { apiKey: outlookApiKey, tenantId: outlookTenantId },
        transportation: { apiKey: transportApiKey },
      };
      const response = await updateTenantSettings(settings);
      if (response.success) {
        setSuccess('設定を保存しました。');
      } else {
        throw new Error('保存に失敗しました。');
      }
    } catch (err) {
      setError('設定の保存に失敗しました。');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4 }}>
        外部連携設定
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Outlook連携設定 */}
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                Outlook連携
              </Typography>
              <TextField
                label="APIキー"
                variant="outlined"
                fullWidth
                value={outlookApiKey}
                onChange={(e) => setOutlookApiKey(e.target.value)}
                margin="normal"
              />
              <TextField
                label="テナントID"
                variant="outlined"
                fullWidth
                value={outlookTenantId}
                onChange={(e) => setOutlookTenantId(e.target.value)}
                margin="normal"
              />
            </Box>

            {/* 路線情報連携設定 */}
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                路線情報連携
              </Typography>
              <TextField
                label="APIキー"
                variant="outlined"
                fullWidth
                value={transportApiKey}
                onChange={(e) => setTransportApiKey(e.target.value)}
                margin="normal"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                fullWidth
              >
                {saving ? <CircularProgress size={24} /> : '保存'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default function WrappedIntegrationsPage() {
  return (
    <PrivateRoute>
      <IntegrationsPage />
    </PrivateRoute>
  );
}