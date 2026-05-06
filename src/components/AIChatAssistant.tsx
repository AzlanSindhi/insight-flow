import { motion } from "framer-motion";
import { useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleMessages = [
  { role: "assistant" as const, content: "I've analyzed your dataset. Here are the key findings:\n\n• **Revenue** shows a 23% upward trend over Q3\n• **Customer churn** correlates strongly with support ticket volume (r=0.87)\n• 3 outliers detected in the transaction column\n\nWould you like me to run a deeper regression analysis?" },
  { role: "user" as const, content: "Yes, run the regression analysis on revenue vs customer satisfaction." },
  { role: "assistant" as const, content: "Running linear regression...\n\n**Results:**\n- R² = 0.92 (strong fit)\n- For every 1-point increase in satisfaction, revenue increases by $12,400\n- The model predicts Q4 revenue of $2.4M with 95% confidence\n\nI also found that response time is the strongest predictor of satisfaction (β = -0.71)." },
];

export function AIChatAssistant() {
  const [messages] = useState(sampleMessages);
  const [input, setInput] = useState("");

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-border/50 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-sm">AI Insights Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask questions about your data</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="p-2 rounded-xl bg-sage/10 h-fit shrink-0">
                <Bot className="w-4 h-4 text-sage" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[80%] ${
                msg.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-accent/50"
              }`}
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>')
                  .replace(/• /g, '&bull; '),
              }}
            />
            {msg.role === "user" && (
              <div className="p-2 rounded-xl bg-primary/10 h-fit shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your data..."
            className="flex-1 bg-accent/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
          <Button variant="warm" size="icon" className="rounded-xl shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
