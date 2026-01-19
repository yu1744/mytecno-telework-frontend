import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Utility functions for common operations
 */

/**
 * Parse string to integer, returning undefined if empty
 */
export const parseIntOrUndefined = (value: string | undefined): number | undefined => {
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
};

/**
 * Convert string ID to number for API calls
 */
export const stringToNumber = (value: string): number => parseInt(value, 10);

/**
 * Convert number ID to string for form values
 */
export const numberToString = (value: number | undefined): string =>
    value !== undefined ? String(value) : "";

/**
 * Format date for display
 */
export const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("ja-JP");
};

/**
 * Format datetime for display
 */
export const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("ja-JP");
};

/**
 * Download file utility for CSV exports
 */
export const downloadCSV = (headers: string[], filename: string): void => {
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Get status badge variant based on status
 */
export type StatusType = "pending" | "approved" | "rejected" | "cancelled";

export const getStatusVariant = (status: StatusType): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
        case "approved":
            return "default";
        case "rejected":
        case "cancelled":
            return "destructive";
        case "pending":
        default:
            return "outline";
    }
};

/**
 * Get status label in Japanese
 */
export const getStatusLabel = (status: StatusType): string => {
    const labels: Record<StatusType, string> = {
        pending: "承認待ち",
        approved: "承認済み",
        rejected: "却下",
        cancelled: "取消済み",
    };
    return labels[status] || status;
};

/**
 * Format time value from date string
 */
export const formatTimeValue = (value?: string | null): string | null => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Generate month options for filter dropdowns
 */
export const generateMonthOptions = (count: number = 12): { value: string; label: string }[] => {
    return Array.from({ length: count }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
            value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            label: `${date.getFullYear()}年${date.getMonth() + 1}月`,
        };
    });
};

/**
 * Clean empty params from object for API calls
 */
export const cleanParams = <T extends Record<string, unknown>>(params: T): Partial<T> => {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ) as Partial<T>;
};
