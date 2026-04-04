import os

import pandas as pd

from app.domain.entities.report_template_field import ReportTemplateField
from app.infrastructure.report_generator.base_generator import BaseReportGenerator


class CsvReportGenerator(BaseReportGenerator):
    def generate(
        self,
        df: pd.DataFrame,
        fields: list[ReportTemplateField],
        output_path: str,
    ) -> tuple[str, int]:
        subset = self._select_columns(df, fields)
        subset.to_csv(output_path, index=False, encoding="utf-8-sig")
        file_size = os.path.getsize(output_path)
        return "text/csv", file_size
