import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../api/fetch-jobs";

export function useJobList(status?: string, page = 1) {
  return useQuery({
    queryKey: ["jobs", status, page],
    queryFn: () => fetchJobs(status, page),
  });
}
