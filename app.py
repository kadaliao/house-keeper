import streamlit as st
import requests
from datetime import date
import altair as alt
import pandas as pd

# FastAPI 服务器的 URL
API_URL = "http://127.0.0.1:8000"


def get_locations():
    response = requests.get(f"{API_URL}/locations/")
    if response.status_code == 200:
        return response.json()
    else:
        st.error("无法获取位置列表")
        return []


def add_location():
    st.subheader("添加位置")
    name = st.text_input("位置名称")
    locations = get_locations()
    location_names = {loc["id"]: loc["name"] for loc in locations}
    print(location_names)
    parent_location_id = st.selectbox(
        "父位置（可选）",
        options=[0] + list(location_names.keys()),
        format_func=lambda x: "无" if x == 0 else location_names[x],
        index=0,
    )

    if parent_location_id == -1:
        parent_location_id = None

    if st.button("添加位置"):
        response = requests.post(
            f"{API_URL}/locations/",
            json={"name": name, "parent_id": parent_location_id},
        )
        if response.status_code == 200:
            st.success("位置添加成功！")
        else:
            st.error("位置添加失败！")


def view_locations():
    st.subheader("查看位置列表")
    locations = get_locations()
    location_names = {loc["id"]: loc["name"] for loc in locations}
    for loc in locations:
        loc["parent_id"] = (
            int(loc["parent_id"]) if loc["parent_id"] is not None else None
        )
        loc["parent_name"] = location_names.get(loc["parent_id"], "无")
    df = pd.DataFrame(locations)
    st.table(df[["id", "name", "parent_id", "parent_name"]])


def edit_location(location_id):
    st.subheader("编辑位置")
    location = requests.get(f"{API_URL}/locations/{location_id}").json()
    name = st.text_input("位置名称", value=location["name"])
    locations = get_locations()
    location_names = {loc["id"]: loc["name"] for loc in locations}
    parent_location_id = st.selectbox(
        "父位置（可选）",
        options=[0] + list(location_names.keys()),
        format_func=lambda x: "无" if x == 0 else location_names[x],
        index=location["parent_id"] if location["parent_id"] else 0,
    )

    if parent_location_id == -1:
        parent_location_id = None

    if st.button("保存修改"):
        response = requests.put(
            f"{API_URL}/locations/{location_id}",
            json={"name": name, "parent_id": parent_location_id},
        )
        if response.status_code == 200:
            st.success("位置修改成功！")
        else:
            st.error("位置修改失败！")


def manage_locations():
    st.subheader("管理位置")
    locations = get_locations()
    location_names = {loc["id"]: loc["name"] for loc in locations}
    location_id = st.selectbox(
        "选择位置",
        options=list(location_names.keys()),
        format_func=lambda x: location_names[x],
    )
    edit_location(location_id)


def add_item():
    st.subheader("添加物品")
    name = st.text_input("物品名称")
    locations = get_locations()
    location_names = {loc["id"]: loc["name"] for loc in locations}
    current_location_id = st.selectbox(
        "当前位置",
        options=list(location_names.keys()),
        format_func=lambda x: location_names[x],
    )
    notes = st.text_area("备注")
    type_ids = st.multiselect("类型ID", options=list(range(1, 100)))
    photo = st.file_uploader("上传照片")

    if st.button("添加物品"):
        # 检查位置是否存在
        response = requests.get(f"{API_URL}/locations/{current_location_id}")
        if response.status_code != 200:
            st.error("位置不存在！")
            return

        files = {"photo": photo} if photo else {}
        response = requests.post(
            f"{API_URL}/items/",
            data={
                "name": name,
                "current_location_id": current_location_id,
                "notes": notes,
                "type_ids": type_ids,
            },
            files=files,
        )
        if response.status_code == 200:
            st.success("物品添加成功！")
        else:
            st.error("物品添加失败！")


def view_items():
    st.subheader("查看物品列表")
    response = requests.get(f"{API_URL}/items/")
    if response.status_code == 200:
        items = response.json()
        for item in items:
            st.write(f"ID: {item['id']}")
            st.write(f"名称: {item['name']}")
            st.write(f"当前位置ID: {item['current_location_id']}")
            st.write(f"备注: {item['notes']}")
            st.write(f"照片URL: {item['photo_url']}")
            st.write("---")
    else:
        st.error("无法获取物品列表")


def search_items():
    st.subheader("搜索物品")
    query = st.text_input("搜索关键词")
    locations = get_locations()
    location_names = {loc["id"]: loc["name"] for loc in locations}
    location_id = st.selectbox(
        "位置（可选）",
        options=[-1] + list(location_names.keys()),
        format_func=lambda x: "无" if x == -1 else location_names[x],
    )

    if location_id == -1:
        location_id = None

    if st.button("搜索"):
        params = {"query": query}
        if location_id:
            params["location_id"] = location_id
        response = requests.get(f"{API_URL}/search/", params=params)
        if response.status_code == 200:
            items = response.json()
            for item in items:
                st.write(f"ID: {item['id']}")
                st.write(f"名称: {item['name']}")
                st.write(f"当前位置ID: {item['current_location_id']}")
                st.write(f"备注: {item['notes']}")
                st.write(f"照片URL: {item['photo_url']}")
                st.write("---")
        else:
            st.error("搜索失败！")


def add_reminder():
    st.subheader("添加提醒")
    item_id = st.number_input("物品ID", min_value=1)
    reminder_type = st.text_input("提醒类型")
    reminder_date = st.date_input("提醒日期")
    is_active = st.checkbox("是否激活")

    if st.button("添加提醒"):
        response = requests.post(
            f"{API_URL}/reminders/",
            json={
                "item_id": item_id,
                "reminder_type": reminder_type,
                "reminder_date": str(reminder_date),
                "is_active": is_active,
            },
        )
        if response.status_code == 200:
            st.success("提醒添加成功！")
        else:
            st.error("提醒添加失败！")


def main():
    st.title("物品管理系统")

    menu = [
        "添加位置",
        "查看位置列表",
        "管理位置",
        "添加物品",
        "查看物品列表",
        "搜索物品",
        "添加提醒",
    ]
    choice = st.sidebar.selectbox("菜单", menu)

    if choice == "添加位置":
        add_location()
    elif choice == "查看位置列表":
        view_locations()
    elif choice == "管理位置":
        manage_locations()
    elif choice == "添加物品":
        add_item()
    elif choice == "查看物品列表":
        view_items()
    elif choice == "搜索物品":
        search_items()
    elif choice == "添加提醒":
        add_reminder()


if __name__ == "__main__":
    main()
