import openpyxl
import pandas as pd

from app.domain.exceptions import ParseError
from app.infrastructure.parser.base_parser import BaseParser


class XlsxParser(BaseParser):
    def get_sheet_names(self, file_path: str) -> list[str]:
        try:
            wb = openpyxl.load_workbook(file_path, read_only=True)
            return wb.sheetnames
        except Exception as e:
            raise ParseError(f"Failed to read xlsx sheet names: {e}") from e

    def parse(
        self,
        file_path: str,
        file_type: str,
        sheet_name: str | None,
        header_row: int,
    ) -> tuple[pd.DataFrame, list[str], int]:
        try:
            df = pd.read_excel(
                file_path,
                sheet_name=sheet_name or 0,
                header=header_row,
                engine="openpyxl",
            )
            columns = df.columns.tolist()
            return df, columns, len(df)
        except Exception as e:
            raise ParseError(f"XLSX parse failed: {e}") from e


class FileParser(CsvParser if False else XlsxParser):
    """Dispatcher that selects parser based on file_type."""
