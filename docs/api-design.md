# API設計

## 共通仕様

- ベースパス: `/api/v1`
- レスポンス形式: JSON
- 認証: MVP時点では未実装
- Import系: `/api/v1/jobs`, `/api/v1/templates`
- Report系: `/api/v1/report-templates`, `/api/v1/report-jobs`
- 共通: `/api/v1/audit-logs`

### 成功レスポンス

```json
{
  "data": { ... },
  "meta": { "total": 100, "page": 1, "per_page": 20 }
}
```

`meta` はページネーション対応エンドポイントのみ付与する。

### エラーレスポンス

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "バリデーションに失敗しました",
    "details": [ ... ]
  }
}
```

### エラーコード一覧

| コード | HTTPステータス | 説明 | 対象 |
|--------|--------------|------|------|
| NOT_FOUND | 404 | リソースが存在しない | 共通 |
| INVALID_STATUS | 409 | 不正なステータス遷移 | 共通 |
| PARSE_ERROR | 422 | ファイルパース失敗 | Import |
| VALIDATION_FAILED | 422 | バリデーション失敗 | Import |
| IMPORT_ERROR | 500 | DB取り込み失敗 | Import |
| REPORT_GENERATION_ERROR | 500 | 帳票生成失敗 | Report |
| REPORT_OUTPUT_NOT_FOUND | 404 | 帳票出力ファイルが存在しない | Report |
| INVALID_FILTER | 422 | フィルタ条件が不正 | Report |
| INTERNAL_ERROR | 500 | 予期しないエラー | 共通 |

---

## A. Import系 API

### ジョブ API

### POST /api/v1/jobs/upload

ファイルアップロード・ジョブ作成。

- Content-Type: `multipart/form-data`
- リクエスト:
  - `file`: アップロードファイル（CSV/xlsx）
  - `operator`: 操作者名（string）
- レスポンス: 作成されたジョブ

```json
{
  "data": {
    "id": "uuid",
    "file_name": "data.xlsx",
    "file_type": "xlsx",
    "status": "uploaded",
    "operator": "田中太郎",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### GET /api/v1/jobs

ジョブ一覧取得。

- クエリパラメータ:
  - `page`: ページ番号（default: 1）
  - `per_page`: 1ページあたり件数（default: 20）
  - `status`: ステータスフィルタ（optional）
- レスポンス: ジョブ一覧 + meta

### GET /api/v1/jobs/{job_id}

ジョブ詳細取得。

- レスポンス: ジョブ詳細（列マッピング・エラー件数含む）

### POST /api/v1/jobs/{job_id}/parse

パース実行。シート選択・ヘッダ行指定を行う。

- リクエスト:
```json
{
  "sheet_name": "Sheet1",
  "header_row": 0
}
```
- レスポンス: パース結果（シート一覧・検出列・総行数）

```json
{
  "data": {
    "sheets": ["Sheet1", "Sheet2"],
    "columns": ["名前", "メール", "部署"],
    "total_rows": 1500,
    "status": "parsing"
  }
}
```

### GET /api/v1/jobs/{job_id}/preview

プレビュー取得。

- クエリパラメータ:
  - `limit`: 取得行数（default: 50）
- レスポンス: 先頭N行のデータ

```json
{
  "data": {
    "columns": ["名前", "メール", "部署"],
    "rows": [
      ["田中太郎", "[email]", "営業部"],
      ["鈴木花子", "[email]", "開発部"]
    ],
    "total_rows": 1500
  }
}
```

### POST /api/v1/jobs/{job_id}/mapping

列マッピング設定。

- リクエスト:
```json
{
  "mappings": [
    {
      "source_column": "名前",
      "target_column": "name",
      "data_type": "str",
      "nullable": false,
      "unique": false,
      "pattern": null
    }
  ],
  "template_id": "uuid or null"
}
```

### POST /api/v1/jobs/{job_id}/validate

バリデーション実行。

- レスポンス: バリデーション結果サマリ

```json
{
  "data": {
    "status": "validating",
    "total_rows": 1500,
    "error_count": 12,
    "valid_rows": 1488
  }
}
```

### GET /api/v1/jobs/{job_id}/errors

エラー一覧取得。

- クエリパラメータ:
  - `page`: ページ番号
  - `per_page`: 件数
  - `column_name`: 列名フィルタ（optional）
  - `error_type`: エラー種別フィルタ（optional）
- レスポンス: エラー一覧

```json
{
  "data": [
    {
      "row_number": 15,
      "column_name": "メール",
      "error_type": "pattern_error",
      "expected_value": "メールアドレス形式",
      "actual_value": "invalid-email",
      "message": "形式が不正です"
    }
  ],
  "meta": { "total": 12, "page": 1, "per_page": 20 }
}
```

### POST /api/v1/jobs/{job_id}/import

取り込み実行。staging経由で本番テーブルへ投入する。

- レスポンス: 取り込み結果

```json
{
  "data": {
    "status": "importing",
    "imported_rows": 0
  }
}
```

### POST /api/v1/jobs/{job_id}/retry

失敗ジョブの再実行。同一設定で再度パース→バリデーション→取り込みを実行する。

- レスポンス: 再実行開始結果

---

## Import用テンプレート API

### GET /api/v1/templates

テンプレート一覧取得。

### POST /api/v1/templates

テンプレート作成。

- リクエスト:
```json
{
  "name": "社員マスタ取り込み",
  "description": "社員マスタCSVの標準テンプレート",
  "target_table": "employees",
  "column_definitions": [
    {
      "source_column": "名前",
      "target_column": "name",
      "data_type": "str",
      "nullable": false,
      "unique": false,
      "pattern": null
    }
  ]
}
```

### GET /api/v1/templates/{template_id}

テンプレート詳細取得。

---

## B. Report系 API

### 帳票テンプレート API

### POST /api/v1/report-templates

帳票テンプレート作成。

- リクエスト:
```json
{
  "name": "取り込みジョブ一覧レポート",
  "description": "全取り込みジョブの一覧帳票",
  "report_type": "list",
  "default_output_format": "pdf",
  "target_resource_type": "import_jobs",
  "layout_definition": {
    "title": "取り込みジョブ一覧",
    "page_size": "A4",
    "orientation": "landscape",
    "header": { "show": true, "text": "業務データ取り込み基盤 — ジョブ一覧レポート" },
    "footer": { "show": true, "text": "ページ {page} / {total_pages}" }
  },
  "fields": [
    {
      "field_key": "file_name",
      "label": "ファイル名",
      "source_path": "file_name",
      "display_order": 1,
      "format_type": "string",
      "is_required": true
    },
    {
      "field_key": "status",
      "label": "ステータス",
      "source_path": "status",
      "display_order": 2,
      "format_type": "string",
      "is_required": true
    },
    {
      "field_key": "created_at",
      "label": "作成日時",
      "source_path": "created_at",
      "display_order": 3,
      "format_type": "datetime",
      "format_pattern": "YYYY-MM-DD HH:mm",
      "is_required": true
    }
  ]
}
```

- レスポンス:
```json
{
  "data": {
    "id": "uuid",
    "name": "取り込みジョブ一覧レポート",
    "report_type": "list",
    "default_output_format": "pdf",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### GET /api/v1/report-templates

帳票テンプレート一覧取得。

- クエリパラメータ:
  - `page`: ページ番号（default: 1）
  - `per_page`: 1ページあたり件数（default: 20）
  - `report_type`: 帳票種別フィルタ（optional: list/single/summary）
- レスポンス: テンプレート一覧 + meta

### GET /api/v1/report-templates/{template_id}

帳票テンプレート詳細取得。フィールド定義を含む。

- レスポンス:
```json
{
  "data": {
    "id": "uuid",
    "name": "取り込みジョブ一覧レポート",
    "description": "全取り込みジョブの一覧帳票",
    "report_type": "list",
    "default_output_format": "pdf",
    "target_resource_type": "import_jobs",
    "layout_definition": { ... },
    "fields": [
      {
        "id": "uuid",
        "field_key": "file_name",
        "label": "ファイル名",
        "source_path": "file_name",
        "display_order": 1,
        "format_type": "string",
        "is_required": true,
        "default_value": null,
        "width": null,
        "aggregation": null
      }
    ],
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

### PUT /api/v1/report-templates/{template_id}

帳票テンプレート更新。

- リクエスト: POST と同一構造（部分更新可）
- レスポンス: 更新後のテンプレート

### DELETE /api/v1/report-templates/{template_id}

帳票テンプレート削除。出力ジョブが存在する場合は論理削除（is_active = false）。

- レスポンス: 204 No Content

---

### 帳票出力ジョブ API

### POST /api/v1/report-jobs

帳票出力ジョブ作成。非同期でジョブを作成し、生成処理を開始する。

- リクエスト:
```json
{
  "report_template_id": "uuid",
  "output_format": "pdf",
  "requested_by": "田中太郎",
  "filter_conditions": {
    "filters": [
      { "field": "status", "operator": "eq", "value": "completed" },
      { "field": "created_at", "operator": "gte", "value": "2025-01-01T00:00:00Z" }
    ],
    "sort": [
      { "field": "created_at", "direction": "desc" }
    ]
  }
}
```

- レスポンス:
```json
{
  "data": {
    "id": "uuid",
    "report_template_id": "uuid",
    "status": "pending",
    "output_format": "pdf",
    "requested_by": "田中太郎",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### GET /api/v1/report-jobs

帳票出力ジョブ一覧取得。

- クエリパラメータ:
  - `page`: ページ番号（default: 1）
  - `per_page`: 1ページあたり件数（default: 20）
  - `status`: ステータスフィルタ（optional: pending/generating/completed/failed）
  - `report_template_id`: テンプレートIDフィルタ（optional）
- レスポンス: ジョブ一覧 + meta

### GET /api/v1/report-jobs/{job_id}

帳票出力ジョブ詳細取得。出力ファイル情報を含む。

- レスポンス:
```json
{
  "data": {
    "id": "uuid",
    "report_template_id": "uuid",
    "report_template_name": "取り込みジョブ一覧レポート",
    "status": "completed",
    "output_format": "pdf",
    "filter_conditions": { ... },
    "row_count": 150,
    "requested_by": "田中太郎",
    "error_message": null,
    "started_at": "2025-01-01T00:00:01Z",
    "completed_at": "2025-01-01T00:00:05Z",
    "created_at": "2025-01-01T00:00:00Z",
    "outputs": [
      {
        "id": "uuid",
        "file_name": "import_jobs_report_20250101.pdf",
        "mime_type": "application/pdf",
        "file_size": 102400,
        "checksum": "sha256:...",
        "created_at": "2025-01-01T00:00:05Z"
      }
    ]
  }
}
```

### GET /api/v1/report-jobs/{job_id}/download

帳票ファイルダウンロード。最新の出力ファイルをストリーミングで返す。

- レスポンス: バイナリストリーム
  - Content-Type: 出力形式に応じたMIMEタイプ
  - Content-Disposition: `attachment; filename="..."`
- エラー: ジョブが未完了またはファイルが存在しない場合は404

### POST /api/v1/report-jobs/{job_id}/retry

失敗した帳票出力ジョブの再実行。同一テンプレート・同一条件で再実行する。

- レスポンス:
```json
{
  "data": {
    "id": "uuid",
    "status": "pending",
    "output_format": "pdf",
    "requested_by": "田中太郎",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

## C. 共通 API

### 監査ログ API

### GET /api/v1/audit-logs

監査ログ一覧取得。

- クエリパラメータ:
  - `page`: ページ番号
  - `per_page`: 件数
  - `operator`: 操作者フィルタ（optional）
  - `action`: 操作種別フィルタ（optional）
  - `resource_type`: リソース種別フィルタ（optional）
- レスポンス: 監査ログ一覧 + meta
