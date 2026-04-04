from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg://app:app@localhost:5432/data_platform"
    UPLOAD_DIR: str = "/tmp/databridge/uploads"
    REPORT_OUTPUT_DIR: str = "/tmp/databridge/reports"
    MAX_FILE_SIZE: int = 52_428_800  # 50MB in bytes


settings = Settings()
