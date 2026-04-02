# ディレクトリ構成: 業務データ取り込み基盤

## 全体構成

```
client/                          フロントエンド（React Router frameworkモード）
  app/                           アプリケーションルート（src/は使用しない）
    routes/                      ルーティング（最上位エントリ）
    providers/                   QueryClient等のプロバイダ
    layouts/                     レイアウトコンポーネント
    features/                    機能単位の実装
    entities/                    ドメインモデル・型定義
    widgets/                     UIブロック（複数featureを組み合わせる）
    shared/                      共通ユーティリティ・UI・API
    components/                  shadcn/uiコンポーネント（自動生成先）
    lib/                         shadcn/ui用ユーティリティ
    app.css                      グローバルスタイル
    root.tsx                     ルートレイアウト
    routes.ts                    ルート定義

server/                          バックエンド（FastAPI）
  app/                           アプリケーションルート
    presentation/                FastAPIルータ・リクエスト/レスポンス定義
    application/                 ユースケース
    domain/                      エンティティ・ビジネスロジック
    infrastructure/              DB・パーサー・外部連携
  alembic/                       マイグレーション
  main.py                        エントリポイント
```

## フロントエンド詳細構成

### routes/ — ルーティング（最上位・エントリ）

画面単位のルートファイルを配置する。各ファイルは `loader` / `action` / デフォルトエクスポートで構成する。
routesが「入口」であり、features/widgets/entitiesは「実装」とする。

```
app/routes/
  home.tsx                       ダッシュボード（ジョブ一覧）
  jobs.upload.tsx                ファイルアップロード
  jobs.$jobId.tsx                ジョブ詳細（ステータス・プレビュー・エラー）
  jobs.$jobId.mapping.tsx        列マッピング設定
  jobs.$jobId.validate.tsx       バリデーション実行・結果
  jobs.$jobId.errors.tsx         エラー詳細一覧
  templates.tsx                  テンプレート一覧
  templates.$templateId.tsx      テンプレート詳細
  audit-logs.tsx                 監査ログ一覧
```

### providers/ — プロバイダ

```
app/providers/
  query-client.tsx               TanStack Query の QueryClientProvider
```

### layouts/ — レイアウト

```
app/layouts/
  app-layout.tsx                 サイドバー + ヘッダー + メインコンテンツ
```

### features/ — 機能単位

各featureは独立したディレクトリとする。feature間の直接依存は禁止する。

```
app/features/
  upload/
    hooks/
      use-file-upload.ts         ファイルアップロードロジック
    api/
      upload-file.ts             アップロードAPI呼び出し
    types.ts                     アップロード関連の型

  mapping/
    hooks/
      use-column-mapping.ts      列マッピングロジック
    api/
      save-mapping.ts            マッピング保存API
    types.ts                     マッピング関連の型

  validation/
    hooks/
      use-validation.ts          バリデーション実行ロジック
    api/
      run-validation.ts          バリデーションAPI
      fetch-errors.ts            エラー取得API
    types.ts                     バリデーション関連の型

  import-job/
    hooks/
      use-job-polling.ts         ジョブステータスポーリング
      use-job-list.ts            ジョブ一覧取得
    api/
      fetch-jobs.ts              ジョブ一覧API
      fetch-job.ts               ジョブ詳細API
      run-import.ts              取り込み実行API
      retry-job.ts               再実行API
    types.ts                     ジョブ関連の型

  template/
    hooks/
      use-templates.ts           テンプレート一覧・詳細
    api/
      fetch-templates.ts         テンプレート取得API
      save-template.ts           テンプレート保存API
    types.ts                     テンプレート関連の型

  audit-log/
    hooks/
      use-audit-logs.ts          監査ログ取得
    api/
      fetch-audit-logs.ts        監査ログAPI
    types.ts                     監査ログ関連の型
```

### entities/ — ドメイン

```
app/entities/
  import-job/
    types.ts                     ImportJob型・ステータスenum
  column/
    types.ts                     Column型・マッピング型
  template/
    types.ts                     Template型
  error/
    types.ts                     ImportError型・エラー種別enum
```

### widgets/ — UIブロック

複数のfeature/entityを組み合わせた表示単位のコンポーネントとする。

```
app/widgets/
  upload-dropzone/
    upload-dropzone.tsx          ドラッグ&ドロップUI（react-dropzone使用）
  preview-table/
    preview-table.tsx            プレビューテーブル（TanStack Table + Virtual）
  mapping-table/
    mapping-table.tsx            列マッピングテーブル
  error-table/
    error-table.tsx              エラー一覧テーブル（行・列単位）
  job-table/
    job-table.tsx                ジョブ一覧テーブル
  job-status-badge/
    job-status-badge.tsx         ステータスバッジ
  template-selector/
    template-selector.tsx        テンプレート選択UI
```

### shared/ — 共通

```
app/shared/
  api/
    client.ts                    axiosインスタンス・インターセプター
    types.ts                     APIレスポンス共通型（data/meta/error）
  ui/
    data-table.tsx               TanStack Table汎用ラッパー
    loading-spinner.tsx          ローディング表示
    empty-state.tsx              空状態表示
    confirm-dialog.tsx           確認ダイアログ
  utils/
    format-date.ts               日時フォーマット
    format-file-size.ts          ファイルサイズフォーマット
```

### components/ui/ — shadcn/ui

shadcn CLIで生成されるコンポーネントの配置先。手動編集は最小限とする。
既存: button, dialog, input, label, select, sonner, table

## バックエンド詳細構成

### presentation/ — FastAPIルータ

```
server/app/presentation/
  __init__.py
  router.py                      APIRouter集約
  jobs/
    __init__.py
    router.py                    /api/v1/jobs エンドポイント
    schemas.py                   リクエスト/レスポンスPydanticモデル
  templates/
    __init__.py
    router.py                    /api/v1/templates エンドポイント
    schemas.py
  audit_logs/
    __init__.py
    router.py                    /api/v1/audit-logs エンドポイント
    schemas.py
  error_handlers.py              例外ハンドラ
```

### application/ — ユースケース

```
server/app/application/
  __init__.py
  job_service.py                 ジョブ管理ユースケース（アップロード・パース・バリデーション・取り込み・再実行）
  template_service.py            テンプレート管理ユースケース
  audit_service.py               監査ログ記録ユースケース
```

### domain/ — エンティティ・ビジネスロジック

```
server/app/domain/
  __init__.py
  entities/
    __init__.py
    import_job.py                ImportJobエンティティ・ステータスenum
    column_mapping.py            ColumnMappingエンティティ
    template.py                  Templateエンティティ
    import_error.py              ImportErrorエンティティ
    audit_log.py                 AuditLogエンティティ
  exceptions.py                  ドメイン例外（DomainError, ParseError, ValidationError等）
```

### infrastructure/ — DB・パーサー・外部連携

```
server/app/infrastructure/
  __init__.py
  database/
    __init__.py
    session.py                   SQLAlchemyセッション管理
    models.py                    SQLAlchemyテーブルモデル
  repositories/
    __init__.py
    job_repository.py            ImportJobリポジトリ
    template_repository.py       Templateリポジトリ
    error_repository.py          ImportErrorリポジトリ
    audit_repository.py          AuditLogリポジトリ
  parser/
    __init__.py
    csv_parser.py                CSVパーサー（pandas）
    xlsx_parser.py               xlsxパーサー（openpyxl + pandas）
    base_parser.py               パーサー基底クラス
  validator/
    __init__.py
    schema_builder.py            pandera DataFrameSchema動的構築
    validator.py                 バリデーション実行・エラー収集
  staging/
    __init__.py
    staging_manager.py           stagingテーブル管理・本番反映
  config.py                      pydantic-settings設定
```

### alembic/ — マイグレーション

```
server/alembic/
  env.py
  versions/
```

### エントリポイント

```
server/
  main.py                        FastAPIアプリケーション起動
```

## 命名規則

### フロントエンド

- ファイル名: kebab-case（`upload-dropzone.tsx`）
- コンポーネント名: PascalCase（`UploadDropzone`）
- hooks: `use-` プレフィックス + kebab-case（`use-file-upload.ts`）
- 型ファイル: `types.ts` で統一
- APIファイル: 動詞 + 名詞のkebab-case（`fetch-jobs.ts`, `save-mapping.ts`）

### バックエンド

- ファイル名: snake_case（`job_service.py`）
- クラス名: PascalCase（`JobService`）
- 関数名: snake_case（`create_job`）
- テーブル名: snake_case複数形（`import_jobs`）

## 依存ルール

### フロントエンド（FSD準拠）

依存方向は上位→下位のみとする。同一レイヤー間の依存は禁止する。

```
routes → widgets → features → entities → shared
routes → features（widgetsを経由しない直接参照も可）
routes → shared
widgets → shared
features → shared
```

- routes: widgets/features/entities/sharedを参照する
- widgets: features/entities/sharedを参照する。他のwidgetsは参照しない
- features: entities/sharedを参照する。他のfeaturesは参照しない
- entities: sharedのみ参照する。他のentitiesは参照しない
- shared: 他のレイヤーを参照しない

### バックエンド（レイヤード準拠）

```
presentation → application → domain
presentation → infrastructure（DI経由）
application → infrastructure（DI経由）
domain → 外部依存なし
```

- presentation: application/infrastructureを参照する
- application: domain/infrastructureを参照する
- domain: 外部依存を持たない。純粋なPythonコードとする
- infrastructure: domainを参照する（モデル変換等）

## 禁止事項

- `src/` ディレクトリの使用（React Routerの仕様上 `app/` がルート）
- feature間の直接import
- widget間の直接import
- entity間の直接import
- domainレイヤーからinfrastructureへの直接依存
- `components/ui/` 配下の手動ファイル作成（shadcn CLIで生成する）
- 過剰なネスト（feature内は最大2階層まで）
- 汎用的すぎる命名（`utils.ts`, `helpers.ts` はshared/utils/内のみ許可）
