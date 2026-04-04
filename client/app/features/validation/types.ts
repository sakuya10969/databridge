import type { ImportError } from "~/entities/error/types";

export interface ValidationResult {
  error_count: number;
}

export interface ErrorListResponse {
  errors: ImportError[];
  total: number;
}
