'use client';

import * as React from 'react';
import { DayPicker, DayProps } from 'react-day-picker';
import { Day } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ja } from 'date-fns/locale';
import { getCalendarApplications } from '@/app/lib/api';
import { toast } from 'sonner';
import { Application } from '@/app/types/application';

interface CalendarDayApplication {
  id: number;
  user_name: string;
  status: string;
}

interface ApplicationData {
  [date: string]: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    applications: CalendarDayApplication[];
  };
}

interface DashboardCalendarProps {
  applications: Application[];
  onDateSelect: (date: Date) => void;
}

export function DashboardCalendar({ applications = [], onDateSelect }: DashboardCalendarProps) {
  const [month, setMonth] = React.useState(new Date());
  const [data, setData] = React.useState<ApplicationData>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const processApplications = () => {
      setLoading(true);
      const applicationData: ApplicationData = {};
      if (Array.isArray(applications)) {
        applications.forEach((app) => {
          const date = app.date.split('T')[0];
          if (!applicationData[date]) {
            applicationData[date] = {
              pending: 0,
              approved: 0,
              rejected: 0,
              total: 0,
              applications: [],
            };
          }
          const status = app.application_status?.name || 'unknown';
          if (status === 'pending') applicationData[date].pending++;
          if (status === 'approved') applicationData[date].approved++;
          if (status === 'rejected') applicationData[date].rejected++;
          applicationData[date].total++;
          applicationData[date].applications.push({
            id: app.id,
            user_name: app.user.name,
            status: status,
          });
        });
      }
      setData(applicationData);
      setLoading(false);
    };

    processApplications();
  }, [applications]);

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = data[dateStr];
    if (dayData && dayData.applications.length > 0) {
      onDateSelect(date);
    }
  };

  const footer = (
    <div className="mt-4 text-sm">
      <p>日付をクリックすると詳細が表示されます。</p>
    </div>
  );

  function CustomDay({ day, ...props }: DayProps) {
    const dateStr = day.date.toISOString().split('T')[0];
    const dayData = data[dateStr];

    return (
      <Day day={day} {...props}>
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          <span>{day.date.getDate()}</span>
          {dayData && (
            <div className="mt-1 flex space-x-1">
              {dayData.approved > 0 && <div className="h-2 w-2 rounded-full bg-green-500" title={`承認: ${dayData.approved}件`}></div>}
              {dayData.pending > 0 && <div className="h-2 w-2 rounded-full bg-yellow-500" title={`申請中: ${dayData.pending}件`}></div>}
              {dayData.rejected > 0 && <div className="h-2 w-2 rounded-full bg-red-500" title={`却下: ${dayData.rejected}件`}></div>}
            </div>
          )}
        </div>
      </Day>
    );
  }

  return (
    <div className="w-full rounded-md border relative">
      {loading && <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">ローディング...</div>}
      <DayPicker
        locale={ja}
        mode="single"
        onSelect={(date) => date && handleDateClick(date)}
        month={month}
        onMonthChange={setMonth}
        components={{
          Day: CustomDay,
        }}
        footer={footer}
        className="p-3"
      />
    </div>
  );
}