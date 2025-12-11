"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import api from "@/app/lib/api";
import { useAuthStore } from "@/app/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// リトライ付きAPIコール
const apiCallWithRetry = async (
    fn: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const isConnectionError = 
                error.code === "ERR_CONNECTION_RESET" || 
                error.code === "ERR_NETWORK" ||
                error.message?.includes("Network Error");
            
            if (isConnectionError && i < maxRetries - 1) {
                console.log(`リトライ ${i + 1}/${maxRetries}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();
    const { data: session, status } = useSession();

    // Microsoft認証を完了する
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

            setAuth(user, authHeaders);

            localStorage.setItem("access-token", authHeaders["access-token"]);
            localStorage.setItem("client", authHeaders["client"]);
            localStorage.setItem("uid", authHeaders["uid"]);

            // リダイレクト中フラグをON
            setIsRedirecting(true);

            const roleName = user.role?.name;
            switch (roleName) {
                case "admin":
                    router.push("/admin");
                    break;
                case "approver":
                    router.push("/approvals");
                    break;
                default:
                    router.push("/dashboard");
                    break;
            }
        } catch (error: any) {
            console.error("Microsoft認証エラー:", error);
            if (error.response?.status === 404) {
                setError(error.response.data.error || "このMicrosoftアカウントは登録されていません。");
            } else {
                setError("Microsoft認証に失敗しました。再度お試しください。");
            }
            setIsLoading(false);
        }
        // 成功時はisLoadingをfalseにしない（リダイレクトするまで維持）
    };

    // 通常のログイン処理
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!email || !password) {
            setError("メールアドレスとパスワードを入力してください。");
            return;
        }

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

            if (!accessToken || !client || !uid) {
                throw new Error("認証情報の取得に失敗しました。");
            }

            const authHeaders = {
                "access-token": accessToken as string,
                client: client as string,
                uid: uid as string,
            };

            setAuth(user, authHeaders);

            localStorage.setItem("access-token", authHeaders["access-token"]);
            localStorage.setItem("client", authHeaders["client"]);
            localStorage.setItem("uid", authHeaders["uid"]);

            // リダイレクト中フラグをON
            setIsRedirecting(true);

            const roleName = user.role?.name;
            switch (roleName) {
                case "admin":
                    router.push("/admin");
                    break;
                case "approver":
                    router.push("/approvals");
                    break;
                default:
                    router.push("/dashboard");
                    break;
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            if (error.response?.status === 401 || error.response?.status === 422) {
                setError("メールアドレスまたはパスワードが正しくありません。");
            } else {
                setError("ログインに失敗しました。");
            }
            setIsLoading(false);
        }
        // 成功時はisLoadingをfalseにしない（リダイレクトするまで維持）
    };

    // Microsoft SSOでサインイン開始（既存セッションをクリアしてから）
    const handleMicrosoftSignIn = async () => {
        setIsLoading(true);
        setError("");
        
        try {
            if (status === "authenticated") {
                await signOut({ redirect: false });
            }
            await signIn("azure-ad", { callbackUrl: "/login" });
        } catch (error) {
            console.error("Microsoft Sign-in failed:", error);
            setError("Microsoftサインインの開始に失敗しました。");
            setIsLoading(false);
        }
    };

    // ローディング画面（セッション読み込み中、リダイレクト中）
    if (status === "loading" || isRedirecting) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {isRedirecting ? "ログイン成功！リダイレクト中..." : "読み込み中..."}
                    </p>
                </div>
            </div>
        );
    }

    const hasMicrosoftSession = status === "authenticated" && session?.accessToken;

    return (
        <>
            {/* ローディングオーバーレイ */}
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">処理中...</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">在宅勤務申請システム</h1>
                        <p className="text-balance text-muted-foreground">
                            {hasMicrosoftSession 
                                ? "Microsoftアカウントでログインします" 
                                : "ログインしてください"}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {hasMicrosoftSession ? (
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
                                Microsoftアカウントでログイン
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
                        <>
                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">メールアドレス</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="username"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">パスワード</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    ログイン
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-gray-100 dark:bg-gray-950 px-2 text-muted-foreground">
                                        または
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
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
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default LoginPage;