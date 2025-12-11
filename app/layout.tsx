"use client";

import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import InstallPrompt from "./components/InstallPrompt";
import NavigationMenu from "./components/NavigationMenu";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import { useModalStore } from "./store/modal";
import ReusableModal from "./components/ReusableModal";
import { SessionProvider } from "next-auth/react"; // frontendsa由来
import { Toaster } from "@/components/ui/sonner"; // main由来

const notoSansJp = Noto_Sans_JP({
	subsets: ["latin"],
	weight: ["400", "700"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const isLoginPage = pathname === "/login";
	const {
		isOpen,
		title,
		message,
		onConfirm,
		onCancel,
		confirmText,
		cancelText,
		hideModal,
	} = useModalStore();

	const handleConfirm = () => {
		onConfirm();
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			hideModal();
		}
	};

	useEffect(() => {
		useAuthStore.persist.rehydrate();
	}, []);

	return (
		<html lang="ja">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
				<meta name="description" content="在宅勤務の申請や承認を行うためのアプリケーションです" />
				<meta name="theme-color" content="#0f172a" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/icon-192x192.png" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="在宅管理" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
			</head>
			<body className={`${notoSansJp.className} bg-gray-100`}>
				{/* SessionProviderでラップし、内部にToasterなども配置 */}
				<SessionProvider>
					{isLoginPage ? (
						<div className="flex items-center justify-center min-h-screen">
							{children}
						</div>
					) : (
						<div className="flex flex-col h-screen">
							<Header />
							<div className="flex flex-1">
								<NavigationMenu />
								<main className="flex-1 overflow-y-auto p-8">{children}</main>
							</div>
						</div>
					)}
					<ReusableModal
						open={isOpen}
						onClose={hideModal}
						title={title}
						content={message}
						actions={[
							{
								text: cancelText || "キャンセル",
								onClick: handleCancel,
								variant: "ghost",
							},
							{
								text: confirmText || "申請",
								onClick: handleConfirm,
								variant: "default",
							},
						]}
					/>
					<InstallPrompt />
					<Toaster />
				</SessionProvider>
			</body>
		</html>
	);
}