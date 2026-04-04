import { apiClient } from "~/shared/api/client";
import type { ApiResponse } from "~/shared/api/types";
import type { SaveMappingPayload } from "../types";

export async function saveMapping(payload: SaveMappingPayload): Promise<void> {
  const { job_id, mappings, template_id } = payload;
  await apiClient.post<ApiResponse<{ ok: boolean }>>(`/jobs/${job_id}/mapping`, {
    mappings: mappings.map((m) => ({
      ...m,
      pattern: m.pattern || null,
    })),
    template_id: template_id || null,
  });
}
