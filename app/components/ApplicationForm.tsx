"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { toast, Toaster } from "react-hot-toast";
import { format } from "date-fns";
import { createApplication } from "@/app/lib/api";
import { ApplicationPayload } from "@/app/types/application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Info } from "lucide-react";
import { useModalStore } from "@/app/store/modal";
import { useNotificationStore } from "@/app/store/notificationStore";

const ApplicationForm = () => {
	const router = useRouter();
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [workOption, setWorkOption] = useState("full_day");
	const [reason, setReason] = useState("");
	const [isSpecial, setIsSpecial] = useState(false);
	const [specialReason, setSpecialReason] = useState("");
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

	const requiresSpecialReason = isSpecial || isLateNightWork;

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

	useEffect(() => {
		if (!requiresSpecialReason) {
			setSpecialReason("");
		}
	}, [requiresSpecialReason]);

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
			start_time: workOption === "full_day" ? undefined : startTime,
			end_time: workOption === "full_day" ? undefined : endTime,
			is_special: requiresSpecialReason,
			reason: reason,
			special_reason: requiresSpecialReason ? specialReason : undefined,
			is_overtime: isOvertime,
			overtime_reason: isOvertime ? overtimeReason : undefined,
			overtime_end: isOvertime ? overtimeEnd : undefined,
		};

		let isModalShown = false;
		try {
			await createApplication(payload);
			useNotificationStore.getState().setMessage("申請を送信しました");
			router.push("/history");
		} catch (error: any) {
			console.error("申請の送信に失敗しました", error);

			// 上限エラーか判定
			const isLimitError = error.response?.data?.is_limit_error;
			if (isLimitError) {
				isModalShown = true;
				// 確認ダイアログを表示
				useModalStore.getState().showModal({
					title: "申請上限超過の確認",
					message:
						error.response?.data?.errors?.join("\n") +
						"\n\n上限を超えて申請してよろしいですか？",
					confirmText: "申請",
					cancelText: "キャンセル",
					onConfirm: async () => {
						setLoading(true);
						try {
							await createApplication(payload, true); // skip_limit_check=true で再試行
							useNotificationStore.getState().setMessage("申請を送信しました");
							useModalStore.getState().hideModal();
							router.push("/history");
						} catch (retryError: any) {
							const retryErrorMessage =
								retryError.response?.data?.errors?.join("\n") ||
								retryError.message ||
								"申請の送信に失敗しました";
							toast.error(retryErrorMessage);
						} finally {
							setLoading(false);
						}
					},
					onCancel: () => {
						useModalStore.getState().hideModal();
						setLoading(false);
					},
				});
			} else {
				// その他のエラー
				const errorMessage =
					error.response?.data?.errors?.join("\n") ||
					error.message ||
					"申請の送信に失敗しました";
				toast.error(errorMessage);
			}
		} finally {
			if (!isModalShown) {
				setLoading(false);
			}
		}
	};

	return (
		<>
			<Toaster />
			<Card className="w-full max-w-2xl mx-auto my-8 bg-white shadow-md rounded-lg">
				<CardHeader>
					<CardTitle>在宅勤務申請</CardTitle>
					<CardDescription>
						必要事項を入力して申請してください。
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="flex flex-col gap-6">
						<div className="grid w-full items-center gap-1.5">
							<Label htmlFor="work-date">勤務日</Label>
							<DatePicker date={date} setDate={setDate} />
						</div>

						<div className="grid w-full items-center gap-1.5">
							<div className="flex items-center gap-2">
								<Label>勤務形態</Label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="ghost" size="icon" className="h-5 w-5">
												<Info className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												所定労働時間よりも短い時間で勤務する場合に選択してください。
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<RadioGroup
								value={workOption}
								onValueChange={setWorkOption}
								className="flex gap-4"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="full_day" id="full_day" />
									<Label htmlFor="full_day">終日</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="am_half" id="am_half" />
									<Label htmlFor="am_half">午前半休</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="pm_half" id="pm_half" />
									<Label htmlFor="pm_half">午後半休</Label>
								</div>
							</RadioGroup>
							{(workOption === "am_half" || workOption === "pm_half") && (
								<p className="text-sm text-muted-foreground">
									（0.5日としてカウント）
								</p>
							)}
						</div>

						{workOption !== "full_day" && (
							<div className="flex gap-4">
								<div className="grid w-1/2 items-center gap-1.5">
									<Label htmlFor="start-time">勤務開始時間</Label>
									<Input
										id="start-time"
										type="time"
										value={startTime}
										onChange={(e) => setStartTime(e.target.value)}
									/>
								</div>
								<div className="grid w-1/2 items-center gap-1.5">
									<Label htmlFor="end-time">勤務終了時間</Label>
									<Input
										id="end-time"
										type="time"
										value={endTime}
										onChange={(e) => setEndTime(e.target.value)}
									/>
								</div>
							</div>
						)}

						{isLateNightWork && (
							<p className="text-sm text-destructive">
								特認申請として扱われ、所属長の承認が必要です
							</p>
						)}

						<div className="grid w-full gap-1.5">
							<Label htmlFor="reason">申請理由</Label>
							<Textarea
								id="reason"
								required={requiresSpecialReason}
								value={reason}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setReason(e.target.value)
								}
								placeholder="申請理由を入力してください"
							/>
						</div>

						{requiresSpecialReason && (
							<div className="grid w-full gap-1.5">
								<Label htmlFor="special-reason">特任申請理由</Label>
								<Textarea
									id="special-reason"
									required={requiresSpecialReason}
									value={specialReason}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setSpecialReason(e.target.value)
									}
									placeholder="特任申請の背景や理由を記載してください"
								/>
							</div>
						)}

						<div className="flex items-center space-x-2">
							<Checkbox
								id="is-special"
								checked={isSpecial}
								onCheckedChange={(checked: boolean) => setIsSpecial(checked)}
							/>
							<div className="grid gap-1.5 leading-none">
								<label
									htmlFor="is-special"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									特認申請
								</label>
							</div>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size="icon" className="h-5 w-5">
											<Info className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>所定の時間を超える場合や、休日申請の場合など</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="is-overtime"
								checked={isOvertime}
								onCheckedChange={(checked: boolean) => setIsOvertime(checked)}
							/>
							<div className="flex items-center gap-0.5">
								<label
									htmlFor="is-overtime"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									8時間以上の勤務
								</label>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="ghost" size="icon" className="h-5 w-5">
												<Info className="h-4 w-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												残業や休日出勤など、1日の労働時間が8時間を超える場合に選択してください。
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>

						{isOvertime && (
							<div className="flex flex-col gap-4 mt-1 p-4 border rounded-md">
								<div className="grid w-full gap-1.5">
									<Label htmlFor="overtime-reason">超過理由</Label>
									<Input
										id="overtime-reason"
										required={isOvertime}
										value={overtimeReason}
										onChange={(e) => setOvertimeReason(e.target.value)}
									/>
								</div>
								<div className="grid w-full gap-1.5">
									<Label htmlFor="overtime-end">業務終了予定時間</Label>
									<Input
										id="overtime-end"
										required={isOvertime}
										type="time"
										value={overtimeEnd}
										onChange={(e) => setOvertimeEnd(e.target.value)}
									/>
								</div>
							</div>
						)}

						<CardFooter className="flex justify-end gap-2 p-0">
							<Button type="button" variant="outline">
								キャンセル
							</Button>
							<Button type="submit" disabled={loading || !date}>
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								申請する
							</Button>
						</CardFooter>
					</form>
				</CardContent>
			</Card>
		</>
	);
};

export default ApplicationForm;
