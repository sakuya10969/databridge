import pandas as pd

from app.domain.interfaces.i_file_parser import IFileParser


class BaseParser(IFileParser):
    def get_sheet_names(self, file_path: str) -> list[str]:
        return []

    def parse(
        self,
        file_path: str,
        file_type: str,
        sheet_name: str | None,
        header_row: int,
    ) -> tuple[pd.DataFrame, list[str], int]:
        raise NotImplementedError
