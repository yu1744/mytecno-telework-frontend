# 再利用可能なUIコンポーネント一覧

このドキュメントは、`frontend/app/components/` ディレクトリ内に存在する再利用可能なUIコンポーネントの一覧です。
重複したコンポーネントの開発を防ぐため、新しいコンポーネントを作成する前に必ずこのドキュメントを確認してください。

---

## 汎用コンポーネント

アプリケーション全体で広く利用できる基本的なUI部品です。

### LoadingSpinner.tsx

-   **役割:** データ読み込み中など、処理の待ち時間を示すスピナーを表示します。
-   **基本的な使い方:**
    ```tsx
    import LoadingSpinner from '@/app/components/LoadingSpinner';

    const MyComponent = () => {
      const [isLoading, setIsLoading] = useState(true);

      if (isLoading) {
        return <LoadingSpinner />;
      }

      return <div>...コンテンツ...</div>;
    };
    ```
-   **Props:** なし

### EmptyState.tsx

-   **役割:** 表示するデータが存在しない場合に、メッセージとアイコンを表示します。
-   **基本的な使い方:**
    ```tsx
    import EmptyState from '@/app/components/EmptyState';

    const MyComponent = ({ data }) => {
      if (data.length === 0) {
        return <EmptyState message="表示するアイテムがありません。" />;
      }

      return <ul>...リスト...</ul>;
    };
    ```
-   **Props:**
    -   `message` (string, optional): 表示するメッセージ。デフォルトは「表示できるデータはありません。」

### FilterComponent.tsx

-   **役割:** 開始日、終了日、ステータスによるデータのフィルタリング機能を提供します。
-   **基本的な使い方:**
    ```tsx
    import FilterComponent from '@/app/components/FilterComponent';

    const MyPage = () => {
      const [startDate, setStartDate] = useState(null);
      const [endDate, setEndDate] = useState(null);
      const [status, setStatus] = useState('all');

      return (
        <FilterComponent
          startDate={startDate}
          endDate={endDate}
          status={status}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStatusChange={setStatus}
        />
      );
    };
    ```
-   **Props:**
    -   `startDate` (Date | null): 開始日
    -   `endDate` (Date | null): 終了日
    -   `status` (string): ステータス
    -   `onStartDateChange` ((date: Date | null) => void): 開始日変更時のコールバック
    -   `onEndDateChange` ((date: Date | null) => void): 終了日変更時のコールバック
    -   `onStatusChange` ((status: string) => void): ステータス変更時のコールバック

---

## アプリケーション特化コンポーネント

特定のページや機能で利用される、より具体的なコンポーネントです。

### ApplicationForm.tsx

-   **役割:** 在宅勤務の申請を行うためのフォームです。
-   **基本的な使い方:** 主に申請ページ (`/apply`) で使用されます。
-   **Props:** なし

### ApplicationListTable.tsx

-   **役割:** 申請履歴の一覧をテーブル形式で表示します。
-   **基本的な使い方:**
    ```tsx
    import ApplicationListTable from '@/app/components/ApplicationListTable';
    import { Application } from '@/app/types/application';

    const HistoryPage = ({ applications }: { applications: Application[] }) => {
      return <ApplicationListTable applications={applications} />;
    };
    ```
-   **Props:**
    -   `applications` (Application[]): 表示する申請データの配列

### Header.tsx

-   **役割:** 全ページ共通のヘッダー。ページタイトル、ユーザー情報、ログアウトボタンなどを表示します。
-   **基本的な使い方:** `layout.tsx` などでグローバルに配置されます。
-   **Props:** なし

### NavigationMenu.tsx

-   **役割:** サイドナビゲーションメニュー。ユーザーの権限に応じて表示項目が変化します。
-   **基本的な使い方:** `layout.tsx` などでグローバルに配置されます。
-   **Props:** なし

### NotificationBell.tsx

-   **役割:** 未読通知の有無を知らせ、通知一覧を表示するベルアイコンです。
-   **基本的な使い方:** `Header.tsx` 内で使用されています。
-   **Props:** なし

### PrivateRoute.tsx

-   **役割:** ページのアクセス制御を行います。未認証のユーザーや、権限のないユーザーをリダイレクトさせます。
-   **基本的な使い方:**
    ```tsx
    import PrivateRoute from '@/app/components/PrivateRoute';

    const AdminPage = () => {
      return (
        <PrivateRoute allowedRoles={['admin']}>
          <h1>管理者ページ</h1>
          {/* ...管理者向けコンテンツ... */}
        </PrivateRoute>
      );
    };
    ```
-   **Props:**
    -   `children` (React.ReactNode): 保護するコンテンツ
    -   `allowedRoles` (string[], optional): アクセスを許可するロールの配列

### UsageAnalytics.tsx

-   **役割:** 在宅勤務の利用状況を分析し、グラフや表で可視化します。
-   **基本的な使い方:** 管理者向けのダッシュボードなどで使用されます。
-   **Props:** なし

### Footer.tsx

-   **役割:** 全ページ共通のフッター。コピーライトなどを表示します。
-   **基本的な使い方:** `layout.tsx` などでグローバルに配置されます。
-   **Props:** なし