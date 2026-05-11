import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Bot, User, Sparkles, Loader2, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendChatMessage } from "@/lib/ai-chat.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveDatasetId } from "@/hooks/useActiveDataset";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; content: string; id?: string }

export function AIChatAssistant() {
  const { user } = useAuth();
  const [datasetId] = useActiveDatasetId();
  const [datasetName, setDatasetName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const send = useServerFn(sendChatMessage);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load dataset name + history scoped to this dataset
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      let name: string | null = null;
      if (datasetId) {
        const { data } = await supabase.from("datasets").select("file_name").eq("id", datasetId).maybeSingle();
        name = data?.file_name ?? null;
      }
      let q = supabase
        .from("chat_messages")
        .select("id,role,content")
        .order("created_at", { ascending: true })
        .limit(50);
      q = datasetId ? q.eq("dataset_id", datasetId) : q.is("dataset_id", null);
      const { data: hist } = await q;
      if (cancelled) return;
      setDatasetName(name);
      const intro: Msg = {
        role: "assistant",
        content: datasetId
          ? `Hi, I'm DataSage. I'm analyzing **${name ?? "your dataset"}**. Ask about columns, trends, correlations, anomalies, or summaries — every answer will be grounded in this file.`
          : "Hi, I'm DataSage. **Upload a dataset** to start a context-aware analysis session. I won't reference data from any previous uploads.",
      };
      setMessages(hist && hist.length ? hist.map((m: any) => ({ id: m.id, role: m.role, content: m.content })) : [intro]);
    })();
    return () => { cancelled = true; };
  }, [user, datasetId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    if (!user) {
      toast.error("Please log in to chat with DataSage");
      return;
    }
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await send({ data: { message: text, datasetId: datasetId ?? null } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-border/50 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10"><Sparkles className="w-4 h-4 text-primary" /></div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">AI Insights Assistant</h3>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            {datasetId ? (
              <><Database className="w-3 h-3" /> Scoped to <span className="text-foreground font-medium truncate">{datasetName ?? "active dataset"}</span></>
            ) : (
              <><AlertCircle className="w-3 h-3" /> No active dataset — upload one to begin</>
            )}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="p-2 rounded-xl bg-sage/10 h-fit shrink-0"><Bot className="w-4 h-4 text-sage" /></div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[80%] whitespace-pre-wrap ${msg.role === "user" ? "bg-foreground text-background" : "bg-accent/50"}`}
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/`([^`]+)`/g, "<code class='px-1 rounded bg-background/50'>$1</code>")
                  .replace(/\n/g, "<br/>")
                  .replace(/• /g, "&bull; "),
              }}
            />
            {msg.role === "user" && (
              <div className="p-2 rounded-xl bg-primary/10 h-fit shrink-0"><User className="w-4 h-4 text-primary" /></div>
            )}
          </motion.div>
        ))}
        {busy && (
          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-sage/10 h-fit shrink-0"><Bot className="w-4 h-4 text-sage" /></div>
            <div className="rounded-2xl px-4 py-3 bg-accent/50"><Loader2 className="w-4 h-4 animate-spin" /></div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? (datasetId ? "Ask about your active dataset..." : "Upload a dataset first...") : "Log in to chat..."}
            disabled={!user || busy}
            className="flex-1 bg-accent/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-60"
          />
          <Button variant="warm" size="icon" type="submit" disabled={!user || busy} className="rounded-xl shrink-0">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
