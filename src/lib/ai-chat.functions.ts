import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const inputSchema = z.object({
  message: z.string().min(1).max(4000),
  datasetId: z.string().uuid().nullable().optional(),
});

function buildDatasetContext(ds: any): string {
  if (!ds) {
    return "No dataset is currently active. If the user asks about data, instruct them to upload or select a dataset first. Do NOT invent metrics.";
  }
  const schema = Array.isArray(ds.schema) ? ds.schema : [];
  const sample = Array.isArray(ds.sample) ? ds.sample : [];
  const cols = schema
    .slice(0, 40)
    .map((c: any) => {
      const stats = c.mean !== undefined ? ` mean=${c.mean} min=${c.min} max=${c.max}` : "";
      return `- ${c.name} (${c.type}, nulls=${c.nulls}, unique=${c.unique})${stats} examples=${JSON.stringify((c.examples || []).slice(0, 3))}`;
    })
    .join("\n");
  const sampleStr = JSON.stringify(sample.slice(0, 15), null, 0);
  return [
    `ACTIVE DATASET: ${ds.file_name}`,
    `Type: ${ds.file_type || "n/a"} | Rows: ${ds.row_count} | Columns: ${ds.column_count} | Health: ${ds.health_score}`,
    `Summary: ${ds.summary || "n/a"}`,
    "",
    "SCHEMA:",
    cols || "(no schema available — file type not introspectable)",
    "",
    "SAMPLE ROWS (truncated):",
    sampleStr,
  ].join("\n");
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { reply: "AI is not configured. Please contact support.", error: "missing_key", sources: [] };
    }

    const datasetId = data.datasetId ?? null;

    // Load active dataset (RLS ensures it belongs to the user)
    let dataset: any = null;
    if (datasetId) {
      const { data: ds } = await supabase
        .from("datasets")
        .select("id,file_name,file_type,row_count,column_count,health_score,summary,schema,sample")
        .eq("id", datasetId)
        .maybeSingle();
      dataset = ds;
    }

    // Persist user message scoped to dataset
    await supabase.from("chat_messages").insert({
      user_id: userId,
      role: "user",
      content: data.message,
      dataset_id: datasetId,
    });

    // History scoped to this dataset only — strict isolation between uploads
    let historyQuery = supabase
      .from("chat_messages")
      .select("role,content")
      .order("created_at", { ascending: false })
      .limit(12);
    historyQuery = datasetId
      ? historyQuery.eq("dataset_id", datasetId)
      : historyQuery.is("dataset_id", null);
    const { data: history } = await historyQuery;

    const datasetContext = buildDatasetContext(dataset);

    const systemPrompt = `You are DataSage, a senior data analyst. You answer ONLY about the ACTIVE DATASET below. Never reference, recall, or import data from previous uploads or other files. If the question cannot be answered from the active dataset's schema or sample, say so explicitly and suggest what the user could do (e.g. provide a column name, change dataset).

Rules:
- Ground every claim in the schema, sample, or computable statistics. Cite the columns you used in a final "Derived from columns: [col1, col2]" line.
- If you compute statistics, show the formula in plain words; mark any number you cannot verify from the sample as "estimated".
- Prefer concise markdown: short paragraphs, **bold** key numbers, bullet lists.
- Ask a clarifying question only if the dataset truly lacks needed information.
- Never fabricate column names, values, or correlations. If unsure, say "insufficient data".
- For requests like trends, regressions, forecasts, anomaly or cluster analysis, only proceed when the schema supports it; otherwise explain why and what would be needed.

${datasetContext}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...((history || []).reverse().map((m: any) => ({ role: m.role, content: m.content }))),
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
        return { reply: "The AI service is temporarily unavailable. Please try again.", error: "ai_error", sources: [] };
      }
      const json: any = await res.json();
      const reply = json.choices?.[0]?.message?.content?.trim() || "I'm not sure how to respond.";
      await supabase.from("chat_messages").insert({
        user_id: userId,
        role: "assistant",
        content: reply,
        dataset_id: datasetId,
      });
      return { reply, error: null, sources: dataset ? (dataset.schema || []).map((c: any) => c.name) : [] };
    } catch (e: any) {
      console.error("AI request failed", e);
      return { reply: "Network error reaching the AI service.", error: "network", sources: [] };
    }
  });
