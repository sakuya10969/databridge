from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.audit_log import AuditLog
from app.domain.repositories.i_audit_repository import IAuditRepository
from app.infrastructure.database.models import AuditLogModel


class AuditRepository(IAuditRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, log: AuditLog) -> AuditLog:
        model = AuditLogModel(
            id=log.id,
            operator=log.operator,
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            details=log.details,
            created_at=log.created_at,
        )
        self._session.add(model)
        await self._session.flush()
        return log

    async def list_logs(
        self,
        operator: str | None,
        action: str | None,
        resource_type: str | None,
        page: int,
        per_page: int,
    ) -> tuple[list[AuditLog], int]:
        query = select(AuditLogModel)
        count_query = select(func.count()).select_from(AuditLogModel)

        if operator:
            query = query.where(AuditLogModel.operator == operator)
            count_query = count_query.where(AuditLogModel.operator == operator)
        if action:
            query = query.where(AuditLogModel.action == action)
            count_query = count_query.where(AuditLogModel.action == action)
        if resource_type:
            query = query.where(AuditLogModel.resource_type == resource_type)
            count_query = count_query.where(AuditLogModel.resource_type == resource_type)

        total = (await self._session.execute(count_query)).scalar_one()
        offset = (page - 1) * per_page
        result = await self._session.execute(query.order_by(AuditLogModel.created_at.desc()).offset(offset).limit(per_page))
        models = result.scalars().all()
        return [self._to_entity(m) for m in models], total

    @staticmethod
    def _to_entity(m: AuditLogModel) -> AuditLog:
        return AuditLog(
            id=m.id,
            operator=m.operator,
            action=m.action,
            resource_type=m.resource_type,
            resource_id=m.resource_id,
            details=m.details,
            created_at=m.created_at,
        )
