const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Foods
  getFoods: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/foods${qs ? `?${qs}` : ""}`);
  },
  getFoodCategories: () => request("/foods/categories"),
  getRecentFoods: (limit = 8) => request(`/foods/recent?limit=${limit}`),
  createFood: (data) => request("/foods", { method: "POST", body: JSON.stringify(data) }),
  deleteFood: (id) => request(`/foods/${id}`, { method: "DELETE" }),
  setFoodFavorite: (id, isFavorite) =>
    request(`/foods/${id}/favorite`, { method: "PUT", body: JSON.stringify({ is_favorite: isFavorite }) }),

  // Food logs
  getFoodLogs: (date) => request(`/food-logs?date=${date}`),
  createFoodLog: (data) => request("/food-logs", { method: "POST", body: JSON.stringify(data) }),
  updateFoodLog: (id, data) => request(`/food-logs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFoodLog: (id) => request(`/food-logs/${id}`, { method: "DELETE" }),

  // Exercises
  getExercises: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/exercises${qs ? `?${qs}` : ""}`);
  },
  getExerciseCategories: () => request("/exercises/categories"),
  createExercise: (data) => request("/exercises", { method: "POST", body: JSON.stringify(data) }),

  // Workout logs
  getWorkoutLogs: (date) => request(`/workout-logs?date=${date}`),
  createWorkoutLog: (data) => request("/workout-logs", { method: "POST", body: JSON.stringify(data) }),
  deleteWorkoutLog: (id) => request(`/workout-logs/${id}`, { method: "DELETE" }),

  // Physique photos
  getPhotos: () => request("/photos"),
  createPhoto: (data) => request("/photos", { method: "POST", body: JSON.stringify(data) }),
  deletePhoto: (id) => request(`/photos/${id}`, { method: "DELETE" }),

  // Workout plan (split planner)
  getWorkoutPlan: () => request("/workout-plan"),
  saveWorkoutPlan: (data) => request("/workout-plan", { method: "PUT", body: JSON.stringify(data) }),
  deleteWorkoutPlan: () => request("/workout-plan", { method: "DELETE" }),

  // Body measurements
  getMeasurements: () => request("/measurements"),
  createMeasurement: (data) => request("/measurements", { method: "POST", body: JSON.stringify(data) }),
  deleteMeasurement: (id) => request(`/measurements/${id}`, { method: "DELETE" }),

  // Water logs
  getWaterLogs: (date) => request(`/water-logs?date=${date}`),
  createWaterLog: (data) => request("/water-logs", { method: "POST", body: JSON.stringify(data) }),
  deleteWaterLog: (id) => request(`/water-logs/${id}`, { method: "DELETE" }),

  // Personal records
  getPRs: () => request("/prs"),
  createPR: (data) => request("/prs", { method: "POST", body: JSON.stringify(data) }),
  deletePR: (id) => request(`/prs/${id}`, { method: "DELETE" }),

  // Streak
  getStreak: () => request("/streak"),

  // Settings
  getSettings: () => request("/settings"),
  updateSettings: (data) => request("/settings", { method: "PUT", body: JSON.stringify(data) }),

  // Summary / history
  getSummary: (date) => request(`/summary?date=${date}`),
  getHistory: (days = 14) => request(`/history?days=${days}`),
};

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateLabel(dateStr) {
  const today = todayStr();
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diffDays = Math.round((d - t) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function shiftDate(dateStr, deltaDays) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function formatFullDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
