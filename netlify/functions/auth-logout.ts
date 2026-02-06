
import { neon } from "@netlify/neon";

const databaseUrl = process.env.NETLIFY_DATABASE_URL;

export default async (req: Request) => {
  if (req.method !== "POST") {
     return new Response("Method not allowed", { status: 405 });
  }

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  if (databaseUrl) {
    const sql = neon(databaseUrl);
    try {
      await sql`DELETE FROM sessions WHERE token = ${token}`;
    } catch (e) {
      console.error("Error logging out", e);
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  path: "/api/auth/logout",
};
