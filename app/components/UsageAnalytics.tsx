'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminExportUsageStats, adminGetUsageStats } from '@/app/lib/api';
import DepartmentTrendChart from './DepartmentTrendChart';
import MonthlyComparisonChart from './MonthlyComparisonChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- ダミーデータ (他のグラフ用) ---
// 2. 全社の曜日別利用率
const usageByDayOfWeek = [
  { name: '月', value: 400 },
  { name: '火', value: 300 },
  { name: '水', value: 300 },
  { name: '木', value: 200 },
  { name: '金', value: 278 },
  { name: '土', value: 189 },
  { name: '日', value: 239 },
];

// 3. 申請種別ごとの割合
const applicationTypeRatio = [
  { name: '終日在宅', value: 400 },
  { name: '午前在宅', value: 300 },
  { name: '午後在宅', value: 300 },
  { name: 'その他', value: 200 },
];

// 4. 個人ごとの利用状況データ
const individualUsageData = [
  { id: 1, name: '山田 太郎', department: '営業部', date: '2023-03-01', type: '終日在宅' },
  { id: 2, name: '鈴木 花子', department: '開発部', date: '2023-03-01', type: '午前在宅' },
  { id: 3, name: '佐藤 次郎', department: '営業部', date: '2023-03-02', type: '終日在宅' },
  { id: 4, name: '田中 三郎', department: '人事部', date: '2023-03-03', type: '午後在宅' },
  { id: 5, name: '伊藤 四郎', department: '開発部', date: '2023-03-05', type: '終日在宅' },
];

const MONTH_COLORS: { [key: string]: string } = {
  '11月': '#FF8042', // オレンジ
  '12月': '#0088FE', // 青
  '1月': '#00C49F',  // 緑
  '2月': '#FFBB28',  // 黄
  '3月': '#8884d8',  // 紫
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const UsageAnalytics = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const fetchStats = async (filters?: { start_date?: string; end_date?: string; department_id?: string }) => {
    try {
      // 初回またはデータがない時だけ全体のローディングを表示する
      if (!usageStats) {
        setLoading(true);
      }
      const res = await adminGetUsageStats(filters);
      setUsageStats(res.data);
    } catch (error) {
      console.error("Failed to fetch usage stats", error);
      toast.error("データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilter = () => {
    const filters: any = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (selectedDepartment && selectedDepartment !== 'all') {
      filters.department_id = selectedDepartment;
    }
    fetchStats(filters);
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const filters: any = {};
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (selectedDepartment && selectedDepartment !== 'all') {
        filters.department_id = selectedDepartment;
      }

      const response = await adminExportUsageStats(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usage_stats_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSVをエクスポートしました。");
    } catch (error) {
      console.error("Failed to export CSV", error);
      toast.error("CSVのエクスポートに失敗しました。");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && !usageStats) return <div className="flex items-center justify-center min-h-[400px]">読み込み中...</div>;
  if (!usageStats) return <div>No data</div>;

  // グラフ用の一時的なログ (削除予定)
  // console.log('chartData sample:', chartData[0]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">在宅勤務利用状況分析</h2>

      {/* グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>申請種別ごとの割合</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageStats?.usage_by_application_type || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {(usageStats?.usage_by_application_type || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>全社の曜日別利用率</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageStats?.usage_by_day_of_week || []}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                >
                  {(usageStats?.usage_by_day_of_week || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DepartmentTrendChart departments={usageStats?.users_by_department || []} />
        <MonthlyComparisonChart />
      </div>

      {/* データ一覧とエクスポート機能 */}
      <Card>
        <CardHeader>
          <CardTitle>個人別利用状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                placeholder="開始日"
                className="w-auto"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>〜</span>
              <Input
                type="date"
                placeholder="終了日"
                className="w-auto"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="部署で絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ての部署</SelectItem>
                  {usageStats?.users_by_department?.map((dept: any) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleFilter}>絞り込み</Button>
            </div>
            <Button onClick={handleExportCsv} disabled={isExporting}>
              {isExporting ? 'エクスポート中...' : 'CSVエクスポート'}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>日付</TableHead>
                <TableHead>申請種別</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(usageStats?.individual_usage_data || []).map((row: any) => (
                <TableRow
                  key={row.id}
                  onClick={() => {
                    // テーブル行をクリックしてフィルタリング
                    const filters: any = {};
                    filters.start_date = row.date;
                    filters.end_date = row.date;
                    if (row.department_name) {
                      const deptObj = usageStats?.users_by_department?.find((d: any) => d.name === row.department_name);
                      if (deptObj) {
                        filters.department_id = deptObj.id || row.department_name;
                      }
                    }
                    setStartDate(row.date);
                    setEndDate(row.date);
                    setSelectedDepartment(row.department_name || 'all');
                    fetchStats(filters);
                  }}
                  style={{ cursor: 'pointer' }}
                  className="hover:bg-gray-100"
                >
                  <TableCell>{row.user_name}</TableCell>
                  <TableCell>{row.department_name}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.application_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageAnalytics;