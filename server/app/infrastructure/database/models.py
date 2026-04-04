import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Shared
# ---------------------------------------------------------------------------

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operator: Mapped[str] = mapped_column(String(255), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    resource_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_audit_logs_created_at", "created_at"),
        Index("ix_audit_logs_operator", "operator"),
        Index("ix_audit_logs_resource", "resource_type", "resource_id"),
        Index("ix_audit_logs_action", "action"),
    )


# ---------------------------------------------------------------------------
# Import系
# ---------------------------------------------------------------------------

class TemplateModel(Base):
    __tablename__ = "templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_table: Mapped[str] = mapped_column(String(255), nullable=False)
    column_definitions: Mapped[list] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    import_jobs: Mapped[list["ImportJobModel"]] = relationship("ImportJobModel", back_populates="template")

    __table_args__ = (Index("ix_templates_name", "name"),)


class ImportJobModel(Base):
    __tablename__ = "import_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)
    sheet_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    header_row: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="uploaded")
    total_rows: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    template_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("templates.id"), nullable=True)
    operator: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    template: Mapped["TemplateModel | None"] = relationship("TemplateModel", back_populates="import_jobs")
    column_mappings: Mapped[list["ColumnMappingModel"]] = relationship(
        "ColumnMappingModel", back_populates="job", cascade="all, delete-orphan"
    )
    import_errors: Mapped[list["ImportErrorModel"]] = relationship(
        "ImportErrorModel", back_populates="job", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_import_jobs_status", "status"),
        Index("ix_import_jobs_created_at", "created_at"),
        Index("ix_import_jobs_operator", "operator"),
        Index("ix_import_jobs_template_id", "template_id"),
    )


class ColumnMappingModel(Base):
    __tablename__ = "column_mappings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("import_jobs.id", ondelete="CASCADE"), nullable=False)
    source_column: Mapped[str] = mapped_column(String(255), nullable=False)
    target_column: Mapped[str] = mapped_column(String(255), nullable=False)
    data_type: Mapped[str] = mapped_column(String(20), nullable=False)
    nullable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_unique: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    pattern: Mapped[str | None] = mapped_column(String(512), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    job: Mapped["ImportJobModel"] = relationship("ImportJobModel", back_populates="column_mappings")

    __table_args__ = (
        Index("ix_column_mappings_job_id", "job_id"),
        UniqueConstraint("job_id", "source_column", name="uq_column_mappings_job_source"),
        UniqueConstraint("job_id", "target_column", name="uq_column_mappings_job_target"),
    )


class ImportErrorModel(Base):
    __tablename__ = "import_errors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("import_jobs.id", ondelete="CASCADE"), nullable=False)
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    column_name: Mapped[str] = mapped_column(String(255), nullable=False)
    error_type: Mapped[str] = mapped_column(String(20), nullable=False)
    expected_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    actual_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    job: Mapped["ImportJobModel"] = relationship("ImportJobModel", back_populates="import_errors")

    __table_args__ = (
        Index("ix_import_errors_job_id", "job_id"),
        Index("ix_import_errors_job_error_type", "job_id", "error_type"),
        Index("ix_import_errors_job_row", "job_id", "row_number"),
    )


# ---------------------------------------------------------------------------
# Report系
# ---------------------------------------------------------------------------

class ReportTemplateModel(Base):
    __tablename__ = "report_templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    report_type: Mapped[str] = mapped_column(String(20), nullable=False)
    default_output_format: Mapped[str] = mapped_column(String(10), nullable=False, default="pdf")
    target_resource_type: Mapped[str] = mapped_column(String(255), nullable=False)
    layout_definition: Mapped[dict] = mapped_column(JSONB, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    fields: Mapped[list["ReportTemplateFieldModel"]] = relationship(
        "ReportTemplateFieldModel", back_populates="template", cascade="all, delete-orphan"
    )
    report_jobs: Mapped[list["ReportJobModel"]] = relationship("ReportJobModel", back_populates="template")

    __table_args__ = (
        Index("ix_report_templates_name", "name"),
        Index("ix_report_templates_report_type", "report_type"),
    )


class ReportTemplateFieldModel(Base):
    __tablename__ = "report_template_fields"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("report_templates.id", ondelete="CASCADE"), nullable=False
    )
    field_key: Mapped[str] = mapped_column(String(255), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    source_path: Mapped[str] = mapped_column(String(512), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    format_type: Mapped[str] = mapped_column(String(20), nullable=False, default="string")
    format_pattern: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    default_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    aggregation: Mapped[str | None] = mapped_column(String(20), nullable=True)

    template: Mapped["ReportTemplateModel"] = relationship("ReportTemplateModel", back_populates="fields")

    __table_args__ = (
        Index("ix_report_template_fields_template_id", "report_template_id"),
        Index("ix_report_template_fields_display_order", "report_template_id", "display_order"),
        UniqueConstraint("report_template_id", "field_key", name="uq_report_template_fields_key"),
    )


class ReportJobModel(Base):
    __tablename__ = "report_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("report_templates.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    output_format: Mapped[str] = mapped_column(String(10), nullable=False)
    filter_conditions: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    row_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    requested_by: Mapped[str] = mapped_column(String(255), nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    template: Mapped["ReportTemplateModel"] = relationship("ReportTemplateModel", back_populates="report_jobs")
    outputs: Mapped[list["ReportOutputModel"]] = relationship(
        "ReportOutputModel", back_populates="job", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_report_jobs_status", "status"),
        Index("ix_report_jobs_created_at", "created_at"),
        Index("ix_report_jobs_template_id", "report_template_id"),
        Index("ix_report_jobs_requested_by", "requested_by"),
    )


class ReportOutputModel(Base):
    __tablename__ = "report_outputs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("report_jobs.id", ondelete="CASCADE"), nullable=False
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    job: Mapped["ReportJobModel"] = relationship("ReportJobModel", back_populates="outputs")

    __table_args__ = (Index("ix_report_outputs_job_id", "report_job_id"),)
