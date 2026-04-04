import { useQuery } from "@tanstack/react-query";
import { fetchReportJobs } from "../api/report-job-api";

export function useReportJobList(params: {
  status?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ["report-jobs", params],
    queryFn: () => fetchReportJobs(params),
  });
}
