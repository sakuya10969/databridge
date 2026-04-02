# API設計

## 共通仕様

- ベースパス: `/api/v1`
- レスポンス形式: JSON
- 認証: MVP時点では未実装

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

| コード | HTTPステータス | 説明 |
|--------|--------------|------|
| NOT_FOUND | 404 | リソースが存在しない |
| INVALID_STATUS | 409 | 不正なステータス遷移 |
| PARSE_ERROR | 422 | ファイルパース失敗 |
| VALIDATION_FAILED | 422 | バリデーション失敗 |
| IMPORT_ERROR | 500 | DB取り込み失敗 |
| INTERNAL_ERROR | 500 | 予期しないエラー |

---

## ジョブ API

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

## テンプレート API

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

## 監査ログ API

### GET /api/v1/audit-logs

監査ログ一覧取得。

- クエリパラメータ:
  - `page`: ページ番号
  - `per_page`: 件数
  - `operator`: 操作者フィルタ（optional）
  - `action`: 操作種別フィルタ（optional）
  - `resource_type`: リソース種別フィルタ（optional）
- レスポンス: 監査ログ一覧 + meta
