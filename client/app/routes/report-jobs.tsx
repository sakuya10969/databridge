import { useState } from "react";
import { Link } from "react-router";
import { useReportJobList } from "~/features/report-job/hooks/use-report-job-list";
import { ReportJobTable } from "~/widgets/report-job-table/report-job-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";

export function meta() {
  return [{ title: "DataBridge - 帳票出力ジョブ" }];
}

const STATUS_OPTIONS = [
  { value: "all", label: "全ステータス" },
  { value: "pending", label: "待機中" },
  { value: "generating", label: "生成中" },
  { value: "completed", label: "完了" },
  { value: "failed", label: "失敗" },
];

export default function ReportJobsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useReportJobList({
    status: status === "all" ? undefined : status,
    page,
    per_page: 20,
  });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const perPage = 20;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">帳票出力ジョブ</h1>
        <Link to="/report-jobs/new">
          <Button>ジョブ作成</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">ステータス:</span>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && <LoadingSpinner />}
      {!isLoading && jobs.length === 0 && (
        <EmptyState
          title="帳票出力ジョブがありません"
          description="ジョブを作成して帳票を出力してください"
        />
      )}
      {jobs.length > 0 && <ReportJobTable jobs={jobs} />}

      {total > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            前へ
          </Button>
          <span>
            {page} / {Math.ceil(total / perPage)} ページ（全 {total} 件）
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * perPage >= total}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
