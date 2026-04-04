export interface ReportOutput {
  id: string;
  report_job_id: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  checksum: string;
  created_at: string;
}
