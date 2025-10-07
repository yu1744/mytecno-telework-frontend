# 在宅勤務申請システム ER図

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : "申請"
    USERS ||--o{ APPROVALS : "承認"
    USERS {
        int id PK
        string name
        string email
        string password_digest
        int role_id FK
        int department_id FK
        date hired_date
        datetime created_at
        datetime updated_at
    }

    DEPARTMENTS {
        int id PK
        string name
        datetime created_at
        datetime updated_at
    }

    ROLES {
        int id PK
        string name
        datetime created_at
        datetime updated_at
    }

    APPLICATIONS {
        int id PK
        int user_id FK
        date date
        float work_hours
        string reason
        int status_id FK
        boolean is_special_case
        string special_reason
        datetime start_time
        datetime end_time
        datetime created_at
        datetime updated_at
    }

    APPROVALS {
        int id PK
        int application_id FK
        int approver_id FK
        string comment
        datetime created_at
        datetime updated_at
    }

    APPLICATION_STATUSES {
        int id PK
        string name
        datetime created_at
        datetime updated_at
    }

    USERS }o--|| DEPARTMENTS : "所属"
    USERS }o--|| ROLES : "役割"
    APPLICATIONS }o--|| APPLICATION_STATUSES : "ステータス"
    APPROVALS }o--|| APPLICATIONS : "申請"
