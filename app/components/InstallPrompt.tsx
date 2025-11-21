"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showInstallPrompt, setShowInstallPrompt] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// PWAがインストール済みかチェック
		if (window.matchMedia("(display-mode: standalone)").matches) {
			setIsInstalled(true);
			return;
		}

		// インストールプロンプトイベントをキャプチャ
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);

			// ユーザーが以前にプロンプトを閉じていないかチェック
			const dismissedTime = localStorage.getItem("pwa-install-dismissed");
			if (dismissedTime) {
				const daysSinceDismissed =
					(Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
				// 7日間は再表示しない
				if (daysSinceDismissed < 7) {
					return;
				}
			}

			// 少し遅延してプロンプトを表示（UX改善）
			setTimeout(() => {
				setShowInstallPrompt(true);
			}, 3000);
		};

		const handleAppInstalled = () => {
			setIsInstalled(true);
			setShowInstallPrompt(false);
			setDeferredPrompt(null);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) {
			return;
		}

		// インストールプロンプトを表示
		deferredPrompt.prompt();

		// ユーザーの選択を待つ
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === "accepted") {
			console.log("ユーザーがPWAをインストールしました");
		} else {
			console.log("ユーザーがPWAインストールを拒否しました");
		}

		// プロンプトをクリア
		setDeferredPrompt(null);
		setShowInstallPrompt(false);
	};

	const handleDismiss = () => {
		setShowInstallPrompt(false);
		localStorage.setItem("pwa-install-dismissed", Date.now().toString());
	};

	// インストール済みまたはプロンプトを表示しない場合は何も表示しない
	if (isInstalled || !showInstallPrompt) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 p-2 rounded-lg">
							<Download className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 className="font-semibold text-sm">アプリをインストール</h3>
							<p className="text-xs text-muted-foreground mt-0.5">
								ホーム画面に追加して素早くアクセス
							</p>
						</div>
					</div>
					<button
						onClick={handleDismiss}
						className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
						aria-label="閉じる"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={handleInstallClick}
						className="flex-1"
						size="sm"
					>
						インストール
					</Button>
					<Button
						onClick={handleDismiss}
						variant="outline"
						size="sm"
					>
						後で
					</Button>
				</div>
			</div>
		</div>
	);
}
