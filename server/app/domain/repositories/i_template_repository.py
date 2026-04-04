from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.template import Template


class ITemplateRepository(ABC):
    @abstractmethod
    async def create(self, template: Template) -> Template: ...

    @abstractmethod
    async def get_by_id(self, template_id: UUID) -> Template | None: ...

    @abstractmethod
    async def get_by_name(self, name: str) -> Template | None: ...

    @abstractmethod
    async def list_templates(self, page: int, per_page: int) -> tuple[list[Template], int]: ...
