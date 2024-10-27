import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db
from database import Base
from datetime import date, timedelta
import random
import string

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def test_create_item_type(db_session):
    unique_name = f"Test Type {random_string()}"
    response = client.post("/item_types/", json={"name": unique_name})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == unique_name
    assert "id" in data

def test_read_item_types(db_session):
    response = client.get("/item_types/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_create_location(db_session):
    unique_name = f"Test Location {random_string()}"
    response = client.post("/locations/", json={"name": unique_name})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == unique_name
    assert "id" in data

def test_read_locations(db_session):
    response = client.get("/locations/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_create_item(db_session):
    location_response = client.post("/locations/", json={"name": f"Test Location {random_string()}"})
    location_id = location_response.json()["id"]
    type_response = client.post("/item_types/", json={"name": f"Test Type {random_string()}"})
    type_id = type_response.json()["id"]

    item_data = {
        "name": f"Test Item {random_string()}",
        "current_location_id": location_id,
        "notes": "Test notes",
        "type_ids": [type_id]
    }
    response = client.post("/items/", data=item_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == item_data["name"]
    assert data["current_location_id"] == location_id
    assert data["notes"] == "Test notes"
    assert len(data["types"]) == 1
    assert data["types"][0]["id"] == type_id

def test_read_items(db_session):
    response = client.get("/items/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_update_item(db_session):
    location_response = client.post("/locations/", json={"name": f"Test Location {random_string()}"})
    location_id = location_response.json()["id"]
    item_data = {
        "name": f"Test Item {random_string()}",
        "current_location_id": location_id,
        "notes": "Test notes",
        "type_ids": []
    }
    create_response = client.post("/items/", data=item_data)
    item_id = create_response.json()["id"]

    update_data = {
        "name": f"Updated Item {random_string()}",
        "current_location_id": location_id,
        "notes": "Updated notes",
        "type_ids": []
    }
    response = client.put(f"/items/{item_id}", data=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["notes"] == "Updated notes"

def test_delete_item(db_session):
    location_response = client.post("/locations/", json={"name": f"Test Location {random_string()}"})
    location_id = location_response.json()["id"]
    item_data = {
        "name": f"Test Item {random_string()}",
        "current_location_id": location_id,
        "notes": "Test notes",
        "type_ids": []
    }
    create_response = client.post("/items/", data=item_data)
    item_id = create_response.json()["id"]

    response = client.delete(f"/items/{item_id}")
    assert response.status_code == 200

    get_response = client.get(f"/items/{item_id}")
    assert get_response.status_code == 404

def test_search_items(db_session):
    location_response = client.post("/locations/", json={"name": f"Test Location {random_string()}"})
    location_id = location_response.json()["id"]
    unique_name = f"Unique Test Item {random_string()}"
    item_data = {
        "name": unique_name,
        "current_location_id": location_id,
        "notes": "Test notes",
        "type_ids": []
    }
    client.post("/items/", data=item_data)

    response = client.get(f"/search/?query={unique_name}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(item["name"] == unique_name for item in data)

def test_create_reminder(db_session):
    location_response = client.post("/locations/", json={"name": f"Test Location {random_string()}"})
    location_id = location_response.json()["id"]
    item_data = {
        "name": f"Test Item {random_string()}",
        "current_location_id": location_id,
        "notes": "Test notes",
        "type_ids": []
    }
    item_response = client.post("/items/", data=item_data)
    item_id = item_response.json()["id"]

    reminder_data = {
        "item_id": item_id,
        "reminder_type": "Test Reminder",
        "reminder_date": str(date.today() + timedelta(days=7)),
        "is_active": True
    }
    response = client.post("/reminders/", json=reminder_data)
    assert response.status_code == 200
    data = response.json()
    assert data["item_id"] == item_id
    assert data["reminder_type"] == "Test Reminder"
    assert data["is_active"] == True

def test_read_reminders(db_session):
    response = client.get("/reminders/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
