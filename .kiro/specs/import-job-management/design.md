# 設計書: Importジョブ一覧・詳細・ステータス管理

## 概要

Importサブシステムのジョブ管理画面機能。ジョブ一覧表示・詳細表示・ステータスフィルタ・ダッシュボード画面を提供する。
ジョブの作成・パース・バリデーション・取り込みの実行ロジックは他specで定義済みの前提とする。

依存: shared-foundation, file-upload-parse（ImportJob, JobStatus, IJobRepository, ImportJobService）

## アーキテクチャ

### フロントエンド追加コンポーネント

```
client/app/
  features/import-job/
    hooks/use-job-list.ts        useQuery ベースのジョブ一覧フック
    hooks/use-job-polling.ts     refetchInterval ベースのステータスポーリング
    api/fetch-jobs.ts            ジョブ一覧取得API
    api/fetch-job.ts             ジョブ詳細取得API
    types.ts                     ジョブ関連の型
  widgets/job-table/
    job-table.tsx                TanStack Table ベースのジョブ一覧テーブル
  widgets/job-status-badge/
    job-status-badge.tsx         ステータスバッジ（Import/Report共用）
  routes/home.tsx                ダッシュボード画面
  routes/jobs.$jobId.tsx         ジョブ詳細画面
```

注: バックエンドのジョブ一覧・詳細APIエンドポイント（GET /api/v1/jobs, GET /api/v1/jobs/{job_id}）は
file-upload-parse specで定義済み。本specはフロントエンド画面の実装が主な責務。

## コンポーネントとインターフェース

### フロントエンド

**features/import-job:**
- `useJobList`: useQueryベースのジョブ一覧フック（ステータスフィルタ・ページネーション）
- `useJobPolling`: refetchIntervalベースのステータスポーリングフック
- `fetchJobs`: ジョブ一覧取得API呼び出し
- `fetchJob`: ジョブ詳細取得API呼び出し

**widgets:**
- `JobTable`: TanStack Tableベースのジョブ一覧テーブル（ステータスフィルタ・ページネーション対応）
- `JobStatusBadge`: ステータスバッジ（各ステータスに応じた色分け、Import/Report共用）

**routes:**
- `home.tsx`: ダッシュボード画面。ジョブ一覧テーブルを表示。loaderでジョブ一覧取得
- `jobs.$jobId.tsx`: ジョブ詳細画面。ステータス・ファイル情報・列マッピング・エラー件数を表示。ステータスに応じた操作ボタン。ステータスポーリングで自動更新

## 正確性プロパティ

### Property 1: ジョブ一覧のフィルタリング

*For any* ジョブ一覧のステータスフィルタに対して、返される全ジョブは指定ステータスを持つ

**Validates: Requirements 1.1, 1.2**

## テスト戦略

### テストフレームワーク

- フロントエンド: vitest + @testing-library/react

### プロパティベーステスト

- タグ形式: **Feature: import-job-management, Property {number}: {property_text}**
