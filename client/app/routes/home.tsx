import { useState } from "react";
import { Link } from "react-router";
import { useJobList } from "~/features/import-job/hooks/use-job-list";
import { JobTable } from "~/widgets/job-table/job-table";
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
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";

export function meta() {
  return [{ title: "DataBridge - ダッシュボード" }];
}

const STATUS_OPTIONS = [
  { value: "all", label: "全ステータス" },
  { value: "uploaded", label: "アップロード済" },
  { value: "parsing", label: "パース中" },
  { value: "validating", label: "バリデーション中" },
  { value: "importing", label: "取り込み中" },
  { value: "completed", label: "完了" },
  { value: "failed", label: "失敗" },
];

export default function Home() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useJobList(status === "all" ? undefined : status, page);

  const jobs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ジョブ一覧</h1>
          <p className="mt-1 text-sm text-gray-500">取り込みジョブの状況を確認できます</p>
        </div>
        <Link to="/jobs/upload">
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            ファイルアップロード
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">ステータス:</span>
            <Select
              value={status}
              onValueChange={(v) => { setStatus(v); setPage(1); }}
            >
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
            {meta && (
              <span className="ml-auto text-sm text-gray-400">全 {meta.total} 件</span>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && jobs.length === 0 && (
        <EmptyState title="ジョブがありません" description="ファイルをアップロードして開始してください" />
      )}
      {jobs.length > 0 && (
        <Card className="shadow-sm overflow-hidden">
          <JobTable jobs={jobs} />
        </Card>
      )}

      {meta && meta.total > meta.per_page && (
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
            {page} / {Math.ceil(meta.total / meta.per_page)} ページ
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * meta.per_page >= meta.total}
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
