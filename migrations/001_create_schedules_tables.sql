-- Migration: Create schedules-related tables for Jadwala System
-- This creates the core tables for managing university course schedules

-- Halls/Labs table
CREATE TABLE IF NOT EXISTS halls (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'hall', -- 'hall' or 'lab'
  capacity INTEGER NOT NULL DEFAULT 30,
  building VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructors table
CREATE TABLE IF NOT EXISTS instructors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  department VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  department VARCHAR(255),
  credit_hours INTEGER NOT NULL DEFAULT 3,
  student_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedules table (the main scheduling entries)
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  hall_id INTEGER NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL, -- 'sunday','monday','tuesday','wednesday','thursday'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  semester VARCHAR(50),
  academic_year VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent double-booking of halls
  CONSTRAINT unique_hall_time UNIQUE (hall_id, day_of_week, start_time, academic_year, semester),
  -- Prevent double-booking of instructors
  CONSTRAINT unique_instructor_time UNIQUE (instructor_id, day_of_week, start_time, academic_year, semester)
);

-- Index for faster schedule lookups
CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedules_hall ON schedules(hall_id);
CREATE INDEX IF NOT EXISTS idx_schedules_instructor ON schedules(instructor_id);
CREATE INDEX IF NOT EXISTS idx_schedules_course ON schedules(course_id);
