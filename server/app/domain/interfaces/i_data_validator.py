from abc import ABC, abstractmethod

import pandas as pd

from app.domain.entities.column_mapping import ColumnMapping
from app.domain.entities.import_error import ImportError


class IDataValidator(ABC):
    @abstractmethod
    def build_schema(self, mappings: list[ColumnMapping]) -> object: ...

    @abstractmethod
    async def validate(
        self, df: pd.DataFrame, mappings: list[ColumnMapping]
    ) -> list[ImportError]: ...
