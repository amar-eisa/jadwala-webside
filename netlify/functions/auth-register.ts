
import { neon } from "@netlify/neon";
import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";

const databaseUrl = process.env.NETLIFY_DATABASE_URL;

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!databaseUrl) {
    return new Response(JSON.stringify({ error: "Missing Database configuration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(databaseUrl);

  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if this is the first user
    const allUsers = await sql`SELECT count(*) as count FROM users`;
    const isFirstUser = parseInt(allUsers[0].count) === 0;

    // Hash password
    const { hash, salt } = hashPassword(password);
    const userId = randomUUID();

    // Insert user
    await sql`
      INSERT INTO users (id, email, password_hash, salt)
      VALUES (${userId}, ${email}, ${hash}, ${salt})
    `;

    // Assign role
    const role = isFirstUser ? 'admin' : 'user';
    await sql`
      INSERT INTO user_roles (user_id, role)
      VALUES (${userId}, ${role})
    `;

    // Create session
    const token = randomUUID(); // Simple token for now. Ideally JWT or signed.
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${token}, ${userId}, ${expiresAt.toISOString()})
    `;

    return new Response(JSON.stringify({ 
      user: { id: userId, email, role },
      session: { access_token: token, expires_at: expiresAt }
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in auth-register:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/auth/register",
};
