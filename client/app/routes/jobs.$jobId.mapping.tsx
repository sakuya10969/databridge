import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ImportJob } from "~/entities/import-job/types";
import { MappingTable } from "~/widgets/mapping-table/mapping-table";
import { TemplateSelector } from "~/widgets/template-selector/template-selector";
import { useColumnMapping } from "~/features/mapping/hooks/use-column-mapping";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useState } from "react";

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

  if (isLoading) return <LoadingSpinner />;
  if (!job) return <p>ジョブが見つかりません</p>;

  const sourceColumns = job.total_rows != null ? [] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">列マッピング設定</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ジョブID: {jobId}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
