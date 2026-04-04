import { useQuery } from "@tanstack/react-query";
import { fetchJob } from "../api/fetch-job";

const POLLING_STATUSES = new Set(["uploading", "parsing", "validating", "importing"]);

export function useJobPolling(jobId: string) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && POLLING_STATUSES.has(status) ? 3000 : false;
    },
  });
}
