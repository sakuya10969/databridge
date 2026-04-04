import pandas as pd

from app.domain.exceptions import ParseError
from app.domain.interfaces.i_file_parser import IFileParser
from app.infrastructure.parser.csv_parser import CsvParser
from app.infrastructure.parser.xlsx_parser import XlsxParser

_csv = CsvParser()
_xlsx = XlsxParser()


class FileParser(IFileParser):
    def get_sheet_names(self, file_path: str) -> list[str]:
        return _xlsx.get_sheet_names(file_path)

    def parse(
        self,
        file_path: str,
        file_type: str,
        sheet_name: str | None,
        header_row: int,
    ) -> tuple[pd.DataFrame, list[str], int]:
        if file_type == "csv":
            return _csv.parse(file_path, file_type, sheet_name, header_row)
        elif file_type == "xlsx":
            return _xlsx.parse(file_path, file_type, sheet_name, header_row)
        else:
            raise ParseError(f"Unsupported file type: {file_type}")
