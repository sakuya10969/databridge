# 技術設計: 業務データ取り込み基盤

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
| PostgreSQL | - | データベース |
| psycopg[binary] | 3.x | PostgreSQLドライバ |
| pandas | 3.x | データフレーム操作 |
| openpyxl | 3.x | xlsx読み込み |
| pandera | 0.30+ | データフレームバリデーション |
| pydantic-settings | 2.x | 設定管理 |
| pyxlsb | 1.x | xlsb読み込み（拡張用） |
| msoffcrypto-tool | 6.x | パスワード付きExcel（拡張用） |

## 採用理由

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
プレビューテーブル・エラーテーブル・ジョブ一覧テーブルの全てでTanStack Tableを使用する。
10万行対応のため、TanStack Virtualによる仮想スクロールを併用する。

TanStack Queryはサーバー状態のキャッシュ・再取得・楽観的更新を担う。
ジョブステータスのポーリングにも使用する。

### FSD（Feature-Sliced Design）

フロントエンドのアーキテクチャとしてFSDを採用する。
ただし、React Routerのframeworkモードに合わせ、`routes/` を最上位エントリとする変則構成とする。
詳細は `structure.md` に記載する。

### レイヤードアーキテクチャ

バックエンドはpresentation / application / domain / infrastructureの4層とする。
各層の依存方向は上位→下位のみとし、逆方向の依存は禁止する。

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

## DB設計方針

### staging前提

本番テーブルへの直接INSERTは禁止する。
ジョブごとにstagingテーブル（またはstaging用スキーマ）を使用し、バリデーション通過後に本番へ反映する。

### 主要テーブル

| テーブル | 用途 |
|---------|------|
| import_jobs | ジョブ管理。ステータス・ファイル情報・実行者・タイムスタンプ |
| import_errors | バリデーションエラー。行番号・列名・エラー種別・該当値・ジョブID |
| column_mappings | 列マッピング定義。ソース列名・ターゲット列名・型・ジョブID |
| templates | テンプレート。名前・列マッピング・バリデーション設定のJSON |
| audit_logs | 監査ログ。操作者・操作種別・対象・タイムスタンプ・詳細 |

### マイグレーション

Alembicで管理する。`server/alembic/` に配置する。
マイグレーションファイルは自動生成（`alembic revision --autogenerate`）を基本とする。

## API方針

### エンドポイント設計

RESTfulに設計する。リソース単位でエンドポイントを分割する。

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
GET    /api/v1/templates             テンプレート一覧
POST   /api/v1/templates             テンプレート作成
GET    /api/v1/templates/{id}        テンプレート詳細
GET    /api/v1/audit-logs            監査ログ一覧
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
CPU負荷の高いパース・バリデーション処理は `run_in_executor` でスレッドプールに逃がす。

拡張フェーズでCelery等のタスクキューを導入する。MVP時点ではジョブのステータスポーリングで進捗を表示する。

## ログ・エラー処理

### ログ

Pythonの標準 `logging` モジュールを使用する。JSON形式で出力する。
ジョブIDをログコンテキストに含め、ジョブ単位でのログ追跡を可能にする。

### エラーハンドリング

- ドメイン例外クラスを定義する（`DomainError`, `ValidationError`, `ParseError` 等）
- FastAPIの例外ハンドラで統一レスポンスに変換する
- バリデーションエラーは例外ではなく、構造化データとしてDBに保存する
- 予期しないエラーは500レスポンスとし、スタックトレースをログに記録する

### フロントエンドエラー

- API通信エラーはaxiosインターセプターで共通処理する
- ユーザー向けエラーはsonnerトーストで表示する
- バリデーションエラーはエラーテーブルで詳細表示する
