from datetime import datetime
import os
import shutil
import uuid
from typing import Any

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.api import deps
from app.core.settings import settings

router = APIRouter()

# 确保上传目录存在
os.makedirs("uploads/images", exist_ok=True)


@router.post("/images/")
async def upload_image(
    *,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    上传图片文件.
    """
    # 检查文件类型
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail="只允许上传图片文件"
        )
    
    # 生成唯一文件名
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_location = f"uploads/images/{unique_filename}"
    
    # 保存文件
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 返回文件URL（相对路径）
    file_url = f"/uploads/images/{unique_filename}"
    
    return {"filename": unique_filename, "url": file_url} 