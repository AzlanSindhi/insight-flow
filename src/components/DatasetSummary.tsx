import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Database, Columns, Hash } from "lucide-react";

const summaryData = {
  rows: "12,847",
  columns: "24",
  missingValues: "3.2%",
  duplicates: "0.8%",
  healthScore: 94,
};

const columns = [
  { name: "customer_id", type: "Integer", missing: "0%", unique: "12,847" },
  { name: "revenue", type: "Float", missing: "1.2%", unique: "11,203" },
  { name: "satisfaction", type: "Float", missing: "2.1%", unique: "50" },
  { name: "created_at", type: "DateTime", missing: "0%", unique: "12,847" },
  { name: "category", type: "String", missing: "0.5%", unique: "8" },
  { name: "is_active", type: "Boolean", missing: "0%", unique: "2" },
];

export function DatasetSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg">Dataset Overview</h3>
          <p className="text-xs text-muted-foreground mt-1">sales_data_2024.csv</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-2xl font-heading text-sage">{summaryData.healthScore}%</p>
            <p className="text-[10px] text-muted-foreground">Health Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Rows", value: summaryData.rows, icon: <Database className="w-3.5 h-3.5" /> },
          { label: "Columns", value: summaryData.columns, icon: <Columns className="w-3.5 h-3.5" /> },
          { label: "Missing", value: summaryData.missingValues, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          { label: "Duplicates", value: summaryData.duplicates, icon: <Hash className="w-3.5 h-3.5" /> },
        ].map((stat) => (
          <div key={stat.label} className="bg-accent/30 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              {stat.icon}
              <span className="text-[11px]">{stat.label}</span>
            </div>
            <p className="text-lg font-medium">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-4 text-[11px] text-muted-foreground px-3 py-2">
          <span>Column</span>
          <span>Type</span>
          <span>Missing</span>
          <span>Unique</span>
        </div>
        {columns.map((col, i) => (
          <motion.div
            key={col.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-4 text-sm px-3 py-2.5 rounded-lg hover:bg-accent/30 transition-colors"
          >
            <span className="font-mono text-xs">{col.name}</span>
            <span className="text-xs">
              <span className="px-2 py-0.5 rounded-full bg-accent/50 text-muted-foreground">{col.type}</span>
            </span>
            <span className="text-xs flex items-center gap-1">
              {col.missing === "0%" ? (
                <CheckCircle className="w-3 h-3 text-sage" />
              ) : parseFloat(col.missing) > 2 ? (
                <XCircle className="w-3 h-3 text-destructive" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-warm" />
              )}
              {col.missing}
            </span>
            <span className="text-xs text-muted-foreground">{col.unique}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
