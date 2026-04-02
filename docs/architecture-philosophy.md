# アーキテクチャ

## 全体構成

```
┌─────────────────┐     HTTP/REST     ┌─────────────────────┐
│   client (React  │ ◄──────────────► │  server (FastAPI)     │
│   Router SSR)    │   /api/v1/*      │                       │
└─────────────────┘                   └────────┬──────────────┘
                                               │
                                      ┌────────▼──────────┐
                                      │   PostgreSQL 17    │
                                      │  (Docker Compose)  │
                                      │  staging + 本番     │
                                      └──────────┬────────┘
                                                 │
                                      ┌──────────▼────────┐
                                      │   ファイルストレージ  │
                                      │  (upload + report)  │
                                      └───────────────────┘
```

### ローカル開発環境

PostgreSQLはDocker Composeで管理する（`docker-compose.yml`）。

- コンテナ名: `data-platform-db`
- ポート: 5432
- ユーザー: `app` / パスワード: `app` / DB名: `data_platform`
- データ永続化: `db-data` ボリューム
- ヘルスチェック: `pg_isready` で5秒間隔チェック

起動: `docker compose up -d`、停止: `docker compose down`、データ削除: `docker compose down -v`

## 責務分離: Import と Report

本システムは2つの独立した責務を持つ。

- **Import（取り込み）**: 外部ファイル → 内部DB。パース・バリデーション・staging経由の安全な投入
- **Report（帳票出力）**: 内部DB → 外部ファイル。データ抽出・帳票生成・ファイル保存

両者は独立したサブドメインとして設計し、共有するのはAuditLog（監査ログ）のみとする。
Import用テンプレート（templates）とReport用テンプレート（report_templates）は完全に別概念である。

各サブドメインは同一のクリーンアーキテクチャ4層構成に従い、domain層のインターフェースを共有しない。

## フロントエンド: FSD（Feature-Sliced Design）変則構成

React Router frameworkモードに最適化したFSD構成を採用する。
`app/` がルートディレクトリであり、`src/` は使用しない。

### レイヤー構成

```
app/
  routes/          最上位エントリ（loader / action / コンポーネント）
  providers/       QueryClient等のプロバイダ
  layouts/         レイアウトコンポーネント
  widgets/         UIブロック（複数feature/entityの組み合わせ）
  features/        機能単位の実装（hooks / api / types）
  entities/        ドメインモデル・型定義
  shared/          共通ユーティリティ・UI・API
  components/ui/   shadcn/ui自動生成コンポーネント
```

### 依存方向（上位→下位のみ）

```
routes → widgets → features → entities → shared
routes → features（直接参照も可）
routes → shared
```

- 同一レイヤー間の依存は禁止
- feature間・widget間・entity間の直接importは禁止

### routesの役割

各ルートファイルは画面のエントリポイントとする。

- `loader`: サーバーサイドデータ取得（TanStack Queryと併用）
- `action`: フォーム送信・ミューテーション
- デフォルトエクスポート: UIコンポーネント（widgets/featuresを組み立て）

### featuresの構成パターン

```
features/{feature-name}/
  hooks/           カスタムフック
  api/             API呼び出し関数
  types.ts         型定義
```

feature内のネストは最大2階層まで。

### 状態管理方針

- サーバー状態: TanStack Query
- ローカル状態: React useState
- グローバル状態管理ライブラリは導入しない

## バックエンド: クリーンアーキテクチャ

4層構成とし、全ての依存はdomain層（最内層）に向かう。依存性の逆転（DIP）を適用する。

### レイヤー構成

```
server/app/
  presentation/    FastAPIルータ・リクエスト/レスポンススキーマ（最外層）
  application/     ユースケース・サービス層
  domain/          エンティティ・ビジネスロジック・インターフェース定義（最内層）
  infrastructure/  DB・パーサー・バリデータ・staging管理（domain層インターフェースの実装）
```

### 依存方向

```
presentation → application → domain ← infrastructure
```

- domain層が中心。全ての層がdomain層に依存する
- application層はdomain層のインターフェース（ABC）に依存し、具象実装を知らない
- infrastructure層はdomain層のインターフェースを実装する
- presentation層はFastAPIのDependsでinfrastructureの具象をapplicationに注入する

### 各層の責務

#### domain（最内層・依存なし）

- エンティティ定義
  - Import系: ImportJob, ColumnMapping, Template, ImportError
  - Report系: ReportTemplate, ReportTemplateField, ReportJob, ReportOutput
  - 共通: AuditLog
- ステータスenum（ImportJobStatus, ReportJobStatus）
- リポジトリインターフェース（ABC）
  - Import系: `IJobRepository`, `ITemplateRepository`, `IErrorRepository`
  - Report系: `IReportTemplateRepository`, `IReportJobRepository`, `IReportOutputRepository`
  - 共通: `IAuditRepository`
- パーサーインターフェース（ABC）: `IFileParser`
- バリデータインターフェース（ABC）: `IDataValidator`
- 帳票生成インターフェース（ABC）: `IReportGenerator`
- ドメイン例外（DomainError, ParseError, ValidationError, ReportGenerationError）
- 外部ライブラリへの依存を一切持たない

#### application（domain層のみに依存）

- ユースケース単位のサービスクラス
- Import系:
  - `ImportJobService`: アップロード・パース・バリデーション・取り込み・再実行
  - `ImportTemplateService`: Import用テンプレートCRUD
- Report系:
  - `ReportTemplateService`: 帳票テンプレートCRUD
  - `ReportJobService`: 帳票出力ジョブ管理・生成実行・再実行
- 共通:
  - `AuditService`: 監査ログ記録（Import・Report両方のイベント）
- コンストラクタでdomain層のインターフェースを受け取る（具象を知らない）

#### infrastructure（domain層のインターフェースを実装）

- `database/`: SQLAlchemyセッション・テーブルモデル（Import系 + Report系）
- `repositories/`: domain層の `IXxxRepository` を実装するリポジトリ具象クラス
  - Import系: JobRepository, TemplateRepository, ErrorRepository
  - Report系: ReportTemplateRepository, ReportJobRepository, ReportOutputRepository
  - 共通: AuditRepository
- `parser/`: domain層の `IFileParser` を実装するCSV/xlsxパーサー（pandas + openpyxl）
- `validator/`: domain層の `IDataValidator` を実装するpanderaバリデータ
- `staging/`: stagingテーブル管理・本番反映
- `report_generator/`: domain層の `IReportGenerator` を実装する帳票生成（PDF/Excel/CSV）
- `config.py`: pydantic-settings設定

#### presentation（最外層・DI組み立て）

- FastAPI APIRouterによるエンドポイント定義
- Pydanticモデルによるリクエスト/レスポンス型定義
- 例外ハンドラによる統一エラーレスポンス
- FastAPIのDependsでinfrastructure具象 → application サービスへの依存注入を組み立てる

### Excel/CSV処理パイプライン（Import）

```
ファイル受信
  → parser/ でDataFrame化（openpyxl: シート情報, pandas: DataFrame変換）
  → validator/ でバリデーション（pandera: スキーマ検証）
  → staging/ でstaging投入 → 本番反映
```

### 帳票生成パイプライン（Report）

```
出力ジョブ作成（status: pending）
  → データ抽出（SQLAlchemy: filter_conditionsに基づくクエリ）
  → 帳票生成（status: generating）
    → report_generator/ で形式別ファイル生成
      → PDF: レイアウト定義に基づくPDF生成
      → Excel: openpyxlによるxlsx生成
      → CSV: pandas to_csvによるCSV生成
  → ファイル保存 → report_outputs レコード作成
  → 完了（status: completed）/ 失敗（status: failed）
```

### 非同期処理（MVP）

- I/Oバウンド: FastAPIのasync/await
- CPUバウンド（パース・バリデーション・帳票生成）: `run_in_executor` でスレッドプール
- ジョブ進捗: フロントからのポーリング（TanStack Query refetchInterval）
- Import・Report両方のジョブステータスをポーリングで追跡する
