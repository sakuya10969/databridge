import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchJob } from "~/features/import-job/api/fetch-job";
import { parseJob } from "~/features/import-job/api/parse-job";
import { fetchJobPreview } from "~/features/import-job/api/fetch-job-preview";
import { MappingTable } from "~/widgets/mapping-table/mapping-table";
import { TemplateSelector } from "~/widgets/template-selector/template-selector";
import { useColumnMapping } from "~/features/mapping/hooks/use-column-mapping";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { BackLink, PageContainer, PageHeader, StatGrid } from "~/shared/ui/page";
import { SectionCard } from "~/shared/ui/section-card";
import { Button } from "~/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function JobMappingPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [templateId, setTemplateId] = useState<string | undefined>();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJob(jobId!),
    enabled: !!jobId,
  });

  const parseMutation = useMutation({
    mutationFn: () =>
      parseJob(jobId!, {
        sheet_name: job?.sheet_name ?? null,
        header_row: job?.header_row ?? 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job", jobId] });
    },
  });

  useEffect(() => {
    if (!jobId || !job) return;
    if (job.total_rows !== null || job.status !== "uploaded") return;
    if (parseMutation.isPending || parseMutation.isSuccess) return;
    parseMutation.mutate();
  }, [jobId, job, parseMutation]);

  const { data: preview, isLoading: isPreviewLoading, error: previewError } = useQuery({
    queryKey: ["job-preview", jobId, job?.sheet_name, job?.header_row],
    queryFn: () => fetchJobPreview(jobId!),
    enabled:
      !!jobId &&
      !!job &&
      (job.total_rows !== null || job.status !== "uploaded" || parseMutation.isSuccess),
  });

  const mutation = useColumnMapping(jobId!);
  const sourceColumns = preview?.columns ?? parseMutation.data?.columns ?? [];

  if (isLoading || parseMutation.isPending || (isPreviewLoading && sourceColumns.length === 0)) {
    return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  }
  if (!job) return <p className="py-20 text-center text-muted-foreground">ジョブが見つかりません</p>;
  if (parseMutation.isError || previewError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">列情報を取得できませんでした</p>
        <p className="mt-1 text-sm text-muted-foreground">
          ファイルのパースまたはプレビュー取得に失敗しました
        </p>
      </div>
    );
  }

  return (
    <PageContainer className="max-w-5xl">
      <BackLink to={`/jobs/${jobId}`}>ジョブ詳細に戻る</BackLink>

      <PageHeader
        eyebrow="Mapping"
        title="列マッピング設定"
        description="ソース列とターゲット列の対応付け、型、制約を設定します。"
      />

      <StatGrid
        items={[
          { label: "ジョブID", value: <span className="font-mono text-xs">{jobId}</span> },
          { label: "検出列数", value: sourceColumns.length },
          { label: "プレビュー行数", value: preview?.rows?.length ?? "-", hint: "取得済みプレビュー" },
        ]}
      />

      <SectionCard title="マッピング設定" description="必要に応じてテンプレートを適用し、列定義を保存します。">
        <div className="space-y-5">
          <TemplateSelector value={templateId} onChange={setTemplateId} />

          <MappingTable
            sourceColumns={sourceColumns}
            isSaving={mutation.isPending}
            onSave={(mappings) => {
              mutation.mutate(
                { job_id: jobId!, mappings, template_id: templateId },
                {
                  onSuccess: () => {
                    toast.success("マッピングを保存しました");
                    navigate(`/jobs/${jobId}/validate`);
                  },
                  onError: (e) => toast.error(String(e)),
                }
              );
            }}
          />
        </div>
      </SectionCard>
    </PageContainer>
  );
}
