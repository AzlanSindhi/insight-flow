import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Database, MoreHorizontal, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "Dataset History — DataSage" },
      { name: "description", content: "Browse and manage your analyzed datasets." },
    ],
  }),
});

const datasets = [
  { name: "sales_data_2024.csv", rows: "12,847", cols: 24, date: "May 4, 2026", health: 94, status: "Analyzed" },
  { name: "customer_survey.xlsx", rows: "5,231", cols: 18, date: "May 3, 2026", health: 88, status: "Analyzed" },
  { name: "marketing_spend.json", rows: "892", cols: 12, date: "May 1, 2026", health: 96, status: "Analyzed" },
  { name: "inventory_q3.csv", rows: "34,102", cols: 31, date: "Apr 28, 2026", health: 72, status: "Processing" },
  { name: "hr_data_2025.xlsx", rows: "2,450", cols: 15, date: "Apr 25, 2026", health: 91, status: "Analyzed" },
  { name: "web_analytics.csv", rows: "156,203", cols: 42, date: "Apr 20, 2026", health: 85, status: "Analyzed" },
];

function HistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-heading text-3xl">Dataset History</h1>
              <p className="text-sm text-muted-foreground mt-1">{datasets.length} datasets analyzed</p>
            </motion.div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search datasets..."
                  className="bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
                />
              </div>
              <button className="p-2 bg-card border border-border rounded-xl hover:bg-accent transition-colors">
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
            {datasets.map((ds, i) => (
              <motion.div
                key={ds.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/analysis"
                  className="grid grid-cols-6 items-center px-6 py-4 hover:bg-accent/20 transition-colors border-b border-border/20 last:border-0"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/50">
                      <Database className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ds.name}</p>
                      <p className="text-xs text-muted-foreground">{ds.cols} columns</p>
                    </div>
                  </div>
                  <span className="text-sm">{ds.rows}</span>
                  <span className="text-sm text-muted-foreground">{ds.date}</span>
                  <span className={`text-sm font-medium ${ds.health >= 90 ? "text-sage" : ds.health >= 80 ? "text-warm" : "text-destructive"}`}>
                    {ds.health}%
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${ds.status === "Analyzed" ? "bg-sage/10 text-sage" : "bg-warm/10 text-warm"}`}>
                      {ds.status}
                    </span>
                    <button className="p-1 hover:bg-accent rounded-lg transition-colors" onClick={(e) => e.preventDefault()}>
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
