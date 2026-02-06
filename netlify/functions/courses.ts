import { neon } from "@netlify/neon";

export default async (req: Request) => {
  const sql = neon();
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const courses = await sql("SELECT * FROM courses ORDER BY created_at DESC");
      return new Response(JSON.stringify(courses), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { name, code, department, credit_hours, student_count } = body;
      const result = await sql(
        "INSERT INTO courses (name, code, department, credit_hours, student_count) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, code, department || null, credit_hours || 3, student_count || 0]
      );
      return new Response(JSON.stringify(result[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const { id, name, code, department, credit_hours, student_count } = body;
      const result = await sql(
        "UPDATE courses SET name=$1, code=$2, department=$3, credit_hours=$4, student_count=$5, updated_at=NOW() WHERE id=$6 RETURNING *",
        [name, code, department || null, credit_hours || 3, student_count || 0, id]
      );
      return new Response(JSON.stringify(result[0]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      await sql("DELETE FROM courses WHERE id=$1", [id]);
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
  path: "/api/courses",
};
