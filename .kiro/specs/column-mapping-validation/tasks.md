# 実装計画: 列マッピング・バリデーション・エラー表示

## 概要

Importサブシステムのデータ品質保証機能を段階的に実装する。
列マッピング設定、panderaバリデータ、エラー保存・表示のAPI・画面を構築する。
shared-foundation, file-upload-parse（ImportJob, ColumnMapping, ImportError, リポジトリ, ImportJobService）が構築済みの前提とする。

## タスク

- [ ] 1. バリデータインターフェースとインフラストラクチャを実装する
  - [ ] 1.1 バリデータインターフェース（ABC）を定義する
    - `server/app/domain/interfaces/i_data_validator.py` に IDataValidator ABC を定義（build_schema, validate）
    - _Requirements: 全体基盤_

  - [ ] 1.2 MappingRepository・ErrorRepositoryを実装する
    - `server/app/infrastructure/repositories/mapping_repository.py` に MappingRepository を実装（bulk_create, list_by_job, delete_by_job）
    - `server/app/infrastructure/repositories/error_repository.py` に ErrorRepository を実装（bulk_create, ページネーション付きlist_by_job, delete_by_job）
    - _Requirements: 1.1, 3.1, 3.2_

  - [ ] 1.3 panderaバリデータを実装する
    - `server/app/infrastructure/validator/__init__.py`, `server/app/infrastructure/validator/schema_builder.py` に ColumnMapping リストから pandera DataFrameSchema を動的構築するロジックを実装
    - `server/app/infrastructure/validator/validator.py` に PanderaValidator を実装（IDataValidator準拠、SchemaErrors からエラー抽出・ImportError構造化）
    - data_type→Column型、nullable、unique、pattern→Check.str_matches
    - _Requirements: 2.1, 2.2_

  - [ ]* 1.4 バリデーションスキーマ構築のプロパティテストを作成する
    - **Property 4: バリデーションスキーマの動的構築と実行**
    - hypothesis でランダムな ColumnMapping 定義とDataFrameを生成し、スキーマが全制約を正しく検証することを確認
    - **Validates: Requirements 2.1**

- [ ] 2. アプリケーション層（mapping/validate）を実装する
  - [ ] 2.1 ImportJobServiceにset_mapping・validateを追加する
    - `server/app/application/import_job_service.py` に以下を追加
    - `set_mapping(job_id, mappings, template_id)`: 列マッピング保存。ソース列名/ターゲット列名の重複チェック。テンプレート指定時はテンプレートから列定義読み込み
    - `validate(job_id)`: status→validating遷移・panderaスキーマ構築・バリデーション実行・エラー保存・error_count更新・監査ログ記録
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.2 列マッピング保存・取得一致のプロパティテストを作成する
    - **Property 1: 列マッピングの保存と取得の一致**
    - hypothesis でランダムな列マッピング定義リストを生成し、保存後の取得結果が元定義と同一であることを検証
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 重複列名拒否のプロパティテストを作成する
    - **Property 3: 重複列名の拒否**
    - hypothesis でソース列名またはターゲット列名に重複を含むマッピングを生成し、保存が拒否されることを検証
    - **Validates: Requirements 1.3**

  - [ ]* 2.4 バリデーションエラー完全性のプロパティテストを作成する
    - **Property 5: バリデーションエラーの完全性**
    - hypothesis でランダムなDataFrameとスキーマを生成し、error_count == 保存エラー件数を検証
    - **Validates: Requirements 2.2, 2.3**

- [ ] 3. プレゼンテーション層（mapping/validate/errors）を実装する
  - [ ] 3.1 Mapping/Validate/Errors用Pydanticスキーマを追加する
    - `server/app/presentation/jobs/schemas.py` に MappingRequest, MappingItem, ValidationResultResponse, ErrorListResponse を追加
    - _Requirements: 全エンドポイント_

  - [ ] 3.2 Mapping/Validate/Errors APIエンドポイントを追加する
    - `server/app/presentation/jobs/router.py` に以下を追加
    - POST /api/v1/jobs/{job_id}/mapping: 列マッピング設定
    - POST /api/v1/jobs/{job_id}/validate: バリデーション実行
    - GET /api/v1/jobs/{job_id}/errors: エラー一覧（ページネーション、列名/エラー種別フィルタ）
    - _Requirements: 1.1-1.3, 2.1-2.6, 3.1-3.2_

  - [ ]* 3.3 エラー一覧フィルタリングのプロパティテストを作成する
    - **Property 6: エラー一覧のフィルタリング**
    - hypothesis でランダムなフィルタ条件を生成し、結果が全て指定条件に一致することを検証
    - **Validates: Requirements 3.1, 3.2**

- [ ] 4. フロントエンド（mapping/validation/errors）を実装する
  - [ ] 4.1 mapping feature を実装する
    - `client/app/features/mapping/api/save-mapping.ts` に列マッピング保存API を実装
    - `client/app/features/mapping/hooks/use-column-mapping.ts` にマッピング管理フックを実装（react-hook-form + Zod）
    - `client/app/features/mapping/types.ts` にマッピング関連の型を定義
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 4.2 validation feature を実装する
    - `client/app/features/validation/api/run-validation.ts` にバリデーション実行API を実装
    - `client/app/features/validation/api/fetch-errors.ts` にエラー一覧取得API を実装
    - `client/app/features/validation/hooks/use-validation.ts` にバリデーション実行・結果管理フックを実装
    - `client/app/features/validation/types.ts` にバリデーション関連の型を定義
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

  - [ ] 4.3 mapping-table・template-selector widget を実装する
    - `client/app/widgets/mapping-table/mapping-table.tsx` に列マッピングテーブルを実装
    - `client/app/widgets/template-selector/template-selector.tsx` にテンプレート選択UIを実装
    - _Requirements: 1.1, 1.2_

  - [ ] 4.4 error-table widget を実装する
    - `client/app/widgets/error-table/error-table.tsx` に TanStack Table ベースのエラー一覧テーブルを実装
    - 列名フィルタ・エラー種別フィルタ、ページネーション対応
    - _Requirements: 3.1, 3.2_

  - [ ] 4.5 列マッピング設定画面を実装する
    - `client/app/routes/jobs.$jobId.mapping.tsx` に mapping-table widget と template-selector widget を配置
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 4.6 バリデーション実行・結果画面を実装する
    - `client/app/routes/jobs.$jobId.validate.tsx` にバリデーション実行ボタンと結果サマリを表示
    - _Requirements: 2.1, 2.3_

  - [ ] 4.7 エラー詳細一覧画面を実装する
    - `client/app/routes/jobs.$jobId.errors.tsx` に error-table widget を配置
    - _Requirements: 3.1, 3.2_

  - [ ] 4.8 ルート定義を更新する
    - `client/app/routes.ts` にmapping/validate/errors系ルートを登録
    - _Requirements: 全体基盤_

- [ ] 5. チェックポイント - 列マッピング・バリデーション・エラー表示完了
  - 全テストが通ることを確認する。不明点があればユーザーに質問する。

## 備考

- `*` マーク付きタスクはオプション
- template-selector widgetはdata-staging-importのテンプレートAPIが必要。テンプレートAPI未実装時はスタブで対応
