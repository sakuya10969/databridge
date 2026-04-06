export type JobStatus =
  | "uploaded"
  | "parsing"
  | "validating"
  | "importing"
  | "completed"
  | "failed";

export interface ImportJob {
  id: string;
  file_name: string;
  file_size: number;
  file_type?: "csv" | "xlsx";
  sheet_name: string | null;
  header_row: number;
  status: JobStatus;
  total_rows: number | null;
  error_count: number;
  template_id: string | null;
  operator: string;
  created_at: string;
  updated_at: string;
}

export interface ParseResult {
  columns: string[];
  total_rows: number;
  sheet_names: string[];
}

export interface PreviewData {
  columns: string[];
  rows: Record<string, string>[];
}
