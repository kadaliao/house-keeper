import requests
import random
from datetime import date, timedelta
import json

# 定义基础URL
BASE_URL = "http://localhost:8000"

# 创建位置的函数
def create_location(name, parent_id=None):
    data = {"name": name, "parent_id": parent_id}
    response = requests.post(f"{BASE_URL}/locations/", json=data)
    if response.status_code == 200:
        return response.json()["id"]
    return None

# 创建物品类型的函数
def create_item_type(name):
    response = requests.post(f"{BASE_URL}/item_types/", json={"name": name})
    if response.status_code == 200:
        return response.json()["id"]
    else:
        print(f"创建物品类型 '{name}' 失败。状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        try:
            error_detail = response.json()
            print(f"错误详情: {json.dumps(error_detail, ensure_ascii=False, indent=2)}")
        except json.JSONDecodeError:
            print("无法解析响应内容为JSON")
    return None

# 添加物品的函数
def add_item(item):
    response = requests.post(f"{BASE_URL}/items/", json=item)
    return response.status_code == 200

def get_item_type(name):
    response = requests.get(f"{BASE_URL}/item_types/", params={"name": name})
    if response.status_code == 200:
        types = response.json()
        if types:
            return types[0]["id"]
    return None

def create_or_get_item_type(name):
    existing_id = get_item_type(name)
    if existing_id:
        print(f"物品类型 '{name}' 已存在，ID: {existing_id}")
        return existing_id
    
    response = requests.post(f"{BASE_URL}/item_types/", json={"name": name})
    if response.status_code == 200:
        new_id = response.json()["id"]
        print(f"成功创建物品类型: {name}, ID: {new_id}")
        return new_id
    else:
        print(f"创建物品类型 '{name}' 失败。状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        try:
            error_detail = response.json()
            print(f"错误详情: {json.dumps(error_detail, ensure_ascii=False, indent=2)}")
        except json.JSONDecodeError:
            print("无法解析响应内容为JSON")
    return None

# 生成测试位置数据
locations = {
    "客厅": None,
    "厨房": None,
    "卧室": None,
    "客厅-电视柜": "客厅",
    "客厅-沙发": "客厅",
    "厨房-冰箱": "厨房",
    "厨房-橱柜": "厨房",
    "卧室-衣柜": "卧室",
    "卧室-书桌": "卧室"
}

# 创建位置并存储ID
location_ids = {}
for location, parent in locations.items():
    parent_id = location_ids.get(parent) if parent else None
    location_id = create_location(location, parent_id)
    if location_id:
        location_ids[location] = location_id

# 生成测试物品类型数据
item_types = ["电子产品", "厨具", "家具", "衣物", "书籍", "食品", "清洁用品"]
type_ids = {}
for item_type in item_types:
    print(f"尝试创建或获取物品类型: {item_type}")
    type_id = create_or_get_item_type(item_type)
    if type_id:
        type_ids[item_type] = type_id
    else:
        print(f"创建或获取物品类型失败: {item_type}")

# 生成测试物品数据
test_items = [
    {"name": "电视机", "type_ids": [type_ids.get("电子产品")], "current_location_id": location_ids.get("客厅-电视柜"), "notes": "55寸智能电视"},
    {"name": "微波炉", "type_ids": [type_ids.get("厨具")], "current_location_id": location_ids.get("厨房-橱柜"), "notes": "700W功率"},
    {"name": "沙发", "type_ids": [type_ids.get("家具")], "current_location_id": location_ids.get("客厅-沙发"), "notes": "三人座皮沙发"},
    {"name": "冬季外套", "type_ids": [type_ids.get("衣物")], "current_location_id": location_ids.get("卧室-衣柜"), "notes": "黑色羽绒服"},
    {"name": "编程书籍", "type_ids": [type_ids.get("书籍")], "current_location_id": location_ids.get("卧室-书桌"), "notes": "Python进阶指南"},
    {"name": "牛奶", "type_ids": [type_ids.get("食品")], "current_location_id": location_ids.get("厨房-冰箱"), "notes": "保质期一周"},
    {"name": "吸尘器", "type_ids": [type_ids.get("清洁用品")], "current_location_id": location_ids.get("客厅"), "notes": "无线手持式"}
]

# 添加测试物品
for item in test_items:
    if None in item["type_ids"] or item["current_location_id"] is None:
        print(f"跳过添加物品：{item['name']}，因为类型或位置ID缺失")
        continue
    if add_item(item):
        print(f"成功添加物品：{item['name']}")
    else:
        print(f"添加物品失败：{item['name']}")

print("测试数据添加完成")
