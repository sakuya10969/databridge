# 仕様ドキュメント インデックス

`.kiro/specs/` 配下の feature spec 一覧。各ディレクトリには `requirements.md`・`design.md`・`tasks.md` を含む。

## Import 系

| Feature | ディレクトリ | 概要 |
|---------|-------------|------|
| 共通基盤 | [shared-foundation](./shared-foundation/) | FastAPI・DB・例外・共通レスポンス・フロントエンド共通基盤 |
| ファイルアップロード・パース | [file-upload-parse](./file-upload-parse/) | CSV/xlsxアップロード・シート選択・ヘッダ行指定・プレビュー |
| 列マッピング・バリデーション | [column-mapping-validation](./column-mapping-validation/) | 列マッピング設定・panderaバリデーション・エラー表示 |
| データステージング・取り込み | [data-staging-import](./data-staging-import/) | stagingテーブル経由のDB投入・取り込み実行 |
| Importジョブ管理 | [import-job-management](./import-job-management/) | ジョブ一覧・詳細・ステータス管理・テンプレート・再実行 |

## Report 系

| Feature | ディレクトリ | 概要 |
|---------|-------------|------|
| 帳票テンプレート管理 | [report-template-management](./report-template-management/) | 帳票テンプレートCRUD・フィールド定義 |
| 帳票出力 | [report-generation](./report-generation/) | 帳票出力ジョブ・生成・ダウンロード・再実行 |

## 運用ルール

- このディレクトリが feature spec の source of truth
- `docs/specs/` は read-only ミラー（自動同期）
- spec の編集は必ずこのディレクトリで行う
