import { useState } from "react";
import { IconX } from "./Icons";

const empty = {
  name: "",
  brand: "",
  category: "Custom",
  serving_size: 1,
  serving_unit: "serving",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  fiber: "",
  sugar: "",
  sodium: "",
};

export default function CustomFoodModal({ onClose, onCreate }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || form.calories === "") return;
    setSaving(true);
    await onCreate({
      ...form,
      serving_size: Number(form.serving_size) || 1,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      fiber: Number(form.fiber) || 0,
      sugar: Number(form.sugar) || 0,
      sodium: Number(form.sodium) || 0,
    });
    setSaving(false);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <div className="modal-title">Add a custom food</div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose}>
            <IconX width={18} height={18} />
          </button>
        </div>
        <div className="modal-body flex-col gap-16">
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>Food name *</label>
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label>Brand (optional)</label>
              <input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label>Category</label>
              <input className="input" value={form.category} onChange={(e) => set("category", e.target.value)} />
            </div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="field">
                <label>Serving size</label>
                <input type="number" step="any" className="input" value={form.serving_size} onChange={(e) => set("serving_size", e.target.value)} />
              </div>
              <div className="field">
                <label>Unit</label>
                <input className="input" value={form.serving_unit} onChange={(e) => set("serving_unit", e.target.value)} placeholder="g, cup, piece…" />
              </div>
            </div>
          </div>

          <div className="grid grid-4" style={{ gap: 12 }}>
            <div className="field">
              <label>Calories *</label>
              <input type="number" step="any" className="input" value={form.calories} onChange={(e) => set("calories", e.target.value)} required />
            </div>
            <div className="field">
              <label>Protein (g)</label>
              <input type="number" step="any" className="input" value={form.protein} onChange={(e) => set("protein", e.target.value)} />
            </div>
            <div className="field">
              <label>Carbs (g)</label>
              <input type="number" step="any" className="input" value={form.carbs} onChange={(e) => set("carbs", e.target.value)} />
            </div>
            <div className="field">
              <label>Fat (g)</label>
              <input type="number" step="any" className="input" value={form.fat} onChange={(e) => set("fat", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-3" style={{ gap: 12 }}>
            <div className="field">
              <label>Fiber (g)</label>
              <input type="number" step="any" className="input" value={form.fiber} onChange={(e) => set("fiber", e.target.value)} />
            </div>
            <div className="field">
              <label>Sugar (g)</label>
              <input type="number" step="any" className="input" value={form.sugar} onChange={(e) => set("sugar", e.target.value)} />
            </div>
            <div className="field">
              <label>Sodium (mg)</label>
              <input type="number" step="any" className="input" value={form.sodium} onChange={(e) => set("sodium", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save food"}
          </button>
        </div>
      </form>
    </div>
  );
}
