import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line } from "recharts";

const trendData = [
  { month: "Jan", value: 4200, predicted: 4100 },
  { month: "Feb", value: 4800, predicted: 4600 },
  { month: "Mar", value: 4500, predicted: 4700 },
  { month: "Apr", value: 5200, predicted: 5100 },
  { month: "May", value: 5800, predicted: 5600 },
  { month: "Jun", value: 6100, predicted: 6200 },
  { month: "Jul", value: 6800, predicted: 6900 },
];

const correlationData = [
  { x: 20, y: 30, z: 200 }, { x: 25, y: 35, z: 180 },
  { x: 30, y: 45, z: 250 }, { x: 35, y: 40, z: 300 },
  { x: 40, y: 55, z: 220 }, { x: 45, y: 60, z: 280 },
  { x: 50, y: 70, z: 350 }, { x: 55, y: 65, z: 310 },
  { x: 60, y: 80, z: 400 }, { x: 65, y: 75, z: 360 },
];

const distributionData = [
  { name: "Numeric", value: 45 },
  { name: "Categorical", value: 25 },
  { name: "DateTime", value: 15 },
  { name: "Boolean", value: 10 },
  { name: "Text", value: 5 },
];

const featureImportance = [
  { feature: "Revenue", importance: 0.92 },
  { feature: "Satisfaction", importance: 0.85 },
  { feature: "Tickets", importance: 0.78 },
  { feature: "Response Time", importance: 0.71 },
  { feature: "Age", importance: 0.45 },
];

const COLORS = ["#C9996B", "#5C766D", "#5C4F4A", "#8B7355", "#7A9E8E"];

export function TrendChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <h3 className="font-heading text-lg mb-1">Trend Analysis</h3>
      <p className="text-xs text-muted-foreground mb-4">Actual vs Predicted values</p>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9996B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C9996B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
          <Area type="monotone" dataKey="value" stroke="#C9996B" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
          <Area type="monotone" dataKey="predicted" stroke="#5C766D" fill="none" strokeWidth={2} strokeDasharray="5 5" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function CorrelationScatter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <h3 className="font-heading text-lg mb-1">Correlation Analysis</h3>
      <p className="text-xs text-muted-foreground mb-4">Variable relationship scatter</p>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis type="number" dataKey="x" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis type="number" dataKey="y" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
          <Scatter data={correlationData} fill="#5C766D" />
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function ColumnTypeDistribution() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <h3 className="font-heading text-lg mb-1">Column Types</h3>
      <p className="text-xs text-muted-foreground mb-4">Data type distribution</p>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {distributionData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {distributionData.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            {item.name}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function FeatureImportanceChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <h3 className="font-heading text-lg mb-1">Feature Importance</h3>
      <p className="text-xs text-muted-foreground mb-4">Model contribution scores</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={featureImportance} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis type="category" dataKey="feature" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={100} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
          <Bar dataKey="importance" fill="#C9996B" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function RegressionChart() {
  const regressionData = trendData.map((d, i) => ({
    ...d,
    regression: 4000 + i * 450,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="bg-card rounded-2xl p-6 border border-border/50"
    >
      <h3 className="font-heading text-lg mb-1">Linear Regression</h3>
      <p className="text-xs text-muted-foreground mb-4">R² = 0.94 · p {"<"} 0.001</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={regressionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
          <Scatter dataKey="value" fill="#5C4F4A" />
          <Line type="linear" dataKey="regression" stroke="#C9996B" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
