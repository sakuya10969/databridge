export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ErrorBody {
  code: string;
  message: string;
  details: ErrorDetail[];
}

export interface ErrorResponse {
  error: ErrorBody;
}
