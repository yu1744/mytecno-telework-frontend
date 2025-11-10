"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

const inter = Inter({ subsets: ["latin"] });

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
  const {
    isSessionTimeoutModalOpen,
    hideSessionTimeoutModal,
    clearAuth,
  } = useAuthStore();
  const { isOpen, title, message, onConfirm, confirmText, hideModal } = useModalStore();

  const handleCloseModal = () => {
    hideSessionTimeoutModal();
    clearAuth();
    router.push("/login");
  };

  const handleConfirm = () => {
    onConfirm();
    hideModal();
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
      <body className={inter.className}>
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
                sx={{
                  flexGrow: 1,
                  p: 3,
                  marginTop: "64px", // Headerの高さ分
                  width: `calc(100% - 240px)`, // Drawerの幅分
                  maxWidth: "1200px", // 最大幅を設定
                  mx: "auto", // 中央寄せ
                }}
              >
                {children}
              </Box>
            </Box>
          )}
          {!isLoginPage && <Footer />}
          <ReusableModal
            open={isSessionTimeoutModalOpen}
            onClose={handleCloseModal}
            title="セッションタイムアウト"
            content="セッションが切れました。再度ログインしてください。"
            actions={[
              {
                text: "OK",
                onClick: handleCloseModal,
                color: "primary",
                variant: "contained",
              },
            ]}
          />
          <ReusableModal
            open={isOpen}
            onClose={hideModal}
            title={title}
            content={message}
            actions={[
              {
                text: confirmText || "OK",
                onClick: handleConfirm,
                color: "primary",
                variant: "contained",
              },
            ]}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
