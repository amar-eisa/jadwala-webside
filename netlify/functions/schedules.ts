import { neon } from "@netlify/neon";

export default async (req: Request) => {
  const sql = neon();
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const schedules = await sql(`
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
        ORDER BY
          CASE s.day_of_week
            WHEN 'sunday' THEN 1
            WHEN 'monday' THEN 2
            WHEN 'tuesday' THEN 3
            WHEN 'wednesday' THEN 4
            WHEN 'thursday' THEN 5
          END,
          s.start_time
      `);
      return new Response(JSON.stringify(schedules), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { course_id, instructor_id, hall_id, day_of_week, start_time, end_time, semester, academic_year } = body;

      // Check for hall conflict
      const hallConflict = await sql(
        `SELECT s.*, c.name as course_name FROM schedules s
         JOIN courses c ON s.course_id = c.id
         WHERE s.hall_id = $1 AND s.day_of_week = $2
         AND s.start_time < $4 AND s.end_time > $3
         AND ($5::varchar IS NULL OR s.semester = $5)
         AND ($6::varchar IS NULL OR s.academic_year = $6)`,
        [hall_id, day_of_week, start_time, end_time, semester || null, academic_year || null]
      );

      if (hallConflict.length > 0) {
        return new Response(
          JSON.stringify({ error: `تعارض في القاعة: القاعة محجوزة لمقرر "${hallConflict[0].course_name}" في نفس الوقت` }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check for instructor conflict
      const instructorConflict = await sql(
        `SELECT s.*, c.name as course_name FROM schedules s
         JOIN courses c ON s.course_id = c.id
         WHERE s.instructor_id = $1 AND s.day_of_week = $2
         AND s.start_time < $4 AND s.end_time > $3
         AND ($5::varchar IS NULL OR s.semester = $5)
         AND ($6::varchar IS NULL OR s.academic_year = $6)`,
        [instructor_id, day_of_week, start_time, end_time, semester || null, academic_year || null]
      );

      if (instructorConflict.length > 0) {
        return new Response(
          JSON.stringify({ error: `تعارض في المحاضر: المحاضر مشغول بمقرر "${instructorConflict[0].course_name}" في نفس الوقت` }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await sql(
        `INSERT INTO schedules (course_id, instructor_id, hall_id, day_of_week, start_time, end_time, semester, academic_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [course_id, instructor_id, hall_id, day_of_week, start_time, end_time, semester || null, academic_year || null]
      );
      return new Response(JSON.stringify(result[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      await sql("DELETE FROM schedules WHERE id=$1", [id]);
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
  path: "/api/schedules",
};
