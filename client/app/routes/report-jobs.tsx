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
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

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
  const perPage = 20;
  const { data, isLoading } = useReportJobList({
    status: status === "all" ? undefined : status,
    page,
    per_page: perPage,
  });

  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">帳票出力ジョブ</h1>
          <p className="mt-1 text-sm text-gray-500">帳票出力ジョブの状況を確認できます</p>
        </div>
        <Link to="/report-jobs/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            ジョブ作成
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">ステータス:</span>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-48">
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
            {total > 0 && (
              <span className="ml-auto text-sm text-gray-400">全 {total} 件</span>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      )}
      {!isLoading && jobs.length === 0 && (
        <EmptyState
          title="帳票出力ジョブがありません"
          description="ジョブを作成して帳票を出力してください"
        />
      )}
      {jobs.length > 0 && (
        <Card className="shadow-sm overflow-hidden">
          <ReportJobTable jobs={jobs} />
        </Card>
      )}

      {total > perPage && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </Button>
          <span className="text-gray-600 tabular-nums">
            {page} / {Math.ceil(total / perPage)} ページ
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * perPage >= total}
            className="gap-1"
          >
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
