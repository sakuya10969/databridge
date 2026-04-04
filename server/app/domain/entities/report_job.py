from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from app.domain.exceptions import InvalidStatusTransitionError


class ReportJobStatus(str, Enum):
    pending = "pending"
    generating = "generating"
    completed = "completed"
    failed = "failed"


_ALLOWED: dict[ReportJobStatus, set[ReportJobStatus]] = {
    ReportJobStatus.pending: {ReportJobStatus.generating, ReportJobStatus.failed},
    ReportJobStatus.generating: {ReportJobStatus.completed, ReportJobStatus.failed},
    ReportJobStatus.failed: {ReportJobStatus.pending},
    ReportJobStatus.completed: set(),
}


@dataclass
class ReportJob:
    report_template_id: UUID
    output_format: str
    requested_by: str
    id: UUID = field(default_factory=uuid4)
    status: ReportJobStatus = ReportJobStatus.pending
    filter_conditions: dict | None = None
    row_count: int | None = None
    error_message: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def can_transition_to(self, new_status: ReportJobStatus) -> bool:
        return new_status in _ALLOWED.get(self.status, set())

    def transition_to(self, new_status: ReportJobStatus) -> None:
        if not self.can_transition_to(new_status):
            raise InvalidStatusTransitionError(
                f"Cannot transition from {self.status} to {new_status}"
            )
        self.status = new_status
        self.updated_at = datetime.utcnow()
