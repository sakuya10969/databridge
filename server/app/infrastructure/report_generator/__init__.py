from app.infrastructure.report_generator.csv_generator import CsvReportGenerator
from app.infrastructure.report_generator.excel_generator import ExcelReportGenerator
from app.infrastructure.report_generator.pdf_generator import PdfReportGenerator
from app.domain.interfaces.i_report_generator import IReportGenerator


class ReportGeneratorFactory:
    @staticmethod
    def get(output_format: str) -> IReportGenerator:
        if output_format == "csv":
            return CsvReportGenerator()
        if output_format == "xlsx":
            return ExcelReportGenerator()
        if output_format == "pdf":
            return PdfReportGenerator()
        raise ValueError(f"Unsupported output format: {output_format}")
