"use client";

import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import Header from "./components/Header";
import NavigationMenu from "./components/NavigationMenu";
import theme from "./theme";
import Footer from "./components/Footer";
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
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const { clearAuth } = useAuthStore();
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {isLoginPage ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
              }}
            >
              {children}
            </Box>
          ) : (
            <Box sx={{ display: "flex" }}>
              <Header />
              <NavigationMenu />
              <Box
                component="main"
                className="p-6" // Add padding using Tailwind CSS
                sx={{
                  flexGrow: 1,
                  marginTop: "64px", // Headerの高さ分
                  width: `calc(100% - 240px)`, // Drawerの幅分
                  maxWidth: "1400px", // 最大幅を設定
                  mx: "auto", // 中央寄せ
                }}
              >
                {children}
              </Box>
            </Box>
          )}
          {!isLoginPage && <Footer />}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
