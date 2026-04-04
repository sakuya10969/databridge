import { Button } from "~/components/ui/button";
import { getDownloadUrl } from "~/features/report-job/api/report-job-api";

export function ReportDownloadButton({ jobId }: { jobId: string }) {
  return (
    <a href={getDownloadUrl(jobId)} download>
      <Button variant="outline">ダウンロード</Button>
    </a>
  );
}
