import { useEffect, useState } from "react";
import { api } from "../api";
import { IconSearch, IconX, IconPlus } from "./Icons";

export default function AddWorkoutModal({ onClose, onAdd, weightKg }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      api.getExercises({ q: query }).then((r) => {
        if (!cancelled) {
          setResults(r);
          setLoading(false);
        }
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  function estCalories(met, minutes) {
    return Math.round(met * weightKg * (minutes / 60));
  }

  function handleAdd() {
    if (!selected) return;
    onAdd(selected.id, Number(duration) || 1);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Log a workout</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <IconX width={18} height={18} />
          </button>
        </div>
        <div className="modal-body">
          {!selected ? (
            <>
              <div className="search-input-wrap">
                <IconSearch />
                <input
                  className="input"
                  autoFocus
                  placeholder="Search exercises (e.g. running, cycling, yoga)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="mt-16 flex-col">
                {loading && <div className="empty-row">Searching…</div>}
                {!loading && results.length === 0 && <div className="empty-row">No exercises found.</div>}
                {!loading &&
                  results.map((ex) => (
                    <div key={ex.id} className="list-row" onClick={() => setSelected(ex)}>
                      <div className="food-row-main">
                        <div className="food-row-name">{ex.name}</div>
                        <div className="food-row-meta">{ex.category}</div>
                      </div>
                      <div className="food-row-cals">~{estCalories(ex.met, 30)} cal/30min</div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="flex-col gap-16">
              <div className="card" style={{ background: "#fbfcfa" }}>
                <div className="font-bold">{selected.name}</div>
                <div className="text-sm text-muted mt-8">{selected.category}</div>
              </div>
              <div className="field">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="input"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="card" style={{ background: "var(--brand-light)", border: "none" }}>
                <div className="text-sm font-semibold">
                  Estimated burn: {estCalories(selected.met, Number(duration) || 0)} cal
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setSelected(null)}>
                ← Choose a different exercise
              </button>
            </div>
          )}
        </div>
        {selected && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              <IconPlus width={15} height={15} /> Add to log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
