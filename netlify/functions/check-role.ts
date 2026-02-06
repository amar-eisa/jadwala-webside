import { neon } from "@netlify/neon";

export default async (req: Request) => {
  const sql = neon();
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ isAdmin: false, error: "Missing userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await sql("SELECT role FROM user_roles WHERE user_id = $1 AND role = 'admin' LIMIT 1", [userId]);
    
    const isAdmin = result.length > 0;
    
    return new Response(JSON.stringify({ isAdmin }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking role:", error);
    return new Response(JSON.stringify({ isAdmin: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/check-role",
};
