import os

import pandas as pd

from app.domain.entities.report_template_field import ReportTemplateField
from app.infrastructure.report_generator.base_generator import BaseReportGenerator


class ExcelReportGenerator(BaseReportGenerator):
    def generate(
        self,
        df: pd.DataFrame,
        fields: list[ReportTemplateField],
        output_path: str,
    ) -> tuple[str, int]:
        subset = self._select_columns(df, fields)
        with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
            subset.to_excel(writer, index=False, sheet_name="Report")
        file_size = os.path.getsize(output_path)
        mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return mime, file_size
