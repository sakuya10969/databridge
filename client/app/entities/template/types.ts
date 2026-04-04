export interface ColumnDefinition {
  source_column: string;
  target_column: string;
  data_type: string;
  nullable: boolean;
  unique: boolean;
  pattern: string | null;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  target_table: string;
  column_definitions: ColumnDefinition[];
  created_at: string;
  updated_at: string;
}
