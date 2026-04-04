export type ErrorType =
  | "type_error"
  | "required_error"
  | "unique_error"
  | "pattern_error"
  | "range_error"
  | "unknown_error";

export interface ImportError {
  id: string;
  row_number: number;
  column_name: string;
  error_type: ErrorType;
  expected_value: string | null;
  actual_value: string | null;
  message: string;
}
