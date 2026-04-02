# ドメイン設計

本システムは「Import（取り込み）」と「Report（帳票出力）」の2つのサブドメインで構成する。
それぞれ独立した集約・サービスを持ち、共有するのはAuditLog（監査ログ）のみとする。

---

## サブドメイン構成

```
┌─────────────────────────────────────────────────────┐
│                    共通基盤                           │
│  AuditLog（監査ログ）                                 │
└──────────────┬──────────────────────┬────────────────┘
               │                      │
┌──────────────▼──────────┐  ┌────────▼───────────────┐
│  Import サブドメイン     │  │  Report サブドメイン    │
│  ─────────────────────  │  │  ────────────────────  │
│  ImportJob              │  │  ReportTemplate        │
│  ColumnMapping          │  │  ReportTemplateField   │
│  Template（Import用）    │  │  ReportJob             │
│  ImportError            │  │  ReportOutput          │
└─────────────────────────┘  └────────────────────────┘
```

責務境界:
- Import = 外部ファイルを内部DBへ正しく取り込む責務
- Report = 内部データを所定フォーマットで外部出力する責務
- ImportのTemplate（templates テーブル）とReportのReportTemplateは完全に別概念
- Import側のジョブ実行時、column_mappingsはテンプレートのスナップショットとしてジョブに紐づく（テンプレート変更がジョブに影響しない）

---

## A. Import サブドメイン

### エンティティ一覧

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

### Template（Import用テンプレート）

列マッピング + バリデーション設定の再利用可能な定義。Import専用である。
帳票出力用テンプレートはReportTemplateとして別管理する。

ジョブ実行時の列マッピング（column_mappings）はテンプレートのスナップショットである。
テンプレートを後から変更しても、既に実行済みのジョブには影響しない。

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

全操作の記録。Import・Report両方のイベントを統一的に記録する。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | ログID |
| operator | str | 操作者名 |
| action | str | 操作種別 |
| resource_type | str | 対象リソース種別 |
| resource_id | UUID | 対象リソースID |
| details | JSON / null | 追加情報 |
| created_at | datetime | 操作日時 |

action の値（Import系 + Report系）:
```
Import系: upload, parse, validate, import, retry, create_template, update_template
Report系: create_report_template, update_report_template, delete_report_template,
          create_report_job, retry_report_job, download_report
```

resource_type の値:
```
Import系: job, template
Report系: report_template, report_job, report_output
```

## Import サービス（ユースケース）

### ImportJobService

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

### ImportTemplateService

Import用テンプレートのCRUD。

| メソッド | 説明 |
|---------|------|
| `list_templates()` | テンプレート一覧 |
| `get_template(template_id)` | テンプレート詳細 |
| `create_template(name, column_definitions)` | テンプレート作成 |
| `apply_template(job_id, template_id)` | ジョブにテンプレート適用 |

---

## B. Report サブドメイン

### エンティティ一覧

### ReportTemplate（帳票テンプレート）

帳票出力のレイアウト・データソース定義。Import用テンプレートとは完全に別概念。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | テンプレートID |
| name | str | テンプレート名 |
| description | str / null | 説明 |
| report_type | ReportType | 帳票種別（list / single / summary） |
| default_output_format | str | デフォルト出力形式（pdf / xlsx / csv） |
| target_resource_type | str | データソースのリソース種別（例: "import_jobs"） |
| layout_definition | JSON | レイアウト定義（タイトル・ヘッダ・フッタ・ページ設定・集計設定） |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

### ReportType（帳票種別enum）

```
list      → 一覧票: 複数行データの表形式出力
single    → 単票: 1レコードの詳細出力
summary   → 集計票: グループ化・集計を含む出力
```

### ReportTemplateField（帳票フィールド定義）

帳票テンプレートに紐づく出力フィールドの定義。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | フィールドID |
| report_template_id | UUID | 所属テンプレートID |
| field_key | str | フィールドキー（出力時の識別子） |
| label | str | 表示ラベル |
| source_path | str | データソース上のカラムパス（例: "file_name", "operator"） |
| display_order | int | 表示順序 |
| format_type | str | 書式タイプ（string/integer/decimal/date/datetime/currency/percentage） |
| format_pattern | str / null | 書式パターン（例: "YYYY-MM-DD", "#,##0"） |
| is_required | bool | 必須フィールドか |
| default_value | str / null | デフォルト値（固定値出力用） |
| width | int / null | 列幅（Excel/PDF用、ポイント単位） |
| aggregation | str / null | 集計関数（sum/count/avg/min/max、集計票用） |

### ReportJob（帳票出力ジョブ）

帳票出力の1回の実行単位。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | ジョブID |
| report_template_id | UUID | 使用テンプレートID |
| status | ReportJobStatus | ジョブステータス |
| output_format | str | 出力形式（pdf / xlsx / csv） |
| filter_conditions | JSON | フィルタ・ソート条件 |
| row_count | int / null | 出力行数（生成後に確定） |
| requested_by | str | リクエスト者名 |
| started_at | datetime / null | 生成開始日時 |
| completed_at | datetime / null | 生成完了日時 |
| error_message | str / null | エラーメッセージ（失敗時） |
| created_at | datetime | 作成日時 |
| updated_at | datetime | 更新日時 |

### ReportJobStatus（帳票出力ステータスenum）

```
pending      → 出力リクエスト受付済み
generating   → 帳票生成処理中
completed    → 生成完了
failed       → 生成失敗
```

遷移ルール:
- `pending → generating → completed`
- `pending → failed`、`generating → failed`
- `failed → pending`（再実行時）

### ReportOutput（帳票出力ファイル）

生成された帳票ファイルのメタデータ。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | UUID | 出力ID |
| report_job_id | UUID | 所属ジョブID |
| file_name | str | 生成ファイル名 |
| file_path | str | サーバー上の保存パス |
| mime_type | str | MIMEタイプ（application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv） |
| file_size | int | ファイルサイズ（bytes） |
| checksum | str | SHA-256チェックサム（改竄検知用） |
| created_at | datetime | 生成日時 |

### Report サービス（ユースケース）

### ReportTemplateService

帳票テンプレートのCRUD。

| メソッド | 説明 |
|---------|------|
| `list_templates()` | 帳票テンプレート一覧 |
| `get_template(template_id)` | 帳票テンプレート詳細（フィールド定義含む） |
| `create_template(name, fields, layout)` | 帳票テンプレート作成 |
| `update_template(template_id, ...)` | 帳票テンプレート更新 |
| `delete_template(template_id)` | 帳票テンプレート削除 |

### ReportJobService

帳票出力ジョブのライフサイクル管理。

| メソッド | 説明 |
|---------|------|
| `create_job(template_id, output_format, filter_conditions, requested_by)` | 出力ジョブ作成 |
| `list_jobs(filters)` | 出力ジョブ一覧 |
| `get_job(job_id)` | 出力ジョブ詳細 |
| `generate(job_id)` | 帳票生成実行（データ抽出→ファイル生成→保存） |
| `retry(job_id)` | 失敗ジョブの再実行 |
| `get_output(job_id)` | 生成ファイルのメタデータ取得 |

---

## 共通サービス

### AuditService

監査ログの記録・取得。Import・Report両方のイベントを統一的に扱う。

| メソッド | 説明 |
|---------|------|
| `log(operator, action, resource_type, resource_id, details)` | ログ記録 |
| `list_logs(filters)` | ログ一覧取得（フィルタ対応） |

---

## ドメイン例外

| 例外クラス | 用途 |
|-----------|------|
| `DomainError` | ドメイン例外の基底クラス |
| `ParseError` | ファイルパース失敗 |
| `ValidationError` | バリデーション設定の不整合 |
| `ImportError` | DB取り込み失敗 |
| `JobNotFoundError` | ジョブが存在しない（Import/Report共通） |
| `InvalidStatusTransitionError` | 不正なステータス遷移（Import/Report共通） |
| `TemplateNotFoundError` | テンプレートが存在しない（Import/Report共通） |
| `ReportGenerationError` | 帳票生成失敗 |
| `ReportOutputNotFoundError` | 帳票出力ファイルが存在しない |

---

## 本番データとのトレーサビリティ方針

### 課題

importの冪等性保証では「job_idで再実行時に削除・再投入する」思想を採用している。
これを成立させるには、本番テーブル側でどのジョブから投入されたデータかを追跡できる必要がある。

### 方針

本番テーブル（import先）には以下のメタカラムを付与することを推奨する:

| カラム | 型 | 説明 |
|--------|-----|------|
| _import_job_id | UUID | 投入元のimport_job ID |
| _imported_at | TIMESTAMPTZ | 投入日時 |

これにより:
- 再実行時: `DELETE FROM target_table WHERE _import_job_id = :job_id` で当該ジョブのデータを削除可能
- トレーサビリティ: 任意の本番データがどのジョブで投入されたかを追跡可能
- 帳票出力時: `_import_job_id` でフィルタすることで、特定ジョブの投入データのみを帳票化可能

### 将来拡張

- `_source_row_hash`: ソースファイルの行ハッシュ。同一データの重複検知に使用
- 業務キー + upsert方針: 業務上の一意キーが定義できる場合、INSERT ON CONFLICTによるupsertも検討可能
- これらはMVP後の拡張として位置づける

---

## DBテーブル

### Import系

| テーブル名 | 対応エンティティ |
|-----------|----------------|
| import_jobs | ImportJob |
| column_mappings | ColumnMapping |
| templates | Template（Import用） |
| import_errors | ImportError |

### Report系

| テーブル名 | 対応エンティティ |
|-----------|----------------|
| report_templates | ReportTemplate |
| report_template_fields | ReportTemplateField |
| report_jobs | ReportJob |
| report_outputs | ReportOutput |

### 共通

| テーブル名 | 対応エンティティ |
|-----------|----------------|
| audit_logs | AuditLog |

全テーブルのPKはUUID。タイムスタンプはUTC。
staging用テーブルはジョブ実行時に動的に作成・削除する。
