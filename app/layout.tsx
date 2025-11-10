"use client";

import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import NavigationMenu from "./components/NavigationMenu";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import { useModalStore } from "./store/modal";
import ReusableModal from "./components/ReusableModal";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// metadataはサーバーコンポーネントでしか使えないため、ここでは定義のみ
// export const metadata: Metadata = {
//   title: "在宅勤務管理システム",
//   description: "MYTECNO在宅勤務管理システム",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const { isOpen, title, message, onConfirm, confirmText, hideModal } = useModalStore();

  const handleConfirm = () => {
    onConfirm();
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
        {isLoginPage ? (
          <div className="flex items-center justify-center min-h-screen">
            {children}
          </div>
        ) : (
          <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1">
              <NavigationMenu />
              <main className="flex-1 overflow-y-auto p-8">
                {children}
              </main>
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
              text: confirmText || "OK",
              onClick: handleConfirm,
              variant: "default",
            },
          ]}
        />
      </body>
    </html>
  );
}
