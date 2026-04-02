# ドメイン設計

## エンティティ一覧

### ImportJob（取り込みジョブ）

ファイル取り込みの1回の実行単位。1ファイル = 1ジョブとする。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | ジョブID |
| file_name | str | アップロードファイル名 |
| file_path | str | サーバー上の保存パス |
| file_size | int | ファイルサイズ（bytes） |
| file_type | str | "csv" / "xlsx" |
| sheet_name | str / null | 選択されたシート名（Excel時） |
| header_row | int | ヘッダ開始行（0-indexed） |
| status | JobStatus | ジョブステータス |
| total_rows | int / null | 総行数（パース後に確定） |
| error_count | int | バリデーションエラー件数 |
| template_id | UUID / null | 使用テンプレートID |
| operator | str | 操作者名 |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

### JobStatus（ステータスenum）

```
uploaded    → ファイルアップロード完了
parsing     → パース処理中
validating  → バリデーション実行中
importing   → DB取り込み中
completed   → 取り込み完了
failed      → 処理失敗
```

遷移ルール:
- `uploaded → parsing → validating → importing → completed`
- 任意のステータスから `failed` へ遷移可能
- `failed → parsing`（再実行時）

### ColumnMapping（列マッピング）

ソースファイルの列とターゲットDBの列の対応関係。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | マッピングID |
| job_id | UUID | 所属ジョブID |
| source_column | str | ソース列名（ファイル側） |
| target_column | str | ターゲット列名（DB側） |
| data_type | str | 期待するデータ型（int/float/str/datetime/bool） |
| nullable | bool | NULL許可 |
| unique | bool | 一意制約 |
| pattern | str / null | 正規表現パターン（形式チェック用） |
| order | int | 表示順序 |

### Template（テンプレート）

列マッピング + バリデーション設定の再利用可能な定義。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | テンプレートID |
| name | str | テンプレート名 |
| description | str / null | 説明 |
| target_table | str | ターゲットテーブル名 |
| column_definitions | JSON | 列マッピング・バリデーション設定の配列 |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

`column_definitions` のJSON構造:
```json
[
  {
    "source_column": "名前",
    "target_column": "name",
    "data_type": "str",
    "nullable": false,
    "unique": false,
    "pattern": null
  }
]
```

### ImportError（取り込みエラー）

バリデーションで検出されたエラー。行・列単位で記録する。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | エラーID |
| job_id | UUID | 所属ジョブID |
| row_number | int | エラー行番号（1-indexed） |
| column_name | str | エラー列名 |
| error_type | ErrorType | エラー種別 |
| expected_value | str / null | 期待値の説明 |
| actual_value | str / null | 実際の値 |
| message | str | エラーメッセージ |

### ErrorType（エラー種別enum）

```
type_error       → 型不一致
required_error   → 必須項目が空
unique_error     → 重複値
pattern_error    → 形式不一致（正規表現）
range_error      → 範囲外
unknown_error    → その他
```

### AuditLog（監査ログ）

全操作の記録。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | ログID |
| operator | str | 操作者名 |
| action | str | 操作種別（upload/parse/validate/import/retry） |
| resource_type | str | 対象リソース種別（job/template） |
| resource_id | UUID | 対象リソースID |
| details | JSON / null | 追加情報 |
| created_at | datetime | 操作日時 |

## サービス（ユースケース）

### JobService

ジョブのライフサイクル全体を管理する。

| メソッド | 説明 |
|---------|------|
| `upload_file(file, operator)` | ファイル保存・ジョブ作成 |
| `parse_file(job_id, sheet_name, header_row)` | パース実行・DataFrame化 |
| `get_preview(job_id, limit)` | プレビューデータ取得 |
| `set_mapping(job_id, mappings)` | 列マッピング設定 |
| `validate(job_id)` | バリデーション実行・エラー保存 |
| `run_import(job_id)` | staging投入 → 本番反映 |
| `retry(job_id)` | 失敗ジョブの再実行 |

### TemplateService

テンプレートのCRUD。

| メソッド | 説明 |
|---------|------|
| `list_templates()` | テンプレート一覧 |
| `get_template(template_id)` | テンプレート詳細 |
| `create_template(name, column_definitions)` | テンプレート作成 |
| `apply_template(job_id, template_id)` | ジョブにテンプレート適用 |

### AuditService

監査ログの記録・取得。

| メソッド | 説明 |
|---------|------|
| `log(operator, action, resource_type, resource_id, details)` | ログ記録 |
| `list_logs(filters)` | ログ一覧取得（フィルタ対応） |

## ドメイン例外

| 例外クラス | 用途 |
|-----------|------|
| `DomainError` | ドメイン例外の基底クラス |
| `ParseError` | ファイルパース失敗 |
| `ValidationError` | バリデーション設定の不整合 |
| `ImportError` | DB取り込み失敗 |
| `JobNotFoundError` | ジョブが存在しない |
| `InvalidStatusTransitionError` | 不正なステータス遷移 |
| `TemplateNotFoundError` | テンプレートが存在しない |

## DBテーブル

| テーブル名 | 対応エンティティ |
|-----------|----------------|
| import_jobs | ImportJob |
| column_mappings | ColumnMapping |
| templates | Template |
| import_errors | ImportError |
| audit_logs | AuditLog |

全テーブルのPKはUUID。タイムスタンプはUTC。
staging用テーブルはジョブ実行時に動的に作成・削除する。
