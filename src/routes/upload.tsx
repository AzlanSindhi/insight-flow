import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { FileUploadZone } from "@/components/FileUploadZone";
import { DatasetSummary } from "@/components/DatasetSummary";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Upload — DataSage" },
      { name: "description", content: "Upload your data files for AI-powered analysis." },
    ],
  }),
});

function UploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-heading text-4xl sm:text-5xl mb-3">Upload Workspace</h1>
            <p className="text-muted-foreground">
              Drop your data files and let our AI do the heavy lifting.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FileUploadZone />
          </motion.div>

          {/* Processing Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { step: "1", title: "Data Cleaning", desc: "Handling missing values, removing duplicates, and normalizing formats." },
              { step: "2", title: "Profiling", desc: "Detecting column types, distributions, and statistical properties." },
              { step: "3", title: "AI Analysis", desc: "Running correlations, regressions, clustering, and generating insights." },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{item.step}</span>
                  </div>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Sample Analysis Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-heading text-xl">Sample Analysis Preview</h2>
              </div>
              <Link to="/analysis">
                <Button variant="ghost" size="sm">
                  Full Results <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
            <DatasetSummary />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
