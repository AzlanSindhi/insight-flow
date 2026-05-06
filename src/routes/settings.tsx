import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Palette, Globe, Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Aura Analytics" },
      { name: "description", content: "Configure your Aura Analytics preferences." },
    ],
  }),
});

function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-3xl mb-8">Settings</h1>

            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-heading text-lg">Notifications</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Analysis complete alerts", desc: "Get notified when your analysis finishes", checked: true },
                    { label: "Weekly digest", desc: "Summary of your analytics activity", checked: true },
                    { label: "Product updates", desc: "New features and improvements", checked: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-9 h-5 bg-accent rounded-full peer peer-checked:bg-sage transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-heading text-lg">Appearance</h3>
                </div>
                <div className="flex gap-3">
                  {["Light", "Dark", "System"].map((theme) => (
                    <button
                      key={theme}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        theme === "Light" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-heading text-lg">Security</h3>
                </div>
                <div className="space-y-3">
                  <Button variant="outline" size="sm">Change Password</Button>
                  <div>
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground mb-2">Add an extra layer of security</p>
                    <Button variant="outline" size="sm">Enable 2FA</Button>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="bg-card rounded-2xl p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-heading text-lg">Language & Region</h3>
                </div>
                <select className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              {/* Danger Zone */}
              <div className="bg-card rounded-2xl p-6 border border-destructive/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <h3 className="font-heading text-lg text-destructive">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data.
                </p>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
