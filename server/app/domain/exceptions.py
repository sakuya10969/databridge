class DomainError(Exception):
    """Base domain exception."""


class ParseError(DomainError):
    """File parse failed."""


class ValidationError(DomainError):
    """Validation configuration error."""


class DataImportError(DomainError):
    """DB import failed."""


class JobNotFoundError(DomainError):
    """Import job not found."""


class InvalidStatusTransitionError(DomainError):
    """Invalid status transition."""


class TemplateNotFoundError(DomainError):
    """Template not found."""


class DuplicateTemplateNameError(DomainError):
    """Duplicate template name."""


class ReportGenerationError(DomainError):
    """Report generation failed."""


class ReportOutputNotFoundError(DomainError):
    """Report output file not found."""


class DuplicateFieldKeyError(DomainError):
    """Duplicate field key."""


class InvalidFilterError(DomainError):
    """Invalid filter condition."""
