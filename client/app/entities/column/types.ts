export type DataType = "int" | "float" | "str" | "datetime" | "bool";

export interface Column {
  name: string;
  data_type?: DataType;
}

export interface ColumnMapping {
  id: string;
  job_id: string;
  source_column: string;
  target_column: string;
  data_type: DataType;
  nullable: boolean;
  is_unique: boolean;
  pattern: string | null;
  display_order: number;
}
