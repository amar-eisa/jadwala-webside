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
        SELECT * FROM leads 
        ORDER BY created_at DESC
      `;

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { full_name, email, phone, institution, job_title, student_count, notes, status } = body;
      
      const [data] = await sql`
        INSERT INTO leads (full_name, email, phone, institution, job_title, student_count, notes, status)
        VALUES (${full_name}, ${email}, ${phone}, ${institution}, ${job_title}, ${student_count}, ${notes || null}, ${status || 'new'})
        RETURNING *
      `;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const { id, status } = body;
      
      if (!id) {
         return new Response(JSON.stringify({ error: "ID required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      const [data] = await sql`
        UPDATE leads 
        SET 
          status = ${status}, 
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (!data) {
        return new Response(JSON.stringify({ error: "Lead not found" }), {
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

      await sql`DELETE FROM leads WHERE id = ${id}`;

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Error in leads function:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/leads",
};