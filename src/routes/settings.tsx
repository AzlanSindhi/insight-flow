import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Palette, Globe, Trash2, Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — DataSage" },
      { name: "description", content: "Configure your DataSage preferences." },
    ],
  }),
});

interface Notifs {
  analysis_alerts: boolean;
  weekly_digest: boolean;
  product_updates: boolean;
}

function SettingsPage() {
  const { user, loading } = useRequireAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("Light");
  const [language, setLanguage] = useState("English (US)");
  const [notifs, setNotifs] = useState<Notifs>({ analysis_alerts: true, weekly_digest: true, product_updates: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setTheme(data.theme || "Light");
        setLanguage(data.language || "English (US)");
        setNotifs((data.notifications as Notifs) || notifs);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const persist = async (next: Partial<{ theme: string; language: string; notifications: Notifs }>) => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      theme: next.theme ?? theme,
      language: next.language ?? language,
      notifications: next.notifications ?? notifs,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("user_settings").upsert(payload);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  const onTheme = (t: string) => {
    setTheme(t);
    if (t === "Dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    persist({ theme: t });
  };

  const onToggle = (key: keyof Notifs) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    persist({ notifications: next });
  };

  const onDeleteAccount = async () => {
    if (!confirm("Permanently delete all your data? This cannot be undone.")) return;
    await supabase.from("datasets").delete().eq("user_id", user!.id);
    await supabase.from("chat_messages").delete().eq("user_id", user!.id);
    toast.success("All your data was removed. Signing out…");
    await signOut();
    navigate({ to: "/" });
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-heading text-3xl">Settings</h1>
              {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-heading text-lg">Notifications</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { key: "analysis_alerts" as const, label: "Analysis complete alerts", desc: "Get notified when your analysis finishes" },
                    { key: "weekly_digest" as const, label: "Weekly digest", desc: "Summary of your analytics activity" },
                    { key: "product_updates" as const, label: "Product updates", desc: "New features and improvements" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifs[item.key]} onChange={() => onToggle(item.key)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-accent rounded-full peer peer-checked:bg-sage transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-heading text-lg">Appearance</h3>
                </div>
                <div className="flex gap-3">
                  {["Light", "Dark", "System"].map((t) => (
                    <button
                      key={t}
                      onClick={() => onTheme(t)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        theme === t ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-heading text-lg">Security</h3>
                </div>
                <Button variant="outline" size="sm" onClick={async () => {
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email!, { redirectTo: window.location.origin });
                  if (error) toast.error(error.message);
                  else toast.success("Password reset email sent");
                }}>Send Password Reset Email</Button>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-heading text-lg">Language & Region</h3>
                </div>
                <select value={language} onChange={(e) => { setLanguage(e.target.value); persist({ language: e.target.value }); }} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-destructive/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <h3 className="font-heading text-lg text-destructive">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete all your datasets, chat history, and sign out.
                </p>
                <Button variant="destructive" size="sm" onClick={onDeleteAccount}>Delete All My Data</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
