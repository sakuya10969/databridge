import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { Template } from "~/entities/template/types";

export async function fetchTemplates(page = 1, per_page = 20) {
  const res = await apiClient.get<ApiResponse<Template[]>>("/templates", {
    params: { page, per_page },
  });
  return res.data;
}

export async function fetchTemplate(id: string) {
  const res = await apiClient.get<ApiResponse<Template>>(`/templates/${id}`);
  return res.data.data;
}
