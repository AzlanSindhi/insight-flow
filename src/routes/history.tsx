import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Database, Trash2, Search, Filter } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { setActiveDatasetId } from "@/hooks/useActiveDataset";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "Dataset History — DataSage" },
      { name: "description", content: "Browse and manage your analyzed datasets." },
    ],
  }),
});

interface Row {
  id: string;
  file_name: string;
  row_count: number;
  column_count: number;
  health_score: number;
  status: string;
  created_at: string;
}

function HistoryPage() {
  const { user, loading } = useRequireAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");

  const refresh = () => {
    supabase
      .from("datasets")
      .select("id,file_name,row_count,column_count,health_score,status,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows(data || []));
  };

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  const onDelete = async (id: string) => {
    const { error } = await supabase.from("datasets").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Dataset removed");
      setRows((r) => r.filter((x) => x.id !== id));
      if (typeof window !== "undefined" && localStorage.getItem("datasage.activeDatasetId") === id) {
        setActiveDatasetId(null);
      }
    }
  };

  if (loading || !user) return null;

  const filtered = rows.filter((r) => r.file_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-heading text-3xl">Dataset History</h1>
              <p className="text-sm text-muted-foreground mt-1">{filtered.length} dataset{filtered.length === 1 ? "" : "s"}</p>
            </motion.div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search datasets..."
                  className="bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
                />
              </div>
              <button className="p-2 bg-card border border-border rounded-xl hover:bg-accent transition-colors" aria-label="Filter">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="grid grid-cols-6 text-xs text-muted-foreground px-6 py-3 border-b border-border/50">
              <span className="col-span-2">Name</span>
              <span>Rows</span>
              <span>Date</span>
              <span>Health</span>
              <span>Status</span>
            </div>
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No datasets yet. <Link to="/upload" className="text-primary hover:underline">Upload one</Link> to get started.
              </div>
            )}
            {filtered.map((ds, i) => (
              <motion.div key={ds.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <div className="grid grid-cols-6 items-center px-6 py-4 hover:bg-accent/20 transition-colors border-b border-border/20 last:border-0">
                  <Link to="/analysis" onClick={() => setActiveDatasetId(ds.id)} className="col-span-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/50"><Database className="w-4 h-4 text-muted-foreground" /></div>
                    <div>
                      <p className="text-sm font-medium">{ds.file_name}</p>
                      <p className="text-xs text-muted-foreground">{ds.column_count} columns · click to set active</p>
                    </div>
                  </Link>
                  <span className="text-sm">{ds.row_count.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{format(new Date(ds.created_at), "MMM d, yyyy")}</span>
                  <span className={`text-sm font-medium ${ds.health_score >= 90 ? "text-sage" : ds.health_score >= 80 ? "text-warm" : "text-destructive"}`}>{ds.health_score}%</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${ds.status === "Analyzed" ? "bg-sage/10 text-sage" : "bg-warm/10 text-warm"}`}>{ds.status}</span>
                    <button className="p-1 hover:bg-destructive/10 rounded-lg transition-colors" onClick={() => onDelete(ds.id)} aria-label="Delete">
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
