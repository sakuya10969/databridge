import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { Template } from "~/entities/template/types";

interface CreateTemplatePayload {
  name: string;
  target_table: string;
  column_definitions: object[];
  description?: string;
  operator?: string;
}

export async function saveTemplate(payload: CreateTemplatePayload): Promise<Template> {
  const res = await apiClient.post<ApiResponse<Template>>("/templates", payload);
  return res.data.data;
}
