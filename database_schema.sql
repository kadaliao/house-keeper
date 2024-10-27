-- 物品表
CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    current_location_id INTEGER,
    added_date DATE,
    notes TEXT,
    photo_url VARCHAR(255),
    FOREIGN KEY (current_location_id) REFERENCES locations(id)
);

-- 位置表
CREATE TABLE locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES locations(id)
);

-- 位置历史表
CREATE TABLE location_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    from_location_id INTEGER,
    to_location_id INTEGER,
    change_date DATETIME,
    reason VARCHAR(100),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (from_location_id) REFERENCES locations(id),
    FOREIGN KEY (to_location_id) REFERENCES locations(id)
);

-- 特殊物品信息表（如书籍、药品、电子产品）
CREATE TABLE special_item_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    key VARCHAR(50),
    value TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- 提醒表
CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    reminder_type VARCHAR(50),
    reminder_date DATE,
    is_active BOOLEAN,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
