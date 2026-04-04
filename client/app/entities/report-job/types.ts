export type ReportJobStatus = "pending" | "generating" | "completed" | "failed";

export interface ReportJob {
  id: string;
  report_template_id: string;
  status: ReportJobStatus;
  output_format: string;
  filter_conditions: Record<string, unknown> | null;
  row_count: number | null;
  requested_by: string;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
