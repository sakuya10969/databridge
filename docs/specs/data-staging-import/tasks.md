# 実装計画: staging経由DB取り込み・再実行・Import用テンプレート管理

## 概要

Importサブシステムのデータ投入・再実行・テンプレート管理機能を段階的に実装する。
StagingManager、取り込み・再実行ロジック、Import用テンプレートCRUDのAPI・画面を構築する。
shared-foundation, file-upload-parse, column-mapping-validationが構築済みの前提とする。

## タスク

- [ ] 1. Import用テンプレートを実装する
  - [ ] 1.1 Templateエンティティとリポジトリインターフェースを定義する
    - `server/app/domain/entities/template.py` に Template dataclass を定義
    - `server/app/domain/repositories/i_template_repository.py` に ITemplateRepository ABC を定義
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 1.2 TemplateModel・TemplateRepositoryを実装する
    - `server/app/infrastructure/database/models.py` に TemplateModel を追加定義
    - `server/app/infrastructure/repositories/template_repository.py` に TemplateRepository を実装
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 1.3 テンプレート用マイグレーションを作成する
    - `uv run alembic revision --autogenerate -m "create templates table"` でマイグレーション生成
    - _Requirements: 全体基盤_

  - [ ] 1.4 ImportTemplateServiceを実装する
    - `server/app/application/import_template_service.py` に ImportTemplateService を実装
    - create_template, get_template, list_templates メソッド
    - 名前重複チェック（DuplicateTemplateNameError）、監査ログ記録
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 1.5 テンプレートAPIエンドポイントを実装する
    - `server/app/presentation/templates/__init__.py`, `server/app/presentation/templates/schemas.py`, `server/app/presentation/templates/router.py` を作成
    - GET /api/v1/templates, POST /api/v1/templates, GET /api/v1/templates/{template_id}
    - DI設定追加、ルーター集約に追加
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 1.6 テンプレート保存・取得一致のプロパティテストを作成する
    - **Property 4: テンプレートの保存と取得の一致**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [ ]* 1.7 テンプレート名一意性のプロパティテストを作成する
    - **Property 5: テンプレート名の一意性**
    - **Validates: Requirements 3.4**

- [ ] 2. StagingManagerと取り込み・再実行を実装する
  - [ ] 2.1 StagingManagerを実装する
    - `server/app/infrastructure/staging/__init__.py`, `server/app/infrastructure/staging/staging_manager.py` に StagingManager を実装
    - create_staging_table, insert_to_staging, copy_to_production, drop_staging_table, cleanup_production
    - _Requirements: 1.1, 1.2, 1.6, 2.2_

  - [ ] 2.2 ImportJobServiceにrun_import・retryを追加する
    - `server/app/application/import_job_service.py` に以下を追加
    - `run_import(job_id)`: status→importing遷移・staging作成→投入→本番反映→staging削除・status→completed遷移・監査ログ記録
    - `retry(job_id)`: failedステータスチェック→status→parsing遷移→クリーンアップ→再実行・監査ログ記録
    - _Requirements: 1.1-1.6, 2.1-2.4_

  - [ ]* 2.3 再実行のステータスガードのプロパティテストを作成する
    - **Property 3: 再実行のステータスガード**
    - **Validates: Requirements 2.3**

- [ ] 3. プレゼンテーション層（import/retry）を実装する
  - [ ] 3.1 Import/Retry APIエンドポイントを追加する
    - `server/app/presentation/jobs/router.py` に以下を追加
    - POST /api/v1/jobs/{job_id}/import: 取り込み実行
    - POST /api/v1/jobs/{job_id}/retry: 再実行
    - _Requirements: 1.1-1.6, 2.1-2.4_

  - [ ]* 3.2 Import APIの統合テストを作成する
    - pytest + httpx.AsyncClient で FastAPI TestClient を使用
    - ファイルアップロード→パース→列マッピング→バリデーション→取り込みの一連フローをテスト
    - 再実行フローのテスト
    - テンプレートCRUDのテスト
    - _Requirements: 全Import要件_

- [ ] 4. フロントエンド（template/import/retry）を実装する
  - [ ] 4.1 template feature を実装する
    - `client/app/entities/template/types.ts` に Template 型を定義
    - `client/app/features/template/api/fetch-templates.ts`, `client/app/features/template/api/save-template.ts` を実装
    - `client/app/features/template/hooks/use-templates.ts` に useQuery ベースのフックを実装
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 4.2 import-job feature にrun-import・retry APIを追加する
    - `client/app/features/import-job/api/run-import.ts` に取り込み実行API を実装
    - `client/app/features/import-job/api/retry-job.ts` に再実行API を実装
    - _Requirements: 1.1, 2.1_

  - [ ] 4.3 テンプレート一覧・詳細画面を実装する
    - `client/app/routes/templates.tsx` にテンプレート一覧テーブルと作成フォームを配置
    - `client/app/routes/templates.$templateId.tsx` にテンプレート詳細を表示
    - ルート定義を更新
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. チェックポイント - staging取り込み・再実行・テンプレート管理完了
  - 全テストが通ることを確認する。不明点があればユーザーに質問する。

## 備考

- `*` マーク付きタスクはオプション
- TemplateModelのマイグレーションはimport_jobsのtemplate_id FKに影響するため、順序に注意
