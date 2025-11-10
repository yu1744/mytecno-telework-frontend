"use client";

import React from "react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FilterComponentProps {
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStatusChange: (status: string) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  startDate,
  endDate,
  status,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
}) => {
  const statusOptions = [
    { value: "all", label: "すべて" },
    { value: "申請中", label: "申請中" },
    { value: "承認済み", label: "承認済み" },
    { value: "却下", label: "却下" },
  ];

  const handleStatusChange = (value: string) => {
    onStatusChange(value === "all" ? "" : value);
  };

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      <div className="flex-1 min-w-[200px]">
        <Label>開始日</Label>
        <DatePicker date={startDate ?? undefined} setDate={onStartDateChange} />
      </div>
      <div className="flex-1 min-w-[200px]">
        <Label>終了日</Label>
        <DatePicker date={endDate ?? undefined} setDate={onEndDateChange} />
      </div>
      <div className="flex-1 min-w-[200px]">
        <Label>ステータス</Label>
        <Select
          value={status === "" ? "all" : status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="ステータスを選択" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterComponent;
