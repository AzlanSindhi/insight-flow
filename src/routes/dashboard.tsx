import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Database, Brain, Search, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { TrendChart, CorrelationScatter, ColumnTypeDistribution, FeatureImportanceChart } from "@/components/AnalyticsCharts";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — DataSage" },
      { name: "description", content: "Your AI-powered analytics dashboard with real-time insights." },
    ],
  }),
});

interface Dataset {
  id: string;
  file_name: string;
  row_count: number;
  status: string;
  health_score: number;
  created_at: string;
}

function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("datasets")
      .select("id,file_name,row_count,status,health_score,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setDatasets(data || []));
    supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setChatCount(count || 0));
  }, [user]);

  if (loading || !user) return null;

  const filtered = datasets.filter((d) => d.file_name.toLowerCase().includes(search.toLowerCase()));
  const avgHealth = datasets.length ? Math.round(datasets.reduce((a, b) => a + b.health_score, 0) / datasets.length) : 0;
  const recent = filtered.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-heading text-3xl">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your analytics overview.</p>
            </div>
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
              <Link to="/upload">
                <Button variant="warm" size="sm">
                  <Plus className="w-4 h-4" /> Upload
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard title="Total Datasets" value={String(datasets.length)} change={`${datasets.length} total`} changeType="positive" icon={<Database className="w-5 h-5 text-muted-foreground" />} delay={0} />
            <KPICard title="AI Messages" value={String(chatCount)} change="From your assistant" changeType="positive" icon={<Brain className="w-5 h-5 text-muted-foreground" />} delay={0.1} />
            <KPICard title="Avg. Health Score" value={`${avgHealth}%`} change="Across all datasets" changeType="positive" icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />} delay={0.2} />
            <KPICard title="Analyzed" value={String(datasets.filter((d) => d.status === "Analyzed").length)} change="Ready to explore" changeType="neutral" icon={<BarChart3 className="w-5 h-5 text-muted-foreground" />} delay={0.3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <TrendChart />
            <CorrelationScatter />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <ColumnTypeDistribution />
            <FeatureImportanceChart />
            <AIChatAssistant />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-heading text-lg">Recent Datasets</h3>
              <Link to="/history" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border/30">
              {recent.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No datasets yet. <Link to="/upload" className="text-primary hover:underline">Upload your first file</Link>.
                </div>
              )}
              {recent.map((ds, i) => (
                <motion.div
                  key={ds.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/50"><Database className="w-4 h-4 text-muted-foreground" /></div>
                    <div>
                      <p className="text-sm font-medium">{ds.file_name}</p>
                      <p className="text-xs text-muted-foreground">{ds.row_count.toLocaleString()} rows · {formatDistanceToNow(new Date(ds.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${ds.status === "Analyzed" ? "bg-sage/10 text-sage" : "bg-warm/10 text-warm"}`}>{ds.status}</span>
                    <Link to="/analysis" className="p-1 hover:bg-accent rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
