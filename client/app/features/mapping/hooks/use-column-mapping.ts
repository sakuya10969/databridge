import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMapping } from "../api/save-mapping";
import type { SaveMappingPayload } from "../types";

export function useColumnMapping(jobId: string) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SaveMappingPayload) => saveMapping(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job", jobId] });
    },
  });

  return mutation;
}
