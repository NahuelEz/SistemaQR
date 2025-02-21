-- Create database
CREATE DATABASE IF NOT EXISTS meal_registration_db;
USE meal_registration_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'employee') DEFAULT 'employee',
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Menus table
CREATE TABLE IF NOT EXISTS menus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'snack', 'dinner') NOT NULL,
    main_dish VARCHAR(255) NOT NULL,
    alternative_dish VARCHAR(255),
    dessert VARCHAR(255),
    special_diet_options JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_menu (date, meal_type)
);

-- Menu selections table
CREATE TABLE IF NOT EXISTS menu_selections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    menu_id INT NOT NULL,
    selected_dish ENUM('main', 'alternative') DEFAULT 'main',
    special_requirements TEXT,
    selection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    week_start_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    UNIQUE KEY unique_selection (user_id, menu_id),
    INDEX idx_week_start (week_start_date),
    INDEX idx_user_week (user_id, week_start_date)
);

-- Weekly menu selection status table
CREATE TABLE IF NOT EXISTS weekly_selection_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    week_start_date DATE NOT NULL,
    selection_complete BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_week_selection (user_id, week_start_date),
    INDEX idx_incomplete_selections (selection_complete, reminder_sent)
);

-- Meal registrations table
CREATE TABLE IF NOT EXISTS meal_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    menu_id INT NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'snack', 'dinner') NOT NULL,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);

-- Create default admin user
INSERT INTO users (username, password, email, role)
VALUES (
    'admin',
    '$2a$10$JmQ5V8YTJ1bB1zHMZV.Hy.Z5X0z1yQ1czgBXkTBUCPA.z7TFvPmFG', -- password: admin123
    'admin@example.com',
    'admin'
) ON DUPLICATE KEY UPDATE id=id;
