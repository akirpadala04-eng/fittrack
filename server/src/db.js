const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const seedFoods = require("./seedFoods");
const seedExercises = require("./seedExercises");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "fittrack.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    serving_size REAL NOT NULL DEFAULT 1,
    serving_unit TEXT NOT NULL DEFAULT 'serving',
    calories REAL NOT NULL DEFAULT 0,
    protein REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    fiber REAL DEFAULT 0,
    sugar REAL DEFAULT 0,
    sodium REAL DEFAULT 0,
    is_custom INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS food_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    meal TEXT NOT NULL DEFAULT 'snack',
    servings REAL NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Cardio',
    met REAL NOT NULL DEFAULT 5,
    is_custom INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS workout_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    duration_minutes REAL NOT NULL DEFAULT 30,
    calories_burned REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS physique_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    note TEXT,
    photo_data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workout_plan (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    split_key TEXT NOT NULL,
    days_per_week INTEGER NOT NULL,
    focus TEXT NOT NULL,
    plan_json TEXT NOT NULL,
    generated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS body_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    weight_kg REAL,
    waist_cm REAL,
    chest_cm REAL,
    hips_cm REAL,
    arms_cm REAL,
    thighs_cm REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount_ml REAL NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS personal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_name TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    reps INTEGER NOT NULL DEFAULT 1,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    display_name TEXT NOT NULL DEFAULT 'there',
    weight_kg REAL NOT NULL DEFAULT 70,
    height_cm REAL NOT NULL DEFAULT 170,
    age INTEGER NOT NULL DEFAULT 30,
    sex TEXT NOT NULL DEFAULT 'other',
    activity_level TEXT NOT NULL DEFAULT 'moderate',
    calorie_goal REAL NOT NULL DEFAULT 2000,
    protein_goal REAL NOT NULL DEFAULT 150,
    carb_goal REAL NOT NULL DEFAULT 200,
    fat_goal REAL NOT NULL DEFAULT 65,
    water_goal_ml REAL NOT NULL DEFAULT 2000
  );

  CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
  CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(date);
  CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
  CREATE INDEX IF NOT EXISTS idx_physique_photos_date ON physique_photos(date);
  CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON body_measurements(date);
  CREATE INDEX IF NOT EXISTS idx_water_logs_date ON water_logs(date);
  CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON personal_records(exercise_name);
`);

// Migration: add is_favorite to foods if it doesn't exist yet (older DBs predate this column)
const foodColumns = db.prepare("PRAGMA table_info(foods)").all().map((c) => c.name);
if (!foodColumns.includes("is_favorite")) {
  db.exec("ALTER TABLE foods ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0");
}

// Seed settings row
const settingsCount = db.prepare("SELECT COUNT(*) AS c FROM settings").get().c;
if (settingsCount === 0) {
  db.prepare("INSERT INTO settings (id) VALUES (1)").run();
}

// Seed foods (only if table empty)
const foodCount = db.prepare("SELECT COUNT(*) AS c FROM foods").get().c;
if (foodCount === 0) {
  const insertFood = db.prepare(`
    INSERT INTO foods (name, brand, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, sodium, is_custom)
    VALUES (@name, @brand, @category, @serving_size, @serving_unit, @calories, @protein, @carbs, @fat, @fiber, @sugar, @sodium, 0)
  `);
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      const [name, brand, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, sodium] = row;
      insertFood.run({ name, brand, category, serving_size, serving_unit, calories, protein, carbs, fat, fiber, sugar, sodium });
    }
  });
  insertMany(seedFoods);
  console.log(`Seeded ${seedFoods.length} foods`);
}

// Seed exercises (only if table empty)
const exerciseCount = db.prepare("SELECT COUNT(*) AS c FROM exercises").get().c;
if (exerciseCount === 0) {
  const insertExercise = db.prepare(`
    INSERT INTO exercises (name, category, met, is_custom) VALUES (@name, @category, @met, 0)
  `);
  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      const [name, category, met] = row;
      insertExercise.run({ name, category, met });
    }
  });
  insertMany(seedExercises);
  console.log(`Seeded ${seedExercises.length} exercises`);
}

module.exports = db;
