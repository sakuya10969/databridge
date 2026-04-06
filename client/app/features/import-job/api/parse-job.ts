import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ParseResult } from "~/entities/import-job/types";

interface ParseJobPayload {
  sheet_name?: string | null;
  header_row?: number;
}

export async function parseJob(jobId: string, payload: ParseJobPayload): Promise<ParseResult> {
  const res = await apiClient.post<ApiResponse<ParseResult>>(`/jobs/${jobId}/parse`, {
    sheet_name: payload.sheet_name ?? null,
    header_row: payload.header_row ?? 0,
  });
  return res.data.data;
}
