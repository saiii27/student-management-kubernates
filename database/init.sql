-- Database Initialization for Student Management System
-- Cloud Computing Lab Evaluation - Problem Statement 19

CREATE DATABASE IF NOT EXISTS studentdb;
USE studentdb;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    usn VARCHAR(20) NOT NULL UNIQUE,
    branch VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Student Records for demonstration
INSERT INTO students (name, usn, branch, semester, email)
VALUES 
    ('Rahul Sharma', '1MS21CS001', 'Computer Science & Engineering', 6, 'rahul.cs@example.edu'),
    ('Priya Patel', '1MS21IS045', 'Information Science & Engineering', 6, 'priya.is@example.edu'),
    ('Ananya Rao', '1MS22EC012', 'Electronics & Communication', 4, 'ananya.ec@example.edu'),
    ('Karthik Kumar', '1MS21AI033', 'Artificial Intelligence & Machine Learning', 6, 'karthik.ai@example.edu')
ON DUPLICATE KEY UPDATE name=VALUES(name);
