
import { neon } from '@netlify/neon';

const databaseUrl = process.env.NETLIFY_DATABASE_URL;

async function initDatabase() {
  if (!databaseUrl) {
    console.error("NETLIFY_DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log("Initializing database tables in Neon...");

    // 1. Halls table
    await sql`
      CREATE TABLE IF NOT EXISTS halls (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'hall',
        capacity INTEGER NOT NULL DEFAULT 30,
        building VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("- Halls table ready");

    // 2. Instructors table
    await sql`
      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        department VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("- Instructors table ready");

    // 3. Courses table
    await sql`
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
    `;
    console.log("- Courses table ready");

    // 4. Schedules table
    await sql`
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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_hall_time UNIQUE (hall_id, day_of_week, start_time, academic_year, semester),
        CONSTRAINT unique_instructor_time UNIQUE (instructor_id, day_of_week, start_time, academic_year, semester)
      )
    `;
    console.log("- Schedules table ready");

    // 5. Leads table
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        institution TEXT NOT NULL,
        job_title TEXT NOT NULL,
        student_count TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    console.log("- Leads table ready");

    // 6. User Roles table (if not already there with right structure)
    // We already checked it exists, but let's make sure.
    await sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, role)
      )
    `;
    console.log("- User roles table ready");

    console.log("Database initialization complete!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

initDatabase();
