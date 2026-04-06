import { useState } from "react";
import { Link } from "react-router";
import { useJobList } from "~/features/import-job/hooks/use-job-list";
import { JobTable } from "~/widgets/job-table/job-table";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { EmptyState } from "~/shared/ui/empty-state";
import { PageContainer, PageHeader, Pagination, StatGrid } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Upload } from "lucide-react";

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
  const completedCount = jobs.filter((job) => job.status === "completed").length;
  const failedCount = jobs.filter((job) => job.status === "failed").length;

  return (
    <PageContainer className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Dashboard"
        title="Import ジョブ一覧"
        description="取り込みジョブの進行状況、件数、失敗有無を高密度に確認できます。"
        actions={
          <Link to="/jobs/upload">
            <Button size="lg" className="gap-2">
            <Upload className="h-4 w-4" />
            ファイルアップロード
            </Button>
          </Link>
        }
      />

      <StatGrid
        items={[
          { label: "表示件数", value: jobs.length, hint: meta ? `総件数 ${meta.total}` : "ジョブ一覧" },
          { label: "完了", value: completedCount, hint: "このページ上の集計" },
          { label: "失敗", value: failedCount, hint: "要再実行の候補" },
          { label: "フィルタ", value: STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? "全ステータス" },
        ]}
      />

      <SectionCard title="フィルタ" description="ステータス単位でジョブを絞り込みます。">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-muted-foreground">ステータス</span>
          <Select
            value={status}
            onValueChange={(v) => { setStatus(v); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-56">
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
            <span className="text-sm text-muted-foreground sm:ml-auto">全 {meta.total} 件</span>
          )}
        </div>
      </SectionCard>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && jobs.length === 0 && (
        <EmptyState title="ジョブがありません" description="ファイルをアップロードして開始してください" />
      )}
      {jobs.length > 0 && (
        <SectionCard title="ジョブ一覧" description="ファイル単位の進行状況とメタデータを表示します。">
          <JobTable jobs={jobs} />
        </SectionCard>
      )}

      {meta && meta.total > meta.per_page && (
        <Pagination
          page={page}
          totalPages={Math.ceil(meta.total / meta.per_page)}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          disablePrev={page === 1}
          disableNext={page * meta.per_page >= meta.total}
        />
      )}
    </PageContainer>
  );
}
