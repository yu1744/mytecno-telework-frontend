import * as React from "react";
import { Badge } from "@/components/ui/badge";

/**
 * Status ID to badge mapping
 * 1: 申請中 (Pending)
 * 2: 承認済み (Approved)
 * 3: 却下 (Rejected)
 * 4: キャンセル (Cancelled)
 */
export const getStatusBadge = (statusId: number): React.ReactNode => {
    switch (statusId) {
        case 1:
            return <Badge variant="outline">申請中</Badge>;
        case 2:
            return <Badge className="bg-green-100 text-green-800">承認済み</Badge>;
        case 3:
            return <Badge variant="destructive">却下</Badge>;
        case 4:
            return <Badge variant="secondary">キャンセル</Badge>;
        default:
            return <Badge variant="secondary">不明</Badge>;
    }
};

interface StatusBadgeProps {
    statusId: number;
}

/**
 * Status Badge Component for application status display
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ statusId }) => {
    return <>{getStatusBadge(statusId)}</>;
};

/**
 * Special note badges for applications
 */
export const renderSpecialNote = (isExceeded: boolean, isSpecial: boolean): React.ReactNode => {
    if (isExceeded && isSpecial) {
        return (
            <div className="flex gap-1">
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100/80">
                    特任
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
                    超過
                </Badge>
            </div>
        );
    }
    if (isExceeded) {
        return (
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">
                8h超過
            </Badge>
        );
    }
    if (isSpecial) {
        return (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100/80">
                特任
            </Badge>
        );
    }
    return null;
};

/**
 * Row class name based on application flags
 */
export const getApplicationRowClassName = (isSpecial: boolean, workHoursExceeded: boolean): string => {
    if (workHoursExceeded && isSpecial) {
        return "bg-purple-100";
    }
    if (workHoursExceeded) {
        return "bg-red-100";
    }
    if (isSpecial) {
        return "bg-blue-100";
    }
    return "";
};
