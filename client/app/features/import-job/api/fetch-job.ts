import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ImportJob } from "~/entities/import-job/types";

export async function fetchJob(jobId: string): Promise<ImportJob> {
  const res = await apiClient.get<ApiResponse<ImportJob>>(`/jobs/${jobId}`);
  return res.data.data;
}
