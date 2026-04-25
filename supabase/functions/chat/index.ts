// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Task {
  id: string;
  title: string;
  description?: string;
  statusLabel?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  columnId: "todo" | "in-progress" | "done";
}

function buildSystemPrompt(tasks: Task[]) {
  const today = new Date().toISOString().slice(0, 10);
  const summary = {
    todo: tasks.filter((t) => t.columnId === "todo").length,
    inProgress: tasks.filter((t) => t.columnId === "in-progress").length,
    done: tasks.filter((t) => t.columnId === "done").length,
  };
  const lines = tasks.map((t) => {
    const due = t.dueDate ? t.dueDate.slice(0, 10) : "no due date";
    return `- [${t.columnId}] (${t.priority}) "${t.title}" — due ${due}${
      t.statusLabel ? ` [${t.statusLabel}]` : ""
    }${t.description ? ` :: ${t.description}` : ""}`;
  });

  return `You are a helpful project assistant embedded in a Kanban board app.
Today's date: ${today}.
The user's current board has ${tasks.length} tasks (${summary.todo} to-do, ${summary.inProgress} in progress, ${summary.done} done).

Tasks:
${lines.join("\n") || "(no tasks yet)"}

Answer concisely in markdown. When the user asks about overdue work, compare due dates to today.
When asked for recommendations, prefer high-priority and overdue items first.
If the user asks something unrelated to their tasks, answer normally but stay brief.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, tasks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt(Array.isArray(tasks) ? tasks : []) },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Payment required" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
