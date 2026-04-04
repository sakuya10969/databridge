import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { ReportTemplate } from "~/entities/report-template/types";

export async function fetchReportTemplates(page = 1, per_page = 20) {
  const res = await apiClient.get<ApiResponse<ReportTemplate[]>>("/report-templates", {
    params: { page, per_page },
  });
  return res.data;
}

export async function fetchReportTemplate(id: string) {
  const res = await apiClient.get<ApiResponse<ReportTemplate>>(`/report-templates/${id}`);
  return res.data.data;
}
