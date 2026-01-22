import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

export interface ColumnDef<T> {
	accessorKey: keyof T | "actions";
	header: string | (({ column }: { column: unknown }) => React.ReactNode);
	cell: ({ row }: { row: T }) => React.ReactNode;
	enableSorting?: boolean;
}

interface CommonTableProps<T> {
	columns: ColumnDef<T>[];
	data: T[];
	title?: string;
	onSort?: (sortKey: keyof T | (string & {})) => void;
	sortKey?: keyof T | (string & {});
	sortOrder?: "asc" | "desc";
	getRowClassName?: (row: T) => string;
	stickyHeader?: boolean;
	fillHeight?: boolean;
	className?: string;
}

export function CommonTable<T extends { id: number | string }>({
	columns,
	data,
	title,
	onSort,
	sortKey,
	sortOrder,
	getRowClassName,
	stickyHeader = true,
	fillHeight = false,
	className,
}: CommonTableProps<T>) {
	return (
		<Card className={cn("shadow-lg overflow-hidden flex flex-col", fillHeight ? "flex-1" : "", className)}>
			{title && (
				<CardHeader className="flex-none">
					<CardTitle>{title}</CardTitle>
				</CardHeader>
			)}
			<CardContent className={cn("p-0 overflow-hidden flex flex-col", fillHeight ? "flex-1" : "")}>
				<div className={cn(
					"rounded-md border overflow-x-auto",
					fillHeight ? "flex-1 overflow-y-auto" : ""
				)}>
					<Table className="relative">
						<TableHeader className={cn(stickyHeader ? "sticky top-0 z-10 bg-white" : "")}>
							<TableRow>
								{columns.map((column, index) => (
									<TableHead key={index} className={cn(stickyHeader ? "bg-white" : "")}>
										{column.enableSorting && onSort ? (
											<Button
												variant="ghost"
												onClick={() => onSort(column.accessorKey as keyof T)}
												className="-ml-4 h-8 data-[state=open]:bg-accent"
											>
												{typeof column.header === "string"
													? column.header
													: column.header({ column: {} })}
												<ArrowUpDown className="ml-2 h-4 w-4" />
											</Button>
										) : typeof column.header === "string" ? (
											column.header
										) : (
											column.header({ column: {} })
										)}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.length === 0 ? (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										データがありません。
									</TableCell>
								</TableRow>
							) : (
								data.map((row) => (
									<TableRow
										key={row.id}
										className={getRowClassName ? getRowClassName(row) : ""}
									>
										{columns.map((column, index) => (
											<TableCell key={index}>{column.cell({ row })}</TableCell>
										))}
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
