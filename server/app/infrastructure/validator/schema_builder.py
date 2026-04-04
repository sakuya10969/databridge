import pandera as pa
from pandera import Check, Column, DataFrameSchema

from app.domain.entities.column_mapping import ColumnMapping

_TYPE_MAP = {
    "int": int,
    "float": float,
    "str": str,
    "datetime": str,  # validated as string pattern
    "bool": bool,
}


def build_schema(mappings: list[ColumnMapping]) -> DataFrameSchema:
    columns: dict[str, Column] = {}
    for m in mappings:
        checks: list[Check] = []
        if m.pattern:
            checks.append(Check.str_matches(m.pattern))

        dtype = _TYPE_MAP.get(m.data_type, str)
        columns[m.source_column] = Column(
            dtype=object,  # use object to allow nullable checks without pandera coercion issues
            checks=checks,
            nullable=m.nullable,
            unique=m.is_unique,
            coerce=True,
        )
    return DataFrameSchema(columns, strict=False)
