import { useEffect, useState } from "react";
import { api } from "../api";
import { SPLITS, FOCUS_OPTIONS, WEEKDAY_SHORT, generatePlan, todayDow } from "../data/splitPlans";
import { IconRefresh, IconCalendar } from "../components/Icons";

export default function SplitPlanner() {
  const [splitKey, setSplitKey] = useState(SPLITS[2].key); // Push/Pull/Legs default
  const [daysPerWeek, setDaysPerWeek] = useState(SPLITS[2].dayOptions[0]);
  const [focus, setFocus] = useState("hypertrophy");
  const [plan, setPlan] = useState(null);
  const [seed, setSeed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getWorkoutPlan().then((saved) => {
      if (saved && saved.plan) {
        setSplitKey(saved.split_key);
        setDaysPerWeek(saved.days_per_week);
        setFocus(saved.focus);
        setPlan(saved.plan);
      }
      setLoading(false);
    });
  }, []);

  function handleSelectSplit(key) {
    setSplitKey(key);
    const def = SPLITS.find((s) => s.key === key);
    setDaysPerWeek(def.dayOptions[0]);
  }

  async function handleGenerate() {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    const generated = generatePlan({ splitKey, daysPerWeek, focus, shuffleSeed: nextSeed });
    setPlan(generated);
    setSaving(true);
    try {
      await api.saveWorkoutPlan({ split_key: splitKey, days_per_week: daysPerWeek, focus, plan: generated });
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setPlan(null);
    await api.deleteWorkoutPlan();
  }

  const activeSplit = SPLITS.find((s) => s.key === splitKey) || SPLITS[0];
  const today = todayDow();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Split Planner</h1>
          <p className="page-subtitle">Pick a workout split and generate a full weekly routine</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title mb-8">Choose your split</div>
        <div className="split-grid">
          {SPLITS.map((s) => (
            <button
              key={s.key}
              className={`split-option${splitKey === s.key ? " active" : ""}`}
              onClick={() => handleSelectSplit(s.key)}
            >
              <div className="split-option-name">{s.name}</div>
              <div className="split-option-desc">{s.description}</div>
              <div className="split-option-days">{s.dayOptions.join(" or ")} days/week</div>
            </button>
          ))}
        </div>

        <div className="mt-24">
          <div className="card-title mb-8">Days per week</div>
          <div className="pill-select">
            {activeSplit.dayOptions.map((n) => (
              <button
                key={n}
                className={`pill-btn${daysPerWeek === n ? " active" : ""}`}
                onClick={() => setDaysPerWeek(n)}
              >
                {n} days
              </button>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <div className="card-title mb-8">Training focus</div>
          <div className="pill-select">
            {FOCUS_OPTIONS.map((f) => (
              <button
                key={f.key}
                className={`pill-btn${focus === f.key ? " active" : ""}`}
                onClick={() => setFocus(f.key)}
                title={f.blurb}
              >
                {f.label} <span className="pill-btn-sub">{f.reps} reps</span>
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary mt-24" onClick={handleGenerate} disabled={saving}>
          <IconRefresh width={15} height={15} />
          {saving ? "Saving…" : plan ? "Regenerate weekly routine" : "Generate weekly routine"}
        </button>
      </div>

      {loading ? (
        <div className="card empty-row mt-24">Loading…</div>
      ) : !plan ? (
        <div className="card photo-empty-state mt-24">
          <IconCalendar width={30} height={30} />
          <div className="font-semibold mt-8">No routine generated yet</div>
          <div className="text-sm text-muted mt-8">
            Pick a split above and hit generate to build your weekly schedule.
          </div>
        </div>
      ) : (
        <>
          <div className="week-grid mt-24">
            {plan.days.map((d) => (
              <div key={d.dow} className={`day-card${d.dow === today ? " day-card-today" : ""}${d.isRest ? " day-card-rest" : ""}`}>
                <div className="day-card-header">
                  <div className="day-card-weekday">
                    {WEEKDAY_SHORT[d.dow]}
                    {d.dow === today && <span className="pill pill-brand ml-6">Today</span>}
                  </div>
                  <div className="day-card-title">{d.title}</div>
                </div>
                {d.isRest ? (
                  <div className="day-card-rest-msg">Rest &amp; recover</div>
                ) : (
                  <ul className="day-exercise-list">
                    {d.exercises.map((ex, i) => (
                      <li key={i}>
                        <span className="day-exercise-name">{ex.name}</span>
                        <span className="day-exercise-sets">
                          {ex.sets} × {ex.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <button className="btn btn-ghost mt-16" onClick={handleClear}>
            Clear plan
          </button>
        </>
      )}
    </div>
  );
}
