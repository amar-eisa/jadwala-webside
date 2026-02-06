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

  try {
    if (req.method === "GET") {
      const data = await sql`
        SELECT * FROM halls 
        ORDER BY created_at DESC
      `;

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { name, type, capacity, building } = body;
      
      const [data] = await sql`
        INSERT INTO halls (name, type, capacity, building)
        VALUES (${name}, ${type || "hall"}, ${capacity || 30}, ${building || null})
        RETURNING *
      `;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const { id, name, type, capacity, building } = body;
      
      const [data] = await sql`
        UPDATE halls 
        SET 
          name = ${name}, 
          type = ${type || "hall"}, 
          capacity = ${capacity || 30}, 
          building = ${building || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (!data) {
        return new Response(JSON.stringify({ error: "Hall not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return new Response("Missing id", { status: 400 });

      await sql`DELETE FROM halls WHERE id = ${parseInt(id)}`;

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Error in halls function:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/halls",
};