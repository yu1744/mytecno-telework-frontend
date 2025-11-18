import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/app/types/application";
import { format } from "date-fns";

type RecentApplicationsTableProps = {
	applications: Application[];
};

const getStatusBadge = (status?: string) => {
	switch (status) {
		case "approved":
			return <Badge variant="default">承認済み</Badge>;
		case "pending":
			return <Badge variant="secondary">未処理</Badge>;
		case "rejected":
			return <Badge variant="destructive">却下済み</Badge>;
		default:
			return <Badge variant="outline">不明</Badge>;
	}
};

const formatTime = (value?: string | null) => {
	if (!value) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return null;
	return format(parsed, "HH:mm");
};

const formatTimeRange = (application: Application) => {
	const start = formatTime(application.start_time);
	const end = formatTime(application.end_time);
	if (start && end) {
		return `${start}〜${end}`;
	}
	if (application.work_option === "full_day") {
		return "終日";
	}
	return "-";
};

const renderSpecialNote = (application: Application) => {
	if (application.is_special) {
		return application.special_reason
			? `特任: ${application.special_reason}`
			: "特任申請";
	}
	if (application.is_overtime) {
		return application.overtime_reason
			? `超過: ${application.overtime_reason}`
			: "超過申請";
	}
	return "-";
};

export const RecentApplicationsTable = ({
	applications,
}: RecentApplicationsTableProps) => {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>申請日</TableHead>
					<TableHead className="hidden md:table-cell">申請種別</TableHead>
					<TableHead className="hidden md:table-cell">時間</TableHead>
					<TableHead>ステータス</TableHead>
					<TableHead className="hidden lg:table-cell">備考</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{applications.map((application) => (
					<TableRow key={application.id}>
						<TableCell>
							{format(new Date(application.date), "yyyy/MM/dd")}
						</TableCell>
						<TableCell className="hidden md:table-cell">
							{application.application_type}
						</TableCell>
						<TableCell className="hidden md:table-cell">
							{formatTimeRange(application)}
						</TableCell>
						<TableCell>
							{getStatusBadge(application.application_status?.name)}
						</TableCell>
						<TableCell className="hidden lg:table-cell">
							{renderSpecialNote(application)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};
