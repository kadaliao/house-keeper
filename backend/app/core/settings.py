import os
from typing import List, Optional, Union, Any

from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "House Keeper"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = []
    ALLOW_ALL_ORIGINS: bool = False

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            # 字符串形式的多个URL，以逗号分隔
            origins = [i.strip() for i in v.split(",")]
            # 检查是否包含通配符
            return [o for o in origins if o != "*"]
        elif isinstance(v, list):
            # 列表形式的多个URL
            return [o for o in v if o != "*"]
        return []

    @field_validator("ALLOW_ALL_ORIGINS", mode="before")
    def check_allow_all_origins(cls, v: Any, values: dict) -> bool:
        # 检查BACKEND_CORS_ORIGINS中是否有通配符
        cors_origins = values.data.get("BACKEND_CORS_ORIGINS", [])
        if isinstance(cors_origins, str) and "*" in cors_origins:
            return True
        if isinstance(cors_origins, list) and "*" in cors_origins:
            return True
        # 保留现有值
        return v if isinstance(v, bool) else False

    # Database
    DATABASE_URL: PostgresDsn = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/house_keeper")
    
    # JWT Token
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings() 