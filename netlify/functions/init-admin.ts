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
    // Attempt to insert the admin role. 
    // If it conflicts (due to unique index), we do nothing (it's already there).
    // Using ON CONFLICT DO NOTHING requires the constraint to be named or specified.
    // Since we just added idx_user_roles_unique (user_id, role), we can rely on it.
    
    // Note: neon/postgres syntax for ON CONFLICT
    await sql(`
      INSERT INTO user_roles (user_id, role) 
      VALUES ($1, 'admin') 
      ON CONFLICT (user_id, role) DO NOTHING
    `, [userId]);
    
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
