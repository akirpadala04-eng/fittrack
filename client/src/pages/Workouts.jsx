import { useEffect, useState } from "react";
import { api, todayStr } from "../api";
import DateNav from "../components/DateNav";
import AddWorkoutModal from "../components/AddWorkoutModal";
import { IconPlus, IconTrash, IconFlame, IconClock, IconDumbbell } from "../components/Icons";

export default function Workouts() {
  const [date, setDate] = useState(todayStr());
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  function reload() {
    setLoading(true);
    api.getWorkoutLogs(date).then((l) => {
      setLogs(l);
      setLoading(false);
    });
  }

  useEffect(reload, [date]);
  useEffect(() => {
    api.getSettings().then(setSettings);
  }, []);

  async function handleAdd(exerciseId, duration) {
    await api.createWorkoutLog({ exercise_id: exerciseId, date, duration_minutes: duration });
    setShowModal(false);
    reload();
  }

  async function handleDelete(id) {
    await api.deleteWorkoutLog(id);
    reload();
  }

  const totalCalories = logs.reduce((s, l) => s + l.calories_burned, 0);
  const totalMinutes = logs.reduce((s, l) => s + l.duration_minutes, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">Log exercise and track calories burned</p>
        </div>
        <DateNav date={date} onChange={setDate} />
      </div>

      <div className="grid grid-3 mt-16" style={{ marginBottom: 22 }}>
        <StatTile icon={<IconFlame />} label="Calories burned" value={Math.round(totalCalories)} />
        <StatTile icon={<IconClock />} label="Total minutes" value={Math.round(totalMinutes)} />
        <StatTile icon={<IconDumbbell />} label="Workouts" value={logs.length} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="meal-header">
          <div className="meal-title">Logged workouts</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <IconPlus width={14} height={14} /> Log workout
          </button>
        </div>
        {loading ? (
          <div className="empty-row">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="empty-row">No workouts logged for this day yet.</div>
        ) : (
          logs.map((w) => (
            <div className="food-row" key={w.id}>
              <div className="food-row-main">
                <div className="food-row-name">{w.name}</div>
                <div className="food-row-meta">
                  {w.category} · {w.duration_minutes} min
                </div>
              </div>
              <div className="food-row-right">
                <div className="food-row-cals">{Math.round(w.calories_burned)} cal</div>
                <button className="btn btn-danger-ghost btn-icon" onClick={() => handleDelete(w.id)}>
                  <IconTrash width={15} height={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && settings && (
        <AddWorkoutModal onClose={() => setShowModal(false)} onAdd={handleAdd} weightKg={settings.weight_kg} />
      )}
    </div>
  );
}

function StatTile({ icon, label, value }) {
  return (
    <div className="card flex items-center gap-12">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "var(--brand-light)",
          color: "var(--brand-dark)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted">{label}</div>
        <div className="font-bold" style={{ fontSize: 19 }}>
          {value}
        </div>
      </div>
    </div>
  );
}
