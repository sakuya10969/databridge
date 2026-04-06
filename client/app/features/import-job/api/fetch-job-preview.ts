import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { PreviewData } from "~/entities/import-job/types";

export async function fetchJobPreview(jobId: string, limit = 50): Promise<PreviewData> {
  const res = await apiClient.get<ApiResponse<PreviewData>>(`/jobs/${jobId}/preview`, {
    params: { limit },
  });
  return res.data.data;
}
