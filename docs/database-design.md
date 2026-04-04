# データベース設計

## 概要

PostgreSQL 17をDocker Composeで運用する。全テーブルのPKはUUID（`gen_random_uuid()`）。タイムスタンプはUTC。
マイグレーションはAlembic（`server/alembic/`）で管理する。

### 接続情報（ローカル開発）

| 項目 | 値 |
|------|-----|
| ホスト | localhost |
| ポート | 5432 |
| ユーザー | admin |
| パスワード | password |
| データベース名 | databridge |
| 接続URL | `postgresql://admin:password@localhost:5432/databridge` |

本システムはImport系テーブル（5テーブル）とReport系テーブル（4テーブル）、および共通のaudit_logsで構成する。

staging用テーブルはジョブ実行時に動的に作成し、取り込み完了後に削除する。
本番テーブルへの直接INSERTは禁止し、必ずstagingテーブルを経由する。

---

## A. Import系テーブル定義

### import_jobs（取り込みジョブ）

1ファイル = 1ジョブ。取り込み処理の実行単位。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ジョブID |
| file_name | VARCHAR(255) | NOT NULL | アップロードファイル名 |
| file_path | VARCHAR(1024) | NOT NULL | サーバー上の保存パス |
| file_size | BIGINT | NOT NULL | ファイルサイズ（bytes） |
| file_type | VARCHAR(10) | NOT NULL, CHECK (file_type IN ('csv', 'xlsx')) | ファイル種別 |
| sheet_name | VARCHAR(255) | NULL | 選択シート名（Excel時） |
| header_row | INTEGER | NOT NULL, DEFAULT 0 | ヘッダ開始行（0-indexed） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'uploaded' | ジョブステータス |
| total_rows | INTEGER | NULL | 総行数（パース後に確定） |
| error_count | INTEGER | NOT NULL, DEFAULT 0 | バリデーションエラー件数 |
| template_id | UUID | NULL, FK → templates(id) | 使用テンプレートID |
| operator | VARCHAR(255) | NOT NULL | 操作者名 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新日時 |

インデックス:
- `ix_import_jobs_status` ON (status)
- `ix_import_jobs_created_at` ON (created_at DESC)
- `ix_import_jobs_operator` ON (operator)
- `ix_import_jobs_template_id` ON (template_id)


### column_mappings（列マッピング）

ソースファイルの列とターゲットDBの列の対応関係。ジョブ単位で保持する。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | マッピングID |
| job_id | UUID | NOT NULL, FK → import_jobs(id) ON DELETE CASCADE | 所属ジョブID |
| source_column | VARCHAR(255) | NOT NULL | ソース列名（ファイル側） |
| target_column | VARCHAR(255) | NOT NULL | ターゲット列名（DB側） |
| data_type | VARCHAR(20) | NOT NULL, CHECK (data_type IN ('int', 'float', 'str', 'datetime', 'bool')) | 期待データ型 |
| nullable | BOOLEAN | NOT NULL, DEFAULT true | NULL許可 |
| is_unique | BOOLEAN | NOT NULL, DEFAULT false | 一意制約 |
| pattern | VARCHAR(512) | NULL | 正規表現パターン（形式チェック用） |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 表示順序 |

インデックス:
- `ix_column_mappings_job_id` ON (job_id)

制約:
- `uq_column_mappings_job_source` UNIQUE (job_id, source_column)
- `uq_column_mappings_job_target` UNIQUE (job_id, target_column)

---

### templates（Import用テンプレート）

列マッピング + バリデーション設定の再利用可能な定義。Import専用。
帳票出力用テンプレートはreport_templatesテーブルで別管理する。

ジョブ実行時のcolumn_mappingsはテンプレートのスナップショットである。
テンプレートを後から変更しても、既に実行済みのジョブには影響しない。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | テンプレートID |
| name | VARCHAR(255) | NOT NULL, UNIQUE | テンプレート名 |
| description | TEXT | NULL | 説明 |
| target_table | VARCHAR(255) | NOT NULL | ターゲットテーブル名 |
| column_definitions | JSONB | NOT NULL | 列マッピング・バリデーション設定 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新日時 |

`column_definitions` のJSONB構造:

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

インデックス:
- `ix_templates_name` ON (name)

---

### import_errors（取り込みエラー）

バリデーションで検出されたエラー。行・列単位で記録する。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | エラーID |
| job_id | UUID | NOT NULL, FK → import_jobs(id) ON DELETE CASCADE | 所属ジョブID |
| row_number | INTEGER | NOT NULL | エラー行番号（1-indexed） |
| column_name | VARCHAR(255) | NOT NULL | エラー列名 |
| error_type | VARCHAR(20) | NOT NULL | エラー種別 |
| expected_value | TEXT | NULL | 期待値の説明 |
| actual_value | TEXT | NULL | 実際の値 |
| message | TEXT | NOT NULL | エラーメッセージ |

`error_type` の値:

| 値 | 説明 |
|----|------|
| type_error | 型不一致 |
| required_error | 必須項目が空 |
| unique_error | 重複値 |
| pattern_error | 形式不一致（正規表現） |
| range_error | 範囲外 |
| unknown_error | その他 |

インデックス:
- `ix_import_errors_job_id` ON (job_id)
- `ix_import_errors_job_error_type` ON (job_id, error_type)
- `ix_import_errors_job_row` ON (job_id, row_number)

---

### audit_logs（監査ログ）

全操作の記録。削除不可（追記のみ）。Import・Report両方のイベントを統一的に記録する。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ログID |
| operator | VARCHAR(255) | NOT NULL | 操作者名 |
| action | VARCHAR(50) | NOT NULL | 操作種別 |
| resource_type | VARCHAR(50) | NOT NULL | 対象リソース種別 |
| resource_id | UUID | NOT NULL | 対象リソースID |
| details | JSONB | NULL | 追加情報 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 操作日時 |

`action` の値:

| 値 | 説明 | 対象 |
|----|------|------|
| upload | ファイルアップロード | Import |
| parse | パース実行 | Import |
| validate | バリデーション実行 | Import |
| import | 取り込み実行 | Import |
| retry | 取り込み再実行 | Import |
| create_template | Import用テンプレート作成 | Import |
| update_template | Import用テンプレート更新 | Import |
| create_report_template | 帳票テンプレート作成 | Report |
| update_report_template | 帳票テンプレート更新 | Report |
| delete_report_template | 帳票テンプレート削除 | Report |
| create_report_job | 帳票出力ジョブ作成 | Report |
| retry_report_job | 帳票出力再実行 | Report |
| download_report | 帳票ファイルダウンロード | Report |

`resource_type` の値:

| 値 | 説明 |
|----|------|
| job | Import用ジョブ |
| template | Import用テンプレート |
| report_template | 帳票テンプレート |
| report_job | 帳票出力ジョブ |
| report_output | 帳票出力ファイル |

インデックス:
- `ix_audit_logs_created_at` ON (created_at DESC)
- `ix_audit_logs_operator` ON (operator)
- `ix_audit_logs_resource` ON (resource_type, resource_id)
- `ix_audit_logs_action` ON (action)

---

## B. Report系テーブル定義

### report_templates（帳票テンプレート）

帳票出力のレイアウト・データソース定義。Import用テンプレート（templates）とは完全に別テーブル。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | テンプレートID |
| name | VARCHAR(255) | NOT NULL, UNIQUE | テンプレート名 |
| description | TEXT | NULL | 説明 |
| report_type | VARCHAR(20) | NOT NULL, CHECK (report_type IN ('list', 'single', 'summary')) | 帳票種別 |
| default_output_format | VARCHAR(10) | NOT NULL, DEFAULT 'pdf', CHECK (default_output_format IN ('pdf', 'xlsx', 'csv')) | デフォルト出力形式 |
| target_resource_type | VARCHAR(255) | NOT NULL | データソースのリソース種別（例: "import_jobs"） |
| layout_definition | JSONB | NOT NULL | レイアウト定義 |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | 有効フラグ（論理削除用） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新日時 |

`report_type` の値:

| 値 | 説明 |
|----|------|
| list | 一覧票: 複数行データの表形式出力 |
| single | 単票: 1レコードの詳細出力 |
| summary | 集計票: グループ化・集計を含む出力 |

`layout_definition` のJSONB構造:

```json
{
  "title": "取り込みジョブ一覧",
  "page_size": "A4",
  "orientation": "landscape",
  "header": { "show": true, "text": "業務データ取り込み基盤 — ジョブ一覧レポート" },
  "footer": { "show": true, "text": "ページ {page} / {total_pages}" },
  "grouping": null,
  "aggregation": null
}
```

インデックス:
- `ix_report_templates_name` ON (name)
- `ix_report_templates_report_type` ON (report_type)
- `ix_report_templates_is_active` ON (is_active) WHERE is_active = true

---

### report_template_fields（帳票フィールド定義）

帳票テンプレートに紐づく出力フィールドの定義。正規化テーブルとして設計し、JONBのみに依存しない。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | フィールドID |
| report_template_id | UUID | NOT NULL, FK → report_templates(id) ON DELETE CASCADE | 所属テンプレートID |
| field_key | VARCHAR(255) | NOT NULL | フィールドキー（出力時の識別子） |
| label | VARCHAR(255) | NOT NULL | 表示ラベル |
| source_path | VARCHAR(512) | NOT NULL | データソース上のカラムパス |
| display_order | INTEGER | NOT NULL, DEFAULT 0 | 表示順序 |
| format_type | VARCHAR(20) | NOT NULL, DEFAULT 'string', CHECK (format_type IN ('string', 'integer', 'decimal', 'date', 'datetime', 'currency', 'percentage')) | 書式タイプ |
| format_pattern | VARCHAR(255) | NULL | 書式パターン（例: "YYYY-MM-DD", "#,##0"） |
| is_required | BOOLEAN | NOT NULL, DEFAULT true | 必須フィールドか |
| default_value | TEXT | NULL | デフォルト値（固定値出力用） |
| width | INTEGER | NULL | 列幅（Excel/PDF用、ポイント単位） |
| aggregation | VARCHAR(20) | NULL, CHECK (aggregation IN ('sum', 'count', 'avg', 'min', 'max')) | 集計関数（集計票用） |

インデックス:
- `ix_report_template_fields_template_id` ON (report_template_id)
- `ix_report_template_fields_display_order` ON (report_template_id, display_order)

制約:
- `uq_report_template_fields_key` UNIQUE (report_template_id, field_key)

---

### report_jobs（帳票出力ジョブ）

帳票出力の1回の実行単位。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ジョブID |
| report_template_id | UUID | NOT NULL, FK → report_templates(id) | 使用テンプレートID |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'generating', 'completed', 'failed')) | ジョブステータス |
| output_format | VARCHAR(10) | NOT NULL, CHECK (output_format IN ('pdf', 'xlsx', 'csv')) | 出力形式 |
| filter_conditions | JSONB | NULL | フィルタ・ソート条件 |
| row_count | INTEGER | NULL | 出力行数（生成後に確定） |
| requested_by | VARCHAR(255) | NOT NULL | リクエスト者名 |
| error_message | TEXT | NULL | エラーメッセージ（失敗時） |
| started_at | TIMESTAMPTZ | NULL | 生成開始日時 |
| completed_at | TIMESTAMPTZ | NULL | 生成完了日時 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新日時 |

`filter_conditions` のJSONB構造:

```json
{
  "filters": [
    { "field": "status", "operator": "eq", "value": "completed" },
    { "field": "created_at", "operator": "gte", "value": "2025-01-01T00:00:00Z" }
  ],
  "sort": [
    { "field": "created_at", "direction": "desc" }
  ]
}
```

対応演算子: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `like`

インデックス:
- `ix_report_jobs_status` ON (status)
- `ix_report_jobs_created_at` ON (created_at DESC)
- `ix_report_jobs_template_id` ON (report_template_id)
- `ix_report_jobs_requested_by` ON (requested_by)

---

### report_outputs（帳票出力ファイル）

生成された帳票ファイルのメタデータ。再実行時は新しいレコードを追加する（旧ファイルは保持）。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 出力ID |
| report_job_id | UUID | NOT NULL, FK → report_jobs(id) ON DELETE CASCADE | 所属ジョブID |
| file_name | VARCHAR(255) | NOT NULL | 生成ファイル名 |
| file_path | VARCHAR(1024) | NOT NULL | サーバー上の保存パス |
| mime_type | VARCHAR(100) | NOT NULL | MIMEタイプ |
| file_size | BIGINT | NOT NULL | ファイルサイズ（bytes） |
| checksum | VARCHAR(64) | NOT NULL | SHA-256チェックサム |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 生成日時 |

`mime_type` の値:

| 出力形式 | MIMEタイプ |
|---------|-----------|
| pdf | application/pdf |
| xlsx | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| csv | text/csv |

インデックス:
- `ix_report_outputs_job_id` ON (report_job_id)

---

## C. ステータス遷移

### Import ジョブ

```
uploaded → parsing → validating → importing → completed
    │         │          │            │
    └─────────┴──────────┴────────────┴──→ failed
                                              │
                                              └──→ parsing（再実行時）
```

アプリケーション層でステータス遷移の妥当性を検証する。許可される遷移:

| 現在のステータス | 遷移先 |
|----------------|--------|
| uploaded | parsing |
| parsing | validating, failed |
| validating | importing, failed |
| importing | completed, failed |
| failed | parsing（再実行） |

### Report ジョブ

```
pending → generating → completed
    │         │
    └─────────┴──→ failed
                      │
                      └──→ pending（再実行時）
```

アプリケーション層でステータス遷移の妥当性を検証する。許可される遷移:

| 現在のステータス | 遷移先 |
|----------------|--------|
| pending | generating, failed |
| generating | completed, failed |
| failed | pending（再実行） |

---

## stagingテーブル戦略

### 方針

本番テーブルへの直接INSERTは禁止する。ジョブごとにstagingテーブルを使用し、バリデーション通過後に本番へ反映する。

### ライフサイクル

1. 取り込み開始時: `staging_{job_id_short}` テーブルを動的に作成
2. バリデーション通過データをstagingテーブルへINSERT
3. 本番テーブルへ `INSERT INTO ... SELECT FROM staging_...` で反映（トランザクション内）
4. 取り込み完了後: stagingテーブルをDROP

### 命名規則

```
staging_{job_id の先頭8文字}
```

例: `staging_a1b2c3d4`

### 冪等性の保証

再実行時は以下の手順で冪等性を確保する:

1. 既存のstagingテーブルが存在すればDROP
2. 本番テーブルから当該ジョブで投入されたデータを削除（`job_id` で特定）
3. 新規にstagingテーブルを作成し、再度パース→バリデーション→取り込みを実行

---

## ER図

### Import系

```
┌──────────────┐       ┌──────────────────┐
│  templates   │       │   import_jobs    │
│ (Import用)   │       │──────────────────│
│──────────────│       │ id (PK)          │
│ id (PK)      │◄──────│ template_id (FK) │
│ name         │       │ file_name        │
│ description  │       │ file_path        │
│ target_table │       │ file_size        │
│ column_defs  │       │ file_type        │
│ created_at   │       │ sheet_name       │
│ updated_at   │       │ header_row       │
└──────────────┘       │ status           │
                       │ total_rows       │
                       │ error_count      │
                       │ operator         │
                       │ created_at       │
                       │ updated_at       │
                       └──────┬───────────┘
                              │ 1
                              │
              ┌───────────────┼───────────────┐
              │ *             │ *             │
    ┌─────────▼──────┐  ┌────▼──────────┐   │
    │ column_mappings │  │ import_errors │   │
    │────────────────│  │──────────────│   │
    │ id (PK)        │  │ id (PK)      │   │
    │ job_id (FK)    │  │ job_id (FK)  │   │
    │ source_column  │  │ row_number   │   │
    │ target_column  │  │ column_name  │   │
    │ data_type      │  │ error_type   │   │
    │ nullable       │  │ expected_val │   │
    │ is_unique      │  │ actual_value │   │
    │ pattern        │  │ message      │   │
    │ display_order  │  └──────────────┘   │
    └────────────────┘                     │
                                           │
### Report系                               │
                                           │
┌───────────────────┐                      │
│ report_templates   │                     │
│───────────────────│                      │
│ id (PK)           │                      │
│ name              │                      │
│ description       │                      │
│ report_type       │                      │
│ default_format    │                      │
│ target_resource   │                      │
│ layout_definition │                      │
│ is_active         │                      │
│ created_at        │                      │
│ updated_at        │                      │
└──────┬────────────┘                      │
       │ 1                                 │
       │                                   │
       ├──────────────────┐                │
       │ *                │ *              │
┌──────▼──────────────┐  ┌▼────────────┐  │
│ report_template_    │  │ report_jobs  │  │
│ fields              │  │─────────────│  │
│─────────────────────│  │ id (PK)     │  │
│ id (PK)             │  │ template_id │  │
│ report_template_id  │  │ status      │  │
│ field_key           │  │ output_fmt  │  │
│ label               │  │ filter_cond │  │
│ source_path         │  │ row_count   │  │
│ display_order       │  │ requested_by│  │
│ format_type         │  │ error_msg   │  │
│ format_pattern      │  │ started_at  │  │
│ is_required         │  │ completed_at│  │
│ default_value       │  │ created_at  │  │
│ width               │  │ updated_at  │  │
│ aggregation         │  └──────┬──────┘  │
└─────────────────────┘         │ 1       │
                                │         │
                         ┌──────▼───────┐ │
                         │report_outputs│ │
                         │──────────────│ │
                         │ id (PK)      │ │
                         │ job_id (FK)  │ │
                         │ file_name    │ │
                         │ file_path    │ │
                         │ mime_type    │ │
                         │ file_size    │ │
                         │ checksum     │ │
                         │ created_at   │ │
                         └──────────────┘ │
                                          │
### 共通                                   │
                                          │
                       ┌──────────────────▼┐
                       │   audit_logs      │
                       │──────────────────│
                       │ id (PK)          │
                       │ operator         │
                       │ action           │
                       │ resource_type    │
                       │ resource_id      │
                       │ details          │
                       │ created_at       │
                       └──────────────────┘
```

※ audit_logsはFKを持たず、resource_type + resource_idで論理的に参照する（多態的関連）。
※ Import系・Report系の両方のイベントをresource_typeで区別して記録する。

---

## SQLAlchemyモデル対応

`server/app/infrastructure/database/models.py` に配置する。

### Import系

| テーブル | SQLAlchemyモデルクラス | ドメインエンティティ |
|---------|----------------------|-------------------|
| import_jobs | ImportJobModel | ImportJob |
| column_mappings | ColumnMappingModel | ColumnMapping |
| templates | TemplateModel | Template |
| import_errors | ImportErrorModel | ImportError |

### Report系

| テーブル | SQLAlchemyモデルクラス | ドメインエンティティ |
|---------|----------------------|-------------------|
| report_templates | ReportTemplateModel | ReportTemplate |
| report_template_fields | ReportTemplateFieldModel | ReportTemplateField |
| report_jobs | ReportJobModel | ReportJob |
| report_outputs | ReportOutputModel | ReportOutput |

### 共通

| テーブル | SQLAlchemyモデルクラス | ドメインエンティティ |
|---------|----------------------|-------------------|
| audit_logs | AuditLogModel | AuditLog |

ドメインエンティティとSQLAlchemyモデルは分離する（クリーンアーキテクチャ準拠）。
リポジトリ層でモデル ↔ エンティティの変換を行う。

---

## マイグレーション方針

- Alembicで管理する（`server/alembic/`）
- 自動生成を基本とする: `uv run alembic revision --autogenerate -m "description"`
- 実行: `uv run alembic upgrade head`
- ロールバック: `uv run alembic downgrade -1`
- マイグレーションファイルはバージョン管理に含める

### 初期マイグレーション

以下の順序でテーブルを作成する（FK依存順）:

1. `templates`（他テーブルから参照される）
2. `import_jobs`（templatesを参照）
3. `column_mappings`（import_jobsを参照）
4. `import_errors`（import_jobsを参照）
5. `report_templates`（他Report系テーブルから参照される）
6. `report_template_fields`（report_templatesを参照）
7. `report_jobs`（report_templatesを参照）
8. `report_outputs`（report_jobsを参照）
9. `audit_logs`（FK依存なし）

---

## パフォーマンス考慮

### インデックス戦略

- Import ジョブ一覧: `status` + `created_at DESC` でのフィルタ・ソートが主要クエリ
- Import エラー一覧: `job_id` + `error_type` / `row_number` でのフィルタが主要クエリ
- Report ジョブ一覧: `status` + `created_at DESC` でのフィルタ・ソートが主要クエリ
- Report テンプレート: `name` での検索、`is_active` でのフィルタが主要クエリ
- Report フィールド: `report_template_id` + `display_order` での取得が主要クエリ
- 監査ログ: `created_at DESC` での時系列表示、`operator` / `action` / `resource_type` でのフィルタ

### 大量データ対応

- import_errorsは1ジョブあたり数千〜数万件になりうる → ページネーション必須
- audit_logsは蓄積型 → 古いログのアーカイブ/パーティショニングを拡張時に検討
- stagingテーブルは一時的なため、インデックスは最小限とする

### JSONB活用

- `templates.column_definitions`: Import用列定義の柔軟な格納。GINインデックスは不要（全体取得が主）
- `report_templates.layout_definition`: 帳票レイアウト定義。ページ設定・ヘッダ・フッタ・集計設定を格納。検索対象としないためインデックス不要
- `report_jobs.filter_conditions`: 帳票出力時のフィルタ・ソート条件。ジョブ単位で保持し、再実行時に再利用する
- `audit_logs.details`: 操作の追加情報。検索対象としないためインデックス不要

### 正規化方針

- Import用テンプレートの列定義（`templates.column_definitions`）はJSONBで格納する。列定義の構造が固定的であり、個別検索の必要がないため
- Report用フィールド定義は`report_template_fields`テーブルとして正規化する。フィールド単位での操作（並び替え・個別更新）が想定されるため
- `report_templates.layout_definition`はJSONBとする。レイアウト構造は帳票種別により異なり、正規化のメリットが薄いため

---

## 本番データとのトレーサビリティ方針

### 課題

importの冪等性保証では「job_idで再実行時に削除・再投入する」思想を採用している。
これを成立させるには、本番テーブル側でどのジョブから投入されたデータかを追跡できる必要がある。

### 方針

本番テーブル（import先）には以下のメタカラムを付与することを推奨する:

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| _import_job_id | UUID | NOT NULL | 投入元のimport_job ID |
| _imported_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 投入日時 |

インデックス:
- `ix_{table}_import_job_id` ON (_import_job_id)

これにより:
- 再実行時: `DELETE FROM target_table WHERE _import_job_id = :job_id` で当該ジョブのデータを削除可能
- トレーサビリティ: 任意の本番データがどのジョブで投入されたかを追跡可能
- 帳票出力時: `_import_job_id` でフィルタすることで、特定ジョブの投入データのみを帳票化可能

### 将来拡張

- `_source_row_hash` (VARCHAR(64)): ソースファイルの行ハッシュ。同一データの重複検知に使用
- 業務キー + upsert方針: 業務上の一意キーが定義できる場合、`INSERT ON CONFLICT` によるupsertも検討可能
- これらはMVP後の拡張として位置づける

---

## 設計上の論点・拡張検討事項

| 論点 | 現状の判断 | 将来検討 |
|------|-----------|---------|
| operator → user_id | 現時点ではVARCHAR(255)で操作者名を格納 | 認証機能実装時にUUID FK化 |
| status/action/resource_type のenum化 | VARCHAR + CHECK制約で管理 | PostgreSQL ENUMまたはアプリ層enumへの移行 |
| import_errors/audit_logsの増大 | ページネーションで対応 | パーティショニング・アーカイブの導入 |
| stagingテーブルの動的作成 | ジョブごとにCREATE/DROP | 共有stagingスキーマへの移行を検討可能 |
| templates.column_definitionsの正規化 | JONBで格納（検索不要のため） | 列定義テーブルへの正規化も選択肢 |
| report_outputsの保持期間 | 無期限保持 | 保持期間ポリシー・自動削除の導入 |
