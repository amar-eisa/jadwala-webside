import { neon } from "@netlify/neon";

export default async (req: Request) => {
  const sql = neon();
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const leads = await sql("SELECT * FROM leads ORDER BY created_at DESC");
      return new Response(JSON.stringify(leads), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { full_name, email, phone, institution, job_title, student_count, notes, status } = body;
      const result = await sql(
        "INSERT INTO leads (full_name, email, phone, institution, job_title, student_count, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [full_name, email, phone, institution, job_title, student_count, notes || null, status || 'new']
      );
      return new Response(JSON.stringify(result[0]), {
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

      const result = await sql(
        "UPDATE leads SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
        [status, id]
      );
      
      return new Response(JSON.stringify(result[0]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      await sql("DELETE FROM leads WHERE id=$1", [id]);
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
  path: "/api/leads",
};
