# ヘッダーとサイドバーのデザイン改善計画

## 1. 現状分析

### 1.1. 概要
現在のヘッダー ([`Header.tsx`](frontend/app/components/Header.tsx)) とナビゲーションメニュー ([`NavigationMenu.tsx`](frontend/app/components/NavigationMenu.tsx)) は、**Material-UI (MUI)** をベースに実装されています。一方で、プロジェクト内の `frontend/components/ui/` ディレクトリには **shadcn/ui** のコンポーネント群が導入されており、2つの異なるデザインシステムが混在している状況です。

### 1.2. 課題
- **デザインの一貫性の欠如:** MUIとshadcn/uiでは、デザインの思想やコンポーネントの見た目が異なります。これにより、アプリケーション全体で統一感のあるユーザー体験を提供することが困難になっています。
- **メンテナンス性の低下:** 2つのライブラリを同時に管理・更新する必要があり、開発コストの増大や、予期せぬ不具合の原因となる可能性があります。
- **拡張性の制限:** 将来的に新しい機能を追加する際、どちらのライブラリを使用するかという判断が常に発生し、開発の意思決定が複雑になります。

## 2. 改善計画

### 2.1. 方針
今後の開発の効率性、デザインの統一性、カスタマイズ性を考慮し、**デザインシステムをshadcn/uiに統一**します。MUIで実装されているコンポーネントをshadcn/uiのコンポーネントで再実装し、MUIへの依存を段階的に排除していきます。

### 2.2. 具体的な改善案

#### 2.2.1. ヘッダー (`Header.tsx`)
- **レイアウト:**
    - MUIの `AppBar`, `Toolbar` を、shadcn/uiの `Card` やFlexboxレイアウトを組み合わせて代替します。
    - ヘッダーを画面上部に固定し、コンテンツ領域とは明確に分離されたデザインにします。背景色やシャドウを用いて、視覚的な階層を表現します。
- **コンポーネント:**
    - 「在宅勤務申請システム」というタイトルは、shadcn/uiの `h2` や `h3` タグに置き換えます。
    - ユーザー名表示 (`Typography`) は、shadcn/uiの `Label` や `p` タグを使用します。
    - `NotificationBell` は、shadcn/uiの `Button` と `Bell` アイコンを組み合わせて再実装します。
    - 「ログアウト」ボタン (`Button`) は、shadcn/uiの `Button` コンポーネント（variant: `outline` or `ghost`）に置き換えます。

#### 2.2.2. ナビゲーションメニュー (`NavigationMenu.tsx`)
- **レイアウト:**
    - MUIの `Drawer` を廃止し、shadcn/uiのコンポーネント（`Card` や `div`）でサイドバーの骨格を再構築します。
    - `Link` コンポーネントと組み合わせ、Next.jsのルーティングと連携させます。
- **コンポーネント:**
    - メニュー項目 (`ListItem`, `ListItemButton`) は、shadcn/uiの `Button` コンポーネント（variant: `ghost`）を縦に並べる形で表現します。
    - 各メニュー項目のアイコン (`ListItemIcon`) は、`lucide-react` などのアイコンライブラリを導入し、`Button` 内に配置します。
    - `Divider` は、shadcn/uiの `Separator` コンポーネントに置き換えます。
- **インタラクション:**
    - 現在アクティブなメニュー項目を視覚的に示すスタイル（背景色、文字色など）を追加します。

### 2.3. 変更が必要なファイルと作業概要

| ファイル | 変更内容の概要 |
| --- | --- |
| [`frontend/app/components/Header.tsx`](frontend/app/components/Header.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装。レイアウトとスタイルの調整。 |
| [`frontend/app/components/NavigationMenu.tsx`](frontend/app/components/NavigationMenu.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装。レイアウト、スタイル、インタラクションの改善。 |
| [`frontend/app/layout.tsx`](frontend/app/layout.tsx) | ヘッダーとナビゲーションメニューの新しいレイアウトに合わせて、全体のページ構造を調整。 |
| [`frontend/package.json`](frontend/package.json) | `lucide-react` などの必要なライブラリを追加。不要になったMUI関連のライブラリを削除。 |
| [`frontend/app/history/page.tsx`](frontend/app/history/page.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/components/EmptyState.tsx`](frontend/app/components/EmptyState.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/components/ApplicationListTable.tsx`](frontend/app/components/ApplicationListTable.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/approvals/page.tsx`](frontend/app/approvals/page.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/components/FilterComponent.tsx`](frontend/app/components/FilterComponent.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/admin/personnel_changes/page.tsx`](frontend/app/admin/personnel_changes/page.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/components/LoadingSpinner.tsx`](frontend/app/components/LoadingSpinner.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/components/Footer.tsx`](frontend/app/components/Footer.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/theme.ts`](frontend/app/theme.ts) | MUIのテーマ定義を削除し、shadcn/uiのテーマ設定に統一 |
| [`frontend/app/components/NotificationBell.tsx`](frontend/app/components/NotificationBell.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |
| [`frontend/app/apply/page.tsx`](frontend/app/apply/page.tsx) | MUIコンポーネントをshadcn/uiコンポーネントで再実装 |

## 3. 期待される効果
- **デザインの統一:** アプリケーション全体で一貫したデザイン言語が適用され、ユーザー体験が向上します。
- **開発効率の向上:** コンポーネントの選択肢が一本化されることで、開発者の意思決定が迅速になり、生産性が向上します。
- **メンテナンス性の向上:** 依存ライブラリが整理され、コードベースがシンプルになることで、メンテナンスが容易になります。