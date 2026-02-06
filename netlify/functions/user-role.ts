
import { neon } from "@netlify/neon";

const databaseUrl = process.env.NETLIFY_DATABASE_URL;

export default async (req: Request) => {
  if (!databaseUrl) {
    return new Response(JSON.stringify({ error: "Missing Database configuration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(databaseUrl);
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ error: "userId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const roles = await sql`
      SELECT role FROM user_roles 
      WHERE user_id = ${userId} AND role = 'admin'
      LIMIT 1
    `;

    return new Response(JSON.stringify({ isAdmin: roles.length > 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in user-role function:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/user-role",
};
