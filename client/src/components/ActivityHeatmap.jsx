import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]; // Sun-Sat, sparse like GitHub's graph
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function cellClass(day) {
  if (!day) return "heatmap-cell heatmap-cell-future";
  if (day.hasFoodLog && day.hasWorkout) return "heatmap-cell heatmap-cell-both";
  if (day.hasFoodLog) return "heatmap-cell heatmap-cell-food";
  return "heatmap-cell";
}

function cellTitle(day) {
  if (!day) return "";
  const d = new Date(day.date + "T00:00:00");
  const label = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const bits = [`${Math.round(day.calories)} cal`];
  if (day.hasWorkout) bits.push("workout logged");
  return `${label} — ${bits.join(", ")}`;
}

export default function ActivityHeatmap({ weeks = 12 }) {
  const [days, setDays] = useState(null);

  useEffect(() => {
    api.getActivityHeatmap(weeks).then((r) => setDays(r.days));
  }, [weeks]);

  const columns = useMemo(() => {
    if (!days) return [];
    const first = new Date(days[0].date + "T00:00:00");
    const leadingPad = first.getDay(); // 0 = Sunday
    const padded = [...Array(leadingPad).fill(null), ...days];
    const trailingPad = (7 - (padded.length % 7)) % 7;
    const full = [...padded, ...Array(trailingPad).fill(null)];
    const cols = [];
    for (let i = 0; i < full.length; i += 7) {
      cols.push(full.slice(i, i + 7));
    }
    return cols;
  }, [days]);

  const monthLabels = useMemo(() => {
    let lastMonth = null;
    return columns.map((col) => {
      const firstDefined = col.find((d) => d);
      if (!firstDefined) return "";
      const month = new Date(firstDefined.date + "T00:00:00").getMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        return MONTH_NAMES[month];
      }
      return "";
    });
  }, [columns]);

  if (!days) {
    return (
      <div className="card">
        <div className="card-title">Activity</div>
        <div className="text-sm text-muted mt-8">Loading…</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Activity</div>
      <div className="text-sm text-muted mb-16">Food and workout logging over the last {weeks} weeks</div>

      <div className="heatmap-scroll">
        <div style={{ display: "inline-block", minWidth: "100%" }}>
          <div className="heatmap-months" style={{ gridTemplateColumns: `repeat(${columns.length}, 14px)` }}>
            {monthLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
          <div className="heatmap-body">
            <div className="heatmap-weekday-labels">
              {WEEKDAY_LABELS.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
            <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${columns.length}, 14px)` }}>
              {columns.map((col, ci) =>
                col.map((day, ri) => (
                  <div key={`${ci}-${ri}`} className={cellClass(day)} title={cellTitle(day)} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <span className="heatmap-legend-swatch" style={{ background: "var(--border)" }} />
        <span className="heatmap-legend-swatch" style={{ background: "var(--brand-mid)" }} />
        <span className="heatmap-legend-swatch" style={{ background: "var(--brand)" }} />
        <span>More</span>
      </div>
    </div>
  );
}
