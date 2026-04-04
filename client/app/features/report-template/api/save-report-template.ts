import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ReportTemplate } from "~/entities/report-template/types";

export async function createReportTemplate(payload: object): Promise<ReportTemplate> {
  const res = await apiClient.post<ApiResponse<ReportTemplate>>("/report-templates", payload);
  return res.data.data;
}

export async function updateReportTemplate(id: string, payload: object): Promise<ReportTemplate> {
  const res = await apiClient.put<ApiResponse<ReportTemplate>>(`/report-templates/${id}`, payload);
  return res.data.data;
}

export async function deleteReportTemplate(id: string, operator = "anonymous"): Promise<void> {
  await apiClient.delete(`/report-templates/${id}`, { params: { operator } });
}
