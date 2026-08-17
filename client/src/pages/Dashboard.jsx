import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { api, todayStr } from "../api";
import DateNav from "../components/DateNav";
import CalorieRing from "../components/CalorieRing";
import MacroBar from "../components/MacroBar";
import WaterTracker from "../components/WaterTracker";
import AchievementBadges from "../components/AchievementBadges";
import ActivityHeatmap from "../components/ActivityHeatmap";
import MacroDonut from "../components/MacroDonut";
import { IconFlame, IconDumbbell, IconClock, IconPlus, IconCalendar } from "../components/Icons";

const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snacks" };

export default function Dashboard() {
  const [date, setDate] = useState(todayStr());
  const [summary, setSummary] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.getSummary(date),
      api.getFoodLogs(date),
      api.getWorkoutLogs(date),
      api.getHistory(14),
    ]).then(([s, fl, wl, h]) => {
      if (cancelled) return;
      setSummary(s);
      setFoodLogs(fl);
      setWorkoutLogs(wl);
      setHistory(h);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  useEffect(() => {
    api.getStreak().then(setStreak);
  }, [date]);

  if (loading || !summary) {
    return (
      <div className="page">
        <div className="text-muted">Loading…</div>
      </div>
    );
  }

  const { food, exercise, goals, netCalories } = summary;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your nutrition and activity overview</p>
        </div>
        <DateNav date={date} onChange={setDate} />
      </div>

      <div className="grid grid-3" style={{ gridTemplateColumns: "1.1fr 1.3fr", alignItems: "stretch" }}>
        <div className="card flex-col items-center" style={{ justifyContent: "center", gap: 14 }}>
          <div className="card-title" style={{ alignSelf: "flex-start" }}>Calories</div>
          <CalorieRing consumed={food.calories} burned={exercise.caloriesBurned} goal={goals.calories} />
          <div className="grid grid-3" style={{ width: "100%", textAlign: "center", gap: 4 }}>
            <div>
              <div className="text-xs text-muted">Goal</div>
              <div className="font-bold">{Math.round(goals.calories).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Food</div>
              <div className="font-bold">{Math.round(food.calories).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Exercise</div>
              <div className="font-bold">{Math.round(exercise.caloriesBurned).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="card flex-col gap-16" style={{ justifyContent: "center" }}>
          <div className="card-title">Macros</div>
          <MacroBar label="Protein" color="var(--series-protein)" amount={food.protein} goal={goals.protein} />
          <MacroBar label="Carbs" color="var(--series-carbs)" amount={food.carbs} goal={goals.carbs} />
          <MacroBar label="Fat" color="var(--series-fat)" amount={food.fat} goal={goals.fat} />
          <MacroDonut protein={food.protein} carbs={food.carbs} fat={food.fat} />
        </div>
      </div>

      <div className="grid grid-2 mt-24" style={{ alignItems: "start" }}>
        <AchievementBadges />
        <ActivityHeatmap weeks={12} />
      </div>

      <div className="grid grid-4 mt-24">
        <StatTile icon={<IconFlame />} label="Net calories" value={Math.round(netCalories).toLocaleString()} />
        <StatTile icon={<IconDumbbell />} label="Workouts logged" value={exercise.workoutCount} />
        <StatTile icon={<IconClock />} label="Active minutes" value={Math.round(exercise.durationMinutes)} />
        <StatTile
          icon={<IconCalendar />}
          label="Logging streak"
          value={streak ? `${streak.streak} day${streak.streak === 1 ? "" : "s"}` : "…"}
        />
      </div>

      <div className="card mt-24">
        <div className="card-row" style={{ marginBottom: 6 }}>
          <div className="card-title">14-day trend</div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e1e0d9" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5)}
                tick={{ fontSize: 11, fill: "#898781" }}
                axisLine={{ stroke: "#c3c2b7" }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#898781" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e4e7e2", fontSize: 12.5 }}
                labelStyle={{ fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ fontSize: 12.5 }} />
              <Line type="monotone" dataKey="calories" name="Calories in" stroke="#2a78d6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="burned" name="Calories burned" stroke="#eb6834" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-3 mt-24" style={{ alignItems: "start" }}>
        <WaterTracker date={date} goalMl={summary.water?.goalMl || 2000} />

        <div className="card">
          <div className="card-row" style={{ marginBottom: 12 }}>
            <div className="card-title">Today's meals</div>
            <Link to="/diary" className="btn btn-ghost btn-sm">
              <IconPlus width={14} height={14} /> Log food
            </Link>
          </div>
          {foodLogs.length === 0 ? (
            <div className="empty-row">No food logged yet for this day.</div>
          ) : (
            <div className="flex-col gap-8">
              {Object.entries(groupBy(foodLogs, "meal")).map(([meal, items]) => (
                <div key={meal} className="flex justify-between text-sm" style={{ padding: "6px 0" }}>
                  <span className="font-semibold">{MEAL_LABELS[meal] || meal}</span>
                  <span className="text-secondary">
                    {items.reduce((s, i) => s + i.total_calories, 0).toFixed(0)} cal · {items.length} item
                    {items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-row" style={{ marginBottom: 12 }}>
            <div className="card-title">Today's workouts</div>
            <Link to="/workouts" className="btn btn-ghost btn-sm">
              <IconPlus width={14} height={14} /> Log workout
            </Link>
          </div>
          {workoutLogs.length === 0 ? (
            <div className="empty-row">No workouts logged yet for this day.</div>
          ) : (
            <div className="flex-col gap-8">
              {workoutLogs.map((w) => (
                <div key={w.id} className="flex justify-between text-sm" style={{ padding: "6px 0" }}>
                  <span className="font-semibold">{w.name}</span>
                  <span className="text-secondary">
                    {w.duration_minutes} min · {Math.round(w.calories_burned)} cal
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}
