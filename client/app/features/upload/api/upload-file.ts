import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ImportJob } from "~/entities/import-job/types";

export async function uploadFile(file: File, operator = "anonymous"): Promise<ImportJob> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("operator", operator);

  const res = await apiClient.post<ApiResponse<ImportJob>>("/jobs/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}
