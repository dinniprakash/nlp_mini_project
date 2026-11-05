from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _resolve_env_file() -> str:
    project_root = Path(__file__).resolve().parents[2]
    backend_root = Path(__file__).resolve().parents[1]
    candidates = [
        project_root / ".env",
        backend_root / ".env",
        Path.cwd() / ".env",
    ]

    for candidate in candidates:
        if candidate.exists():
            return str(candidate)

    return str(backend_root / ".env")


class Settings(BaseSettings):
    app_name: str = "SCSVMV Student Wellness NLP"
    database_url: str = "sqlite:///./wellness.db"
    secret_key: str = "CHANGE-ME-IN-PRODUCTION"
    access_token_minutes: int = 60
    model_path: str = "ml/artifacts/tfidf_logreg.joblib"
    confidence_threshold: float = 0.55
    model_config = SettingsConfigDict(env_file=_resolve_env_file(), extra="ignore")


settings = Settings()
