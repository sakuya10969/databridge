import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ImportJob } from "~/entities/import-job/types";

export async function fetchJobs(status?: string, page = 1, per_page = 20) {
  const res = await apiClient.get<ApiResponse<ImportJob[]>>("/jobs", {
    params: { status, page, per_page },
  });
  return res.data;
}
