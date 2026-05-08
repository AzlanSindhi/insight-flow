import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { User, Mail, Camera, BarChart3, Database, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — DataSage" },
      { name: "description", content: "Manage your DataSage profile." },
    ],
  }),
});

function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-6 mb-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-sage/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-sage" />
                </div>
                <button className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-lg">
                  <Camera className="w-3 h-3 text-primary-foreground" />
                </button>
              </div>
              <div>
                <h1 className="font-heading text-2xl">Sarah Chen</h1>
                <p className="text-sm text-muted-foreground">sarah@techcorp.com · Professional Plan</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: "Datasets", value: "24", icon: <Database className="w-4 h-4" /> },
                { label: "Analyses", value: "156", icon: <BarChart3 className="w-4 h-4" /> },
                { label: "Insights", value: "1.8K", icon: <TrendingUp className="w-4 h-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border/50 text-center">
                  <div className="flex justify-center mb-2 text-muted-foreground">{stat.icon}</div>
                  <p className="font-heading text-2xl">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <h3 className="font-heading text-lg mb-6">Profile Settings</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">First Name</label>
                    <input defaultValue="Sarah" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Last Name</label>
                    <input defaultValue="Chen" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input defaultValue="sarah@techcorp.com" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company</label>
                  <input defaultValue="TechCorp Inc." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="pt-2">
                  <Button variant="warm">Save Changes</Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
