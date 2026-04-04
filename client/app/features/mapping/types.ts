import type { DataType } from "~/entities/column/types";

export interface MappingFormItem {
  source_column: string;
  target_column: string;
  data_type: DataType;
  nullable: boolean;
  is_unique: boolean;
  pattern: string;
}

export interface SaveMappingPayload {
  job_id: string;
  mappings: MappingFormItem[];
  template_id?: string;
}
