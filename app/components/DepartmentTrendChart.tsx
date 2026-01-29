'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminGetDepartmentTrend } from '@/app/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface TrendData {
  month: string;
  count: number;
}

interface Department {
  name: string;
}

interface DepartmentTrendChartProps {
  departments: Department[];
}

const DepartmentTrendChart = ({ departments }: DepartmentTrendChartProps) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('');

  useEffect(() => {
    const fetchTrend = async () => {
      if (!selectedDept || selectedDept === 'all') {
        setData([]);
        return;
      }

      try {
        setLoading(true);
        const res = await adminGetDepartmentTrend(selectedDept);
        setData(res.data.trend_data || []);
      } catch (error) {
        console.error('Failed to fetch department trend', error);
        toast.error('部署推移データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [selectedDept]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>部署の月次利用推移</CardTitle>
        <div className="w-[180px]">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger>
              <SelectValue placeholder="部署を選択" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.name} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedDept ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-center px-4">
            <p>部署を選択すると、月次の利用推移が表示されます。</p>
          </div>
        ) : loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p>読み込み中...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>データがありません。</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => val.replace(/^\d{4}-/, '') + '月'}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(label) => `${label.replace('-', '年')}月`}
                  formatter={(value) => [`${value} 回`, '利用回数']}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="利用回数"
                  stroke="#8884d8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8884d8' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentTrendChart;
