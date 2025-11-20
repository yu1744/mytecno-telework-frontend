# バックエンドAPI仕様変更・追加点

## 1. 概要

本ドキュメントは、UI改善・新機能要件に伴うバックエンドAPIの変更・追加点を定義するものである。

## 2. データベース設計変更

### 2.1. `users` テーブル

| カラム名              | 型      | オプション      | 目的                               |
| --------------------- | ------- | --------------- | ---------------------------------- |
| `is_child_caregiver`  | boolean | default: false  | 育児対象者の有無                   |
| `is_caregiver`        | boolean | default: false  | 介護対象者の有無                   |

### 2.2. `applications` テーブル

| カラム名           | 型      | オプション | 目的                                                         |
| ------------------ | ------- | ---------- | ------------------------------------------------------------ |
| `application_type` | string  |            | 申請種別 (`normal`, `special_approval`, `over_8_hours`, `late_night_early_morning`) |

### 2.3. `approvals` テーブル

| カラム名           | 型      | オプション | 目的                               |
| ------------------ | ------- | ---------- | ---------------------------------- |
| `status`           | string  |            | 承認ステータス (`approved`, `rejected`) |
| `rejection_reason` | text    |            | 却下理由（`status`が`rejected`の場合に必須） |

### 2.4. `user_info_changes` テーブル (新規作成)

人事異動の予約情報を管理する。

| カラム名              | 型           | オプション       | 目的                 |
| --------------------- | ------------ | ---------------- | -------------------- |
| `id`                  | bigint       | primary key      | ID                   |
| `user_id`             | bigint       | foreign key      | 対象ユーザー         |
| `changer_id`          | bigint       | foreign key      | 変更者（管理者）     |
| `effective_date`      | date         |                  | 変更反映日           |
| `new_department_id`   | bigint       | foreign key      | 新しい部署           |
| `new_role_id`         | bigint       | foreign key      | 新しい役職           |
| `new_manager_id`      | bigint       | foreign key      | 新しい上長           |
| `status`              | string       |                  | 状態 (`pending`, `processed`, `canceled`) |

### 2.5. `user_profiles` テーブル (新規作成)

ユーザーごとの詳細な設定情報を管理する。

| カラム名          | 型     | オプション    | 目的             |
| ----------------- | ------ | ------------- | ---------------- |
| `id`              | bigint | primary key   | ID               |
| `user_id`         | bigint | foreign key   | ユーザー         |
| `outlook_setting` | json   |               | Outlook連携設定  |
| `commute_routes`  | json   |               | 通勤経路情報     |

### 2.6. `tenant_settings` テーブル (新規作成)

テナント全体の外部連携設定を管理する。

| カラム名   | 型     | オプション    | 目的             |
| ---------- | ------ | ------------- | ---------------- |
| `id`       | bigint | primary key   | ID               |
| `name`     | string |               | 設定名           |
| `settings` | json   |               | 設定内容（暗号化） |

## 3. APIエンドポイント設計

### 3.1. 動的な申請上限回数の表示

- **エンドポイント:** `GET /api/v1/users/:user_id/application_limit`
- **説明:** ユーザーの勤続年数や育児・介護情報に基づき、申請可能な上限回数を返す。
- **レスポンス:**
  ```json
  {
    "user_id": 1,
    "limit_count": 10,
    "reason": "勤続年数5年以上のため"
  }
  ```

### 3.2. 申請機能の強化

- **エンドポイント:** `POST /api/v1/applications`
- **説明:** 申請時に申請種別を指定できるように改修。
- **リクエストボディ:**
  ```json
  {
    "application_type": "over_8_hours",
    ...
  }
  ```

### 3.3. 承認機能の強化

- **エンドポイント:**
    - `GET /api/v1/applications`
    - `POST /api/v1/approvals`
- **説明:**
    - 申請一覧取得時に、承認判断に役立つ情報を追加。
    - 承認APIで却下理由を必須にする。
- **リクエストボディ (`POST /api/v1/approvals`):**
  ```json
  {
    "status": "rejected",
    "rejection_reason": "業務の都合上、承認できません。",
    ...
  }
  ```

### 3.4. 人事異動の予約・管理

- **エンドポイント:**
    - `POST /api/v1/admin/user_info_changes` (予約作成)
    - `GET /api/v1/admin/user_info_changes` (一覧)
    - `PUT /api/v1/admin/user_info_changes/:id` (編集)
    - `DELETE /api/v1/admin/user_info_changes/:id` (取消)
- **説明:** 人事異動の予約と管理を行うためのCRUD API。

### 3.5. ユーザープロファイル機能

- **エンドポイント:**
    - `GET /api/v1/users/:user_id/profile`
    - `PUT /api/v1/users/:user_id/profile`
- **説明:** ユーザープロファイル（Outlook連携設定、通勤経路など）を取得・更新する。

### 3.6. 外部連携設定

- **エンドポイント:**
    - `GET /api/v1/admin/tenant_settings`
    - `PUT /api/v1/admin/tenant_settings/:id`
- **説明:** テナント全体の外部連携設定を管理する。

### 3.7. カレンダー表示用データ取得

- **エンドポイント:** `GET /api/v1/applications/calendar`
- **説明:** 指定された期間の申請データをカレンダー表示用に取得する。ユーザーのロールに応じて返すデータが異なる。
    - **admin:** 全ユーザーの申請
    - **approver:** 所属部署のユーザーの申請
    - **applicant:** 自身の申請
- **クエリパラメータ:**
    - `start_date` (string, YYYY-MM-DD): 取得期間の開始日
    - `end_date` (string, YYYY-MM-DD): 取得期間の終了日
- **レスポンス:**
  ```json
  [
    {
      "id": 1,
      "title": "山田太郎 - 在宅勤務",
      "start": "2023-12-01",
      "end": "2023-12-01",
      "status": "承認",
      "backgroundColor": "#22c55e",
      "borderColor": "#22c55e",
      "allDay": true
    }
  ]
  ```
### 3.7. 通知機能

- **実装方針:**
    - `ApplicationController`, `ApprovalController` のステータス変更アクションをトリガーとする。
    - `ActionMailer` や非同期ジョブキューを利用して、メール等の通知を送信する。