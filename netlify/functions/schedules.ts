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
        SELECT 
          s.*,
          c.name as course_name,
          c.code as course_code,
          i.name as instructor_name,
          h.name as hall_name,
          h.type as hall_type
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        JOIN instructors i ON s.instructor_id = i.id
        JOIN halls h ON s.hall_id = h.id
      `;

      // Sort by day/time
      const daysOrder: Record<string, number> = { 'sunday': 1, 'monday': 2, 'tuesday': 3, 'wednesday': 4, 'thursday': 5 };
      
      const mappedData = data.sort((a: any, b: any) => {
        const dayA = daysOrder[a.day_of_week] || 99;
        const dayB = daysOrder[b.day_of_week] || 99;
        if (dayA !== dayB) return dayA - dayB;
        return a.start_time.localeCompare(b.start_time);
      });

      return new Response(JSON.stringify(mappedData), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { course_id, instructor_id, hall_id, day_of_week, start_time, end_time, semester, academic_year } = body;

      // 1. Check Hall Conflict
      const hallConflicts = await sql`
        SELECT s.*, c.name as course_name
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        WHERE s.hall_id = ${hall_id}
          AND s.day_of_week = ${day_of_week}
          AND s.start_time < ${end_time}
          AND s.end_time > ${start_time}
          ${semester ? sql`AND s.semester = ${semester}` : sql``}
          ${academic_year ? sql`AND s.academic_year = ${academic_year}` : sql``}
      `;

      if (hallConflicts.length > 0) {
        const conflictCourse = hallConflicts[0].course_name || "Unknown";
        return new Response(
          JSON.stringify({ error: `تعارض في القاعة: القاعة محجوزة لمقرر "${conflictCourse}" في نفس الوقت` }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      // 2. Check Instructor Conflict
      const instConflicts = await sql`
        SELECT s.*, c.name as course_name
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        WHERE s.instructor_id = ${instructor_id}
          AND s.day_of_week = ${day_of_week}
          AND s.start_time < ${end_time}
          AND s.end_time > ${start_time}
          ${semester ? sql`AND s.semester = ${semester}` : sql``}
          ${academic_year ? sql`AND s.academic_year = ${academic_year}` : sql``}
      `;

      if (instConflicts.length > 0) {
         const conflictCourse = instConflicts[0].course_name || "Unknown";
        return new Response(
          JSON.stringify({ error: `تعارض في المحاضر: المحاضر مشغول بمقرر "${conflictCourse}" في نفس الوقت` }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      // 3. Insert
      const [data] = await sql`
        INSERT INTO schedules (
          course_id, instructor_id, hall_id, day_of_week, 
          start_time, end_time, semester, academic_year
        )
        VALUES (
          ${course_id}, ${instructor_id}, ${hall_id}, ${day_of_week}, 
          ${start_time}, ${end_time}, ${semester || null}, ${academic_year || null}
        )
        RETURNING *
      `;

      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return new Response("Missing id", { status: 400 });

      await sql`DELETE FROM schedules WHERE id = ${parseInt(id)}`;

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Error in schedules function:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/schedules",
};