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
import { isAxiosError } from "@/app/lib/utils";

import { Calendar } from "@/components/ui/calendar";

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
			router.push("/history?submitted=true");
		} catch (error: unknown) {
			console.error("申請の送信に失敗しました", error);

			const isLimitError = isAxiosError(error) && error.response?.data?.is_limit_error;
			if (isLimitError) {
				isModalShown = true;
				useModalStore.getState().showModal({
					title: "申請上限超過の確認",
					message:
						((isAxiosError(error) && error.response?.data?.errors?.join("\n")) || "") +
						"\n\n上限を超えて申請してよろしいですか？",
					confirmText: "申請",
					cancelText: "キャンセル",
					onConfirm: async () => {
						setLoading(true);
						try {
							await createApplication(payload, true);
							useModalStore.getState().hideModal();
							router.push("/history?submitted=true");
						} catch (retryError: unknown) {
							const retryErrorMessage =
								(isAxiosError(retryError) && retryError.response?.data?.errors?.join("\n")) ||
								(retryError instanceof Error ? retryError.message : null) ||
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
				const errorMessage =
					(isAxiosError(error) && error.response?.data?.errors?.join("\n")) ||
					(error instanceof Error ? error.message : null) ||
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
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
				{/* カレンダーセクション */}
				<Card className="lg:col-span-5 shadow-sm border-0 bg-white/50 backdrop-blur-sm h-full flex flex-col">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg font-bold text-muted-foreground flex items-center gap-2">
							<span className="w-1 h-4 bg-primary rounded-full"></span>
							勤務日の選択
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 flex flex-col items-center justify-center p-4">
						<Calendar
							mode="single"
							selected={date}
							onSelect={setDate}
							className="rounded-md border shadow-inner bg-white scale-110 origin-center"
						/>
					</CardContent>
					<CardFooter className="flex-col items-start gap-1 pt-0">
						<p className="text-sm text-muted-foreground">
							{date ? (
								<span className="text-primary font-bold">
									選択中: {format(date, "yyyy年MM月dd日")}
								</span>
							) : (
								"カレンダーから日付を選択してください"
							)}
						</p>
					</CardFooter>
				</Card>

				{/* フォームセクション */}
				<Card className="lg:col-span-7 shadow-lg border-0 bg-white h-full flex flex-col">

					<CardHeader>
						<CardTitle className="text-2xl font-extrabold tracking-tight">
							申請詳細入力
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* 勤務形態 */}
							<div className="space-y-3 p-4 bg-secondary/20 rounded-xl">
								<div className="flex items-center gap-2">
									<Label className="text-base font-bold">勤務形態</Label>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant="ghost" size="icon" className="h-5 w-5">
													<Info className="h-4 w-4" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>所定労働時間よりも短い時間で勤務する場合に選択してください。</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								<RadioGroup
									value={workOption}
									onValueChange={setWorkOption}
									className="flex flex-wrap gap-6"
								>
									<div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border shadow-sm cursor-pointer hover:border-primary transition-colors">
										<RadioGroupItem value="full_day" id="full_day" />
										<Label htmlFor="full_day" className="font-bold cursor-pointer">終日</Label>
									</div>
									<div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border shadow-sm cursor-pointer hover:border-primary transition-colors">
										<RadioGroupItem value="am_half" id="am_half" />
										<Label htmlFor="am_half" className="font-bold cursor-pointer">午前半休</Label>
									</div>
									<div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border shadow-sm cursor-pointer hover:border-primary transition-colors">
										<RadioGroupItem value="pm_half" id="pm_half" />
										<Label htmlFor="pm_half" className="font-bold cursor-pointer">午後半休</Label>
									</div>
								</RadioGroup>
							</div>

							{workOption !== "full_day" && (
								<div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
									<div className="space-y-2">
										<Label htmlFor="start-time" className="font-bold">勤務開始時間</Label>
										<Input
											id="start-time"
											type="time"
											value={startTime}
											onChange={(e) => setStartTime(e.target.value)}
											className="h-11 text-lg"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="end-time" className="font-bold">勤務終了時間</Label>
										<Input
											id="end-time"
											type="time"
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
											className="h-11 text-lg"
										/>
									</div>
								</div>
							)}

							{isLateNightWork && (
								<p className="text-sm font-bold text-destructive bg-destructive/10 p-2 rounded-md">
									⚠️ 特認申請として扱われ、所属長の承認が必要です
								</p>
							)}

							<div className="space-y-2">
								<Label htmlFor="reason" className="font-bold">申請理由</Label>
								<Textarea
									id="reason"
									required={requiresSpecialReason}
									value={reason}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
									placeholder="申請理由を入力してください"
									className="min-h-[100px] text-base"
								/>
							</div>

							{requiresSpecialReason && (
								<div className="space-y-2 animate-in zoom-in-95">
									<Label htmlFor="special-reason" className="font-bold text-primary">特任申請理由</Label>
									<Textarea
										id="special-reason"
										required={requiresSpecialReason}
										value={specialReason}
										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSpecialReason(e.target.value)}
										placeholder="特任申請の背景や理由を記載してください"
										className="min-h-[80px] border-primary/50 focus-visible:ring-primary"
									/>
								</div>
							)}

							<div className="flex flex-col gap-3 pt-2 border-t mt-4">
								<div className="flex items-center space-x-3 group">
									<Checkbox
										id="is-special"
										checked={isSpecial}
										onCheckedChange={(checked: boolean) => setIsSpecial(checked)}
										className="w-5 h-5"
									/>
									<div className="flex items-center gap-2">
										<Label htmlFor="is-special" className="text-base font-bold group-hover:text-primary transition-colors">
											特認申請
										</Label>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button variant="ghost" size="icon" className="h-5 w-5 opacity-50">
														<Info className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>所定の時間を超える場合や、休日申請の場合など</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>

								<div className="flex items-center space-x-3 group">
									<Checkbox
										id="is-overtime"
										checked={isOvertime}
										onCheckedChange={(checked: boolean) => setIsOvertime(checked)}
										className="w-5 h-5"
									/>
									<div className="flex items-center gap-2">
										<Label htmlFor="is-overtime" className="text-base font-bold group-hover:text-primary transition-colors">
											8時間以上の勤務
										</Label>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button variant="ghost" size="icon" className="h-5 w-5 opacity-50">
														<Info className="h-4 w-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>
													<p>残業や休日出勤など、1日の労働時間が8時間を超える場合に選択してください。</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
							</div>

							{isOvertime && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 bg-amber-50 rounded-xl border border-amber-200 animate-in slide-in-from-left-2">
									<div className="space-y-2">
										<Label htmlFor="overtime-reason" className="font-bold">超過理由</Label>
										<Input
											id="overtime-reason"
											required={isOvertime}
											value={overtimeReason}
											onChange={(e) => setOvertimeReason(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="overtime-end" className="font-bold">業務終了予定時間</Label>
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

							<CardFooter className="flex justify-end gap-3 pt-6 px-0 border-t">
								<Button type="button" variant="ghost" onClick={() => router.back()}>
									キャンセル
								</Button>
								<Button
									type="submit"
									size="lg"
									disabled={loading || !date}
									className="px-8 font-bold text-lg h-12 shadow-md hover:scale-105 transition-transform"
								>
									{loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
									上記内容で申請する
								</Button>
							</CardFooter>
						</form>
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default ApplicationForm;
