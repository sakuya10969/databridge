import { useParams, useNavigate, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ImportJob } from "~/entities/import-job/types";
import { MappingTable } from "~/widgets/mapping-table/mapping-table";
import { TemplateSelector } from "~/widgets/template-selector/template-selector";
import { useColumnMapping } from "~/features/mapping/hooks/use-column-mapping";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function JobMappingPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [templateId, setTemplateId] = useState<string | undefined>();

  const { data: jobRes, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () =>
      apiClient
        .get<ApiResponse<ImportJob>>(`/jobs/${jobId}`)
        .then((r) => r.data),
    enabled: !!jobId,
  });

  const mutation = useColumnMapping(jobId!);
  const job = jobRes?.data;

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (!job) return <p className="text-center py-20 text-gray-500">ジョブが見つかりません</p>;

  const sourceColumns = job.total_rows != null ? [] : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to={`/jobs/${jobId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            ジョブ詳細に戻る
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">列マッピング設定</h1>
        <p className="mt-1 text-sm text-gray-500">ソース列とターゲット列の対応付けを設定します</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">ジョブ情報</CardTitle>
          <CardDescription className="font-mono text-xs">{jobId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
        </CardContent>
      </Card>
    </div>
  );
}
