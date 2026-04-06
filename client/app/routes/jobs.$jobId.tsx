import { useParams, Link } from "react-router";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useJobPolling } from "~/features/import-job/hooks/use-job-polling";
import { runImport } from "~/features/import-job/api/run-import";
import { retryJob } from "~/features/import-job/api/retry-job";
import { JobStatusBadge } from "~/widgets/job-status-badge/job-status-badge";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { BackLink, InfoList, PageContainer, PageHeader } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Button } from "~/components/ui/button";
import { formatDate } from "~/shared/utils/format-date";
import { formatFileSize } from "~/shared/utils/format-file-size";
import {
  FileSpreadsheet,
  User,
  Calendar,
  AlertCircle,
  ChevronLeft,
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
        <p className="text-lg font-medium text-foreground">ジョブが見つかりません</p>
        <p className="mt-1 text-sm text-muted-foreground">指定されたジョブは存在しないか、削除された可能性があります</p>
        <Link to="/" className="mt-4">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
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
    <PageContainer className="max-w-5xl">
      <BackLink to="/">ジョブ一覧に戻る</BackLink>

      <PageHeader
        eyebrow="Import Job"
        title="ジョブ詳細"
        description={jobId}
        actions={<JobStatusBadge status={job.status} />}
      />

      <SectionCard title="ジョブ情報" description="ファイル、操作者、件数、更新日時などの詳細です。">
        <InfoList
          items={infoItems.map((item) => ({
            label: item.label,
            value: item.value,
          }))}
        />
      </SectionCard>

      <SectionCard title="ジョブアクション" description="現在のステータスに応じて実行可能な操作を表示します。">
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
      </SectionCard>
    </PageContainer>
  );
}
