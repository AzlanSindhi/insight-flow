import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  delay?: number;
}

export function KPICard({ title, value, change, changeType = "neutral", icon, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-heading mt-1">{value}</p>
          {change && (
            <p className={cn(
              "text-xs mt-2 font-medium",
              changeType === "positive" && "text-sage",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground",
            )}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-accent/50">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
