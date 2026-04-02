# データベース設計

## 概要

PostgreSQLを使用する。全テーブルのPKはUUID（`gen_random_uuid()`）。タイムスタンプはUTC。
マイグレーションはAlembic（`server/alembic/`）で管理する。

staging用テーブルはジョブ実行時に動的に作成し、取り込み完了後に削除する。
本番テーブルへの直接INSERTは禁止し、必ずstagingテーブルを経由する。

---

## テーブル定義

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

### templates（テンプレート）

列マッピング + バリデーション設定の再利用可能な定義。

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

全操作の記録。削除不可（追記のみ）。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | ログID |
| operator | VARCHAR(255) | NOT NULL | 操作者名 |
| action | VARCHAR(50) | NOT NULL | 操作種別 |
| resource_type | VARCHAR(50) | NOT NULL | 対象リソース種別 |
| resource_id | UUID | NOT NULL | 対象リソースID |
| details | JSONB | NULL | 追加情報 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 操作日時 |

`action` の値: `upload`, `parse`, `validate`, `import`, `retry`, `create_template`

`resource_type` の値: `job`, `template`

インデックス:
- `ix_audit_logs_created_at` ON (created_at DESC)
- `ix_audit_logs_operator` ON (operator)
- `ix_audit_logs_resource` ON (resource_type, resource_id)
- `ix_audit_logs_action` ON (action)

---

## ステータス遷移

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

```
┌──────────────┐       ┌──────────────────┐
│  templates   │       │   import_jobs    │
│──────────────│       │──────────────────│
│ id (PK)      │◄──────│ template_id (FK) │
│ name         │       │ id (PK)          │
│ description  │       │ file_name        │
│ target_table │       │ file_path        │
│ column_defs  │       │ file_size        │
│ created_at   │       │ file_type        │
│ updated_at   │       │ sheet_name       │
└──────────────┘       │ header_row       │
                       │ status           │
                       │ total_rows       │
                       │ error_count      │
                       │ operator         │
                       │ created_at       │
                       │ updated_at       │
                       └──────┬───────────┘
                              │ 1
                              │
              ┌───────────────┼───────────────┐
              │ *             │ *             │ *
    ┌─────────▼──────┐  ┌────▼──────────┐  ┌▼──────────────┐
    │ column_mappings │  │ import_errors │  │  audit_logs   │
    │────────────────│  │──────────────│  │──────────────│
    │ id (PK)        │  │ id (PK)      │  │ id (PK)      │
    │ job_id (FK)    │  │ job_id (FK)  │  │ operator     │
    │ source_column  │  │ row_number   │  │ action       │
    │ target_column  │  │ column_name  │  │ resource_type│
    │ data_type      │  │ error_type   │  │ resource_id  │
    │ nullable       │  │ expected_val │  │ details      │
    │ is_unique      │  │ actual_value │  │ created_at   │
    │ pattern        │  │ message      │  └──────────────┘
    │ display_order  │  └──────────────┘
    └────────────────┘
```

※ audit_logsはFKを持たず、resource_type + resource_idで論理的に参照する（多態的関連）。

---

## SQLAlchemyモデル対応

`server/app/infrastructure/database/models.py` に配置する。

| テーブル | SQLAlchemyモデルクラス | ドメインエンティティ |
|---------|----------------------|-------------------|
| import_jobs | ImportJobModel | ImportJob |
| column_mappings | ColumnMappingModel | ColumnMapping |
| templates | TemplateModel | Template |
| import_errors | ImportErrorModel | ImportError |
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
5. `audit_logs`（FK依存なし）

---

## パフォーマンス考慮

### インデックス戦略

- ジョブ一覧: `status` + `created_at DESC` でのフィルタ・ソートが主要クエリ
- エラー一覧: `job_id` + `error_type` / `row_number` でのフィルタが主要クエリ
- 監査ログ: `created_at DESC` での時系列表示、`operator` / `action` でのフィルタ

### 大量データ対応

- import_errorsは1ジョブあたり数千〜数万件になりうる → ページネーション必須
- audit_logsは蓄積型 → 古いログのアーカイブ/パーティショニングを拡張時に検討
- stagingテーブルは一時的なため、インデックスは最小限とする

### JSONB活用

- `templates.column_definitions`: 列定義の柔軟な格納。GINインデックスは不要（全体取得が主）
- `audit_logs.details`: 操作の追加情報。検索対象としないためインデックス不要
