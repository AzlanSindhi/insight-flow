import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { DatasetSummary } from "@/components/DatasetSummary";
import { TrendChart, CorrelationScatter, ColumnTypeDistribution, FeatureImportanceChart, RegressionChart } from "@/components/AnalyticsCharts";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/analysis")({
  component: AnalysisPage,
  head: () => ({
    meta: [
      { title: "Analysis Results — Aura Analytics" },
      { name: "description", content: "View AI-generated analysis results for your dataset." },
    ],
  }),
});

function AnalysisPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h1 className="font-heading text-3xl">Analysis Results</h1>
              <p className="text-sm text-muted-foreground mt-1">sales_data_2024.csv — Completed 2 hours ago</p>
            </motion.div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" /> Share
              </Button>
              <Button variant="warm" size="sm">
                <Download className="w-4 h-4" /> Download Report
              </Button>
            </div>
          </div>

          {/* AI Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border/50 mb-6"
          >
            <h3 className="font-heading text-lg mb-3">AI Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your dataset contains <strong>12,847 records</strong> across <strong>24 columns</strong> with a health score of <strong>94%</strong>.
              Revenue shows a strong upward trend with 23% growth over Q3. Customer satisfaction is highly correlated with revenue (r = 0.92).
              We detected 3 significant outliers in the transaction column and recommend investigating records #4,521, #8,903, and #11,247.
              The predictive model suggests Q4 revenue of <strong>$2.4M</strong> with 95% confidence interval.
            </p>
          </motion.div>

          <DatasetSummary />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <TrendChart />
            <RegressionChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <CorrelationScatter />
            <FeatureImportanceChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <ColumnTypeDistribution />
            <AIChatAssistant />
          </div>

          {/* Confidence Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl p-6 border border-border/50 mt-6"
          >
            <h3 className="font-heading text-lg mb-4">Model Confidence Scores</h3>
            <div className="space-y-3">
              {[
                { model: "Linear Regression", confidence: 94, color: "bg-sage" },
                { model: "Trend Forecast", confidence: 89, color: "bg-warm" },
                { model: "Anomaly Detection", confidence: 97, color: "bg-sage" },
                { model: "Clustering (K=4)", confidence: 82, color: "bg-warm" },
              ].map((item) => (
                <div key={item.model} className="flex items-center gap-4">
                  <span className="text-sm w-40 shrink-0">{item.model}</span>
                  <div className="flex-1 bg-accent/30 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.confidence}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-2 rounded-full ${item.color}`}
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{item.confidence}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
