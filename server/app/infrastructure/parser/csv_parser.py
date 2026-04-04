import pandas as pd

from app.domain.exceptions import ParseError
from app.infrastructure.parser.base_parser import BaseParser


class CsvParser(BaseParser):
    def get_sheet_names(self, file_path: str) -> list[str]:
        return []

    def parse(
        self,
        file_path: str,
        file_type: str,
        sheet_name: str | None,
        header_row: int,
    ) -> tuple[pd.DataFrame, list[str], int]:
        try:
            df = pd.read_csv(file_path, header=header_row)
            columns = df.columns.tolist()
            return df, columns, len(df)
        except Exception as e:
            raise ParseError(f"CSV parse failed: {e}") from e
