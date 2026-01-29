"use client";

import * as React from "react";
import { DayPicker, DayProps } from "react-day-picker";
import { Day } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ja } from "date-fns/locale";
import { getCalendarApplications } from "@/app/lib/api";
import { toast } from "sonner";
import { Application } from "@/app/types/application";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarDayApplication {
	id: number;
	user_name: string;
	status: string;
	work_style: string;
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

export function DashboardCalendar({
	applications = [],
	onDateSelect,
}: DashboardCalendarProps) {
	const [month, setMonth] = React.useState(new Date());
	const [data, setData] = React.useState<ApplicationData>({});
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		const processApplications = () => {
			setLoading(true);
			const applicationData: ApplicationData = {};
			if (Array.isArray(applications)) {
				applications.forEach((app) => {
					const date = app.date.split("T")[0];
					if (!applicationData[date]) {
						applicationData[date] = {
							pending: 0,
							approved: 0,
							rejected: 0,
							total: 0,
							applications: [],
						};
					}
					const status = app.application_status?.name || "unknown";
					if (status === "申請中" || status === "pending")
						applicationData[date].pending++;
					if (status === "承認" || status === "approved")
						applicationData[date].approved++;
					if (status === "却下" || status === "rejected")
						applicationData[date].rejected++;
					applicationData[date].total++;
					applicationData[date].applications.push({
						id: app.id,
						user_name: app.user.name,
						status: status,
						work_style: app.work_style,
					});
				});
			}
			setData(applicationData);
			setLoading(false);
		};

		processApplications();
	}, [applications]);

	const handleDateClick = (date: Date) => {
		onDateSelect(date);
	};

	function CustomDay({ day, ...props }: DayProps) {
		const year = day.date.getFullYear();
		const month = String(day.date.getMonth() + 1).padStart(2, "0");
		const dayOfMonth = String(day.date.getDate()).padStart(2, "0");
		const dateStr = `${year}-${month}-${dayOfMonth}`;
		const dayData = data[dateStr];

		const dayContent = (
			<div
				className="relative flex h-full w-full flex-col items-center justify-center rounded-md cursor-pointer p-2 hover:bg-gray-100 transition-colors duration-200"
				onClick={() => handleDateClick(day.date)}
			>
				<span>{day.date.getDate()}</span>
				{dayData && (
					<div className="absolute bottom-1 flex space-x-1">
						{dayData.approved > 0 && (
							<div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
						)}
						{dayData.pending > 0 && (
							<div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
						)}
						{dayData.rejected > 0 && (
							<div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
						)}
					</div>
				)}
			</div>
		);

		if (dayData) {
			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Day day={day} {...props}>
								{dayContent}
							</Day>
						</TooltipTrigger>
						<TooltipContent>
							<ul className="space-y-1">
								{dayData.applications.map((app) => (
									<li key={app.id} className="text-sm">
										<span className="font-semibold">{app.user_name}</span>:{" "}
										{app.work_style} ({app.status})
									</li>
								))}
							</ul>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		}

		return (
			<Day day={day} {...props}>
				{dayContent}
			</Day>
		);
	}

	return (
		<div className="w-full rounded-md border relative h-full flex flex-col">
			{loading && (
				<div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
					ローディング...
				</div>
			)}
			<DayPicker
				locale={ja}
				mode="single"
				onSelect={(date) => date && handleDateClick(date)}
				month={month}
				onMonthChange={setMonth}
				components={{
					Day: CustomDay,
				}}
				className="p-4 flex-grow"
				classNames={{
					root: "h-full flex flex-col",
					months: "flex-grow",
					month: "h-full flex flex-col",
					table: "h-full",
					tbody: "h-full",
				}}
				captionLayout="dropdown"
				fromYear={new Date().getFullYear() - 5}
				toYear={new Date().getFullYear() + 5}
			/>
			<div className="p-3 border-t">
				<h3 className="text-sm font-medium mb-2">凡例</h3>
				<div className="flex items-center space-x-4 text-xs">
					<div className="flex items-center">
						<span className="h-3 w-3 rounded-full bg-blue-400 mr-1.5"></span>
						承認済み
					</div>
					<div className="flex items-center">
						<span className="h-3 w-3 rounded-full bg-yellow-400 mr-1.5"></span>
						申請中
					</div>
					<div className="flex items-center">
						<span className="h-3 w-3 rounded-full bg-gray-400 mr-1.5"></span>
						却下
					</div>
				</div>
			</div>
		</div>
	);
}
