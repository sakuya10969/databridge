import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "../api/upload-file";
import type { ImportJob } from "~/entities/import-job/types";

export function useFileUpload(onSuccess?: (job: ImportJob) => void) {
  return useMutation({
    mutationFn: ({ file, operator }: { file: File; operator?: string }) =>
      uploadFile(file, operator),
    onSuccess,
  });
}
