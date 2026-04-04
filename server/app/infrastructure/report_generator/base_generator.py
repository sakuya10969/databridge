import pandas as pd

from app.domain.entities.report_template_field import ReportTemplateField
from app.domain.interfaces.i_report_generator import IReportGenerator


class BaseReportGenerator(IReportGenerator):
    def _select_columns(
        self, df: pd.DataFrame, fields: list[ReportTemplateField]
    ) -> pd.DataFrame:
        available = [f for f in fields if f.source_path in df.columns]
        if not available:
            return df
        subset = df[[f.source_path for f in available]].copy()
        subset.columns = [f.label for f in available]
        return subset

    def generate(
        self,
        df: pd.DataFrame,
        fields: list[ReportTemplateField],
        output_path: str,
    ) -> tuple[str, int]:
        raise NotImplementedError
