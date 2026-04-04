# ドキュメントインデックス

## docs/

| ファイル | 内容 |
|---------|------|
| [project-overview.md](./project-overview.md) | プロジェクト概要 — プロダクトの目的・課題・ユーザー・取り込み/帳票出力フロー・非機能要件・スコープ |
| [domain-design.md](./domain-design.md) | ドメイン設計 — Import/Reportサブドメイン・エンティティ定義・ステータス遷移・サービス・ドメイン例外・トレーサビリティ方針 |
| [database-design.md](./database-design.md) | データベース設計 — Import系5テーブル・Report系4テーブル・監査ログ拡張・ER図・トレーサビリティ・staging戦略 |
| [api-design.md](./api-design.md) | API設計 — Import系/Report系全エンドポイント仕様・リクエスト/レスポンス例・エラーコード |
| [architecture-philosophy.md](./architecture-philosophy.md) | アーキテクチャ思想 — FSD変則構成（フロント）・レイヤードアーキテクチャ（バック）・Import/Report責務分離・依存ルール |
| [tech-stack.md](./tech-stack.md) | 技術スタック — フロントエンド/バックエンドの技術一覧・バージョン・採用理由・帳票出力用拡張候補・ビルドコマンド |
| [spec-sync.md](./spec-sync.md) | Spec同期ガイド — `.kiro/specs/` → `docs/specs/` の片方向ミラー同期の仕組み・運用ルール・手動同期方法 |
| [issues.md](./issues.md) | 課題・検討事項 |

## docs/specs/（read-only ミラー）

`.kiro/specs/` から自動同期される feature spec のミラー。直接編集禁止。
詳細は [specs/INDEX.md](./specs/INDEX.md) を参照。

| Feature | ディレクトリ | 概要 |
|---------|-------------|------|
| 共通基盤 | [shared-foundation](./specs/shared-foundation/) | FastAPI・DB・例外・共通レスポンス・フロントエンド共通基盤 |
| ファイルアップロード・パース | [file-upload-parse](./specs/file-upload-parse/) | CSV/xlsxアップロード・シート選択・ヘッダ行指定・プレビュー |
| 列マッピング・バリデーション | [column-mapping-validation](./specs/column-mapping-validation/) | 列マッピング設定・panderaバリデーション・エラー表示 |
| データステージング・取り込み | [data-staging-import](./specs/data-staging-import/) | stagingテーブル経由のDB投入・取り込み実行 |
| Importジョブ管理 | [import-job-management](./specs/import-job-management/) | ジョブ一覧・詳細・ステータス管理・テンプレート・再実行 |
| 帳票テンプレート管理 | [report-template-management](./specs/report-template-management/) | 帳票テンプレートCRUD・フィールド定義 |
| 帳票出力 | [report-generation](./specs/report-generation/) | 帳票出力ジョブ・生成・ダウンロード・再実行 |

## .kiro/steering/（実装エージェント向け）

| ファイル | 内容 |
|---------|------|
| product.md | プロダクト定義 — ユースケース・MVP機能・成功条件・スコープ外 |
| structure.md | ディレクトリ構成 — フロント/バックの詳細ファイル配置・命名規則・依存ルール・禁止事項 |
| tech.md | 技術設計 — 技術選定理由・処理方針・DB設計方針・API方針・エラー処理 |
