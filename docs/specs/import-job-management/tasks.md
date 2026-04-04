# 実装計画: Importジョブ一覧・詳細・ステータス管理

## 概要

Importサブシステムのジョブ管理画面機能を実装する。
ジョブ一覧テーブル・詳細画面・ステータスバッジ・ダッシュボード画面を構築する。
shared-foundation, file-upload-parse（ImportJob, JobStatus, ジョブAPI）が構築済みの前提とする。

注: バックエンドのジョブ一覧・詳細APIはfile-upload-parse specで実装済み。本specはフロントエンド画面が主な責務。

## タスク

- [ ] 1. import-job feature を実装する
  - [ ] 1.1 import-job feature のAPI・hooksを実装する
    - `client/app/features/import-job/api/fetch-jobs.ts` にジョブ一覧取得API を実装
    - `client/app/features/import-job/api/fetch-job.ts` にジョブ詳細取得API を実装
    - `client/app/features/import-job/hooks/use-job-list.ts` に useQuery ベースのジョブ一覧フックを実装（ステータスフィルタ・ページネーション）
    - `client/app/features/import-job/hooks/use-job-polling.ts` に refetchInterval ベースのステータスポーリングフックを実装
    - `client/app/features/import-job/types.ts` にジョブ関連の型を定義
    - _Requirements: 1.1, 1.2, 2.1, 3.2_

- [ ] 2. ジョブ管理 widget を実装する
  - [ ] 2.1 job-table widget を実装する
    - `client/app/widgets/job-table/job-table.tsx` に TanStack Table ベースのジョブ一覧テーブルを実装
    - ステータスフィルタ・ページネーション対応
    - _Requirements: 1.1, 1.2_

  - [ ] 2.2 job-status-badge widget を実装する
    - `client/app/widgets/job-status-badge/job-status-badge.tsx` にステータスバッジを実装
    - 各ステータスに応じた色分け（Import/Report共用で汎用的に実装）
    - _Requirements: 3.2_

- [ ] 3. ジョブ管理画面を実装する
  - [ ] 3.1 ダッシュボード画面（home.tsx）を実装する
    - `client/app/routes/home.tsx` を更新し、ジョブ一覧テーブル（job-table widget）を表示
    - loader でジョブ一覧を取得、ステータスフィルタ・ページネーション対応
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 3.2 ジョブ詳細画面を実装する
    - `client/app/routes/jobs.$jobId.tsx` にジョブ詳細情報を表示
    - loader でジョブ詳細取得、ステータスに応じた操作ボタン表示
    - preview-table widget でプレビュー表示（パース済みの場合）
    - ステータスポーリング（useJobPolling）で進捗自動更新
    - _Requirements: 2.1, 2.2, 3.2, 3.3_

  - [ ] 3.3 ルート定義を更新する
    - `client/app/routes.ts` にhome, jobs.$jobId ルートを登録（app-layout 適用）
    - _Requirements: 全体基盤_

- [ ] 4. チェックポイント - Importジョブ管理画面完了
  - 全テストが通ることを確認する。不明点があればユーザーに質問する。

## 備考

- 本specはフロントエンド画面が主な責務。バックエンドAPIはfile-upload-parse specで実装済み
- job-status-badge widgetはreport-generation specでも再利用される
