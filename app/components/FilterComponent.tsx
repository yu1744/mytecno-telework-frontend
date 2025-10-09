"use client";

import React from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ja } from "date-fns/locale/ja";

interface FilterComponentProps {
	startDate: Date | null;
	endDate: Date | null;
	status: string;
	onStartDateChange: (date: Date | null) => void;
	onEndDateChange: (date: Date | null) => void;
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

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
			<Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
			  <Box sx={{ flex: '1 1 200px' }}>
			    <DatePicker
			      label="開始日"
			      value={startDate}
			      onChange={onStartDateChange}
			      slotProps={{ textField: { fullWidth: true } }}
			    />
			  </Box>
			  <Box sx={{ flex: '1 1 200px' }}>
			    <DatePicker
			      label="終了日"
			      value={endDate}
			      onChange={onEndDateChange}
			      slotProps={{ textField: { fullWidth: true } }}
			    />
			  </Box>
			  <Box sx={{ flex: '1 1 200px' }}>
			    <TextField
			      select
			      label="ステータス"
			      value={status}
			      onChange={(e) => onStatusChange(e.target.value)}
			      fullWidth
			    >
			      {statusOptions.map((option) => (
			        <MenuItem key={option.value} value={option.value}>
			          {option.label}
			        </MenuItem>
			      ))}
			    </TextField>
			  </Box>
			</Box>
		</LocalizationProvider>
	);
};

export default FilterComponent;
