export type ReportType = "list" | "single" | "summary";
export type OutputFormat = "pdf" | "xlsx" | "csv";
export type FormatType =
  | "string"
  | "integer"
  | "decimal"
  | "date"
  | "datetime"
  | "currency"
  | "percentage";

export interface ReportTemplateField {
  id: string;
  field_key: string;
  label: string;
  source_path: string;
  display_order: number;
  format_type: FormatType;
  format_pattern: string | null;
  is_required: boolean;
  default_value: string | null;
  width: number | null;
  aggregation: string | null;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  report_type: ReportType;
  default_output_format: OutputFormat;
  target_resource_type: string;
  layout_definition: Record<string, unknown>;
  is_active: boolean;
  fields: ReportTemplateField[];
  created_at: string;
  updated_at: string;
}
