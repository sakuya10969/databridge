from dataclasses import dataclass, field
from enum import Enum
from uuid import UUID, uuid4


class ErrorType(str, Enum):
    type_error = "type_error"
    required_error = "required_error"
    unique_error = "unique_error"
    pattern_error = "pattern_error"
    range_error = "range_error"
    unknown_error = "unknown_error"


@dataclass
class ImportError:
    job_id: UUID
    row_number: int
    column_name: str
    error_type: ErrorType
    message: str
    id: UUID = field(default_factory=uuid4)
    expected_value: str | None = None
    actual_value: str | None = None
