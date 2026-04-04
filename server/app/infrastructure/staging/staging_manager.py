from uuid import UUID

import pandas as pd
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.column_mapping import ColumnMapping


def _staging_table_name(job_id: UUID) -> str:
    return f"staging_{str(job_id).replace('-', '')[:8]}"


_DTYPE_MAP = {
    "int": "BIGINT",
    "float": "DOUBLE PRECISION",
    "str": "TEXT",
    "datetime": "TIMESTAMPTZ",
    "bool": "BOOLEAN",
}


class StagingManager:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_staging_table(self, job_id: UUID, mappings: list[ColumnMapping]) -> None:
        table = _staging_table_name(job_id)
        col_defs = ", ".join(
            f'"{m.target_column}" {_DTYPE_MAP.get(m.data_type, "TEXT")}'
            for m in mappings
        )
        col_defs += f', "_import_job_id" UUID NOT NULL, "_imported_at" TIMESTAMPTZ NOT NULL DEFAULT now()'
        await self._session.execute(text(f'CREATE TABLE IF NOT EXISTS "{table}" ({col_defs})'))

    async def insert_to_staging(
        self, job_id: UUID, df: pd.DataFrame, mappings: list[ColumnMapping]
    ) -> None:
        table = _staging_table_name(job_id)
        col_names = [m.source_column for m in mappings]
        target_names = [m.target_column for m in mappings]

        for _, row in df[col_names].iterrows():
            cols = ", ".join(f'"{t}"' for t in target_names) + ', "_import_job_id"'
            placeholders = ", ".join(f":v{i}" for i in range(len(target_names))) + f", '{job_id}'"
            params = {f"v{i}": row[col] for i, col in enumerate(col_names)}
            await self._session.execute(
                text(f'INSERT INTO "{table}" ({cols}) VALUES ({placeholders})'),
                params,
            )

    async def copy_to_production(self, job_id: UUID, mappings: list[ColumnMapping]) -> None:
        """Override in subclass for real production table copy."""
        # MVP: staging IS the production target — no separate prod table assumed
        pass

    async def drop_staging_table(self, job_id: UUID) -> None:
        table = _staging_table_name(job_id)
        await self._session.execute(text(f'DROP TABLE IF EXISTS "{table}"'))

    async def cleanup_production(self, job_id: UUID) -> None:
        """Remove previously imported rows from production (for retry idempotency)."""
        # MVP: drop staging if exists
        await self.drop_staging_table(job_id)
