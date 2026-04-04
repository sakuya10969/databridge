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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

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
        <h1 className="text-2xl font-bold">ジョブ一覧</h1>
        <Link to="/jobs/upload">
          <Button>ファイルアップロード</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">ステータス:</span>
            <Select
              value={status}
              onValueChange={(v) => { setStatus(v); setPage(1); }}
            >
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
        <EmptyState title="ジョブがありません" description="ファイルをアップロードして開始してください" />
      )}
      {jobs.length > 0 && <JobTable jobs={jobs} />}

      {meta && (
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
            {page} / {Math.ceil(meta.total / meta.per_page)} ページ
            （全 {meta.total} 件）
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * meta.per_page >= meta.total}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
