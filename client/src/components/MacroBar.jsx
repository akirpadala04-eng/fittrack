export default function MacroBar({ label, color, amount, goal, unit = "g" }) {
  const pct = goal > 0 ? Math.min(100, (amount / goal) * 100) : 0;
  return (
    <div className="macro-row">
      <div className="macro-row-head">
        <span className="macro-name">
          <span className="macro-dot" style={{ background: color }} />
          {label}
        </span>
        <span className="macro-amount">
          {Math.round(amount)}
          {unit} / {Math.round(goal)}
          {unit}
        </span>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
