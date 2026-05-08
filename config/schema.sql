-- 1. Setup Database
CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portfolio_db;

-- 2. Clean up existing tables to avoid column mismatches
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS stats;

-- 3. Create Tables with exact column names
CREATE TABLE projects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(120)  NOT NULL,
  description   VARCHAR(500)  NOT NULL, 
  tags          VARCHAR(255)  NOT NULL,
  github_url    VARCHAR(500)  DEFAULT NULL,
  live_url      VARCHAR(500)  DEFAULT NULL,
  display_order INT           DEFAULT 0,
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(80) NOT NULL,
  category VARCHAR(50) DEFAULT 'general'
);

CREATE TABLE messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  mood        VARCHAR(40)  DEFAULT 'chat',
  message     TEXT         NOT NULL,
  is_read     TINYINT(1)   DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stats (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(60)  NOT NULL,
  value VARCHAR(20)  NOT NULL
);

-- 4. Insert Project Data
-- Note: 'description' and 'tags' now match the table definition exactly
INSERT INTO projects (title, description, tags, github_url, display_order) VALUES
('Bakery Landing Page',
 'A frontend web application that provides a landing page for JVSA Bakery. This is my first project.',
 'CSS,Node.js,Html,JavaScript',
 'https://github.com/V-S-AISHWARYA/OIBSIP_Web-Development-and-Designing_Task-1',
 1),
('Temperature Converter',
 'A temperature converter that convert temperature from celcius to farenheit and vice versa.',
 'Html,Tailwind css,Vanilla Javascript',
 'https://github.com/V-S-AISHWARYA/OIBSIP_Web-Development-and-Designing_Task-3',
 2),
('Job Hunt',
 'A job board platform where jobs can be searched and posted similar to Naukri.',
 'Html, Css, Javascript, Node.js, Database',
 'https://github.com/V-S-AISHWARYA/CODSOFT_task-1',
 3),
('JVSA Quizzee',
 'A platform for making and taking quiz which can be used by students for testing their knowledge and by teachers for making quiz.',
 'Html, Css, Javascript, Node.js, MySQLWorkbench',
 'https://github.com/V-S-AISHWARYA/CODSOFT_task-2',
 4);

INSERT INTO skills (name, category) VALUES
('Node.js',    'backend'),
('Python',     'backend'),
('MySQL',      'database'),
('HTML',       'frontend'),
('CSS',        'frontend'),
('Figma',      'design'),
('JavaScript', 'frontend'),
('Java',       'backend');

INSERT INTO stats (label, value) VALUES
('Hackathons', '20+'),
('Projects',   '10+'),
('Winnings',   '8+');

SELECT * FROM projects;