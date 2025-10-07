"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import Header from "./components/Header";
import NavigationMenu from "./components/NavigationMenu";
import theme from "./theme";
import Footer from "./components/Footer";
import { usePathname } from "next/navigation";

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
  const isLoginPage = pathname === "/login";

  return (
    <html lang="ja">
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
        </ThemeProvider>
      </body>
    </html>
  );
}
