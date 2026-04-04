import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTemplates } from "../api/fetch-templates";
import { saveTemplate } from "../api/save-template";

export function useTemplates(page = 1) {
  return useQuery({
    queryKey: ["templates", page],
    queryFn: () => fetchTemplates(page),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}
