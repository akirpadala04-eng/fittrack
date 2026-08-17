import { useEffect, useState } from "react";
import { api } from "../api";

export default function Settings() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then(setForm);
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const updated = await api.updateSettings({
      ...form,
      weight_kg: Number(form.weight_kg),
      height_cm: Number(form.height_cm),
      age: Number(form.age),
      calorie_goal: Number(form.calorie_goal),
      protein_goal: Number(form.protein_goal),
      carb_goal: Number(form.carb_goal),
      fat_goal: Number(form.fat_goal),
      water_goal_ml: Number(form.water_goal_ml),
    });
    setForm(updated);
    setSaving(false);
    setSaved(true);
  }

  function applySuggestedGoals() {
    // Mifflin-St Jeor BMR, then apply activity multiplier + 20% protein / 45% carb / 35% fat split
    const w = Number(form.weight_kg);
    const h = Number(form.height_cm);
    const a = Number(form.age);
    const bmr =
      form.sex === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : form.sex === "female" ? 10 * w + 6.25 * h - 5 * a - 161 : 10 * w + 6.25 * h - 5 * a - 78;
    const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = Math.round(bmr * (multipliers[form.activity_level] || 1.55));
    setForm((f) => ({
      ...f,
      calorie_goal: tdee,
      protein_goal: Math.round((tdee * 0.3) / 4),
      carb_goal: Math.round((tdee * 0.4) / 4),
      fat_goal: Math.round((tdee * 0.3) / 9),
    }));
    setSaved(false);
  }

  if (!form) {
    return (
      <div className="page">
        <div className="text-muted">Loading…</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Personal details and daily goals</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-col gap-16" style={{ maxWidth: 640 }}>
        <div className="card flex-col gap-16">
          <div className="card-title">About you</div>
          <div className="field">
            <label>Display name</label>
            <input className="input" value={form.display_name} onChange={(e) => set("display_name", e.target.value)} />
          </div>
          <div className="grid grid-3" style={{ gap: 12 }}>
            <div className="field">
              <label>Weight (kg)</label>
              <input type="number" step="any" className="input" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} />
            </div>
            <div className="field">
              <label>Height (cm)</label>
              <input type="number" step="any" className="input" value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} />
            </div>
            <div className="field">
              <label>Age</label>
              <input type="number" step="1" className="input" value={form.age} onChange={(e) => set("age", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>Sex</label>
              <select className="select" value={form.sex} onChange={(e) => set("sex", e.target.value)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Activity level</label>
              <select className="select" value={form.activity_level} onChange={(e) => set("activity_level", e.target.value)}>
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Lightly active</option>
                <option value="moderate">Moderately active</option>
                <option value="active">Very active</option>
                <option value="very_active">Extremely active</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-muted">Weight is also used to estimate calories burned per workout.</div>
        </div>

        <BmiCard weightKg={Number(form.weight_kg)} heightCm={Number(form.height_cm)} />

        <div className="card flex-col gap-16">
          <div className="card-row">
            <div className="card-title">Daily goals</div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={applySuggestedGoals}>
              Suggest goals for me
            </button>
          </div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>Calorie goal (kcal)</label>
              <input type="number" step="1" className="input" value={form.calorie_goal} onChange={(e) => set("calorie_goal", e.target.value)} />
            </div>
            <div className="field">
              <label>Water goal (ml)</label>
              <input type="number" step="1" className="input" value={form.water_goal_ml} onChange={(e) => set("water_goal_ml", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-3" style={{ gap: 12 }}>
            <div className="field">
              <label>Protein (g)</label>
              <input type="number" step="1" className="input" value={form.protein_goal} onChange={(e) => set("protein_goal", e.target.value)} />
            </div>
            <div className="field">
              <label>Carbs (g)</label>
              <input type="number" step="1" className="input" value={form.carb_goal} onChange={(e) => set("carb_goal", e.target.value)} />
            </div>
            <div className="field">
              <label>Fat (g)</label>
              <input type="number" step="1" className="input" value={form.fat_goal} onChange={(e) => set("fat_goal", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save settings"}
          </button>
          {saved && <span className="text-sm" style={{ color: "var(--status-good)" }}>Saved!</span>}
        </div>
      </form>
    </div>
  );
}

function BmiCard({ weightKg, heightCm }) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let category = "Normal";
  let color = "var(--status-good)";
  if (bmi < 18.5) {
    category = "Underweight";
    color = "var(--status-warning)";
  } else if (bmi >= 25 && bmi < 30) {
    category = "Overweight";
    color = "var(--status-warning)";
  } else if (bmi >= 30) {
    category = "Obese";
    color = "var(--status-critical)";
  }
  return (
    <div className="card flex items-center justify-between gap-16">
      <div>
        <div className="card-title">Body Mass Index</div>
        <div className="text-xs text-muted mt-8">
          BMI is a rough screening measure — it doesn't account for muscle mass, so take the category loosely.
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div className="font-bold" style={{ fontSize: 24 }}>
          {bmi.toFixed(1)}
        </div>
        <div className="text-xs font-semibold" style={{ color }}>
          {category}
        </div>
      </div>
    </div>
  );
}
