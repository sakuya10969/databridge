from abc import ABC, abstractmethod

import pandas as pd


class IFileParser(ABC):
    @abstractmethod
    def get_sheet_names(self, file_path: str) -> list[str]: ...

    @abstractmethod
    def parse(
        self,
        file_path: str,
        file_type: str,
        sheet_name: str | None,
        header_row: int,
    ) -> tuple[pd.DataFrame, list[str], int]: ...
