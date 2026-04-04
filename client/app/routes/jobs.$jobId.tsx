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

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const qc = useQueryClient();
  const { data: job, isLoading } = useJobPolling(jobId!);

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

  if (isLoading) return <LoadingSpinner />;
  if (!job) return <p>ジョブが見つかりません</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ジョブ詳細</h1>
        <JobStatusBadge status={job.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ジョブ情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">ファイル名</dt>
              <dd>{job.file_name}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">ファイルサイズ</dt>
              <dd>{formatFileSize(job.file_size)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">ファイル種別</dt>
              <dd>{job.file_type}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">総行数</dt>
              <dd>{job.total_rows ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">エラー件数</dt>
              <dd>{job.error_count}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">操作者</dt>
              <dd>{job.operator}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">作成日時</dt>
              <dd>{formatDate(job.created_at)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">更新日時</dt>
              <dd>{formatDate(job.updated_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {job.status === "validating" && (
          <Link to={`/jobs/${jobId}/mapping`}>
            <Button variant="outline">マッピング設定</Button>
          </Link>
        )}
        {job.status === "importing" && (
          <Button onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
            {importMutation.isPending ? "実行中..." : "取り込み実行"}
          </Button>
        )}
        {job.status === "failed" && (
          <Button
            variant="outline"
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
          >
            {retryMutation.isPending ? "再実行中..." : "再実行"}
          </Button>
        )}
        {job.error_count > 0 && (
          <Link to={`/jobs/${jobId}/errors`}>
            <Button variant="outline">エラー一覧 ({job.error_count}件)</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
