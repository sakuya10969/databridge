import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ImportError } from "~/entities/error/types";

interface FetchErrorsParams {
  jobId: string;
  page?: number;
  per_page?: number;
  column_name?: string;
  error_type?: string;
}

export async function fetchErrors(params: FetchErrorsParams) {
  const { jobId, page = 1, per_page = 20, column_name, error_type } = params;
  const res = await apiClient.get<ApiResponse<ImportError[]>>(`/jobs/${jobId}/errors`, {
    params: { page, per_page, column_name, error_type },
  });
  return res.data;
}
