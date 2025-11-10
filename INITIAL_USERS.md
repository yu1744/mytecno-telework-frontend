# 初期ユーザー情報

## 📋 ログイン情報

システムのセットアップ時に以下の初期ユーザーが作成されます。

### 👨‍💼 管理者 (Admin)

- **Email**: `admin@example.com`
- **Password**: `password123`
- **権限**: 全ての機能にアクセス可能
- **部署**: 総務部
- **社員番号**: A001

### 👔 承認者 (Approver)

- **Email**: `approver@example.com`
- **Password**: `password123`
- **権限**: 申請の承認・却下が可能
- **部署**: 開発部
- **社員番号**: M001

### 👤 一般ユーザー (User)

- **Email**: `user@example.com`
- **Password**: `password123`
- **権限**: 申請の作成・閲覧が可能
- **部署**: 開発部
- **社員番号**: U001
- **上司**: 承認者

## 🔐 初回ログイン後の推奨事項

1. **パスワードの変更**

   - セキュリティのため、初回ログイン後は必ずパスワードを変更してください

2. **プロフィール情報の更新**

   - 必要に応じて個人情報を更新してください

3. **テストデータの削除**
   - 本番環境で使用する場合は、これらのテストユーザーを削除してください

## 🔄 ユーザーの再作成

初期ユーザーを再作成したい場合:

```bash
# データベースをリセット
docker-compose exec backend bundle exec rails db:reset

# または
make db-reset
```

## ➕ 新規ユーザーの追加

### 管理画面から追加（推奨）

管理者でログイン後、ユーザー管理画面から追加できます。

### コンソールから追加

```bash
docker-compose exec backend bundle exec rails console

# Railsコンソール内で
User.create!(
  email: 'newuser@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  name: '新規ユーザー',
  role: Role.find_by(name: 'user'),
  department: Department.first,
  employee_number: 'U999'
)
```

## 📚 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) - 開発ガイド
- [BACKEND_API_SPEC.md](../BACKEND_API_SPEC.md) - API 仕様
