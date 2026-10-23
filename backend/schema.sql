-- SQL Database Schema for Echelon Connect
CREATE DATABASE IF NOT EXISTS echelon_connect;
USE echelon_connect;

-- Table 1: Students Table
-- Stores student account details and accommodation details
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  register_number VARCHAR(30) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL,
  year INT NOT NULL,                                       -- 1, 2, 3, or 4
  accommodation_type ENUM('day_scholar', 'hosteller') NOT NULL,
  hostel_block VARCHAR(20) NULL,                          -- required for hostellers
  room_number VARCHAR(20) NULL                            -- required for hostellers
);

-- Table 2: Staff Table
-- Stores staff account details (Advisors, HODs, Wardens)
CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(50) NULL,                            -- NULL for wardens
  role ENUM('advisor', 'hod', 'warden') NOT NULL
);

-- Table 3: Requests Table
-- Stores all submitted leave, OD, and outpass requests with their current approval status
CREATE TABLE IF NOT EXISTS requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,

  request_type ENUM(
    'leave_request',            -- Day Scholar
    'od_request',                -- Day Scholar AND Hosteller
    'leave_letter',              -- Hosteller
    'leave_outpass_letter'       -- Hosteller
  ) NOT NULL,

  from_datetime DATETIME NOT NULL,
  to_datetime DATETIME NOT NULL,
  out_time TIME NULL,           -- only for Leave and Outpass Letter
  in_time TIME NULL,            -- only for Leave and Outpass Letter

  reason TEXT NOT NULL,

  department VARCHAR(50) NOT NULL,                          -- copied from student at submit time
  year INT NOT NULL,                                         -- copied from student at submit time
  accommodation_type ENUM('day_scholar','hosteller') NOT NULL, -- copied from student at submit time
  hostel_block VARCHAR(20) NULL,                    -- copied from student at submit time
  room_number VARCHAR(20) NULL,                     -- copied from student at submit time

  advisor_choice VARCHAR(50) NOT NULL,                       -- a specific advisor's id/name, or 'all'

  status ENUM(
    'pending_advisor',
    'pending_hod',
    'pending_warden',           -- only used for hostellers
    'approved',
    'rejected'
  ) DEFAULT 'pending_advisor',

  hidden_from_student BOOLEAN DEFAULT FALSE,
  hidden_from_advisor BOOLEAN DEFAULT FALSE,
  hidden_from_hod BOOLEAN DEFAULT FALSE,
  hidden_from_warden BOOLEAN DEFAULT FALSE,

  qr_token VARCHAR(255) UNIQUE NULL,
  qr_image_path VARCHAR(255) NULL,
  qr_expired TINYINT DEFAULT 0,
  qr_expired_at DATETIME NULL,
  scanned_at DATETIME NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
