"use client";

import React, { useState } from "react";
import {
	TextField,
	Button,
	Box,
	Typography,
	CircularProgress,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	FormLabel,
	Checkbox,
	Collapse,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import toast, { Toaster } from "react-hot-toast";

const ApplicationForm = () => {
	const [date, setDate] = useState<Date | null>(null);
	const [workOption, setWorkOption] = useState("full_day");
	const [reason, setReason] = useState("");
	const [isSpecial, setIsSpecial] = useState(false);
	const [isOvertime, setIsOvertime] = useState(false);
	const [overtimeReason, setOvertimeReason] = useState("");
	const [overtimeEnd, setOvertimeEnd] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// 機能ロジックは実装しない
		console.log({
			date,
			workOption,
			reason,
			isSpecial,
			isOvertime,
			overtimeReason,
			overtimeEnd,
		});
		toast.success("UI要素の確認");
	};

	return (
		<>
			<Toaster />
			<Box
				component="form"
				onSubmit={handleSubmit}
				sx={{
					display: "flex",
					flexDirection: "column",
					gap: 2,
					maxWidth: 500,
					m: "auto",
				}}
				noValidate
				autoComplete="off"
			>
				<Typography variant="h5" component="h2" gutterBottom>
					在宅勤務申請
				</Typography>

				<FormControl fullWidth>
					<FormLabel>勤務日</FormLabel>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<DatePicker
							value={date}
							onChange={(newValue) => setDate(newValue)}
						/>
					</LocalizationProvider>
				</FormControl>

				<FormControl component="fieldset">
					<FormLabel component="legend">勤務形態</FormLabel>
					<RadioGroup
						row
						name="workOption"
						value={workOption}
						onChange={(e) => setWorkOption(e.target.value)}
					>
						<FormControlLabel
							value="full_day"
							control={<Radio />}
							label="終日"
						/>
						<FormControlLabel
							value="am_half"
							control={<Radio />}
							label="午前半休"
						/>
						<FormControlLabel
							value="pm_half"
							control={<Radio />}
							label="午後半休"
						/>
					</RadioGroup>
				</FormControl>

				<FormControl fullWidth>
					<FormLabel required>申請理由</FormLabel>
					<TextField
						required
						id="reason"
						multiline
						rows={4}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
				</FormControl>

				<FormControlLabel
					control={
						<Checkbox
							checked={isSpecial}
							onChange={(e) => setIsSpecial(e.target.checked)}
						/>
					}
					label="特認申請"
				/>

				<FormControlLabel
					control={
						<Checkbox
							checked={isOvertime}
							onChange={(e) => setIsOvertime(e.target.checked)}
						/>
					}
					label="8時間以上の勤務"
				/>

				<Collapse in={isOvertime}>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
						<FormControl fullWidth>
							<FormLabel>超過理由</FormLabel>
							<TextField
								value={overtimeReason}
								onChange={(e) => setOvertimeReason(e.target.value)}
								fullWidth
							/>
						</FormControl>
						<FormControl fullWidth>
							<FormLabel>終了予定時間</FormLabel>
							<TextField
								type="time"
								value={overtimeEnd}
								onChange={(e) => setOvertimeEnd(e.target.value)}
								InputLabelProps={{ shrink: true }}
								fullWidth
							/>
						</FormControl>
					</Box>
				</Collapse>

				<Button
					type="submit"
					variant="contained"
					color="primary"
					sx={{ mt: 2 }}
					disabled={loading}
				>
					{loading ? <CircularProgress size={24} /> : "申請する"}
				</Button>
			</Box>
		</>
	);
};

export default ApplicationForm;
