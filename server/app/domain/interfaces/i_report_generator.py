from abc import ABC, abstractmethod

import pandas as pd

from app.domain.entities.report_template_field import ReportTemplateField


class IReportGenerator(ABC):
    @abstractmethod
    def generate(
        self,
        df: pd.DataFrame,
        fields: list[ReportTemplateField],
        output_path: str,
    ) -> tuple[str, int]:
        """Returns (mime_type, file_size)."""
        ...
