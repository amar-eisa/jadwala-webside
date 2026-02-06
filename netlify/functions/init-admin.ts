import { neon } from "@netlify/neon";

export default async (req: Request) => {
  const sql = neon();
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: "Missing userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Check if the user already has the admin role
    const existing = await sql("SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'admin'", [userId]);
    
    if (existing.length === 0) {
      await sql("INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')", [userId]);
    }
    
    return new Response(JSON.stringify({ success: true, message: "Admin role assigned" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error initializing admin:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/init-admin",
};
