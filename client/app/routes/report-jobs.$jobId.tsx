import { useParams } from "react-router";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useReportJobPolling } from "~/features/report-job/hooks/use-report-job-polling";
import { generateReport, retryReportJob } from "~/features/report-job/api/report-job-api";
import { JobStatusBadge } from "~/widgets/job-status-badge/job-status-badge";
import { ReportDownloadButton } from "~/widgets/report-download-button/report-download-button";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDate } from "~/shared/utils/format-date";

export function meta() {
  return [{ title: "DataBridge - 帳票ジョブ詳細" }];
}

export default function ReportJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const qc = useQueryClient();
  const { data: job, isLoading } = useReportJobPolling(jobId!);

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

  if (isLoading) return <LoadingSpinner />;
  if (!job) return <p>ジョブが見つかりません</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">帳票出力ジョブ詳細</h1>
        <JobStatusBadge status={job.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ジョブ情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">ジョブID</dt>
              <dd className="font-mono text-xs">{job.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">テンプレートID</dt>
              <dd className="font-mono text-xs">{job.report_template_id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">出力形式</dt>
              <dd>{job.output_format.toUpperCase()}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">行数</dt>
              <dd>{job.row_count ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">依頼者</dt>
              <dd>{job.requested_by}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">作成日時</dt>
              <dd>{formatDate(job.created_at)}</dd>
            </div>
            {job.started_at && (
              <div>
                <dt className="font-medium text-muted-foreground">開始日時</dt>
                <dd>{formatDate(job.started_at)}</dd>
              </div>
            )}
            {job.completed_at && (
              <div>
                <dt className="font-medium text-muted-foreground">完了日時</dt>
                <dd>{formatDate(job.completed_at)}</dd>
              </div>
            )}
            {job.error_message && (
              <div className="col-span-2">
                <dt className="font-medium text-muted-foreground">エラー</dt>
                <dd className="text-destructive text-xs">{job.error_message}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {job.status === "pending" && (
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? "生成中..." : "帳票生成"}
          </Button>
        )}
        {job.status === "completed" && <ReportDownloadButton jobId={job.id} />}
        {job.status === "failed" && (
          <Button
            variant="outline"
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
          >
            {retryMutation.isPending ? "再実行中..." : "再実行"}
          </Button>
        )}
      </div>
    </div>
  );
}
