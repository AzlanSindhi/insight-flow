import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TrendChart, CorrelationScatter, ColumnTypeDistribution } from "@/components/AnalyticsCharts";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { Download, Share2, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useActiveDatasetId } from "@/hooks/useActiveDataset";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/analysis")({
  component: AnalysisPage,
  head: () => ({
    meta: [
      { title: "Analysis Results — DataSage" },
      { name: "description", content: "Context-aware AI analysis grounded in your active dataset." },
    ],
  }),
});

interface ColumnSchema {
  name: string;
  type: string;
  nulls: number;
  unique: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  examples?: any[];
}

interface Dataset {
  id: string;
  file_name: string;
  file_type: string | null;
  row_count: number;
  column_count: number;
  health_score: number;
  status: string;
  summary: string | null;
  schema: ColumnSchema[];
  sample: Record<string, unknown>[];
  created_at: string;
}

function AnalysisPage() {
  const { user, loading } = useRequireAuth();
  const [datasetId] = useActiveDatasetId();
  const [ds, setDs] = useState<Dataset | null>(null);
  const [loadingDs, setLoadingDs] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingDs(true);
    (async () => {
      let row: any = null;
      if (datasetId) {
        const { data } = await supabase
          .from("datasets")
          .select("*")
          .eq("id", datasetId)
          .maybeSingle();
        row = data;
      }
      if (!row) {
        // Fallback: most recent dataset
        const { data } = await supabase
          .from("datasets")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        row = data;
      }
      setDs(row || null);
      setLoadingDs(false);
    })();
  }, [user, datasetId]);

  const onDownload = () => {
    if (!ds) return;
    const report = {
      file: ds.file_name,
      generated_at: new Date().toISOString(),
      summary: ds.summary,
      health_score: ds.health_score,
      rows: ds.row_count,
      columns: ds.column_count,
      schema: ds.schema,
      sample: ds.sample,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ds.file_name.replace(/\.[^.]+$/, "")}-datasage-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onShare = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (loading || !user) return null;

  if (!loadingDs && !ds) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 px-6 max-w-2xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-heading text-2xl mb-2">No dataset selected</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Upload a file or pick one from your history to start a context-aware analysis session.
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/upload"><Button variant="warm">Upload dataset</Button></Link>
            <Link to="/history"><Button variant="outline">Browse history</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const numericCols = (ds?.schema || []).filter((c) => c.type === "number");
  const categoricalCols = (ds?.schema || []).filter((c) => c.type === "string");
  const totalNulls = (ds?.schema || []).reduce((a, c) => a + (c.nulls || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Database className="w-3 h-3" /> Active dataset
              </div>
              <h1 className="font-heading text-3xl">{ds?.file_name || "Loading…"}</h1>
              {ds && (
                <p className="text-sm text-muted-foreground mt-1">
                  {ds.row_count.toLocaleString()} rows · {ds.column_count} cols · health {ds.health_score}% · uploaded {formatDistanceToNow(new Date(ds.created_at), { addSuffix: true })}
                </p>
              )}
            </motion.div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onShare}><Share2 className="w-4 h-4" /> Share</Button>
              <Button variant="warm" size="sm" onClick={onDownload}><Download className="w-4 h-4" /> Download Report</Button>
            </div>
          </div>

          {/* Dataset summary grounded in actual file */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 border border-border/50 mb-6">
            <h3 className="font-heading text-lg mb-3">Dataset Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ds?.summary || "Summary unavailable."} Detected <strong>{numericCols.length} numeric</strong>, <strong>{categoricalCols.length} categorical</strong> columns and <strong>{totalNulls.toLocaleString()}</strong> missing values across the scanned sample. The AI assistant on this page is strictly scoped to this file — it will not reference any other upload.
            </p>
          </motion.div>

          {/* Schema table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl border border-border/50 overflow-hidden mb-6">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-heading text-lg">Schema & Column Profile</h3>
              <span className="text-xs text-muted-foreground">{ds?.schema?.length || 0} columns</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/50">
                    <th className="text-left px-6 py-3 font-medium">Column</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-right px-4 py-3 font-medium">Nulls</th>
                    <th className="text-right px-4 py-3 font-medium">Unique</th>
                    <th className="text-right px-4 py-3 font-medium">Min</th>
                    <th className="text-right px-4 py-3 font-medium">Mean</th>
                    <th className="text-right px-4 py-3 font-medium">Max</th>
                    <th className="text-left px-4 py-3 font-medium">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {(ds?.schema || []).map((c) => (
                    <tr key={c.name} className="border-b border-border/20 last:border-0 hover:bg-accent/20">
                      <td className="px-6 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-accent/50">{c.type}</span></td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{c.nulls}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{c.unique}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{c.min ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{c.mean ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{c.max ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[260px]">{(c.examples || []).slice(0, 3).map((e) => String(e)).join(", ")}</td>
                    </tr>
                  ))}
                  {(!ds?.schema || ds.schema.length === 0) && (
                    <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-muted-foreground">Schema introspection isn't available for this file type. Try CSV or JSON for full profiling.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrendChart />
            <CorrelationScatter />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <ColumnTypeDistribution />
            <AIChatAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}
