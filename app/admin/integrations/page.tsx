'use client';

import { useState, useEffect } from 'react';
import PrivateRoute from '@/app/components/PrivateRoute';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">
        外部連携設定
      </h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Outlook連携</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="outlook-api-key">APIキー</Label>
                  <Input
                    id="outlook-api-key"
                    value={outlookApiKey}
                    onChange={(e) => setOutlookApiKey(e.target.value)}
                    placeholder="APIキーを入力"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outlook-tenant-id">テナントID</Label>
                  <Input
                    id="outlook-tenant-id"
                    value={outlookTenantId}
                    onChange={(e) => setOutlookTenantId(e.target.value)}
                    placeholder="テナントIDを入力"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>路線情報連携</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transport-api-key">APIキー</Label>
                  <Input
                    id="transport-api-key"
                    value={transportApiKey}
                    onChange={(e) => setTransportApiKey(e.target.value)}
                    placeholder="APIキーを入力"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WrappedIntegrationsPage() {
  return (
    <PrivateRoute>
      <IntegrationsPage />
    </PrivateRoute>
  );
}