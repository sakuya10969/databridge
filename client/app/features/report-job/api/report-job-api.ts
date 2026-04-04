import { apiClient } from "~/shared/api/client";
import type { ReportJob } from "~/entities/report-job/types";
import type { ReportOutput } from "~/entities/report-output/types";

interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

interface CreateReportJobPayload {
  report_template_id: string;
  output_format: string;
  filter_conditions?: Record<string, unknown> | null;
  requested_by: string;
}

export async function createReportJob(
  payload: CreateReportJobPayload
): Promise<ReportJob> {
  const res = await apiClient.post<ApiResponse<ReportJob>>("/report-jobs", payload);
  return res.data.data;
}

export async function fetchReportJobs(params: {
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<{ jobs: ReportJob[]; total: number }> {
  const res = await apiClient.get<ApiResponse<ReportJob[]>>("/report-jobs", {
    params,
  });
  return {
    jobs: res.data.data,
    total: res.data.meta?.total ?? 0,
  };
}

export async function fetchReportJob(jobId: string): Promise<ReportJob> {
  const res = await apiClient.get<ApiResponse<ReportJob>>(`/report-jobs/${jobId}`);
  return res.data.data;
}

export async function generateReport(jobId: string): Promise<ReportOutput> {
  const res = await apiClient.post<ApiResponse<ReportOutput>>(
    `/report-jobs/${jobId}/generate`
  );
  return res.data.data;
}

export async function retryReportJob(jobId: string): Promise<ReportJob> {
  const res = await apiClient.post<ApiResponse<ReportJob>>(
    `/report-jobs/${jobId}/retry`
  );
  return res.data.data;
}

export function getDownloadUrl(jobId: string): string {
  return `/api/v1/report-jobs/${jobId}/download`;
}
