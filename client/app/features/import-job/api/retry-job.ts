import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";

export async function retryJob(jobId: string): Promise<void> {
  await apiClient.post<ApiResponse<{ ok: boolean }>>(`/jobs/${jobId}/retry`);
}
