import { useState } from "react";
import { Link } from "react-router";
import { useReportJobList } from "~/features/report-job/hooks/use-report-job-list";
import { ReportJobTable } from "~/widgets/report-job-table/report-job-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { Button } from "~/components/ui/button";

export function meta() {
  return [{ title: "DataBridge - 帳票出力ジョブ" }];
}

const STATUS_OPTIONS = [
  { value: "", label: "全ステータス" },
  { value: "pending", label: "待機中" },
  { value: "generating", label: "生成中" },
  { value: "completed", label: "完了" },
  { value: "failed", label: "失敗" },
];

export default function ReportJobsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useReportJobList({
    status: status || undefined,
    page,
    per_page: 20,
  });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const perPage = 20;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">帳票出力ジョブ</h1>
        <Link to="/report-jobs/new">
          <Button>ジョブ作成</Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">ステータス:</label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <LoadingSpinner />}
      {!isLoading && jobs.length === 0 && (
        <EmptyState
          title="帳票出力ジョブがありません"
          description="ジョブを作成して帳票を出力してください"
        />
      )}
      {jobs.length > 0 && <ReportJobTable jobs={jobs} />}

      {total > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            前へ
          </button>
          <span>
            {page} / {Math.ceil(total / perPage)} ページ（全 {total} 件）
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * perPage >= total}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
