"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { apiCallWithRetry, isAxiosError } from "@/app/lib/utils";
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
	const [isLoading, setIsLoading] = useState(false); // loading状態を統一
	const [isRedirecting, setIsRedirecting] = useState(false);
	const setAuth = useAuthStore((state) => state.setAuth);
	const router = useRouter();
	const { data: session, status } = useSession();

	// 共通の認証後処理（トークン保存とリダイレクト）
	const handleAuthSuccess = (user: { id: number; email: string; name: string }, authHeaders: { "access-token": string; client: string; uid: string }) => {
		setAuth(user, authHeaders);

		localStorage.setItem("access-token", authHeaders["access-token"]);
		localStorage.setItem("client", authHeaders["client"]);
		localStorage.setItem("uid", authHeaders["uid"]);

		setIsRedirecting(true);

		const roleName = user.role?.name;
		switch (roleName) {
			case "admin":
				router.push("/admin");
				break;
			case "approver":
				router.push("/approvals");
				break;
			case "applicant": // main由来のroleも考慮
				router.push("/dashboard");
				break;
			default:
				router.push("/dashboard");
				break;
		}
	};

	// Microsoft認証を完了する (frontendsa由来)
	const handleMicrosoftAuth = async () => {
		if (!session?.accessToken) {
			setError("Microsoftセッションがありません。再度サインインしてください。");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await apiCallWithRetry(() =>
				api.post("/auth/microsoft/callback", {
					access_token: session.accessToken,
				})
			);

			const user = response.data.data;
			const headers = response.headers;

			const accessToken = headers["access-token"];
			const client = headers["client"];
			const uid = headers["uid"];

			if (!accessToken || !client || !uid) {
				throw new Error("認証情報の取得に失敗しました。");
			}

			const authHeaders = {
				"access-token": accessToken as string,
				client: client as string,
				uid: uid as string,
			};

			handleAuthSuccess(user, authHeaders);
		} catch (error: unknown) {
			if (isAxiosError(error) && error.response?.status === 404) {
				setError(
					error.response?.data?.error ||
					"このMicrosoftアカウントは登録されていません。"
				);
			} else {
				setError("Microsoft認証に失敗しました。再度お試しください。");
			}
			setIsLoading(false);
		}
	};

	// 通常のログイン処理 (mainとfrontendsaの統合)
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await api.post("/auth/sign_in", {
				email,
				password,
			});

			const user = response.data.data;
			const headers = response.headers;
			const accessToken = headers["access-token"];
			const client = headers["client"];
			const uid = headers["uid"];

			const authHeaders = {
				"access-token": accessToken as string,
				client: client as string,
				uid: uid as string,
			};

			handleAuthSuccess(user, authHeaders);
		} catch (error: unknown) {
			// main由来の詳細なエラーハンドリングを採用
			if (isAxiosError(error) && (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")) {
				setError(
					"サーバーへの接続がタイムアウトしました。少しお待ちください。"
				);
			} else if (isAxiosError(error) && (error.code === "ERR_NETWORK" || !error.response)) {
				setError("ネットワークエラーが発生しました。接続を確認してください。");
			} else if (isAxiosError(error) &&
				(error.response?.status === 401 ||
				error.response?.status === 422)
			) {
				setError("メールアドレスまたはパスワードが正しくありません。");
			} else if (isAxiosError(error) && error.response?.status === 500) {
				setError("サーバーエラーが発生しました。しばらく後にお試しください。");
			} else {
				setError("ログインに失敗しました。もう一度お試しください。");
			}
			setIsLoading(false);
		}
	};

	// Microsoft SSOでサインイン開始
	const handleMicrosoftSignIn = async () => {
		setIsLoading(true);
		setError("");

		try {
			if (status === "authenticated") {
				await signOut({ redirect: false });
			}
			await signIn("azure-ad", { callbackUrl: "/login" });
		} catch (error) {
			setError("Microsoftサインインの開始に失敗しました。");
			setIsLoading(false);
		}
	};

	// ローディング画面（セッション読み込み中、リダイレクト中）
	if (status === "loading" || isRedirecting) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-950 z-50">
				<div className="text-center">
					<Loader2 className="animate-spin h-12 w-12 text-gray-900 mx-auto" />
					<p className="mt-4 text-gray-600">
						{isRedirecting
							? "ログイン成功！リダイレクト中..."
							: "読み込み中..."}
					</p>
				</div>
			</div>
		);
	}

	const hasMicrosoftSession =
		status === "authenticated" && session?.accessToken;

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						在宅勤務申請システム
					</CardTitle>
					<CardDescription className="text-center">
						{hasMicrosoftSession
							? "Microsoftアカウントでログインします"
							: "アカウントにログインしてください"}
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

					{hasMicrosoftSession ? (
						// Microsoftセッションがある場合（コールバック後）
						<div className="grid gap-4">
							<Button
								type="button"
								className="w-full"
								onClick={handleMicrosoftAuth}
								disabled={isLoading}
							>
								<svg className="w-5 h-5 mr-2" viewBox="0 0 21 21">
									<rect x="1" y="1" width="9" height="9" fill="#f25022" />
									<rect x="11" y="1" width="9" height="9" fill="#7fba00" />
									<rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
									<rect x="11" y="11" width="9" height="9" fill="#ffb900" />
								</svg>
								Microsoftアカウントでログインを完了
							</Button>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={handleMicrosoftSignIn}
								disabled={isLoading}
							>
								別のアカウントを使用
							</Button>
						</div>
					) : (
						// 通常のログイン画面 + SSO開始ボタン
						<>
							<Button
								type="button"
								variant="outline"
								className="w-full mb-4"
								onClick={handleMicrosoftSignIn}
								disabled={isLoading}
							>
								<svg className="w-5 h-5 mr-2" viewBox="0 0 21 21">
									<rect x="1" y="1" width="9" height="9" fill="#f25022" />
									<rect x="11" y="1" width="9" height="9" fill="#7fba00" />
									<rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
									<rect x="11" y="11" width="9" height="9" fill="#ffb900" />
								</svg>
								Microsoftアカウントでサインイン
							</Button>

							<div className="relative mb-4">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-white dark:bg-gray-950 px-2 text-muted-foreground">
										または
									</span>
								</div>
							</div>

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
										disabled={isLoading}
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
										disabled={isLoading}
									/>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? (
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
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default LoginPage;