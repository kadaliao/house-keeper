import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestHealthEndpoints:
    def test_health_check(self, client: TestClient):
        """测试健康检查端点"""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
    
    def test_api_health_check(self, client: TestClient):
        """测试API健康检查端点"""
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "message": "服务正常运行"}
    
    def test_db_health_check(self, client: TestClient, db: Session):
        """测试数据库健康检查端点"""
        response = client.get("/api/v1/health/db")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "message" in data
        assert "database" in data
        assert "timestamp" in data 