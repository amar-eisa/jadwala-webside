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
        .from("halls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { name, type, capacity, building } = body;
      
      const { data, error } = await supabase
        .from("halls")
        .insert([{ 
          name, 
          type: type || "hall", 
          capacity: capacity || 30, 
          building: building || null 
        }])
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const { id, name, type, capacity, building } = body;
      
      const { data, error } = await supabase
        .from("halls")
        .update({ 
          name, 
          type: type || "hall", 
          capacity: capacity || 30, 
          building: building || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return new Response("Missing id", { status: 400 });

      const { error } = await supabase
        .from("halls")
        .delete()
        .eq("id", id);

      if (error) throw error;
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