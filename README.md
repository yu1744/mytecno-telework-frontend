# フロントエンド (Next.js)

## 1. 概要

このリポジトリは、在宅勤務管理-MYTECNO のフロントエンドアプリケーションです。Next.js, TypeScript, Tailwind CSS を使用しています。
開発環境の起動やGitの運用ルールについては、親リポジトリの `README.md` を参照してください。

## 2. 技術スタック

-   フレームワーク: [Next.js](https://nextjs.org/) (App Router)
-   言語: [TypeScript](https://www.typescriptlang.org/)
-   CSS: [Tailwind CSS](https://tailwindcss.com/)
-   状態管理: (例: Zustand, Recoil, etc. - 導入時に記載)
-   データフェッチ: (例: SWR, React Query, etc. - 導入時に記載)

## 3. コーディング規約

-   **リンター & フォーマッター:** [ESLint](https://eslint.org/) と [Prettier](https://prettier.io/) を使用します。コミット前に自動でフォーマットが実行される設定になっています。
-   **コンポーネント設計:** (例: Atomic Design, etc. - 方針が決まり次第記載)
-   **命名規則:**
    -   ファイル名: `kebab-case.tsx`
    -   コンポーネント名: `PascalCase`
    -   変数・関数名: `camelCase`

## 4. ディレクトリ構成 (主要なもの)

```
frontend/
├── app/              # App Routerの規約に沿ったページやコンポーネント
│   ├── layout.tsx
│   └── page.tsx
├── components/       # 共通で利用するUIコンポーネント
├── lib/              # APIクライアントや共通の便利関数など
└── ...
