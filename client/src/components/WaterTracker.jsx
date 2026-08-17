import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { IconDroplet, IconTrash } from "./Icons";
import Confetti from "./Confetti";

const QUICK_ADD_ML = [250, 500, 750];

export default function WaterTracker({ date, goalMl }) {
  const [entries, setEntries] = useState([]);
  const [totalMl, setTotalMl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [celebrate, setCelebrate] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const prevTotalRef = useRef(0);
  const toastTimeoutRef = useRef(null);

  function reload() {
    api.getWaterLogs(date).then((r) => {
      setEntries(r.entries);
      setTotalMl(r.totalMl);
      prevTotalRef.current = r.totalMl;
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  async function addWater(amountMl) {
    const before = prevTotalRef.current;
    await api.createWaterLog({ date, amount_ml: amountMl });
    const r = await api.getWaterLogs(date);
    setEntries(r.entries);
    setTotalMl(r.totalMl);
    const after = r.totalMl;
    if (goalMl > 0 && before < goalMl && after >= goalMl) {
      setCelebrate(true);
      setShowToast(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000);
    }
    prevTotalRef.current = after;
  }

  async function removeLast() {
    if (entries.length === 0) return;
    const last = entries[entries.length - 1];
    await api.deleteWaterLog(last.id);
    reload();
  }

  const pct = goalMl > 0 ? Math.min(100, (totalMl / goalMl) * 100) : 0;
  const liters = (totalMl / 1000).toFixed(2);
  const goalLiters = (goalMl / 1000).toFixed(1);

  return (
    <div className="card">
      <div className="card-row" style={{ marginBottom: 12 }}>
        <div className="card-title flex items-center gap-8">
          <IconDroplet width={16} height={16} style={{ color: "var(--series-protein)" }} /> Water
        </div>
        {entries.length > 0 && (
          <button className="btn btn-ghost btn-icon" onClick={removeLast} aria-label="Remove last entry" title="Undo last">
            <IconTrash width={14} height={14} />
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-sm text-muted">Loading…</div>
      ) : (
        <>
          <div className="water-fill-row">
            <div className="bar-track" style={{ height: 14 }}>
              <div
                className="bar-fill"
                style={{ width: `${pct}%`, background: "var(--series-protein)" }}
              />
            </div>
          </div>
          <div className="flex justify-between mt-8 text-sm">
            <span className="font-bold">{liters} L</span>
            <span className="text-muted">of {goalLiters} L goal</span>
          </div>
          <div className="flex gap-8 mt-16" style={{ flexWrap: "wrap" }}>
            {QUICK_ADD_ML.map((ml) => (
              <button key={ml} className="btn btn-secondary btn-sm" onClick={() => addWater(ml)}>
                + {ml} ml
              </button>
            ))}
          </div>
          {showToast && (
            <div className="celebration-toast">🎉 Daily water goal reached!</div>
          )}
        </>
      )}
      <Confetti active={celebrate} />
    </div>
  );
}
