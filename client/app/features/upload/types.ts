import type { ImportJob } from "~/entities/import-job/types";

export interface UploadFilePayload {
  file: File;
  operator?: string;
}

export interface UploadResult {
  job: ImportJob;
}
