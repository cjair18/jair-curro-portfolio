import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6"];
const PIE_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6", "#0891b2"];

const CHART_MARGIN = { top: 8, right: 16, left: 0, bottom: 8 };

function BarView({ spec }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={spec.data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={spec.xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        {spec.yKeys.length > 1 && <Legend />}
        {spec.yKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={SERIES_COLORS[i % SERIES_COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineView({ spec }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={spec.data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={spec.xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        {spec.yKeys.length > 1 && <Legend />}
        {spec.yKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function PieView({ spec }) {
  const dataKey = spec.yKeys[0];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart margin={CHART_MARGIN}>
        <Tooltip />
        <Legend />
        <Pie
          data={spec.data}
          dataKey={dataKey}
          nameKey={spec.xKey}
          cx="50%"
          cy="50%"
          outerRadius={110}
          label={(entry) => entry[spec.xKey]}
        >
          {spec.data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Renders the current dashboardSpec ({ type, title, data, xKey, yKeys })
 * returned by reasoning.js. Shows a friendly placeholder before the first
 * matched question, or when a "no match" answer leaves the spec unset.
 */
export default function Dashboard({ spec }) {
  return (
    <section className="dashboard-panel" aria-label="Dashboard">
      {!spec ? (
        <div className="dashboard-placeholder">
          <p>Your dashboard will appear here once you ask a question.</p>
          <p className="dashboard-placeholder-hint">
            Try: &ldquo;How much did I spend on Google Ads this week, and how
            much revenue did it drive?&rdquo;
          </p>
        </div>
      ) : (
        <div className="dashboard-content">
          <h2 className="dashboard-title">{spec.title}</h2>
          {spec.type === "line" && <LineView spec={spec} />}
          {spec.type === "bar" && <BarView spec={spec} />}
          {spec.type === "pie" && <PieView spec={spec} />}
          {!["line", "bar", "pie"].includes(spec.type) && (
            <p>Unsupported chart type: {spec.type}</p>
          )}
        </div>
      )}
    </section>
  );
}
