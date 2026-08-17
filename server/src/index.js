const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
// Raised limit (default is 100kb) so base64-encoded progress photos can be uploaded as JSON.
app.use(express.json({ limit: "15mb" }));

// ---------- Helpers ----------
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// Given an array of 'YYYY-MM-DD' date strings (any order, dupes ok), return the
// length of the longest run of consecutive calendar dates.
function longestConsecutiveRun(dateStrings) {
  const sorted = [...new Set(dateStrings)].sort();
  let longest = 0;
  let current = 0;
  let prev = null;
  for (const d of sorted) {
    if (prev !== null) {
      const prevDate = new Date(prev + "T00:00:00");
      const curDate = new Date(d + "T00:00:00");
      const diffDays = Math.round((curDate - prevDate) / 86400000);
      current = diffDays === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prev = d;
  }
  return longest;
}

// ---------- Foods ----------

// Search / list foods
app.get("/api/foods", (req, res) => {
  const { q, category, favorite } = req.query;
  let sql = "SELECT * FROM foods WHERE 1=1";
  const params = [];
  if (q) {
    sql += " AND name LIKE ?";
    params.push(`%${q}%`);
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (favorite) {
    sql += " AND is_favorite = 1";
  }
  sql += " ORDER BY is_custom DESC, name ASC LIMIT 200";
  const foods = db.prepare(sql).all(...params);
  res.json(foods);
});

app.get("/api/foods/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM foods ORDER BY category").all();
  res.json(rows.map((r) => r.category));
});

// Most recently logged distinct foods (for quick-add in the Add Food modal)
app.get("/api/foods/recent", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "8", 10) || 8, 30);
  const rows = db
    .prepare(
      `SELECT f.* FROM foods f
       WHERE f.id IN (
         SELECT food_id FROM (
           SELECT food_id, MAX(created_at) AS last_logged
           FROM food_logs GROUP BY food_id
         ) ORDER BY last_logged DESC LIMIT ?
       )
       ORDER BY (SELECT MAX(created_at) FROM food_logs WHERE food_logs.food_id = f.id) DESC`
    )
    .all(limit);
  res.json(rows);
});

app.put("/api/foods/:id/favorite", (req, res) => {
  const food = db.prepare("SELECT * FROM foods WHERE id = ?").get(req.params.id);
  if (!food) return res.status(404).json({ error: "Food not found" });
  const isFavorite = req.body.is_favorite ? 1 : 0;
  db.prepare("UPDATE foods SET is_favorite = ? WHERE id = ?").run(isFavorite, req.params.id);
  res.json(db.prepare("SELECT * FROM foods WHERE id = ?").get(req.params.id));
});

app.get("/api/foods/:id", (req, res) => {
  const food = db.prepare("SELECT * FROM foods WHERE id = ?").get(req.params.id);
  if (!food) return res.status(404).json({ error: "Food not found" });
  res.json(food);
});

app.post("/api/foods", (req, res) => {
  const {
    name, brand, category, serving_size, serving_unit,
    calories, protein, carbs, fat, fiber, sugar, sodium,
  } = req.body;
  if (!name || calories === undefined) {
    return res.status(400).json({ error: "name and calories are required" });
  }
  const stmt = db.prepare(`
    INSERT INTO foods (name, brand, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, sodium, is_custom)
    VALUES (@name, @brand, @category, @serving_size, @serving_unit, @calories, @protein, @carbs, @fat, @fiber, @sugar, @sodium, 1)
  `);
  const info = stmt.run({
    name,
    brand: brand || null,
    category: category || "Custom",
    serving_size: serving_size ?? 1,
    serving_unit: serving_unit || "serving",
    calories: calories ?? 0,
    protein: protein ?? 0,
    carbs: carbs ?? 0,
    fat: fat ?? 0,
    fiber: fiber ?? 0,
    sugar: sugar ?? 0,
    sodium: sodium ?? 0,
  });
  const food = db.prepare("SELECT * FROM foods WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(food);
});

app.delete("/api/foods/:id", (req, res) => {
  const food = db.prepare("SELECT * FROM foods WHERE id = ?").get(req.params.id);
  if (!food) return res.status(404).json({ error: "Food not found" });
  if (!food.is_custom) return res.status(400).json({ error: "Cannot delete a built-in food" });
  db.prepare("DELETE FROM foods WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---------- Food Logs ----------

app.get("/api/food-logs", (req, res) => {
  const date = req.query.date || todayStr();
  const rows = db
    .prepare(
      `SELECT fl.id, fl.date, fl.meal, fl.servings, fl.created_at,
              f.id AS food_id, f.name, f.brand, f.serving_size, f.serving_unit,
              f.calories, f.protein, f.carbs, f.fat, f.fiber, f.sugar, f.sodium
       FROM food_logs fl
       JOIN foods f ON f.id = fl.food_id
       WHERE fl.date = ?
       ORDER BY fl.created_at ASC`
    )
    .all(date);

  const withTotals = rows.map((r) => ({
    ...r,
    total_calories: round1(r.calories * r.servings),
    total_protein: round1(r.protein * r.servings),
    total_carbs: round1(r.carbs * r.servings),
    total_fat: round1(r.fat * r.servings),
  }));
  res.json(withTotals);
});

app.post("/api/food-logs", (req, res) => {
  const { food_id, date, meal, servings } = req.body;
  if (!food_id || !meal) return res.status(400).json({ error: "food_id and meal are required" });
  const food = db.prepare("SELECT * FROM foods WHERE id = ?").get(food_id);
  if (!food) return res.status(404).json({ error: "Food not found" });
  const stmt = db.prepare(`
    INSERT INTO food_logs (food_id, date, meal, servings) VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(food_id, date || todayStr(), meal, servings ?? 1);
  const log = db.prepare("SELECT * FROM food_logs WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(log);
});

app.put("/api/food-logs/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM food_logs WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Log not found" });
  const { servings, meal } = req.body;
  db.prepare("UPDATE food_logs SET servings = ?, meal = ? WHERE id = ?").run(
    servings ?? existing.servings,
    meal ?? existing.meal,
    req.params.id
  );
  const updated = db.prepare("SELECT * FROM food_logs WHERE id = ?").get(req.params.id);
  res.json(updated);
});

app.delete("/api/food-logs/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM food_logs WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Log not found" });
  db.prepare("DELETE FROM food_logs WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---------- Exercises ----------

app.get("/api/exercises", (req, res) => {
  const { q, category } = req.query;
  let sql = "SELECT * FROM exercises WHERE 1=1";
  const params = [];
  if (q) {
    sql += " AND name LIKE ?";
    params.push(`%${q}%`);
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  sql += " ORDER BY is_custom DESC, name ASC LIMIT 200";
  res.json(db.prepare(sql).all(...params));
});

app.get("/api/exercises/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM exercises ORDER BY category").all();
  res.json(rows.map((r) => r.category));
});

app.post("/api/exercises", (req, res) => {
  const { name, category, met } = req.body;
  if (!name || !met) return res.status(400).json({ error: "name and met are required" });
  const info = db
    .prepare("INSERT INTO exercises (name, category, met, is_custom) VALUES (?, ?, ?, 1)")
    .run(name, category || "Custom", met);
  res.status(201).json(db.prepare("SELECT * FROM exercises WHERE id = ?").get(info.lastInsertRowid));
});

// ---------- Workout Logs ----------

app.get("/api/workout-logs", (req, res) => {
  const date = req.query.date || todayStr();
  const rows = db
    .prepare(
      `SELECT wl.id, wl.date, wl.duration_minutes, wl.calories_burned, wl.notes, wl.created_at,
              e.id AS exercise_id, e.name, e.category, e.met
       FROM workout_logs wl
       JOIN exercises e ON e.id = wl.exercise_id
       WHERE wl.date = ?
       ORDER BY wl.created_at ASC`
    )
    .all(date);
  res.json(rows);
});

app.post("/api/workout-logs", (req, res) => {
  const { exercise_id, date, duration_minutes, notes } = req.body;
  if (!exercise_id || !duration_minutes) {
    return res.status(400).json({ error: "exercise_id and duration_minutes are required" });
  }
  const exercise = db.prepare("SELECT * FROM exercises WHERE id = ?").get(exercise_id);
  if (!exercise) return res.status(404).json({ error: "Exercise not found" });
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  const caloriesBurned = round1(exercise.met * settings.weight_kg * (duration_minutes / 60));

  const info = db
    .prepare(
      `INSERT INTO workout_logs (exercise_id, date, duration_minutes, calories_burned, notes)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(exercise_id, date || todayStr(), duration_minutes, caloriesBurned, notes || null);

  const log = db.prepare("SELECT * FROM workout_logs WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(log);
});

app.delete("/api/workout-logs/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM workout_logs WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Log not found" });
  db.prepare("DELETE FROM workout_logs WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---------- Physique Photos ----------

app.get("/api/photos", (req, res) => {
  const rows = db
    .prepare("SELECT id, date, note, photo_data, created_at FROM physique_photos ORDER BY date DESC, id DESC")
    .all();
  res.json(rows);
});

app.post("/api/photos", (req, res) => {
  const { date, note, photo_data } = req.body;
  if (!photo_data || typeof photo_data !== "string" || !photo_data.startsWith("data:image/")) {
    return res.status(400).json({ error: "photo_data must be a base64 image data URL" });
  }
  // Rough sanity cap (~12MB of base64 text) in addition to the express.json limit.
  if (photo_data.length > 12 * 1024 * 1024) {
    return res.status(413).json({ error: "That photo is too large. Try a smaller image." });
  }
  const info = db
    .prepare("INSERT INTO physique_photos (date, note, photo_data) VALUES (?, ?, ?)")
    .run(date || todayStr(), note || null, photo_data);
  const photo = db
    .prepare("SELECT id, date, note, photo_data, created_at FROM physique_photos WHERE id = ?")
    .get(info.lastInsertRowid);
  res.status(201).json(photo);
});

app.delete("/api/photos/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM physique_photos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Photo not found" });
  db.prepare("DELETE FROM physique_photos WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---------- Workout Plan (Split Planner) ----------

app.get("/api/workout-plan", (req, res) => {
  const row = db.prepare("SELECT * FROM workout_plan WHERE id = 1").get();
  if (!row) return res.json(null);
  res.json({
    split_key: row.split_key,
    days_per_week: row.days_per_week,
    focus: row.focus,
    plan: JSON.parse(row.plan_json),
    generated_at: row.generated_at,
  });
});

app.put("/api/workout-plan", (req, res) => {
  const { split_key, days_per_week, focus, plan } = req.body;
  if (!split_key || !days_per_week || !focus || !plan) {
    return res.status(400).json({ error: "split_key, days_per_week, focus, and plan are required" });
  }
  db.prepare(
    `INSERT INTO workout_plan (id, split_key, days_per_week, focus, plan_json, generated_at)
     VALUES (1, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       split_key=excluded.split_key, days_per_week=excluded.days_per_week,
       focus=excluded.focus, plan_json=excluded.plan_json, generated_at=excluded.generated_at`
  ).run(split_key, days_per_week, focus, JSON.stringify(plan));
  const row = db.prepare("SELECT * FROM workout_plan WHERE id = 1").get();
  res.json({
    split_key: row.split_key,
    days_per_week: row.days_per_week,
    focus: row.focus,
    plan: JSON.parse(row.plan_json),
    generated_at: row.generated_at,
  });
});

app.delete("/api/workout-plan", (req, res) => {
  db.prepare("DELETE FROM workout_plan WHERE id = 1").run();
  res.status(204).end();
});

// ---------- Settings ----------

app.get("/api/settings", (req, res) => {
  res.json(db.prepare("SELECT * FROM settings WHERE id = 1").get());
});

app.put("/api/settings", (req, res) => {
  const current = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  const merged = { ...current, ...req.body, id: 1 };
  db.prepare(
    `UPDATE settings SET display_name=@display_name, weight_kg=@weight_kg, height_cm=@height_cm,
     age=@age, sex=@sex, activity_level=@activity_level, calorie_goal=@calorie_goal,
     protein_goal=@protein_goal, carb_goal=@carb_goal, fat_goal=@fat_goal, water_goal_ml=@water_goal_ml
     WHERE id = 1`
  ).run(merged);
  res.json(db.prepare("SELECT * FROM settings WHERE id = 1").get());
});

// ---------- Daily Summary ----------

app.get("/api/summary", (req, res) => {
  const date = req.query.date || todayStr();
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();

  const foodTotals = db
    .prepare(
      `SELECT
        COALESCE(SUM(f.calories * fl.servings), 0) AS calories,
        COALESCE(SUM(f.protein * fl.servings), 0) AS protein,
        COALESCE(SUM(f.carbs * fl.servings), 0) AS carbs,
        COALESCE(SUM(f.fat * fl.servings), 0) AS fat,
        COALESCE(SUM(f.fiber * fl.servings), 0) AS fiber,
        COALESCE(SUM(f.sugar * fl.servings), 0) AS sugar,
        COALESCE(SUM(f.sodium * fl.servings), 0) AS sodium
       FROM food_logs fl JOIN foods f ON f.id = fl.food_id
       WHERE fl.date = ?`
    )
    .get(date);

  const exerciseTotals = db
    .prepare(
      `SELECT COALESCE(SUM(calories_burned), 0) AS calories_burned,
              COALESCE(SUM(duration_minutes), 0) AS duration_minutes,
              COUNT(*) AS workout_count
       FROM workout_logs WHERE date = ?`
    )
    .get(date);

  const mealBreakdown = db
    .prepare(
      `SELECT fl.meal, COALESCE(SUM(f.calories * fl.servings), 0) AS calories
       FROM food_logs fl JOIN foods f ON f.id = fl.food_id
       WHERE fl.date = ?
       GROUP BY fl.meal`
    )
    .all(date);

  const caloriesConsumed = round1(foodTotals.calories);
  const caloriesBurned = round1(exerciseTotals.calories_burned);
  const netCalories = round1(caloriesConsumed - caloriesBurned);
  const remaining = round1(settings.calorie_goal - netCalories);

  const waterTotal = db
    .prepare("SELECT COALESCE(SUM(amount_ml), 0) AS total FROM water_logs WHERE date = ?")
    .get(date).total;

  res.json({
    date,
    goals: {
      calories: settings.calorie_goal,
      protein: settings.protein_goal,
      carbs: settings.carb_goal,
      fat: settings.fat_goal,
      water_ml: settings.water_goal_ml,
    },
    water: {
      consumedMl: round1(waterTotal),
      goalMl: settings.water_goal_ml,
    },
    food: {
      calories: caloriesConsumed,
      protein: round1(foodTotals.protein),
      carbs: round1(foodTotals.carbs),
      fat: round1(foodTotals.fat),
      fiber: round1(foodTotals.fiber),
      sugar: round1(foodTotals.sugar),
      sodium: round1(foodTotals.sodium),
    },
    exercise: {
      caloriesBurned,
      durationMinutes: exerciseTotals.duration_minutes,
      workoutCount: exerciseTotals.workout_count,
    },
    netCalories,
    remaining,
    mealBreakdown,
  });
});

// ---------- History (last N days summary, for progress charts) ----------
app.get("/api/history", (req, res) => {
  const days = parseInt(req.query.days || "14", 10);
  const rows = db
    .prepare(
      `SELECT fl.date,
              COALESCE(SUM(f.calories * fl.servings), 0) AS calories
       FROM food_logs fl JOIN foods f ON f.id = fl.food_id
       GROUP BY fl.date
       ORDER BY fl.date DESC
       LIMIT ?`
    )
    .all(days);

  const burnRows = db
    .prepare(
      `SELECT date, COALESCE(SUM(calories_burned), 0) AS burned
       FROM workout_logs GROUP BY date ORDER BY date DESC LIMIT ?`
    )
    .all(days);
  const burnMap = Object.fromEntries(burnRows.map((r) => [r.date, r.burned]));

  const combined = rows
    .map((r) => ({ date: r.date, calories: round1(r.calories), burned: round1(burnMap[r.date] || 0) }))
    .reverse();
  res.json(combined);
});

// ---------- Logging streak ----------
// Current consecutive-day streak of logging at least one food entry, ending today or yesterday
// (so the streak doesn't reset to 0 the moment you wake up before logging breakfast).
app.get("/api/streak", (req, res) => {
  const dates = new Set(
    db.prepare("SELECT DISTINCT date FROM food_logs").all().map((r) => r.date)
  );
  let streak = 0;
  let cursor = todayStr();
  if (!dates.has(cursor)) {
    // today has no entries yet — start counting from yesterday instead
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }
  while (dates.has(cursor)) {
    streak += 1;
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 1);
    cursor = d.toISOString().slice(0, 10);
  }
  res.json({ streak, loggedToday: dates.has(todayStr()) });
});

// ---------- Achievements ----------
// Server-computed badge unlock state, purely derived from existing tables — no new storage.
app.get("/api/achievements", (req, res) => {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();

  const foodLogCount = db.prepare("SELECT COUNT(*) AS c FROM food_logs").get().c;
  const foodDates = db.prepare("SELECT DISTINCT date FROM food_logs").all().map((r) => r.date);
  const longestFoodStreak = longestConsecutiveRun(foodDates);

  const workoutCount = db.prepare("SELECT COUNT(*) AS c FROM workout_logs").get().c;
  const prCount = db.prepare("SELECT COUNT(*) AS c FROM personal_records").get().c;
  const photoCount = db.prepare("SELECT COUNT(*) AS c FROM physique_photos").get().c;
  const measurementCount = db.prepare("SELECT COUNT(*) AS c FROM body_measurements").get().c;

  const maxWaterDay =
    db
      .prepare(
        `SELECT MAX(total) AS maxTotal FROM (
           SELECT date, SUM(amount_ml) AS total FROM water_logs GROUP BY date
         )`
      )
      .get().maxTotal || 0;

  const dailyCalorieRows = db
    .prepare(
      `SELECT fl.date AS date, SUM(f.calories * fl.servings) AS calories
       FROM food_logs fl JOIN foods f ON f.id = fl.food_id
       GROUP BY fl.date`
    )
    .all();
  const calorieGoalLow = settings.calorie_goal * 0.9;
  const calorieGoalHigh = settings.calorie_goal * 1.1;
  const goalGetterHit = dailyCalorieRows.some(
    (r) => r.calories >= calorieGoalLow && r.calories <= calorieGoalHigh
  );

  const achievements = [
    {
      key: "first_bite",
      label: "First Bite",
      description: "Log your first food entry",
      unlocked: foodLogCount > 0,
      progress: null,
    },
    {
      key: "week_warrior",
      label: "Week Warrior",
      description: "Log food 7 days in a row",
      unlocked: longestFoodStreak >= 7,
      progress: { current: Math.min(longestFoodStreak, 7), target: 7 },
    },
    {
      key: "consistency_champion",
      label: "Consistency Champion",
      description: "Log food 30 days in a row",
      unlocked: longestFoodStreak >= 30,
      progress: { current: Math.min(longestFoodStreak, 30), target: 30 },
    },
    {
      key: "first_sweat",
      label: "First Sweat",
      description: "Log your first workout",
      unlocked: workoutCount > 0,
      progress: null,
    },
    {
      key: "iron_habit",
      label: "Iron Habit",
      description: "Log 10 workouts total",
      unlocked: workoutCount >= 10,
      progress: { current: Math.min(workoutCount, 10), target: 10 },
    },
    {
      key: "pr_setter",
      label: "PR Setter",
      description: "Record your first personal record",
      unlocked: prCount > 0,
      progress: null,
    },
    {
      key: "strength_streak",
      label: "Strength Streak",
      description: "Record 5 personal records",
      unlocked: prCount >= 5,
      progress: { current: Math.min(prCount, 5), target: 5 },
    },
    {
      key: "snap_shot",
      label: "Snap Shot",
      description: "Upload your first progress photo",
      unlocked: photoCount > 0,
      progress: null,
    },
    {
      key: "transformation",
      label: "Transformation",
      description: "Upload 3 progress photos",
      unlocked: photoCount >= 3,
      progress: { current: Math.min(photoCount, 3), target: 3 },
    },
    {
      key: "on_the_scale",
      label: "On The Scale",
      description: "Log your first body measurement",
      unlocked: measurementCount > 0,
      progress: null,
    },
    {
      key: "hydration_hero",
      label: "Hydration Hero",
      description: "Hit your daily water goal",
      unlocked: maxWaterDay >= settings.water_goal_ml,
      progress: null,
    },
    {
      key: "goal_getter",
      label: "Goal Getter",
      description: "Log a day within 10% of your calorie goal",
      unlocked: goalGetterHit,
      progress: null,
    },
  ];

  res.json({ achievements });
});

// ---------- Weekly Activity Heatmap ----------
app.get("/api/activity-heatmap", (req, res) => {
  let weeks = parseInt(req.query.weeks || "12", 10);
  if (!Number.isFinite(weeks) || weeks < 1) weeks = 12;
  weeks = Math.min(weeks, 26);

  const totalDays = weeks * 7;
  const end = new Date(todayStr() + "T00:00:00");
  const start = new Date(end);
  start.setDate(start.getDate() - (totalDays - 1));

  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const foodRows = db
    .prepare(
      `SELECT fl.date AS date, SUM(f.calories * fl.servings) AS calories
       FROM food_logs fl JOIN foods f ON f.id = fl.food_id
       WHERE fl.date >= ? AND fl.date <= ?
       GROUP BY fl.date`
    )
    .all(startDate, endDate);
  const foodMap = new Map(foodRows.map((r) => [r.date, round1(r.calories)]));

  const workoutRows = db
    .prepare(`SELECT DISTINCT date FROM workout_logs WHERE date >= ? AND date <= ?`)
    .all(startDate, endDate);
  const workoutSet = new Set(workoutRows.map((r) => r.date));

  const days = [];
  const cursor = new Date(start);
  for (let i = 0; i < totalDays; i++) {
    const dateStr = cursor.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      hasFoodLog: foodMap.has(dateStr),
      hasWorkout: workoutSet.has(dateStr),
      calories: foodMap.get(dateStr) || 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  res.json({ weeks, startDate, endDate, days });
});

// ---------- Body Measurements ----------

app.get("/api/measurements", (req, res) => {
  const rows = db.prepare("SELECT * FROM body_measurements ORDER BY date DESC, id DESC").all();
  res.json(rows);
});

app.post("/api/measurements", (req, res) => {
  const { date, weight_kg, waist_cm, chest_cm, hips_cm, arms_cm, thighs_cm, notes } = req.body;
  const hasAnyValue = [weight_kg, waist_cm, chest_cm, hips_cm, arms_cm, thighs_cm].some(
    (v) => v !== undefined && v !== null && v !== ""
  );
  if (!hasAnyValue) {
    return res.status(400).json({ error: "Enter at least one measurement" });
  }
  const info = db
    .prepare(
      `INSERT INTO body_measurements (date, weight_kg, waist_cm, chest_cm, hips_cm, arms_cm, thighs_cm, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      date || todayStr(),
      weight_kg || null,
      waist_cm || null,
      chest_cm || null,
      hips_cm || null,
      arms_cm || null,
      thighs_cm || null,
      notes || null
    );
  res.status(201).json(db.prepare("SELECT * FROM body_measurements WHERE id = ?").get(info.lastInsertRowid));
});

app.delete("/api/measurements/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM body_measurements WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Measurement not found" });
  db.prepare("DELETE FROM body_measurements WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---------- Water Logs ----------

app.get("/api/water-logs", (req, res) => {
  const date = req.query.date || todayStr();
  const rows = db.prepare("SELECT * FROM water_logs WHERE date = ? ORDER BY created_at ASC").all(date);
  const total = rows.reduce((s, r) => s + r.amount_ml, 0);
  res.json({ date, entries: rows, totalMl: round1(total) });
});

app.post("/api/water-logs", (req, res) => {
  const { date, amount_ml } = req.body;
  if (!amount_ml || amount_ml <= 0) return res.status(400).json({ error: "amount_ml must be a positive number" });
  const info = db
    .prepare("INSERT INTO water_logs (date, amount_ml) VALUES (?, ?)")
    .run(date || todayStr(), amount_ml);
  res.status(201).json(db.prepare("SELECT * FROM water_logs WHERE id = ?").get(info.lastInsertRowid));
});

app.delete("/api/water-logs/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM water_logs WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Water log not found" });
  db.prepare("DELETE FROM water_logs WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---------- Personal Records ----------

app.get("/api/prs", (req, res) => {
  const rows = db.prepare("SELECT * FROM personal_records ORDER BY exercise_name ASC, date DESC").all();
  res.json(rows);
});

app.post("/api/prs", (req, res) => {
  const { exercise_name, weight_kg, reps, date, notes } = req.body;
  if (!exercise_name || !weight_kg) {
    return res.status(400).json({ error: "exercise_name and weight_kg are required" });
  }
  const info = db
    .prepare(
      `INSERT INTO personal_records (exercise_name, weight_kg, reps, date, notes)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(exercise_name.trim(), weight_kg, reps || 1, date || todayStr(), notes || null);
  res.status(201).json(db.prepare("SELECT * FROM personal_records WHERE id = ?").get(info.lastInsertRowid));
});

app.delete("/api/prs/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM personal_records WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Personal record not found" });
  db.prepare("DELETE FROM personal_records WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---------- Fitness chatbot (Claude API) ----------

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

const CHAT_SYSTEM_PROMPT = `You are FitBot, a friendly fitness assistant embedded inside the FitTrack app.

Scope: you ONLY answer questions about fitness, exercise, workouts, training programs, sports performance, stretching, recovery, nutrition, calories, macros, healthy eating, weight management, and using the FitTrack app itself.

If the user asks about anything outside that scope (general knowledge, coding, news, entertainment, relationships, homework, etc.), politely decline in one short sentence and steer back to fitness — do not answer the off-topic question even partially.

You are not a doctor. For injuries, medical conditions, medications, pregnancy, eating disorders, or anything that sounds like a medical concern, give only general safety guidance and recommend they consult a qualified healthcare professional — never diagnose or prescribe.

Keep replies concise (usually under 120 words), practical, and encouraging. Use plain text, not markdown tables.`;

// Very small in-memory rate limiter (per server instance) so a public demo
// can't run up API costs. Not for production multi-instance use.
const rateLimitBuckets = new Map();
const RATE_LIMIT_MAX = 20; // requests
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes, per IP

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip) || [];
  const recent = bucket.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitBuckets.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

app.post("/api/chat", async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error:
        "The fitness assistant isn't configured yet. The site owner needs to add an ANTHROPIC_API_KEY environment variable.",
    });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many messages — please wait a bit and try again." });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Keep only the last 12 turns and cap message length to keep costs/latency bounded.
  const trimmed = messages.slice(-12).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 2000),
  }));

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system: CHAT_SYSTEM_PROMPT,
        messages: trimmed,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error("Anthropic API error:", data);
      return res.status(502).json({ error: "The fitness assistant is temporarily unavailable. Please try again shortly." });
    }

    const reply = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    res.json({ reply: reply || "Sorry, I didn't catch that — could you rephrase your fitness question?" });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({ error: "Something went wrong reaching the fitness assistant." });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---------- Serve built frontend (client/dist), if present ----------
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: any non-API GET route returns index.html so client-side routing works
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FitTrack API listening on http://localhost:${PORT}`);
});
