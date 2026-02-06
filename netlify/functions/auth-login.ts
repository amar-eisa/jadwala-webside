
import { neon } from "@netlify/neon";
import { pbkdf2Sync, randomUUID } from "node:crypto";

const databaseUrl = process.env.NETLIFY_DATABASE_URL;

function verifyPassword(password: string, hash: string, salt: string) {
  const verifyHash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
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

    // Get user
    const users = await sql`
      SELECT id, email, password_hash, salt 
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid login credentials" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = users[0];

    // Verify password
    if (!verifyPassword(password, user.password_hash, user.salt)) {
      return new Response(JSON.stringify({ error: "Invalid login credentials" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get Role
    const roles = await sql`SELECT role FROM user_roles WHERE user_id = ${user.id}`;
    const role = roles.length > 0 ? roles[0].role : 'user';

    // Create session
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${token}, ${user.id}, ${expiresAt.toISOString()})
    `;

    return new Response(JSON.stringify({ 
      user: { id: user.id, email: user.email, role },
      session: { access_token: token, expires_at: expiresAt }
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in auth-login:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/auth/login",
};
