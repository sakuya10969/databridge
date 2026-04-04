import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { runValidation } from "../api/run-validation";
import { fetchErrors } from "../api/fetch-errors";

export function useValidation(jobId: string) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => runValidation(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job", jobId] });
      qc.invalidateQueries({ queryKey: ["errors", jobId] });
    },
  });

  return mutation;
}

export function useErrors(jobId: string, page = 1, columnName?: string, errorType?: string) {
  return useQuery({
    queryKey: ["errors", jobId, page, columnName, errorType],
    queryFn: () =>
      fetchErrors({ jobId, page, column_name: columnName, error_type: errorType }),
  });
}
