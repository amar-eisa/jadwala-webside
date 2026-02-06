import { neon } from "@netlify/neon";

export default async (req: Request) => {
  const sql = neon();
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const instructors = await sql("SELECT * FROM instructors ORDER BY created_at DESC");
      return new Response(JSON.stringify(instructors), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { name, email, department } = body;
      const result = await sql(
        "INSERT INTO instructors (name, email, department) VALUES ($1, $2, $3) RETURNING *",
        [name, email || null, department || null]
      );
      return new Response(JSON.stringify(result[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const { id, name, email, department } = body;
      const result = await sql(
        "UPDATE instructors SET name=$1, email=$2, department=$3, updated_at=NOW() WHERE id=$4 RETURNING *",
        [name, email || null, department || null, id]
      );
      return new Response(JSON.stringify(result[0]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      await sql("DELETE FROM instructors WHERE id=$1", [id]);
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
  path: "/api/instructors",
};
