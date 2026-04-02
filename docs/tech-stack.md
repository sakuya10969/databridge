# 技術スタック

## フロントエンド

| 技術 | バージョン | 用途 | 採用理由 |
|------|-----------|------|---------|
| React | 19.x | UIライブラリ | エコシステムの成熟度 |
| React Router | 7.x (framework mode) | ルーティング・SSR・loader/action | ファイルベースルーティング + SSR対応 |
| TypeScript | 5.x | 型安全 | 開発効率・保守性 |
| Bun | latest | パッケージマネージャ・ランタイム | npm/yarnより高速。`bun run` で統一 |
| Tailwind CSS | 4.x | スタイリング | ユーティリティファーストCSS |
| shadcn/ui | radix-nova | UIコンポーネント | コピーベースでカスタマイズ性が高い |
| TanStack Query | 5.x | サーバー状態管理 | キャッシュ・ポーリング・楽観的更新 |
| TanStack Table | 8.x | テーブル表示 | ヘッドレスでshadcn/uiと組み合わせ可能 |
| TanStack Virtual | 3.x | 仮想スクロール | 10万行対応 |
| react-hook-form | 7.x | フォーム管理 | パフォーマンス・Zod統合 |
| Zod | 4.x | バリデーション | TypeScript型推論との統合 |
| react-dropzone | 15.x | ファイルD&D | ドラッグ&ドロップUI |
| axios | 1.x | HTTPクライアント | インターセプター・エラーハンドリング |
| sonner | 2.x | トースト通知 | 軽量・shadcn/ui統合 |
| lucide-react | 1.x | アイコン | shadcn/ui標準アイコンセット |

## バックエンド

| 技術 | バージョン | 用途 | 採用理由 |
|------|-----------|------|---------|
| Python | 3.12 | ランタイム | pandas/panderaエコシステム |
| FastAPI | 0.135+ | APIフレームワーク | 非同期対応・自動ドキュメント・Pydantic統合 |
| uv | latest | パッケージマネージャ | pipより高速。`uv run` で統一 |
| SQLAlchemy | 2.x | ORM | 型安全なクエリビルダー |
| Alembic | 1.x | DBマイグレーション | SQLAlchemy統合 |
| PostgreSQL | latest | データベース | JSONB・トランザクション・staging対応 |
| psycopg[binary] | 3.x | PostgreSQLドライバ | 非同期対応 |
| pandas | 3.x | データフレーム操作 | CSV/Excel読み込み・列操作・型変換 |
| openpyxl | 3.x | xlsx読み込み | シート一覧取得・ヘッダ行検出 |
| pandera | 0.30+ | DataFrameバリデーション | スキーマベースの型・必須・重複・形式チェック |
| pydantic-settings | 2.x | 設定管理 | 環境変数・.envファイル統合 |

## 拡張用（依存導入済み・MVP未使用）

| 技術 | 用途 |
|------|------|
| pyxlsb | xlsb形式読み込み |
| msoffcrypto-tool | パスワード付きExcel復号 |

## パッケージ管理

| 対象 | ツール | lockファイル | 仮想環境 |
|------|--------|-------------|---------|
| フロントエンド | Bun | `client/bun.lock` | - |
| バックエンド | uv | `server/uv.lock` | `server/.venv` |

## ビルド・実行

| 操作 | コマンド |
|------|---------|
| フロント開発サーバー | `cd client && bun run dev` |
| フロントビルド | `cd client && bun run build` |
| フロント型チェック | `cd client && bun run typecheck` |
| バックエンド開発サーバー | `cd server && uv run uvicorn app.main:app --reload` |
| マイグレーション生成 | `cd server && uv run alembic revision --autogenerate -m "description"` |
| マイグレーション実行 | `cd server && uv run alembic upgrade head` |
