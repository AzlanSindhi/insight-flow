import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { User, BarChart3, Database, TrendingUp, Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { user, loading } = useRequireAuth();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [stats, setStats] = useState({ datasets: 0, insights: 0, messages: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,company").eq("id", user.id).maybeSingle().then(({ data }) => {
      setFullName(data?.full_name || "");
      setCompany(data?.company || "");
    });
    Promise.all([
      supabase.from("datasets").select("row_count", { count: "exact" }),
      supabase.from("chat_messages").select("id", { count: "exact", head: true }),
    ]).then(([ds, ch]) => {
      const insights = (ds.data || []).reduce((a: number, b: any) => a + (b.row_count || 0), 0);
      setStats({ datasets: ds.count || 0, insights, messages: ch.count || 0 });
    });
  }, [user]);

  if (loading || !user) return null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, company, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-6 mb-10">
              <div className="w-20 h-20 rounded-2xl bg-sage/20 flex items-center justify-center">
                <User className="w-8 h-8 text-sage" />
              </div>
              <div>
                <h1 className="font-heading text-2xl">{fullName || "Welcome"}</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: "Datasets", value: stats.datasets, icon: <Database className="w-4 h-4" /> },
                { label: "Rows analyzed", value: stats.insights.toLocaleString(), icon: <BarChart3 className="w-4 h-4" /> },
                { label: "AI messages", value: stats.messages, icon: <TrendingUp className="w-4 h-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border/50 text-center">
                  <div className="flex justify-center mb-2 text-muted-foreground">{stat.icon}</div>
                  <p className="font-heading text-2xl">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <h3 className="font-heading text-lg mb-6">Profile Settings</h3>
              <form className="space-y-4" onSubmit={onSave}>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                  <input value={user.email || ""} disabled className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm opacity-60" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company</label>
                  <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="pt-2">
                  <Button variant="warm" type="submit" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
