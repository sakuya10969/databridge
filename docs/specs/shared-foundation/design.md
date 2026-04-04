# 設計書: 共通基盤（Shared Foundation）

## 概要

Import・Report両サブシステムが依存する共通基盤を構築する。
バックエンドはクリーンアーキテクチャ4層の骨格（FastAPI、SQLAlchemy、Alembic、ドメイン例外、共通スキーマ、例外ハンドラ）と監査ログ機能を提供する。
フロントエンドはFSD変則構成の共通レイヤー（APIクライアント、共通UI、レイアウト、プロバイダ）を提供する。

## アーキテクチャ

### バックエンド共通基盤

```
server/
  app/
    presentation/
      __init__.py
      router.py              APIRouter集約（/api/v1）
      common_schemas.py      ApiResponse[T], ErrorResponse, PaginationMeta
      error_handlers.py      ドメイン例外→HTTPレスポンス変換
      dependencies.py        FastAPI Depends用ファクトリ
      audit_logs/
        router.py            GET /api/v1/audit-logs
        schemas.py           AuditLogListResponse
    application/
      __init__.py
      audit_service.py       AuditService
    domain/
      __init__.py
      exceptions.py          全ドメイン例外
      entities/
        __init__.py
        audit_log.py         AuditLog dataclass
      repositories/
        __init__.py
        i_audit_repository.py  IAuditRepository ABC
    infrastructure/
      __init__.py
      config.py              pydantic-settings設定
      database/
        __init__.py
        session.py           async engine, sessionmaker, get_session
        models.py            AuditLogModel（初期）
      repositories/
        __init__.py
        audit_repository.py  AuditRepository具象
  alembic/
    env.py
    versions/
  main.py                    FastAPIアプリ起動
```

### フロントエンド共通基盤

```
client/app/
  shared/
    api/
      client.ts              axiosインスタンス・インターセプター
      types.ts               ApiResponse<T>, ErrorResponse, PaginationMeta
    ui/
      data-table.tsx          TanStack Table汎用ラッパー
      loading-spinner.tsx     ローディング表示
      empty-state.tsx         空状態表示
      confirm-dialog.tsx      確認ダイアログ
    utils/
      format-date.ts          日時フォーマット
      format-file-size.ts     ファイルサイズフォーマット
  providers/
    query-client.tsx          TanStack Query QueryClientProvider
  layouts/
    app-layout.tsx            サイドバー + ヘッダー + メインコンテンツ
```

## コンポーネントとインターフェース

### バックエンド

#### domain層

**エンティティ:**
- `AuditLog`: 監査ログエンティティ（id, operator, action, resource_type, resource_id, details, created_at）

**リポジトリインターフェース:**

```python
class IAuditRepository(ABC):
    async def create(self, log: AuditLog) -> AuditLog: ...
    async def list_logs(self, operator: str | None, action: str | None,
                        resource_type: str | None, page: int, per_page: int) -> tuple[list[AuditLog], int]: ...
```

**ドメイン例外:**
- `DomainError`: 基底例外
- `ParseError`: ファイルパース失敗
- `ValidationError`: バリデーション設定不整合
- `DataImportError`: DB取り込み失敗
- `JobNotFoundError`: ジョブ不存在
- `InvalidStatusTransitionError`: 不正ステータス遷移
- `TemplateNotFoundError`: テンプレート不存在
- `DuplicateTemplateNameError`: テンプレート名重複
- `ReportGenerationError`: 帳票生成失敗
- `ReportOutputNotFoundError`: 帳票出力ファイル不存在
- `DuplicateFieldKeyError`: フィールドキー重複
- `InvalidFilterError`: フィルタ条件不正

#### application層

**AuditService:**

```python
class AuditService:
    def __init__(self, audit_repo: IAuditRepository): ...
    async def log(self, operator: str, action: str, resource_type: str,
                  resource_id: UUID, details: dict | None = None) -> AuditLog: ...
    async def list_logs(self, operator: str | None, action: str | None,
                        resource_type: str | None, page: int, per_page: int) -> tuple[list[AuditLog], int]: ...
```

#### infrastructure層

**SQLAlchemyモデル:**
- `AuditLogModel`: audit_logsテーブル

**設定:**
- `Settings`: DATABASE_URL, UPLOAD_DIR, REPORT_OUTPUT_DIR, MAX_FILE_SIZE等

#### presentation層

**例外ハンドラマッピング:**

| ドメイン例外 | HTTPステータス | エラーコード |
|-------------|--------------|------------|
| JobNotFoundError | 404 | NOT_FOUND |
| TemplateNotFoundError | 404 | NOT_FOUND |
| ReportOutputNotFoundError | 404 | REPORT_OUTPUT_NOT_FOUND |
| InvalidStatusTransitionError | 409 | INVALID_STATUS |
| DuplicateTemplateNameError | 409 | DUPLICATE_NAME |
| DuplicateFieldKeyError | 409 | DUPLICATE_FIELD_KEY |
| ParseError | 422 | PARSE_ERROR |
| ValidationError | 422 | VALIDATION_FAILED |
| InvalidFilterError | 422 | INVALID_FILTER |
| DataImportError | 500 | IMPORT_ERROR |
| ReportGenerationError | 500 | REPORT_GENERATION_ERROR |
| Exception | 500 | INTERNAL_ERROR |

**共通Pydanticスキーマ:**
- `ApiResponse[T]`: `{"data": T, "meta": PaginationMeta | None}`
- `ErrorResponse`: `{"error": {"code": str, "message": str, "details": list}}`
- `PaginationMeta`: `{"total": int, "page": int, "per_page": int}`

**エンドポイント:**

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/v1/audit-logs | 監査ログ一覧（ページネーション、operator/action/resource_typeフィルタ） |

## データモデル

### audit_logs

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | UUID | PK | ログID |
| operator | VARCHAR(255) | NOT NULL | 操作者名 |
| action | VARCHAR(50) | NOT NULL | 操作種別 |
| resource_type | VARCHAR(50) | NOT NULL | リソース種別 |
| resource_id | UUID | NOT NULL | リソースID |
| details | JSONB | NULL | 追加情報 |
| created_at | TIMESTAMPTZ | NOT NULL | 操作日時 |

## 正確性プロパティ

### Property 1: 監査ログの不変性

*For any* 監査ログの操作シーケンスに対して、既存ログの内容は変更されず、ログ件数は単調増加する

**Validates: Requirements 4.3**

### Property 2: 監査ログのフィルタリング

*For any* 監査ログのフィルタ条件（操作者名・操作種別・リソース種別）に対して、返される全ログは指定条件に一致する

**Validates: Requirements 4.1, 4.2**

### Property 3: 例外ハンドラの網羅性

*For any* ドメイン例外に対して、例外ハンドラは適切なHTTPステータスコードとエラーコードを含むErrorResponseを返す

**Validates: Requirements 2.1, 2.2**

## テスト戦略

### テストフレームワーク

- バックエンド: pytest + hypothesis
- フロントエンド: vitest + @testing-library/react

### プロパティベーステスト

- ライブラリ: hypothesis（Python）
- タグ形式: **Feature: shared-foundation, Property {number}: {property_text}**
