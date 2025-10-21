"use client";

import React, { useState, useMemo, useEffect } from "react";
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
	FormHelperText,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import { createApplication } from "@/app/lib/api";
import { ApplicationPayload } from "@/app/types/application";
 
 const ApplicationForm = () => {
 	const [date, setDate] = useState<Date | null>(null);
	const [workOption, setWorkOption] = useState("full_day");
	const [reason, setReason] = useState("");
	const [isSpecial, setIsSpecial] = useState(false);
	const [isOvertime, setIsOvertime] = useState(false);
	const [overtimeReason, setOvertimeReason] = useState("");
	const [overtimeEnd, setOvertimeEnd] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [loading, setLoading] = useState(false);

	const isLateNightWork = useMemo(() => {
		if (!startTime && !endTime) return false;
		const start = startTime ? parseInt(startTime.split(":")[0], 10) : 0;
		const end = endTime ? parseInt(endTime.split(":")[0], 10) : 0;
		return start >= 22 || start < 5 || end >= 22 || end < 5;
	}, [startTime, endTime]);

	useEffect(() => {
		if (date) {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const selectedDate = new Date(date);
			selectedDate.setHours(0, 0, 0, 0);
			setIsSpecial(selectedDate.getTime() === today.getTime());
		}
	}, [date]);

	useEffect(() => {
		if (startTime && endTime) {
			const start = new Date(`1970-01-01T${startTime}`);
			const end = new Date(`1970-01-01T${endTime}`);
			const diff = end.getTime() - start.getTime();
			const hours = diff / (1000 * 60 * 60);
			setIsOvertime(hours > 8);
		} else {
			setIsOvertime(false);
		}
	}, [startTime, endTime]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!date) {
			toast.error("勤務日を選択してください。");
			return;
		}

		setLoading(true);

		const payload: ApplicationPayload = {
			date: format(date, "yyyy-MM-dd"),
			work_option: workOption,
			start_time: startTime,
			end_time: endTime,
			is_special: isSpecial,
			reason: reason,
			is_overtime: isOvertime,
			overtime_reason: isOvertime ? overtimeReason : undefined,
			overtime_end: isOvertime ? overtimeEnd : undefined,
		};

		try {
			await createApplication(payload);
			toast.success("申請を送信しました");
			// フォームをリセットするなどの処理をここに追加できます
		} catch (error) {
			console.error("申請の送信に失敗しました", error);
			toast.error("申請の送信に失敗しました");
		} finally {
			setLoading(false);
		}
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
					<FormHelperText>※半日勤務は0.5回としてカウントされます</FormHelperText>
				</FormControl>

				<Box sx={{ display: "flex", gap: 2 }}>
					<FormControl fullWidth>
						<FormLabel>勤務開始時間</FormLabel>
						<TextField
							type="time"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
					</FormControl>
					<FormControl fullWidth>
						<FormLabel>勤務終了時間</FormLabel>
						<TextField
							type="time"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
					</FormControl>
				</Box>

				{isLateNightWork && (
					<Typography color="error" variant="body2">
						特認申請として扱われ、所属長の承認が必要です
					</Typography>
				)}

				<FormControl fullWidth>
					<FormLabel required={isSpecial || isLateNightWork}>申請理由</FormLabel>
					<TextField
						required={isSpecial || isLateNightWork}
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
							<FormLabel required={isOvertime}>超過理由</FormLabel>
							<TextField
								required={isOvertime}
								value={overtimeReason}
								onChange={(e) => setOvertimeReason(e.target.value)}
								fullWidth
							/>
						</FormControl>
						<FormControl fullWidth>
							<FormLabel required={isOvertime}>業務終了予定時間</FormLabel>
							<TextField
								required={isOvertime}
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
					disabled={loading || !date}
				>
					{loading ? <CircularProgress size={24} /> : "申請する"}
				</Button>
			</Box>
		</>
	);
};

export default ApplicationForm;
