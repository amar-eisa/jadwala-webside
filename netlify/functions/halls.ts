import { neon } from "@netlify/neon";

export default async (req: Request) => {
  const sql = neon();
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const halls = await sql("SELECT * FROM halls ORDER BY created_at DESC");
      return new Response(JSON.stringify(halls), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { name, type, capacity, building } = body;
      const result = await sql(
        "INSERT INTO halls (name, type, capacity, building) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, type || "hall", capacity || 30, building || null]
      );
      return new Response(JSON.stringify(result[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const { id, name, type, capacity, building } = body;
      const result = await sql(
        "UPDATE halls SET name=$1, type=$2, capacity=$3, building=$4, updated_at=NOW() WHERE id=$5 RETURNING *",
        [name, type || "hall", capacity || 30, building || null, id]
      );
      return new Response(JSON.stringify(result[0]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      await sql("DELETE FROM halls WHERE id=$1", [id]);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/halls",
};
