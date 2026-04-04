from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: UUID
    operator: str
    action: str
    resource_type: str
    resource_id: UUID
    details: dict | None
    created_at: datetime
