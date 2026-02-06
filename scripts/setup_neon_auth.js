
import { neon } from '@netlify/neon';

const databaseUrl = process.env.NETLIFY_DATABASE_URL;

async function setupAuth() {
  if (!databaseUrl) {
    console.error("NETLIFY_DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log("Setting up Auth tables in Neon...");

    // 1. Users table
    // We use TEXT for id to be compatible with UUIDs but keeping it simple. 
    // Ideally use UUID type but let's stick to what works easily.
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("- Users table ready");

    // 2. Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("- Sessions table ready");

    // 3. Update user_roles if necessary
    // Ensure it can link to users table if we enforce FK. 
    // The existing init_neon.js created it with:
    // CREATE TABLE IF NOT EXISTS user_roles (user_id UUID NOT NULL, role TEXT NOT NULL, ...)
    // It didn't have a FK constraint. We can leave it as is or add it.
    // For safety, let's leave it loose or add it if we are sure.
    // Let's just ensure it exists.
    await sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, role)
      )
    `;
    console.log("- User roles table ready");

    console.log("Auth setup complete!");
  } catch (error) {
    console.error("Error setting up auth:", error);
    process.exit(1);
  }
}

setupAuth();
