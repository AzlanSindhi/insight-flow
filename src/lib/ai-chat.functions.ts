import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const inputSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "AI is not configured. Please contact support.", error: "missing_key" };
    }

    // Save user message
    await supabase.from("chat_messages").insert({ user_id: userId, role: "user", content: data.message });

    // Recent context
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role,content")
      .order("created_at", { ascending: false })
      .limit(10);
    const messages = [
      { role: "system", content: "You are DataSage, an AI data analytics assistant. Give concise, insight-rich answers about the user's data. Use markdown bullets and bold sparingly." },
      ...((history || []).reverse().map((m) => ({ role: m.role, content: m.content }))),
    ];

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error", res.status, txt);
        return { reply: "The AI service is temporarily unavailable. Please try again.", error: "ai_error" };
      }
      const json: any = await res.json();
      const reply = json.choices?.[0]?.message?.content?.trim() || "I'm not sure how to respond.";
      await supabase.from("chat_messages").insert({ user_id: userId, role: "assistant", content: reply });
      return { reply, error: null };
    } catch (e: any) {
      console.error("AI request failed", e);
      return { reply: "Network error reaching the AI service.", error: "network" };
    }
  });
