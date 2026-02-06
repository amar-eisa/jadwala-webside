import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default async (req: Request) => {
  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const url = new URL(req.url);

  try {
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          *,
          courses:course_id (name, code),
          instructors:instructor_id (name),
          halls:hall_id (name, type)
        `);

      if (error) throw error;

      // Map to flat structure expected by frontend
      // and sort by day/time
      const daysOrder = { 'sunday': 1, 'monday': 2, 'tuesday': 3, 'wednesday': 4, 'thursday': 5 };
      
      const mappedData = data.map((s: any) => ({
        ...s,
        course_name: s.courses?.name,
        course_code: s.courses?.code,
        instructor_name: s.instructors?.name,
        hall_name: s.halls?.name,
        hall_type: s.halls?.type
      })).sort((a: any, b: any) => {
        const dayA = daysOrder[a.day_of_week as keyof typeof daysOrder] || 99;
        const dayB = daysOrder[b.day_of_week as keyof typeof daysOrder] || 99;
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
      let hallQuery = supabase
        .from('schedules')
        .select('*, courses(name)')
        .eq('hall_id', hall_id)
        .eq('day_of_week', day_of_week)
        .lt('start_time', end_time)
        .gt('end_time', start_time);
      
      if (semester) hallQuery = hallQuery.eq('semester', semester);
      if (academic_year) hallQuery = hallQuery.eq('academic_year', academic_year);

      const { data: hallConflicts, error: hallError } = await hallQuery;
      if (hallError) throw hallError;

      if (hallConflicts && hallConflicts.length > 0) {
        const conflictCourse = (hallConflicts[0] as any).courses?.name || "Unknown";
        return new Response(
          JSON.stringify({ error: `تعارض في القاعة: القاعة محجوزة لمقرر "${conflictCourse}" في نفس الوقت` }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      // 2. Check Instructor Conflict
      let instQuery = supabase
        .from('schedules')
        .select('*, courses(name)')
        .eq('instructor_id', instructor_id)
        .eq('day_of_week', day_of_week)
        .lt('start_time', end_time)
        .gt('end_time', start_time);

      if (semester) instQuery = instQuery.eq('semester', semester);
      if (academic_year) instQuery = instQuery.eq('academic_year', academic_year);

      const { data: instConflicts, error: instError } = await instQuery;
      if (instError) throw instError;

      if (instConflicts && instConflicts.length > 0) {
         const conflictCourse = (instConflicts[0] as any).courses?.name || "Unknown";
        return new Response(
          JSON.stringify({ error: `تعارض في المحاضر: المحاضر مشغول بمقرر "${conflictCourse}" في نفس الوقت` }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      // 3. Insert
      const { data, error } = await supabase
        .from("schedules")
        .insert([{ 
          course_id, 
          instructor_id, 
          hall_id, 
          day_of_week, 
          start_time, 
          end_time, 
          semester: semester || null, 
          academic_year: academic_year || null 
        }])
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return new Response("Missing id", { status: 400 });

      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
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