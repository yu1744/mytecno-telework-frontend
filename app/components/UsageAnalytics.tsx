'use client';

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

// --- ダミーデータ ---

// 1. 部署別の月次利用回数
const monthlyUsageByDepartment = [
  { name: '営業部', '1月': 40, '2月': 30, '3月': 50 },
  { name: '開発部', '1月': 50, '2月': 60, '3月': 70 },
  { name: '人事部', '1月': 20, '2月': 25, '3月': 30 },
  { name: '広報部', '1月': 10, '2月': 15, '3月': 20 },
];

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const UsageAnalytics = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">在宅勤務利用状況分析</h2>

      {/* グラフセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>部署別の月次利用回数</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyUsageByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="1月" fill="#8884d8" />
                <Bar dataKey="2月" fill="#82ca9d" />
                <Bar dataKey="3月" fill="#ffc658" />
              </BarChart>
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
                  data={usageByDayOfWeek}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                >
                  {usageByDayOfWeek.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>申請種別ごとの割合</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applicationTypeRatio}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {applicationTypeRatio.map((entry, index) => (
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

      {/* データ一覧とエクスポート機能 */}
      <Card>
        <CardHeader>
          <CardTitle>個人別利用状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input type="date" placeholder="開始日" className="w-auto" />
              <span>〜</span>
              <Input type="date" placeholder="終了日" className="w-auto" />
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="部署で絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ての部署</SelectItem>
                  <SelectItem value="sales">営業部</SelectItem>
                  <SelectItem value="dev">開発部</SelectItem>
                  <SelectItem value="hr">人事部</SelectItem>
                  <SelectItem value="pr">広報部</SelectItem>
                </SelectContent>
              </Select>
              <Button>絞り込み</Button>
            </div>
            <Button>CSVエクスポート</Button>
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
              {individualUsageData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.type}</TableCell>
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