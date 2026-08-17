import { useEffect, useMemo, useState } from "react";
import { api, todayStr, formatFullDate } from "../api";
import { EXERCISE_LIBRARY } from "../data/splitPlans";
import { IconPlus, IconTrash, IconTrophy } from "../components/Icons";

const ALL_EXERCISE_NAMES = Array.from(new Set(Object.values(EXERCISE_LIBRARY).flat())).sort();

// Epley formula: a standard, widely-used estimate of 1-rep max from any weight/rep pair.
function estimate1RM(weightKg, reps) {
  if (reps <= 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export default function PersonalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ exercise_name: "", weight_kg: "", reps: "1", date: todayStr(), notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reload() {
    setLoading(true);
    api.getPRs().then((r) => {
      setRecords(r);
      setLoading(false);
    });
  }

  useEffect(reload, []);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.exercise_name.trim() || !form.weight_kg) {
      setError("Exercise name and weight are required.");
      return;
    }
    setSaving(true);
    try {
      await api.createPR({
        exercise_name: form.exercise_name.trim(),
        weight_kg: Number(form.weight_kg),
        reps: Number(form.reps) || 1,
        date: form.date,
        notes: form.notes || null,
      });
      setForm({ exercise_name: "", weight_kg: "", reps: "1", date: todayStr(), notes: "" });
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await api.deletePR(id);
    reload();
  }

  const bestByExercise = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      const est = estimate1RM(r.weight_kg, r.reps);
      const existing = map.get(r.exercise_name);
      if (!existing || est > existing.est1rm) {
        map.set(r.exercise_name, { ...r, est1rm: est });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.est1rm - a.est1rm);
  }, [records]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Records</h1>
          <p className="page-subtitle">Log your lifts and track strength progress over time</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <IconPlus width={15} height={15} /> Log a lift
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-16">
          <div className="card-title mb-8">New lift</div>
          <div className="field">
            <label>Exercise</label>
            <input
              className="input"
              list="pr-exercise-names"
              placeholder="e.g. Barbell Bench Press"
              value={form.exercise_name}
              onChange={(e) => setField("exercise_name", e.target.value)}
              autoFocus
            />
            <datalist id="pr-exercise-names">
              {ALL_EXERCISE_NAMES.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-3 mt-16" style={{ gap: 12 }}>
            <div className="field">
              <label>Weight (kg)</label>
              <input type="number" step="any" min="0" className="input" value={form.weight_kg} onChange={(e) => setField("weight_kg", e.target.value)} />
            </div>
            <div className="field">
              <label>Reps</label>
              <input type="number" step="1" min="1" className="input" value={form.reps} onChange={(e) => setField("reps", e.target.value)} />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" className="input" value={form.date} onChange={(e) => setField("date", e.target.value)} />
            </div>
          </div>
          <div className="field mt-16">
            <label>Notes (optional)</label>
            <input className="input" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="e.g. felt easy, new belt" />
          </div>
          {error && (
            <div className="text-sm mt-16" style={{ color: "var(--status-critical)" }}>
              {error}
            </div>
          )}
          <div className="flex gap-12 mt-16">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save lift"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card empty-row">Loading…</div>
      ) : records.length === 0 ? (
        <div className="card photo-empty-state">
          <IconTrophy width={30} height={30} />
          <div className="font-semibold mt-8">No lifts logged yet</div>
          <div className="text-sm text-muted mt-8">Log a lift to start tracking your personal records.</div>
        </div>
      ) : (
        <>
          <div className="card-title mb-8">Personal bests</div>
          <div className="split-grid mb-24">
            {bestByExercise.map((r) => (
              <div className="split-option" key={r.exercise_name} style={{ cursor: "default" }}>
                <div className="split-option-name">{r.exercise_name}</div>
                <div className="split-option-desc">
                  {r.weight_kg} kg × {r.reps} {r.reps === 1 ? "rep" : "reps"} — {formatFullDate(r.date)}
                </div>
                <div className="split-option-days">Est. 1RM: {Math.round(r.est1rm)} kg</div>
              </div>
            ))}
          </div>

          <div className="card-title mb-8">Full history</div>
          <div className="card" style={{ padding: 0 }}>
            {records.map((r) => (
              <div className="food-row" key={r.id}>
                <div className="food-row-main">
                  <div className="food-row-name">{r.exercise_name}</div>
                  <div className="food-row-meta">
                    {formatFullDate(r.date)}
                    {r.notes ? ` · ${r.notes}` : ""}
                  </div>
                </div>
                <div className="food-row-right">
                  <div className="text-sm" style={{ textAlign: "right" }}>
                    <span className="font-bold">
                      {r.weight_kg} kg × {r.reps}
                    </span>
                    <span className="text-muted"> · ~{Math.round(estimate1RM(r.weight_kg, r.reps))} kg 1RM</span>
                  </div>
                  <button className="btn btn-danger-ghost btn-icon" onClick={() => handleDelete(r.id)} aria-label="Delete">
                    <IconTrash width={15} height={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
