import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const SERIES = [
  { key: "protein", label: "Protein", color: "var(--series-protein)", kcalPerGram: 4 },
  { key: "carbs", label: "Carbs", color: "var(--series-carbs)", kcalPerGram: 4 },
  { key: "fat", label: "Fat", color: "var(--series-fat)", kcalPerGram: 9 },
];

export default function MacroDonut({ protein = 0, carbs = 0, fat = 0 }) {
  const data = SERIES.map((s) => ({
    ...s,
    kcal: Math.max(0, ({ protein, carbs, fat }[s.key] || 0) * s.kcalPerGram),
  }));
  const totalKcal = data.reduce((sum, d) => sum + d.kcal, 0);

  if (totalKcal <= 0) {
    return (
      <div className="text-sm text-muted" style={{ textAlign: "center", padding: "20px 0" }}>
        Log food to see your macro split
      </div>
    );
  }

  return (
    <div className="macro-donut-wrap">
      <div style={{ width: 140, height: 140, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="kcal"
              nameKey="label"
              innerRadius={44}
              outerRadius={64}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div className="macro-donut-center-value">{Math.round(totalKcal)}</div>
          <div className="macro-donut-center-label">kcal</div>
        </div>
      </div>
      <div className="macro-donut-legend">
        {data.map((d) => (
          <div key={d.key} className="macro-donut-legend-item">
            <span className="macro-dot" style={{ background: d.color }} />
            {d.label} {Math.round((d.kcal / totalKcal) * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
}
