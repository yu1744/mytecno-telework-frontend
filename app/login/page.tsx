"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { useAuthStore } from "@/app/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const setAuth = useAuthStore((state) => state.setAuth);
	const router = useRouter();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setLoading(true); // Set loading to true when submission starts
		try {
			const response = await api.post("/auth/sign_in", {
				email,
				password,
			});

			const user = response.data.data;
			const headers = response.headers;
			const authHeaders = {
				"access-token": headers["access-token"] as string,
				client: headers["client"] as string,
				uid: headers["uid"] as string,
			};

			setAuth(user, authHeaders);

			localStorage.setItem("access-token", authHeaders["access-token"]);
			localStorage.setItem("client", authHeaders["client"]);
			localStorage.setItem("uid", authHeaders["uid"]);

			const roleName = user.role?.name;
			switch (roleName) {
				case "admin":
					router.push("/admin");
					break;
				case "approver":
					router.push("/approvals");
					break;
				case "applicant":
					router.push("/dashboard");
					break;
				default:
					router.push("/dashboard");
					break;
			}
		} catch (error: any) {
			console.error("Login failed:", error);

			// より詳細なエラーメッセージを表示
			if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
				setError(
					"サーバーへの接続がタイムアウトしました。少しお待ちください。"
				);
			} else if (error.code === "ERR_NETWORK" || !error.response) {
				setError("ネットワークエラーが発生しました。接続を確認してください。");
			} else if (
				error.response?.status === 401 ||
				error.response?.status === 422
			) {
				setError("メールアドレスまたはパスワードが正しくありません。");
			} else if (error.response?.status === 500) {
				setError("サーバーエラーが発生しました。しばらく後にお試しください。");
			} else {
				setError("ログインに失敗しました。もう一度お試しください。");
			}
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						在宅勤務申請システム
					</CardTitle>
					<CardDescription className="text-center">
						メールアドレスとパスワードを入力してログインしてください
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<div
							className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
							role="alert"
						>
							<span className="block sm:inline">{error}</span>
						</div>
					)}
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email">メールアドレス</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">パスワード</Label>
							</div>
							<Input
								id="password"
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							ログイン
						</Button>
						<div className="text-center mt-4">
							<Link
								href="/activate"
								className="text-sm text-blue-600 hover:underline"
							>
								初回ログイン・パスワード設定はこちら
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default LoginPage;
