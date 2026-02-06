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
    // GET: List courses
    if (req.method === "GET") {
      const data = await sql`
        SELECT * FROM courses 
        ORDER BY created_at DESC
      `;

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST: Create course
    if (req.method === "POST") {
      const body = await req.json();
      const { name, code, department, credit_hours, student_count } = body;
      
      const [data] = await sql`
        INSERT INTO courses (name, code, department, credit_hours, student_count)
        VALUES (${name}, ${code}, ${department || null}, ${credit_hours || 3}, ${student_count || 0})
        RETURNING *
      `;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // PUT: Update course
    if (req.method === "PUT") {
      const body = await req.json();
      const { id, name, code, department, credit_hours, student_count } = body;
      
      const [data] = await sql`
        UPDATE courses 
        SET 
          name = ${name}, 
          code = ${code}, 
          department = ${department || null}, 
          credit_hours = ${credit_hours || 3}, 
          student_count = ${student_count || 0},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (!data) {
        return new Response(JSON.stringify({ error: "Course not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // DELETE: Delete course
    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return new Response("Missing id", { status: 400 });

      await sql`DELETE FROM courses WHERE id = ${parseInt(id)}`;

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Error in courses function:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/courses",
};