import { useQuery } from "@tanstack/react-query";
import { fetchReportJob } from "../api/report-job-api";
import type { ReportJobStatus } from "~/entities/report-job/types";

const TERMINAL_STATUSES: ReportJobStatus[] = ["completed", "failed"];

export function useReportJobPolling(jobId: string) {
  return useQuery({
    queryKey: ["report-job", jobId],
    queryFn: () => fetchReportJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || TERMINAL_STATUSES.includes(status)) return false;
      return 3000;
    },
  });
}
