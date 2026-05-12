import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
} from "recharts";

interface ColumnSchema {
  name: string;
  type: string;
  nulls: number;
  unique: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  examples?: any[];
}

interface Props {
  schema: ColumnSchema[];
  sample: Record<string, unknown>[];
}

const COLORS = ["#C9996B", "#5C766D", "#5C4F4A", "#8B7355", "#7A9E8E", "#A88A6E", "#6B8E7F"];

function Card({ title, subtitle, children, delay = 0 }: { title: string; subtitle?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <h3 className="font-heading text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>}
      {children}
    </motion.div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="h-[250px] flex items-center justify-center text-xs text-muted-foreground">{msg}</div>;
}

export function DynamicCharts({ schema, sample }: Props) {
  const numericCols = schema.filter((c) => c.type === "number");
  const categoricalCols = schema.filter((c) => c.type === "string" && c.unique > 1 && c.unique <= 30);

  // 1. Numeric trend / line — first numeric column over its index
  const trendCol = numericCols[0];
  const trendData = trendCol
    ? sample.slice(0, 30).map((r, i) => ({ idx: i + 1, value: Number(r[trendCol.name]) || 0 }))
    : [];

  // 2. Histogram for first numeric col (10 bins)
  const histCol = numericCols[0];
  let histData: { bin: string; count: number }[] = [];
  if (histCol && typeof histCol.min === "number" && typeof histCol.max === "number" && histCol.max > histCol.min) {
    const bins = 10;
    const step = (histCol.max - histCol.min) / bins;
    const buckets = Array.from({ length: bins }, () => 0);
    for (const r of sample) {
      const v = Number(r[histCol.name]);
      if (!isNaN(v)) {
        const idx = Math.min(bins - 1, Math.floor((v - (histCol.min as number)) / step));
        buckets[idx]++;
      }
    }
    histData = buckets.map((c, i) => ({
      bin: `${((histCol.min as number) + i * step).toFixed(1)}`,
      count: c,
    }));
  }

  // 3. Categorical bar — top values of first eligible categorical column
  const catCol = categoricalCols[0];
  const catData = catCol
    ? Object.entries(
        sample.reduce<Record<string, number>>((a, r) => {
          const v = String(r[catCol.name] ?? "");
          if (v) a[v] = (a[v] || 0) + 1;
          return a;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : [];

  // 4. Scatter between first two numeric columns
  const xCol = numericCols[0];
  const yCol = numericCols[1];
  const scatterData = xCol && yCol
    ? sample
        .map((r) => ({ x: Number(r[xCol.name]), y: Number(r[yCol.name]) }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y))
    : [];

  // 5. Column type distribution
  const typeCounts = schema.reduce<Record<string, number>>((a, c) => {
    a[c.type] = (a[c.type] || 0) + 1;
    return a;
  }, {});
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Trend" subtitle={trendCol ? `${trendCol.name} across sample` : "—"} delay={0}>
        {trendCol ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="dynTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9996B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C9996B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="idx" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Area type="monotone" dataKey="value" stroke="#C9996B" fill="url(#dynTrend)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <Empty msg="No numeric columns detected" />}
      </Card>

      <Card title="Distribution" subtitle={histCol ? `Histogram of ${histCol.name}` : "—"} delay={0.05}>
        {histData.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={histData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="bin" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="count" fill="#5C766D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty msg="Numeric range not available" />}
      </Card>

      <Card title="Top Categories" subtitle={catCol ? `${catCol.name}` : "—"} delay={0.1}>
        {catData.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={catData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={110} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="value" fill="#C9996B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <Empty msg="No low-cardinality categorical column" />}
      </Card>

      <Card title="Correlation" subtitle={xCol && yCol ? `${xCol.name} vs ${yCol.name}` : "—"} delay={0.15}>
        {scatterData.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" dataKey="x" name={xCol!.name} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis type="number" dataKey="y" name={yCol!.name} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Scatter data={scatterData} fill="#5C766D" />
            </ScatterChart>
          </ResponsiveContainer>
        ) : <Empty msg="Need at least 2 numeric columns" />}
      </Card>

      <Card title="Column Types" subtitle="Schema composition" delay={0.2}>
        {typeData.length ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {typeData.map((t, i) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {t.name} ({t.value})
                </div>
              ))}
            </div>
          </>
        ) : <Empty msg="No schema available" />}
      </Card>
    </div>
  );
}
