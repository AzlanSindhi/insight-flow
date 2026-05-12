import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const inputSchema = z.object({ datasetId: z.string().uuid() });

export const generateUnderstanding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, error: "missing_key" };

    const { data: ds } = await supabase
      .from("datasets")
      .select("id,file_name,file_type,row_count,column_count,health_score,summary,schema,sample,domain")
      .eq("id", data.datasetId)
      .maybeSingle();
    if (!ds) return { ok: false, error: "not_found" };

    const schema = Array.isArray(ds.schema) ? ds.schema : [];
    const sample = Array.isArray(ds.sample) ? ds.sample : [];
    const cols = schema
      .slice(0, 40)
      .map((c: any) => {
        const stats = c.mean !== undefined ? ` mean=${c.mean} min=${c.min} max=${c.max}` : "";
        return `- ${c.name} (${c.type}, nulls=${c.nulls}, unique=${c.unique})${stats}`;
      })
      .join("\n");

    const sys = `You are a senior data analyst. Produce a concise, accurate "Dataset Understanding Report" in markdown for the dataset below. Ground EVERY claim in the provided schema and sample. Never invent columns or numbers. If the dataset is too small or ambiguous to support a section, write "Insufficient data".

Sections (use these exact H2 headings):
## Dataset Type
## What It Contains
## Column Descriptions
## Key Metrics & Patterns
## Notable Relationships
## Trends & Anomalies
## Suggested Business Insights

End with a final line: "Derived from columns: [list]".`;

    const user = `Filename: ${ds.file_name}
Detected domain: ${ds.domain || "general"}
Type: ${ds.file_type} | Rows: ${ds.row_count} | Columns: ${ds.column_count} | Health: ${ds.health_score}
Summary: ${ds.summary}

SCHEMA:
${cols || "(none)"}

SAMPLE (first ${Math.min(15, sample.length)} rows):
${JSON.stringify(sample.slice(0, 15))}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: sys },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error("understanding gateway error", res.status, txt);
        return { ok: false, error: "ai_error" };
      }
      const j: any = await res.json();
      const md = j.choices?.[0]?.message?.content?.trim() || "";
      await supabase
        .from("datasets")
        .update({ understanding: md, insights: { generated_at: new Date().toISOString() } })
        .eq("id", ds.id);
      return { ok: true, understanding: md };
    } catch (e: any) {
      console.error("understanding failed", e);
      return { ok: false, error: "network" };
    }
  });
