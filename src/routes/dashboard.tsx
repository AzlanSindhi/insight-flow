import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Database, Brain, Search, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { TrendChart, CorrelationScatter, ColumnTypeDistribution, FeatureImportanceChart } from "@/components/AnalyticsCharts";
import { AIChatAssistant } from "@/components/AIChatAssistant";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — DataSage" },
      { name: "description", content: "Your AI-powered analytics dashboard with real-time insights." },
    ],
  }),
});

const recentDatasets = [
  { name: "sales_data_2024.csv", rows: "12,847", date: "2 hours ago", status: "Analyzed" },
  { name: "customer_survey.xlsx", rows: "5,231", date: "Yesterday", status: "Analyzed" },
  { name: "marketing_spend.json", rows: "892", date: "3 days ago", status: "Analyzed" },
  { name: "inventory_q3.csv", rows: "34,102", date: "1 week ago", status: "Processing" },
];

function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
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

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Total Datasets"
              value="24"
              change="+3 this week"
              changeType="positive"
              icon={<Database className="w-5 h-5 text-muted-foreground" />}
              delay={0}
            />
            <KPICard
              title="Insights Generated"
              value="1,847"
              change="+124 today"
              changeType="positive"
              icon={<Brain className="w-5 h-5 text-muted-foreground" />}
              delay={0.1}
            />
            <KPICard
              title="Avg. Health Score"
              value="94%"
              change="+2.1% from last month"
              changeType="positive"
              icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />}
              delay={0.2}
            />
            <KPICard
              title="Active Models"
              value="12"
              change="3 training"
              changeType="neutral"
              icon={<BarChart3 className="w-5 h-5 text-muted-foreground" />}
              delay={0.3}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <TrendChart />
            <CorrelationScatter />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <ColumnTypeDistribution />
            <FeatureImportanceChart />
            <AIChatAssistant />
          </div>

          {/* Recent Datasets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl border border-border/50 overflow-hidden"
          >
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-heading text-lg">Recent Datasets</h3>
              <Link to="/history" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border/30">
              {recentDatasets.map((ds, i) => (
                <motion.div
                  key={ds.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/50">
                      <Database className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ds.name}</p>
                      <p className="text-xs text-muted-foreground">{ds.rows} rows · {ds.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${ds.status === "Analyzed" ? "bg-sage/10 text-sage" : "bg-warm/10 text-warm"}`}>
                      {ds.status}
                    </span>
                    <button className="p-1 hover:bg-accent rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
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
