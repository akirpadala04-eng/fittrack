export default function CalorieRing({ consumed = 0, burned = 0, goal = 2000, size = 168 }) {
  const net = consumed - burned;
  const remaining = goal - net;
  const pct = Math.max(0, Math.min(1, goal > 0 ? net / goal : 0));
  const over = remaining < 0;

  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * pct;

  const color = over ? "var(--status-critical)" : "var(--brand)";

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#eef1ee"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.3s ease" }}
        />
      </svg>
      <div className="ring-center">
        <div className="ring-value" style={{ color: over ? "var(--status-critical)" : "var(--text-primary)" }}>
          {Math.abs(Math.round(remaining)).toLocaleString()}
        </div>
        <div className="ring-label">{over ? "over goal" : "remaining"}</div>
      </div>
    </div>
  );
}
