import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown } from "lucide-react";

export interface ColumnDef<T> {
  accessorKey: keyof T | 'actions';
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
  sortOrder?: 'asc' | 'desc';
}

export function CommonTable<T extends { id: number | string }>({
  columns,
  data,
  title,
  onSort,
  sortKey,
  sortOrder,
}: CommonTableProps<T>) {
  return (
    <Card className="shadow-lg">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>
                    {column.enableSorting && onSort ? (
                      <Button variant="ghost" onClick={() => onSort(column.accessorKey as keyof T)}>
                        {typeof column.header === 'string' ? column.header : column.header({ column: {} })}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      typeof column.header === 'string' ? column.header : column.header({ column: {} })
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    データがありません。
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column, index) => (
                      <TableCell key={index}>
                        {column.cell({ row })}
                      </TableCell>
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