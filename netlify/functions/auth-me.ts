
import { neon } from "@netlify/neon";

const databaseUrl = process.env.NETLIFY_DATABASE_URL;

export default async (req: Request) => {
  if (!databaseUrl) {
    return new Response(JSON.stringify({ error: "Missing Database configuration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const sql = neon(databaseUrl);

  try {
    const sessions = await sql`
      SELECT s.user_id, s.expires_at, u.email
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;

    if (sessions.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
    }

    const session = sessions[0];
    
    // Get roles
    const roles = await sql`SELECT role FROM user_roles WHERE user_id = ${session.user_id}`;
    const role = roles.length > 0 ? roles[0].role : 'user';

    return new Response(JSON.stringify({ 
      user: { id: session.user_id, email: session.email, role },
      session: { access_token: token, expires_at: session.expires_at }
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in auth-me:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/auth/me",
};
