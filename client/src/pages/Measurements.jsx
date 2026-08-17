import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { api, todayStr, formatFullDate } from "../api";
import { IconPlus, IconTrash, IconScale } from "../components/Icons";

const FIELDS = [
  { key: "weight_kg", label: "Weight (kg)" },
  { key: "waist_cm", label: "Waist (cm)" },
  { key: "chest_cm", label: "Chest (cm)" },
  { key: "hips_cm", label: "Hips (cm)" },
  { key: "arms_cm", label: "Arms (cm)" },
  { key: "thighs_cm", label: "Thighs (cm)" },
];

export default function Measurements() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function blankForm() {
    return { date: todayStr(), weight_kg: "", waist_cm: "", chest_cm: "", hips_cm: "", arms_cm: "", thighs_cm: "", notes: "" };
  }

  function reload() {
    setLoading(true);
    api.getMeasurements().then((r) => {
      setEntries(r);
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
    const hasAny = FIELDS.some((f) => form[f.key] !== "");
    if (!hasAny) {
      setError("Enter at least one measurement.");
      return;
    }
    setSaving(true);
    try {
      const payload = { date: form.date, notes: form.notes || null };
      FIELDS.forEach((f) => {
        payload[f.key] = form[f.key] === "" ? null : Number(form[f.key]);
      });
      await api.createMeasurement(payload);
      setForm(blankForm());
      setShowForm(false);
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    await api.deleteMeasurement(id);
    reload();
  }

  const weightSeries = [...entries]
    .filter((e) => e.weight_kg != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, weight: e.weight_kg }));

  const latest = entries[0];
  const first = weightSeries[0];
  const weightChange =
    latest?.weight_kg != null && first?.weight != null ? latest.weight_kg - first.weight : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Measurements</h1>
          <p className="page-subtitle">Track weight and body measurements over time</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <IconPlus width={15} height={15} /> Log measurement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-16">
          <div className="card-title mb-8">New measurement</div>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>Date</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setField("date", e.target.value)} />
          </div>
          <div className="grid grid-3 mt-16" style={{ gap: 12 }}>
            {FIELDS.map((f) => (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="input"
                  placeholder="optional"
                  value={form[f.key]}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="field mt-16">
            <label>Notes (optional)</label>
            <input className="input" value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="e.g. morning, fasted" />
          </div>
          {error && (
            <div className="text-sm mt-16" style={{ color: "var(--status-critical)" }}>
              {error}
            </div>
          )}
          <div className="flex gap-12 mt-16">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save measurement"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card empty-row">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="card photo-empty-state">
          <IconScale width={30} height={30} />
          <div className="font-semibold mt-8">No measurements logged yet</div>
          <div className="text-sm text-muted mt-8">Log your weight or body measurements to see trends over time.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-3 mb-16">
            <StatTile label="Latest weight" value={latest?.weight_kg != null ? `${latest.weight_kg} kg` : "—"} />
            <StatTile
              label="Change since first log"
              value={weightChange != null ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg` : "—"}
            />
            <StatTile label="Entries logged" value={entries.length} />
          </div>

          {weightSeries.length >= 2 && (
            <div className="card mb-16">
              <div className="card-title mb-8">Weight trend</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="#e1e0d9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => d.slice(5)}
                      tick={{ fontSize: 11, fill: "#898781" }}
                      axisLine={{ stroke: "#c3c2b7" }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#898781" }} axisLine={false} tickLine={false} width={40} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e4e7e2", fontSize: 12.5 }} labelStyle={{ fontWeight: 700 }} />
                    <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#1baf7a" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0 }}>
            <div
              className="flex justify-between text-xs text-muted font-semibold"
              style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "#fbfcfa" }}
            >
              <span>Date</span>
              <span>Measurements</span>
            </div>
            {entries.map((e) => (
              <div className="food-row" key={e.id}>
                <div className="food-row-main">
                  <div className="food-row-name">{formatFullDate(e.date)}</div>
                  {e.notes && <div className="food-row-meta">{e.notes}</div>}
                </div>
                <div className="food-row-right">
                  <div className="text-sm" style={{ textAlign: "right" }}>
                    {FIELDS.filter((f) => e[f.key] != null)
                      .map((f) => `${f.label.split(" ")[0]}: ${e[f.key]}${f.key === "weight_kg" ? "kg" : "cm"}`)
                      .join(" · ") || "—"}
                  </div>
                  <button className="btn btn-danger-ghost btn-icon" onClick={() => handleDelete(e.id)} aria-label="Delete">
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

function StatTile({ label, value }) {
  return (
    <div className="card">
      <div className="text-xs text-muted">{label}</div>
      <div className="font-bold" style={{ fontSize: 20, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}
