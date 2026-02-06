import { neon } from "@netlify/neon";

export default async (req: Request) => {
  const sql = neon();

  try {
    // Create halls table
    await sql(`
      CREATE TABLE IF NOT EXISTS halls (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'hall',
        capacity INTEGER NOT NULL DEFAULT 30,
        building VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create instructors table
    await sql(`
      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        department VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create courses table
    await sql(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        department VARCHAR(255),
        credit_hours INTEGER NOT NULL DEFAULT 3,
        student_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create schedules table
    await sql(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        instructor_id INTEGER NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
        hall_id INTEGER NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
        day_of_week VARCHAR(20) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        semester VARCHAR(50),
        academic_year VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create leads table
    await sql(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        institution VARCHAR(255) NOT NULL,
        job_title VARCHAR(100) NOT NULL,
        student_count VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create user_roles table
    await sql(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create indexes
    await sql(`CREATE INDEX IF NOT EXISTS idx_schedules_day ON schedules(day_of_week)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_schedules_hall ON schedules(hall_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_schedules_instructor ON schedules(instructor_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_schedules_course ON schedules(course_id)`);
    // Ensure unique roles per user
    await sql(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique ON user_roles(user_id, role)`);

    return new Response(JSON.stringify({ success: true, message: "Database tables created successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/db-setup",
};
