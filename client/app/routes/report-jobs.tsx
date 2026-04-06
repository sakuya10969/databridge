import { useState } from "react";
import { Link } from "react-router";
import { useReportJobList } from "~/features/report-job/hooks/use-report-job-list";
import { ReportJobTable } from "~/widgets/report-job-table/report-job-table";
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
import { Plus } from "lucide-react";

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
  const completedCount = jobs.filter((job) => job.status === "completed").length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Report Jobs"
        title="帳票出力ジョブ"
        description="帳票出力ジョブの状況を一覧で確認できます。"
        actions={
          <Link to="/report-jobs/new">
            <Button className="gap-2">
            <Plus className="h-4 w-4" />
            ジョブ作成
            </Button>
          </Link>
        }
      />

      <StatGrid
        items={[
          { label: "表示件数", value: jobs.length, hint: `総件数 ${total}` },
          { label: "完了", value: completedCount },
          { label: "フィルタ", value: STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? "全ステータス" },
        ]}
      />

      <SectionCard title="フィルタ" description="ステータス単位で帳票ジョブを絞り込みます。">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <span className="text-sm font-medium text-muted-foreground">ステータス</span>
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
              <span className="text-sm text-muted-foreground lg:ml-auto">全 {total} 件</span>
            )}
          </div>
      </SectionCard>

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
        <SectionCard title="ジョブ一覧" description="帳票ジョブの進捗と出力形式を表示します。">
          <ReportJobTable jobs={jobs} />
        </SectionCard>
      )}

      {total > perPage && (
        <Pagination
          page={page}
          totalPages={Math.ceil(total / perPage)}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          disablePrev={page === 1}
          disableNext={page * perPage >= total}
        />
      )}
    </PageContainer>
  );
}
