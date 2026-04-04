from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from app.domain.exceptions import InvalidStatusTransitionError


class JobStatus(str, Enum):
    uploaded = "uploaded"
    parsing = "parsing"
    validating = "validating"
    importing = "importing"
    completed = "completed"
    failed = "failed"


_ALLOWED_TRANSITIONS: dict[JobStatus, set[JobStatus]] = {
    JobStatus.uploaded: {JobStatus.parsing},
    JobStatus.parsing: {JobStatus.validating, JobStatus.failed},
    JobStatus.validating: {JobStatus.importing, JobStatus.failed},
    JobStatus.importing: {JobStatus.completed, JobStatus.failed},
    JobStatus.failed: {JobStatus.parsing},
    JobStatus.completed: set(),
}


@dataclass
class ImportJob:
    file_name: str
    file_path: str
    file_size: int
    file_type: str
    operator: str
    id: UUID = field(default_factory=uuid4)
    sheet_name: str | None = None
    header_row: int = 0
    status: JobStatus = JobStatus.uploaded
    total_rows: int | None = None
    error_count: int = 0
    template_id: UUID | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def can_transition_to(self, new_status: JobStatus) -> bool:
        return new_status in _ALLOWED_TRANSITIONS.get(self.status, set())

    def transition_to(self, new_status: JobStatus) -> None:
        if not self.can_transition_to(new_status):
            raise InvalidStatusTransitionError(
                f"Cannot transition from {self.status} to {new_status}"
            )
        self.status = new_status
        self.updated_at = datetime.utcnow()
