import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPWA_ = withPWA as any;

const nextConfig: NextConfig = {
	/* config options here */
	// パフォーマンス最適化
	reactStrictMode: true,

	// SWC Minifier（高速化）
	swcMinify: true,

	// 画像最適化
	images: {
		domains: [],
		formats: ["image/avif", "image/webp"],
	},

	// 開発環境での高速リフレッシュ
	experimental: {
		optimizeCss: true,
	},

	// 本番ビルド最適化
	compiler: {
		removeConsole: process.env.NODE_ENV === "production",
	},
};

export default withPWA_({
	dest: "public",
	register: true,
	skipWaiting: true,
	swSrc: "public/sw.js",
	// PWA最適化
	disable: process.env.NODE_ENV === "development",
	buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig);
