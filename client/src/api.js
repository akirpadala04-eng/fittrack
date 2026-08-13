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
  createFood: (data) => request("/foods", { method: "POST", body: JSON.stringify(data) }),
  deleteFood: (id) => request(`/foods/${id}`, { method: "DELETE" }),

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
