import uuid

import pandas as pd
import pandera as pa

from app.domain.entities.column_mapping import ColumnMapping
from app.domain.entities.import_error import ErrorType, ImportError
from app.domain.interfaces.i_data_validator import IDataValidator
from app.infrastructure.validator.schema_builder import build_schema


class PanderaValidator(IDataValidator):
    def build_schema(self, mappings: list[ColumnMapping]):
        return build_schema(mappings)

    async def validate(
        self, df: pd.DataFrame, mappings: list[ColumnMapping]
    ) -> list[ImportError]:
        job_id = mappings[0].job_id if mappings else None
        schema = build_schema(mappings)

        errors: list[ImportError] = []
        try:
            schema.validate(df, lazy=True)
        except pa.errors.SchemaErrors as exc:
            for _, row in exc.failure_cases.iterrows():
                error_type = _map_error_type(row.get("check", ""))
                row_num = row.get("index", -1)
                column = row.get("column", "")
                actual = row.get("failure_case", None)
                errors.append(
                    ImportError(
                        id=uuid.uuid4(),
                        job_id=job_id,
                        row_number=int(row_num) + 1 if row_num is not None else -1,
                        column_name=str(column),
                        error_type=error_type,
                        actual_value=str(actual) if actual is not None else None,
                        message=f"Validation failed: {row.get('check', '')} on column {column}",
                    )
                )
        return errors


def _map_error_type(check_name: str) -> ErrorType:
    check = str(check_name).lower()
    if "not_nullable" in check or "required" in check:
        return ErrorType.required_error
    if "unique" in check:
        return ErrorType.unique_error
    if "str_matches" in check or "pattern" in check:
        return ErrorType.pattern_error
    if "dtype" in check or "type" in check:
        return ErrorType.type_error
    return ErrorType.unknown_error
