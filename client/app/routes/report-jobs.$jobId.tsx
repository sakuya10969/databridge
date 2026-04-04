import { useParams, Link } from "react-router";
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
import {
  ArrowLeft,
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
        <p className="text-lg font-medium text-gray-700">ジョブが見つかりません</p>
        <Link to="/report-jobs" className="mt-4">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/report-jobs">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            一覧に戻る
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">帳票出力ジョブ詳細</h1>
          <p className="mt-1 text-sm text-gray-500 font-mono">{jobId}</p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">ジョブ情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-gray-50 p-2">
                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{item.label}</dt>
                    <dd className={`mt-0.5 text-sm font-medium text-gray-900 ${item.mono ? "font-mono text-xs" : ""}`}>
                      {item.value}
                    </dd>
                  </div>
                </div>
              );
            })}
          </dl>

          {job.error_message && (
            <div className="mt-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">エラー</p>
              <p className="text-sm text-red-800">{job.error_message}</p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
