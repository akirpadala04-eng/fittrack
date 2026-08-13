import { useEffect, useState } from "react";
import { api, todayStr } from "../api";
import DateNav from "../components/DateNav";
import AddFoodModal from "../components/AddFoodModal";
import CalorieRing from "../components/CalorieRing";
import MacroBar from "../components/MacroBar";
import { IconPlus, IconTrash } from "../components/Icons";

const MEALS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snack", label: "Snacks" },
];

export default function Diary() {
  const [date, setDate] = useState(todayStr());
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [modalMeal, setModalMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    setLoading(true);
    Promise.all([api.getFoodLogs(date), api.getSummary(date)]).then(([l, s]) => {
      setLogs(l);
      setSummary(s);
      setLoading(false);
    });
  }

  useEffect(reload, [date]);

  async function handleAdd(foodId, servings) {
    await api.createFoodLog({ food_id: foodId, date, meal: modalMeal, servings });
    setModalMeal(null);
    reload();
  }

  async function handleDelete(id) {
    await api.deleteFoodLog(id);
    reload();
  }

  if (loading || !summary) {
    return (
      <div className="page">
        <div className="text-muted">Loading…</div>
      </div>
    );
  }

  const { food, goals } = summary;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Food Diary</h1>
          <p className="page-subtitle">Log what you eat, meal by meal</p>
        </div>
        <DateNav date={date} onChange={setDate} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px", alignItems: "start", gap: 24 }}>
        <div className="flex-col gap-16">
          {MEALS.map((meal) => {
            const items = logs.filter((l) => l.meal === meal.key);
            const total = items.reduce((s, i) => s + i.total_calories, 0);
            return (
              <div className="meal-card" key={meal.key}>
                <div className="meal-header">
                  <div className="meal-title">{meal.label}</div>
                  <div className="flex items-center gap-12">
                    <span className="meal-cals">{Math.round(total)} cal</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => setModalMeal(meal.key)}>
                      <IconPlus width={14} height={14} /> Add food
                    </button>
                  </div>
                </div>
                {items.length === 0 ? (
                  <div className="empty-row">Nothing logged for {meal.label.toLowerCase()} yet.</div>
                ) : (
                  items.map((item) => (
                    <div className="food-row" key={item.id}>
                      <div className="food-row-main">
                        <div className="food-row-name">{item.name}</div>
                        <div className="food-row-meta">
                          {item.servings} × {item.serving_size} {item.serving_unit}
                        </div>
                      </div>
                      <div className="food-row-right">
                        <div className="food-row-cals">{Math.round(item.total_calories)} cal</div>
                        <button className="btn btn-danger-ghost btn-icon" onClick={() => handleDelete(item.id)}>
                          <IconTrash width={15} height={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>

        <div className="flex-col gap-16">
          <div className="card flex-col items-center" style={{ gap: 10 }}>
            <div className="card-title" style={{ alignSelf: "flex-start" }}>Today's totals</div>
            <CalorieRing consumed={food.calories} burned={summary.exercise.caloriesBurned} goal={goals.calories} size={140} />
          </div>
          <div className="card flex-col gap-16">
            <MacroBar label="Protein" color="var(--series-protein)" amount={food.protein} goal={goals.protein} />
            <MacroBar label="Carbs" color="var(--series-carbs)" amount={food.carbs} goal={goals.carbs} />
            <MacroBar label="Fat" color="var(--series-fat)" amount={food.fat} goal={goals.fat} />
          </div>
          <div className="card text-sm flex-col gap-8">
            <div className="flex justify-between">
              <span className="text-secondary">Fiber</span>
              <span className="font-semibold">{Math.round(food.fiber)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Sugar</span>
              <span className="font-semibold">{Math.round(food.sugar)}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Sodium</span>
              <span className="font-semibold">{Math.round(food.sodium)}mg</span>
            </div>
          </div>
        </div>
      </div>

      {modalMeal && (
        <AddFoodModal
          mealLabel={MEALS.find((m) => m.key === modalMeal).label}
          onClose={() => setModalMeal(null)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
