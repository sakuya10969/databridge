import { useParams, Link } from "react-router";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useJobPolling } from "~/features/import-job/hooks/use-job-polling";
import { runImport } from "~/features/import-job/api/run-import";
import { retryJob } from "~/features/import-job/api/retry-job";
import { JobStatusBadge } from "~/widgets/job-status-badge/job-status-badge";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDate } from "~/shared/utils/format-date";
import { formatFileSize } from "~/shared/utils/format-file-size";
import {
  ArrowLeft,
  FileSpreadsheet,
  User,
  Calendar,
  AlertCircle,
  Rows3,
  Play,
  RotateCcw,
  Columns3,
} from "lucide-react";

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const qc = useQueryClient();
  const { data: job, isLoading, isError } = useJobPolling(jobId!);
  const fileTypeLabel = job?.file_type?.toUpperCase() ?? "-";

  const importMutation = useMutation({
    mutationFn: () => runImport(jobId!),
    onSuccess: () => {
      toast.success("取り込みを開始しました");
      qc.invalidateQueries({ queryKey: ["job", jobId] });
    },
    onError: (e) => toast.error(String(e)),
  });

  const retryMutation = useMutation({
    mutationFn: () => retryJob(jobId!),
    onSuccess: () => {
      toast.success("再実行を開始しました");
      qc.invalidateQueries({ queryKey: ["job", jobId] });
    },
    onError: (e) => toast.error(String(e)),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-lg font-medium text-gray-700">ジョブが見つかりません</p>
        <p className="mt-1 text-sm text-gray-500">指定されたジョブは存在しないか、削除された可能性があります</p>
        <Link to="/" className="mt-4">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            ジョブ一覧に戻る
          </Button>
        </Link>
      </div>
    );
  }

  const infoItems = [
    { icon: FileSpreadsheet, label: "ファイル名", value: job.file_name },
    { icon: FileSpreadsheet, label: "ファイルサイズ", value: formatFileSize(job.file_size) },
    { icon: FileSpreadsheet, label: "ファイル種別", value: fileTypeLabel },
    { icon: Rows3, label: "総行数", value: job.total_rows ?? "-" },
    { icon: AlertCircle, label: "エラー件数", value: job.error_count },
    { icon: User, label: "操作者", value: job.operator },
    { icon: Calendar, label: "作成日時", value: formatDate(job.created_at) },
    { icon: Calendar, label: "更新日時", value: formatDate(job.updated_at) },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ジョブ詳細</h1>
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
                    <dd className="mt-0.5 text-sm font-medium text-gray-900">{item.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {(job.status === "uploaded" || job.status === "parsing") && (
          <Link to={`/jobs/${jobId}/mapping`}>
            <Button variant="outline" className="gap-2">
              <Columns3 className="h-4 w-4" />
              マッピング設定
            </Button>
          </Link>
        )}
        {job.status === "validating" && (
          <Button
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {importMutation.isPending ? "実行中..." : "取り込み実行"}
          </Button>
        )}
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
        {job.error_count > 0 && (
          <Link to={`/jobs/${jobId}/errors`}>
            <Button variant="outline" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              エラー一覧 ({job.error_count}件)
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
