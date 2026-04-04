from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class ReportOutput:
    report_job_id: UUID
    file_name: str
    file_path: str
    mime_type: str
    file_size: int
    checksum: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
