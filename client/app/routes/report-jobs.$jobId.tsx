import { useParams, Link } from "react-router";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useReportJobPolling } from "~/features/report-job/hooks/use-report-job-polling";
import { generateReport, retryReportJob } from "~/features/report-job/api/report-job-api";
import { JobStatusBadge } from "~/widgets/job-status-badge/job-status-badge";
import { ReportDownloadButton } from "~/widgets/report-download-button/report-download-button";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { BackLink, InfoList, PageContainer, PageHeader } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Button } from "~/components/ui/button";
import { formatDate } from "~/shared/utils/format-date";
import {
  Play,
  RotateCcw,
  FileOutput,
  User,
  Calendar,
  AlertCircle,
  Rows3,
} from "lucide-react";

export function meta() {
  return [{ title: "DataBridge - 帳票ジョブ詳細" }];
}

export default function ReportJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const qc = useQueryClient();
  const { data: job, isLoading, isError } = useReportJobPolling(jobId!);

  const generateMutation = useMutation({
    mutationFn: () => generateReport(jobId!),
    onSuccess: () => {
      toast.success("帳票生成を開始しました");
      qc.invalidateQueries({ queryKey: ["report-job", jobId] });
    },
    onError: (e) => toast.error(String(e)),
  });

  const retryMutation = useMutation({
    mutationFn: () => retryReportJob(jobId!),
    onSuccess: () => {
      toast.success("再実行しました");
      qc.invalidateQueries({ queryKey: ["report-job", jobId] });
    },
    onError: (e) => toast.error(String(e)),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-lg font-medium text-foreground">ジョブが見つかりません</p>
        <Link to="/report-jobs" className="mt-4">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            一覧に戻る
          </Button>
        </Link>
      </div>
    );
  }

  const infoItems = [
    { icon: FileOutput, label: "ジョブID", value: job.id, mono: true },
    { icon: FileOutput, label: "テンプレートID", value: job.report_template_id, mono: true },
    { icon: FileOutput, label: "出力形式", value: job.output_format.toUpperCase() },
    { icon: Rows3, label: "行数", value: job.row_count ?? "-" },
    { icon: User, label: "依頼者", value: job.requested_by },
    { icon: Calendar, label: "作成日時", value: formatDate(job.created_at) },
  ];

  if (job.started_at) {
    infoItems.push({ icon: Calendar, label: "開始日時", value: formatDate(job.started_at) });
  }
  if (job.completed_at) {
    infoItems.push({ icon: Calendar, label: "完了日時", value: formatDate(job.completed_at) });
  }

  return (
    <PageContainer className="max-w-5xl">
      <BackLink to="/report-jobs">一覧に戻る</BackLink>

      <PageHeader
        eyebrow="Report Job"
        title="帳票出力ジョブ詳細"
        description={jobId}
        actions={<JobStatusBadge status={job.status} />}
      />

      <SectionCard title="ジョブ情報" description="テンプレート、出力形式、件数、実行日時を表示します。">
        <div className="space-y-5">
          <InfoList
            items={infoItems.map((item) => ({
              label: item.label,
              value: item.value,
              mono: item.mono,
            }))}
          />

          {job.error_message && (
            <div className="rounded-xl border border-destructive/20 bg-[#fef2f2] px-4 py-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-destructive">エラー</p>
              <p className="text-sm text-destructive">{job.error_message}</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="ジョブアクション" description="ステータスに応じて帳票生成、再実行、ダウンロードが可能です。">
        <div className="flex flex-wrap gap-3">
        {job.status === "pending" && (
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {generateMutation.isPending ? "生成中..." : "帳票生成"}
          </Button>
        )}
        {job.status === "completed" && <ReportDownloadButton jobId={job.id} />}
        {job.status === "failed" && (
          <Button
            variant="outline"
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {retryMutation.isPending ? "再実行中..." : "再実行"}
          </Button>
        )}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
