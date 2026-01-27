"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { checkActivation, setupAccount } from "../lib/api";
import { isAxiosError } from "../lib/utils";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const step1Schema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください"),
	employee_number: z.string().min(1, "社員番号を入力してください"),
});

const step2Schema = z.object({
	password: z.string().min(8, "パスワードは8文字以上で入力してください"),
	password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
	message: "パスワードが一致しません",
	path: ["password_confirmation"],
});

export default function ActivatePage() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [userInfo, setUserInfo] = useState<{ email: string; employee_number: string } | null>(null);

	const form1 = useForm<z.infer<typeof step1Schema>>({
		resolver: zodResolver(step1Schema),
		defaultValues: {
			email: "",
			employee_number: "",
		},
	});

	const form2 = useForm<z.infer<typeof step2Schema>>({
		resolver: zodResolver(step2Schema),
		defaultValues: {
			password: "",
			password_confirmation: "",
		},
	});

	const onStep1Submit = async (values: z.infer<typeof step1Schema>) => {
		setLoading(true);
		try {
			await checkActivation(values.email, values.employee_number);
			setUserInfo(values);
			setStep(2);
		} catch (error: unknown) {
			console.error(error);
			if (isAxiosError(error) && error.response?.data?.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error("アカウントの確認に失敗しました");
			}
		} finally {
			setLoading(false);
		}
	};

	const onStep2Submit = async (values: z.infer<typeof step2Schema>) => {
		if (!userInfo) return;
		setLoading(true);
		try {
			await setupAccount({
				...userInfo,
				...values,
			});
			toast.success("アカウントが有効化されました。ログインしてください。");
			router.push("/login");
		} catch (error: unknown) {
			console.error(error);
			if (isAxiosError(error) && error.response?.data?.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error("アカウントの有効化に失敗しました");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">初回ログイン設定</CardTitle>
					<CardDescription className="text-center">
						{step === 1
							? "メールアドレスと社員番号を入力して本人確認を行います"
							: "新しいパスワードを設定してください"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{step === 1 ? (
						<form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">メールアドレス</label>
								<Input
									id="email"
									placeholder="example@mytecno.co.jp"
									{...form1.register("email")}
								/>
								{form1.formState.errors.email && (
									<p className="text-sm font-medium text-destructive text-red-500">
										{form1.formState.errors.email.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<label htmlFor="employee_number" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">社員番号</label>
								<Input
									id="employee_number"
									placeholder="12345"
									{...form1.register("employee_number")}
								/>
								{form1.formState.errors.employee_number && (
									<p className="text-sm font-medium text-destructive text-red-500">
										{form1.formState.errors.employee_number.message}
									</p>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
								次へ
							</Button>
						</form>
					) : (
						<form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">新しいパスワード</label>
								<Input
									id="password"
									type="password"
									placeholder="********"
									{...form2.register("password")}
								/>
								{form2.formState.errors.password && (
									<p className="text-sm font-medium text-destructive text-red-500">
										{form2.formState.errors.password.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<label htmlFor="password_confirmation" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">パスワード（確認）</label>
								<Input
									id="password_confirmation"
									type="password"
									placeholder="********"
									{...form2.register("password_confirmation")}
								/>
								{form2.formState.errors.password_confirmation && (
									<p className="text-sm font-medium text-destructive text-red-500">
										{form2.formState.errors.password_confirmation.message}
									</p>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
								設定してログインへ
							</Button>
							<Button
								type="button"
								variant="ghost"
								className="w-full"
								onClick={() => setStep(1)}
								disabled={loading}
							>
								戻る
							</Button>
						</form>
					)}
					<div className="mt-4 text-center text-sm">
						<Link href="/login" className="text-blue-600 hover:underline">
							ログイン画面に戻る
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
