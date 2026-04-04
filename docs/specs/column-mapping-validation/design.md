# 設計書: 列マッピング・バリデーション・エラー表示

## 概要

Importサブシステムのデータ品質保証機能。列マッピング設定、panderaによるバリデーション実行、エラーの保存・表示を提供する。

依存: shared-foundation, file-upload-parse（ImportJob, ColumnMapping, ImportError, IJobRepository, IMappingRepository, IErrorRepository）

## アーキテクチャ

### バックエンド追加コンポーネント

```
server/app/
  domain/interfaces/
    i_data_validator.py      IDataValidator ABC
  infrastructure/validator/
    schema_builder.py        pandera DataFrameSchema動的構築
    validator.py             PanderaValidator（IDataValidator実装）
  infrastructure/repositories/
    mapping_repository.py    MappingRepository具象
    error_repository.py      ErrorRepository具象
  application/
    import_job_service.py    set_mapping, validate メソッド追加
  presentation/jobs/
    router.py                POST /{id}/mapping, POST /{id}/validate, GET /{id}/errors 追加
    schemas.py               MappingRequest, ValidationResultResponse, ErrorListResponse 追加
```

### フロントエンド追加コンポーネント

```
client/app/
  features/mapping/              useColumnMapping hook, save-mapping API
  features/validation/           useValidation hook, run-validation/fetch-errors API
  widgets/mapping-table/         列マッピングテーブル
  widgets/error-table/           エラー一覧テーブル
  widgets/template-selector/     テンプレート選択UI
  routes/jobs.$jobId.mapping.tsx     列マッピング設定画面
  routes/jobs.$jobId.validate.tsx    バリデーション実行・結果画面
  routes/jobs.$jobId.errors.tsx      エラー詳細一覧画面
```

## コンポーネントとインターフェース

### バックエンド

#### domain層

**バリデータインターフェース:**

```python
class IDataValidator(ABC):
    def build_schema(self, mappings: list[ColumnMapping]) -> pa.DataFrameSchema: ...
    def validate(self, df: pd.DataFrame, schema: pa.DataFrameSchema) -> list[ImportError]: ...
```

#### infrastructure層

**PanderaValidator:**
- ColumnMappingからpandera DataFrameSchemaを動的構築
  - data_type → pandera Column型マッピング
  - nullable=false → nullable=False
  - is_unique=true → unique=True
  - pattern → Check.str_matches(pattern)
- SchemaErrorsからエラー抽出・ImportError構造化

#### application層

**ImportJobService追加メソッド:**

```python
async def set_mapping(self, job_id: UUID, mappings: list[MappingInput],
                      template_id: UUID | None) -> None: ...
async def validate(self, job_id: UUID) -> ValidationResult: ...
```

#### presentation層

**追加エンドポイント:**

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/v1/jobs/{job_id}/mapping | 列マッピング設定 |
| POST | /api/v1/jobs/{job_id}/validate | バリデーション実行 |
| GET | /api/v1/jobs/{job_id}/errors | エラー一覧（ページネーション、フィルタ） |

## 正確性プロパティ

### Property 1: 列マッピングの保存と取得の一致

*For any* 有効な列マッピング定義のリストに対して、保存後に取得したColumn_Mappingは元の定義と同一のソース列名・ターゲット列名・データ型・NULL許可・一意制約・パターンを持つ

**Validates: Requirements 1.1**

### Property 2: テンプレート適用による列マッピング生成

*For any* Import_Templateに対して、ジョブへの適用後に生成されるColumn_Mappingはテンプレートのcolumn_definitionsと同一の列定義を持つ

**Validates: Requirements 1.2**

### Property 3: 重複列名の拒否

*For any* ソース列名またはターゲット列名に重複を含む列マッピング定義に対して、保存は拒否されエラーが返される

**Validates: Requirements 1.3**

### Property 4: バリデーションスキーマの動的構築と実行

*For any* Column_Mapping定義とDataFrameの組み合わせに対して、構築されたpandera_Schemaはdata_type・nullable・is_unique・patternの全制約を検証する

**Validates: Requirements 2.1**

### Property 5: バリデーションエラーの完全性

*For any* バリデーション実行結果に対して、Import_Jobのerror_countは保存されたImport_Errorの件数と一致し、総行数はエラー行数＋有効行数と一致する

**Validates: Requirements 2.2, 2.3**

### Property 6: エラー一覧のフィルタリング

*For any* エラー一覧のフィルタ条件（列名・エラー種別）に対して、返される全エラーは指定条件に一致する

**Validates: Requirements 3.1, 3.2**

## テスト戦略

### テストフレームワーク

- バックエンド: pytest + hypothesis
- フロントエンド: vitest + @testing-library/react

### プロパティベーステスト

- ライブラリ: hypothesis（Python）
- タグ形式: **Feature: column-mapping-validation, Property {number}: {property_text}**
