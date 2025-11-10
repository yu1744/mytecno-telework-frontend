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
import { format } from 'date-fns';

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

export const RecentApplicationsTable = ({ applications }: RecentApplicationsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>申請日</TableHead>
          <TableHead className="hidden md:table-cell">申請種別</TableHead>
          <TableHead>ステータス</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((application) => (
          <TableRow key={application.id}>
            <TableCell>{format(new Date(application.date), 'yyyy/MM/dd')}</TableCell>
            <TableCell className="hidden md:table-cell">{application.application_type}</TableCell>
            <TableCell>{getStatusBadge(application.application_status?.name)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};