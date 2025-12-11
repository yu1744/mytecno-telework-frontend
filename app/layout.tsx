"use client";

import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import NavigationMenu from "./components/NavigationMenu";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import { useModalStore } from "./store/modal";
import ReusableModal from "./components/ReusableModal";
import { SessionProvider } from "next-auth/react";

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
				<link rel="manifest" href="/manifest.json" />
				<meta name="theme-color" content="#000000" />
			</head>
			<body className={`${notoSansJp.className} bg-gray-100`}>
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
				</SessionProvider>
			</body>
		</html>
	);
}