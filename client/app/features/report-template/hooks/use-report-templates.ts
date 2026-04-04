import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchReportTemplates } from "../api/fetch-report-templates";
import { createReportTemplate, deleteReportTemplate, updateReportTemplate } from "../api/save-report-template";

export function useReportTemplates(page = 1) {
  return useQuery({
    queryKey: ["report-templates", page],
    queryFn: () => fetchReportTemplates(page),
  });
}

export function useCreateReportTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReportTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["report-templates"] }),
  });
}

export function useUpdateReportTemplate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: object) => updateReportTemplate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report-templates"] });
      qc.invalidateQueries({ queryKey: ["report-template", id] });
    },
  });
}

export function useDeleteReportTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, operator }: { id: string; operator?: string }) =>
      deleteReportTemplate(id, operator),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["report-templates"] }),
  });
}
