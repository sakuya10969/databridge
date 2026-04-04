# 技術設計: 業務データ取り込み・帳票出力基盤

## 技術スタック一覧

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19.x | UIライブラリ |
| React Router | 7.x | ルーティング・SSR・loader/action |
| TypeScript | 5.x | 型安全 |
| Bun | - | パッケージマネージャ・ランタイム |
| Tailwind CSS | 4.x | スタイリング |
| shadcn/ui | radix-nova | UIコンポーネント基盤 |
| TanStack Query | 5.x | サーバー状態管理 |
| TanStack Table | 8.x | テーブル表示・ソート・フィルタ |
| TanStack Virtual | 3.x | 大量行の仮想スクロール |
| react-hook-form | 7.x | フォーム管理 |
| Zod | 4.x | クライアント側バリデーション |
| react-dropzone | 15.x | ファイルドラッグ&ドロップ |
| sonner | 2.x | トースト通知 |
| axios | 1.x | HTTPクライアント |
| lucide-react | 1.x | アイコン |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Python | 3.12 | ランタイム |
| FastAPI | 0.135+ | APIフレームワーク |
| uv | - | パッケージマネージャ |
| SQLAlchemy | 2.x | ORM |
| Alembic | 1.x | DBマイグレーション |
| PostgreSQL | 17 | データベース |
| psycopg[binary] | 3.x | PostgreSQLドライバ |
| pandas | 3.x | データフレーム操作 |
| openpyxl | 3.x | xlsx読み込み |
| pandera | 0.30+ | データフレームバリデーション |
| pydantic-settings | 2.x | 設定管理 |
| pyxlsb | 1.x | xlsb読み込み（拡張用） |
| msoffcrypto-tool | 6.x | パスワード付きExcel（拡張用） |

## 採用理由

### Docker Compose（ローカル開発DB）

PostgreSQL 17をDocker Composeで管理する（`docker-compose.yml`）。

- コンテナ名: `data-platform-db`
- ポート: 5432
- ユーザー: `admin` / パスワード: `password` / DB名: `databridge`
- 接続URL: `postgresql://admin:password@localhost:5432/databridge`
- データ永続化: `db-data` ボリューム
- ヘルスチェック: `pg_isready` で5秒間隔チェック

コマンド:
- 起動: `docker compose up -d`
- 停止: `docker compose down`
- データ削除: `docker compose down -v`

### Bun

npm/yarnより高速なインストール・実行を実現する。lockファイルは `bun.lock` を使用する。
スクリプト実行は `bun run` で統一する。

### uv

Pythonのパッケージ管理をpipより高速に行う。lockファイルは `uv.lock` を使用する。
仮想環境は `server/.venv` に配置する。コマンドは `uv run` で統一する。

### shadcn/ui + TanStack構成

shadcn/uiはコピーベースのUIコンポーネントであり、カスタマイズ性が高い。
スタイルは `radix-nova` を採用済み。コンポーネントエイリアスは `~/components/ui` とする。

TanStack Tableはヘッドレスであり、shadcn/uiのTableコンポーネントと組み合わせて使用する。
プレビューテーブル・エラーテーブル・ジョブ一覧テーブル・帳票出力ジョブ一覧テーブルの全てでTanStack Tableを使用する。
10万行対応のため、TanStack Virtualによる仮想スクロールを併用する。

TanStack Queryはサーバー状態のキャッシュ・再取得・楽観的更新を担う。
Import・Report両方のジョブステータスのポーリングにも使用する。

### FSD（Feature-Sliced Design）

フロントエンドのアーキテクチャとしてFSDを採用する。
ただし、React Routerのframeworkモードに合わせ、`routes/` を最上位エントリとする変則構成とする。
詳細は `structure.md` に記載する。

### クリーンアーキテクチャ

バックエンドはpresentation / application / domain / infrastructureの4層とする。
全ての依存はdomain層（最内層）に向かう。domain層は外部に一切依存しない。
application層はdomain層が定義するリポジトリインターフェース（抽象基底クラス）に依存し、infrastructure層がその具象実装を提供する（依存性の逆転）。

## フロントエンド構成方針

### React Router frameworkモード

SSRを有効化済み（`ssr: true`）。`react-router.config.ts` で設定する。
各ルートは `loader` / `action` / デフォルトエクスポート（コンポーネント）の3要素で構成する。

- `loader`: サーバーサイドでのデータ取得。ジョブ一覧・ジョブ詳細等
- `action`: フォーム送信・ファイルアップロード等のミューテーション
- コンポーネント: UIレンダリング。features/widgets/entitiesから組み立てる

パスエイリアスは `~/` = `app/` とする（tsconfig.jsonで設定済み）。

### フォーム管理

react-hook-form + Zodで統一する。
列マッピング・ヘッダ行指定・テンプレート名入力等、全フォームに適用する。
Zodスキーマはフロント・バック共通の概念だが、実装は各自で持つ（共有しない）。

### 状態管理

グローバル状態管理ライブラリは導入しない。
サーバー状態はTanStack Query、ローカル状態はReactのuseStateで管理する。

## バックエンド構成方針

### FastAPI構成

APIRouterでルーティングを分割する。プレフィックスは `/api/v1` とする。
レスポンスはPydanticモデルで型定義する。エラーレスポンスも統一フォーマットとする。

### Excel/CSV処理方針

#### 役割分担

| ライブラリ | 役割 |
|-----------|------|
| openpyxl | xlsxファイルの読み込み。シート一覧取得・ヘッダ行検出に使用 |
| pandas | CSV/xlsxデータのDataFrame化。列操作・型変換・プレビュー生成に使用 |
| pandera | DataFrameのバリデーション。スキーマ定義に基づく型・必須・重複・形式チェック |

#### 処理フロー

1. ファイルアップロード → ディスク保存 → ジョブ作成（status: uploaded）
2. パース開始（status: parsing）→ openpyxlでシート情報取得 → pandasでDataFrame化
3. バリデーション（status: validating）→ panderaスキーマで検証 → エラー収集
4. 取り込み（status: importing）→ stagingテーブルへINSERT → 本番テーブルへCOPY
5. 完了（status: completed）または失敗（status: failed）

#### panderaバリデーション

pandera DataFrameSchemaを動的に構築する。テンプレートの列定義からスキーマを生成する。

チェック項目:
- 型チェック: int / float / str / datetime / bool
- 必須チェック: nullable=False
- 重複チェック: unique=True
- 形式チェック: regex pattern（メールアドレス・電話番号等）
- 範囲チェック: in_range / greater_than / less_than

エラーは `SchemaErrors` から行番号・列名・エラー種別・該当値を抽出し、構造化して保存する。

### 帳票生成方針

#### 役割分担

| ライブラリ | 役割 |
|-----------|------|
| openpyxl | Excel帳票生成。Import用で導入済みのため追加依存なし |
| pandas | CSV帳票生成。to_csvで出力 |
| WeasyPrint or reportlab | PDF帳票生成。MVP実装開始時に選定 |

#### 処理フロー

1. 帳票出力ジョブ作成（status: pending）
2. データ抽出（status: generating）→ SQLAlchemyでfilter_conditionsに基づくクエリ実行
3. 帳票生成 → report_generator/ で形式別ファイル生成
4. ファイル保存 → report_outputs レコード作成
5. 完了（status: completed）または失敗（status: failed）

#### 出力形式別の生成方針

- **PDF**: レイアウト定義（layout_definition）に基づき、タイトル・ヘッダ・フッタ・ページ番号を含むPDFを生成。日本語フォント対応必須
- **Excel**: openpyxlでxlsxを生成。フィールド定義のlabel・width・format_typeに基づきセル書式を設定
- **CSV**: pandasのto_csvで生成。フィールド定義のlabel・display_orderに基づきヘッダ行・列順を制御

#### 帳票テンプレートとImport用テンプレートの分離

Import用テンプレート（templates テーブル）は列マッピング + バリデーション設定の再利用定義である。
帳票テンプレート（report_templates + report_template_fields テーブル）は帳票レイアウト + フィールド定義である。
両者は完全に別概念であり、テーブル・エンティティ・サービスを分離する。

## DB設計方針

### staging前提

本番テーブルへの直接INSERTは禁止する。
ジョブごとにstagingテーブル（またはstaging用スキーマ）を使用し、バリデーション通過後に本番へ反映する。

### 主要テーブル

#### Import系

| テーブル | 用途 |
|---------|------|
| import_jobs | ジョブ管理。ステータス・ファイル情報・実行者・タイムスタンプ |
| import_errors | バリデーションエラー。行番号・列名・エラー種別・該当値・ジョブID |
| column_mappings | 列マッピング定義。ソース列名・ターゲット列名・型・ジョブID |
| templates | Import用テンプレート。名前・列マッピング・バリデーション設定のJSON |

#### Report系

| テーブル | 用途 |
|---------|------|
| report_templates | 帳票テンプレート。名前・帳票種別・出力形式・レイアウト定義 |
| report_template_fields | 帳票フィールド定義。フィールドキー・ラベル・書式・表示順 |
| report_jobs | 帳票出力ジョブ。テンプレートID・ステータス・フィルタ条件・出力形式 |
| report_outputs | 帳票出力ファイル。ファイル名・パス・MIMEタイプ・チェックサム |

#### 共通

| テーブル | 用途 |
|---------|------|
| audit_logs | 監査ログ。操作者・操作種別・対象・タイムスタンプ・詳細（Import・Report両方） |

### マイグレーション

Alembicで管理する。`server/alembic/` に配置する。
マイグレーションファイルは自動生成（`alembic revision --autogenerate`）を基本とする。

## API方針

### エンドポイント設計

RESTfulに設計する。リソース単位でエンドポイントを分割する。
Import系とReport系は別プレフィックスで整理する。

#### Import系

```
POST   /api/v1/jobs/upload          ファイルアップロード・ジョブ作成
GET    /api/v1/jobs                  ジョブ一覧
GET    /api/v1/jobs/{job_id}         ジョブ詳細
POST   /api/v1/jobs/{job_id}/parse   パース実行（シート選択・ヘッダ行指定）
GET    /api/v1/jobs/{job_id}/preview プレビュー取得
POST   /api/v1/jobs/{job_id}/mapping 列マッピング設定
POST   /api/v1/jobs/{job_id}/validate バリデーション実行
GET    /api/v1/jobs/{job_id}/errors  エラー一覧
POST   /api/v1/jobs/{job_id}/import  取り込み実行
POST   /api/v1/jobs/{job_id}/retry   再実行
GET    /api/v1/templates             Import用テンプレート一覧
POST   /api/v1/templates             Import用テンプレート作成
GET    /api/v1/templates/{id}        Import用テンプレート詳細
```

#### Report系

```
POST   /api/v1/report-templates              帳票テンプレート作成
GET    /api/v1/report-templates              帳票テンプレート一覧
GET    /api/v1/report-templates/{id}         帳票テンプレート詳細
PUT    /api/v1/report-templates/{id}         帳票テンプレート更新
DELETE /api/v1/report-templates/{id}         帳票テンプレート削除
POST   /api/v1/report-jobs                   帳票出力ジョブ作成
GET    /api/v1/report-jobs                   帳票出力ジョブ一覧
GET    /api/v1/report-jobs/{id}              帳票出力ジョブ詳細
GET    /api/v1/report-jobs/{id}/download     帳票ファイルダウンロード
POST   /api/v1/report-jobs/{id}/retry        帳票出力再実行
```

#### 共通

```
GET    /api/v1/audit-logs            監査ログ一覧（Import・Report両方）
```

### レスポンス形式

成功時:
```json
{
  "data": { ... },
  "meta": { "total": 100, "page": 1, "per_page": 20 }
}
```

エラー時:
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "バリデーションに失敗しました",
    "details": [ ... ]
  }
}
```

## 非同期処理方針（MVP）

MVPでは同期処理を基本とする。FastAPIのasync/awaitでI/Oバウンドな処理を非同期化する。
CPU負荷の高いパース・バリデーション・帳票生成処理は `run_in_executor` でスレッドプールに逃がす。

帳票出力ジョブは非同期ジョブとして設計する。ジョブ作成（POST）は即座にレスポンスを返し、
生成処理はバックグラウンドで実行する。フロントからのステータスポーリングで進捗を追跡する。

拡張フェーズでCelery等のタスクキューを導入する。MVP時点ではImport・Report両方のジョブステータスポーリングで進捗を表示する。

## ログ・エラー処理

### ログ

Pythonの標準 `logging` モジュールを使用する。JSON形式で出力する。
ジョブIDをログコンテキストに含め、ジョブ単位でのログ追跡を可能にする。

### エラーハンドリング

- ドメイン例外クラスを定義する（`DomainError`, `ValidationError`, `ParseError`, `ReportGenerationError` 等）
- FastAPIの例外ハンドラで統一レスポンスに変換する
- Import用バリデーションエラーは例外ではなく、構造化データとしてDBに保存する
- 帳票生成エラーはreport_jobs.error_messageに記録し、ステータスをfailedに遷移する
- 予期しないエラーは500レスポンスとし、スタックトレースをログに記録する

### フロントエンドエラー

- API通信エラーはaxiosインターセプターで共通処理する
- ユーザー向けエラーはsonnerトーストで表示する
- バリデーションエラーはエラーテーブルで詳細表示する
