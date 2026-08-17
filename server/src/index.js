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

// ---------- Foods ----------

// Search / list foods
app.get("/api/foods", (req, res) => {
  const { q, category } = req.query;
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
  sql += " ORDER BY is_custom DESC, name ASC LIMIT 200";
  const foods = db.prepare(sql).all(...params);
  res.json(foods);
});

app.get("/api/foods/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM foods ORDER BY category").all();
  res.json(rows.map((r) => r.category));
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

  res.json({
    date,
    goals: {
      calories: settings.calorie_goal,
      protein: settings.protein_goal,
      carbs: settings.carb_goal,
      fat: settings.fat_goal,
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
