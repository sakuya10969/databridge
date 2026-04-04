import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ValidationResult } from "../types";

export async function runValidation(jobId: string): Promise<ValidationResult> {
  const res = await apiClient.post<ApiResponse<ValidationResult>>(`/jobs/${jobId}/validate`);
  return res.data.data;
}
