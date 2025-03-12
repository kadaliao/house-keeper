from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse

from app.api.api import api_router
from app.core.settings import settings

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS or getattr(settings, "ALLOW_ALL_ORIGINS", False):
    if getattr(settings, "ALLOW_ALL_ORIGINS", False):
        # 如果设置了允许所有源，则使用通配符
        # 注意：使用通配符时不能设置allow_credentials=True
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,  # 使用通配符时必须为False
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        # 使用指定的源列表
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
else:
    # 如果没有具体配置，允许所有源（仅用于开发环境）
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # 使用通配符时必须为False
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", include_in_schema=False)
def main():
    return RedirectResponse(url="/docs")

@app.get("/health", include_in_schema=True)
def root_health_check():
    """根路径健康检查端点，用于系统监控"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 