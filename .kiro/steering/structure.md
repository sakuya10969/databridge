# ディレクトリ構成: 業務データ取り込み・帳票出力基盤

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
  templates.tsx                  Import用テンプレート一覧
  templates.$templateId.tsx      Import用テンプレート詳細
  report-templates.tsx           帳票テンプレート一覧
  report-templates.new.tsx       帳票テンプレート作成
  report-templates.$templateId.tsx  帳票テンプレート詳細・編集
  report-jobs.tsx                帳票出力ジョブ一覧
  report-jobs.new.tsx            帳票出力ジョブ作成（テンプレート選択・条件指定）
  report-jobs.$jobId.tsx         帳票出力ジョブ詳細・ダウンロード
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
      use-templates.ts           Import用テンプレート一覧・詳細
    api/
      fetch-templates.ts         テンプレート取得API
      save-template.ts           テンプレート保存API
    types.ts                     テンプレート関連の型

  report-template/
    hooks/
      use-report-templates.ts    帳票テンプレート一覧・詳細
      use-report-template-form.ts 帳票テンプレート作成・編集フォーム
    api/
      fetch-report-templates.ts  帳票テンプレート取得API
      save-report-template.ts    帳票テンプレート保存API
      delete-report-template.ts  帳票テンプレート削除API
    types.ts                     帳票テンプレート関連の型

  report-job/
    hooks/
      use-report-job-polling.ts  帳票出力ジョブステータスポーリング
      use-report-job-list.ts     帳票出力ジョブ一覧取得
    api/
      fetch-report-jobs.ts       帳票出力ジョブ一覧API
      fetch-report-job.ts        帳票出力ジョブ詳細API
      create-report-job.ts       帳票出力ジョブ作成API
      retry-report-job.ts        帳票出力再実行API
      download-report.ts         帳票ファイルダウンロードAPI
    types.ts                     帳票出力ジョブ関連の型

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
    types.ts                     Import用Template型
  error/
    types.ts                     ImportError型・エラー種別enum
  report-template/
    types.ts                     ReportTemplate型・ReportTemplateField型・帳票種別enum
  report-job/
    types.ts                     ReportJob型・ReportJobStatus enum
  report-output/
    types.ts                     ReportOutput型
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
    job-table.tsx                Import用ジョブ一覧テーブル
  job-status-badge/
    job-status-badge.tsx         ステータスバッジ（Import・Report共用）
  template-selector/
    template-selector.tsx        Import用テンプレート選択UI
  report-template-form/
    report-template-form.tsx     帳票テンプレート作成・編集フォーム
  report-field-editor/
    report-field-editor.tsx      帳票フィールド定義エディタ
  report-job-table/
    report-job-table.tsx         帳票出力ジョブ一覧テーブル
  report-condition-form/
    report-condition-form.tsx    帳票出力条件指定フォーム（フィルタ・ソート・出力形式）
  report-download-button/
    report-download-button.tsx   帳票ファイルダウンロードボタン
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
    router.py                    /api/v1/templates エンドポイント（Import用）
    schemas.py
  report_templates/
    __init__.py
    router.py                    /api/v1/report-templates エンドポイント
    schemas.py
  report_jobs/
    __init__.py
    router.py                    /api/v1/report-jobs エンドポイント
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
  import_job_service.py          Import用ジョブ管理ユースケース（アップロード・パース・バリデーション・取り込み・再実行）
  import_template_service.py     Import用テンプレート管理ユースケース
  report_template_service.py     帳票テンプレート管理ユースケース
  report_job_service.py          帳票出力ジョブ管理ユースケース（作成・生成・再実行）
  audit_service.py               監査ログ記録ユースケース（Import・Report共通）
```

### domain/ — エンティティ・ビジネスロジック・インターフェース（最内層）

```
server/app/domain/
  __init__.py
  entities/
    __init__.py
    import_job.py                ImportJobエンティティ・ステータスenum
    column_mapping.py            ColumnMappingエンティティ
    template.py                  Import用Templateエンティティ
    import_error.py              ImportErrorエンティティ
    report_template.py           ReportTemplateエンティティ・帳票種別enum
    report_template_field.py     ReportTemplateFieldエンティティ
    report_job.py                ReportJobエンティティ・ステータスenum
    report_output.py             ReportOutputエンティティ
    audit_log.py                 AuditLogエンティティ
  repositories/
    __init__.py
    i_job_repository.py          IJobRepository（ABC）
    i_template_repository.py     ITemplateRepository（ABC、Import用）
    i_error_repository.py        IErrorRepository（ABC）
    i_report_template_repository.py  IReportTemplateRepository（ABC）
    i_report_job_repository.py   IReportJobRepository（ABC）
    i_report_output_repository.py IReportOutputRepository（ABC）
    i_audit_repository.py        IAuditRepository（ABC）
  interfaces/
    __init__.py
    i_file_parser.py             IFileParser（ABC）
    i_data_validator.py          IDataValidator（ABC）
    i_report_generator.py        IReportGenerator（ABC）
  exceptions.py                  ドメイン例外（DomainError, ParseError, ValidationError, ReportGenerationError等）
```

### infrastructure/ — DB・パーサー・外部連携

```
server/app/infrastructure/
  __init__.py
  database/
    __init__.py
    session.py                   SQLAlchemyセッション管理
    models.py                    SQLAlchemyテーブルモデル（Import系 + Report系）
  repositories/
    __init__.py
    job_repository.py            ImportJobリポジトリ
    template_repository.py       Import用Templateリポジトリ
    error_repository.py          ImportErrorリポジトリ
    report_template_repository.py 帳票テンプレートリポジトリ
    report_job_repository.py     帳票出力ジョブリポジトリ
    report_output_repository.py  帳票出力ファイルリポジトリ
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
  report_generator/
    __init__.py
    base_generator.py            帳票生成基底クラス
    pdf_generator.py             PDF帳票生成
    excel_generator.py           Excel帳票生成（openpyxl）
    csv_generator.py             CSV帳票生成（pandas）
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

### バックエンド（クリーンアーキテクチャ準拠）

依存方向は全てdomain層（最内層）に向かう。依存性の逆転（DIP）を適用する。

```
presentation → application → domain ← infrastructure
```

- domain: 最内層。外部依存を持たない。リポジトリインターフェース（ABC）を定義する
- application: domain層のエンティティ・インターフェースに依存する。infrastructure層を直接参照しない
- infrastructure: domain層のインターフェースを実装する（リポジトリ具象クラス等）
- presentation: application層のサービスを呼び出す。FastAPIのDependsでinfrastructure→applicationへDI

## 禁止事項

- `src/` ディレクトリの使用（React Routerの仕様上 `app/` がルート）
- feature間の直接import
- widget間の直接import
- entity間の直接import
- domainレイヤーからinfrastructureへの直接依存
- `components/ui/` 配下の手動ファイル作成（shadcn CLIで生成する）
- 過剰なネスト（feature内は最大2階層まで）
- 汎用的すぎる命名（`utils.ts`, `helpers.ts` はshared/utils/内のみ許可）
