// Curated strength-exercise library + workout split templates for the Split Planner.
// This is intentionally separate from the cardio-focused `exercises` table (which is
// MET-based and used for calorie-burn logging) — split planning needs muscle-group tags.

export const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Which weekday indices (0=Mon..6=Sun) are training days for a given days/week count.
const SCHEDULE_BY_DAYS = {
  3: [0, 2, 4], // Mon, Wed, Fri
  4: [0, 1, 3, 4], // Mon, Tue, Thu, Fri
  5: [0, 1, 2, 3, 4], // Mon-Fri
  6: [0, 1, 2, 3, 4, 5], // Mon-Sat
};

export const EXERCISE_LIBRARY = {
  chest: ["Barbell Bench Press", "Incline Dumbbell Press", "Push-Ups", "Cable Fly", "Dumbbell Flyes", "Chest Dip"],
  back: ["Pull-Ups", "Barbell Row", "Lat Pulldown", "Seated Cable Row", "Deadlift", "T-Bar Row"],
  shoulders: ["Overhead Press", "Lateral Raise", "Face Pull", "Arnold Press", "Front Raise", "Rear Delt Fly", "Barbell Shrug"],
  biceps: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Concentration Curl"],
  triceps: ["Triceps Pushdown", "Skull Crushers", "Close-Grip Bench Press", "Overhead Triceps Extension", "Dips"],
  quads: ["Barbell Squat", "Leg Press", "Walking Lunges", "Leg Extension", "Bulgarian Split Squat", "Hack Squat"],
  hamstrings: ["Romanian Deadlift", "Lying Leg Curl", "Good Morning", "Glute-Ham Raise"],
  glutes: ["Hip Thrust", "Glute Bridge", "Cable Kickback", "Cable Pull-Through", "Bulgarian Split Squat"],
  calves: ["Standing Calf Raise", "Seated Calf Raise", "Donkey Calf Raise"],
  core: ["Plank", "Hanging Leg Raise", "Cable Crunch", "Russian Twist", "Ab Wheel Rollout", "Mountain Climbers"],
};

export const FOCUS_OPTIONS = [
  { key: "strength", label: "Strength", sets: 5, reps: "3–5", rest: "2–3 min rest", blurb: "Heavy weight, low reps — build raw strength." },
  { key: "hypertrophy", label: "Hypertrophy", sets: 4, reps: "8–12", rest: "60–90s rest", blurb: "Moderate weight, higher volume — build muscle size." },
  { key: "endurance", label: "Endurance", sets: 3, reps: "15–20", rest: "30–45s rest", blurb: "Lighter weight, high reps — build muscular endurance." },
];

function pickExercises(groupKey, count, offset) {
  const list = EXERCISE_LIBRARY[groupKey] || [];
  if (list.length === 0 || count <= 0) return [];
  const picked = [];
  for (let i = 0; i < count; i++) {
    picked.push(list[(offset + i) % list.length]);
  }
  return picked.map((name) => ({ name, group: groupKey }));
}

export const SPLITS = [
  {
    key: "full_body",
    name: "Full Body",
    description: "Train your whole body every session. Great for beginners or limited days.",
    dayOptions: [3, 4],
    buildSessions(daysPerWeek) {
      // Mirrors real full-body programs (e.g. Workout A/B alternation): every session hits
      // chest, back, quads, shoulders and hamstrings, and alternates biceps/triceps each day.
      return Array.from({ length: daysPerWeek }, (_, i) => {
        const armGroup = i % 2 === 0 ? "biceps" : "triceps";
        const groups = [
          { key: "chest", count: 1 },
          { key: "back", count: 1 },
          { key: "quads", count: 1 },
          { key: "shoulders", count: 1 },
          { key: "hamstrings", count: 1 },
          { key: armGroup, count: 1 },
          { key: "core", count: 1 },
        ];
        return { title: `Full Body ${String.fromCharCode(65 + i)}`, groups, variant: i };
      });
    },
  },
  {
    key: "upper_lower",
    name: "Upper / Lower",
    description: "Alternate upper-body and lower-body days. A classic 4-day strength split.",
    dayOptions: [4],
    buildSessions(daysPerWeek) {
      const upper = [
        { key: "chest", count: 1 },
        { key: "back", count: 1 },
        { key: "shoulders", count: 1 },
        { key: "biceps", count: 1 },
        { key: "triceps", count: 1 },
      ];
      const lower = [
        { key: "quads", count: 1 },
        { key: "hamstrings", count: 1 },
        { key: "glutes", count: 1 },
        { key: "calves", count: 1 },
        { key: "core", count: 1 },
      ];
      const sessions = [];
      for (let i = 0; i < daysPerWeek; i++) {
        const isUpper = i % 2 === 0;
        const variant = Math.floor(i / 2);
        sessions.push({
          title: `${isUpper ? "Upper" : "Lower"} ${String.fromCharCode(65 + variant)}`,
          groups: isUpper ? upper : lower,
          variant,
        });
      }
      return sessions;
    },
  },
  {
    key: "push_pull_legs",
    name: "Push / Pull / Legs",
    description: "Push (chest/shoulders/triceps), Pull (back/biceps), Legs — run once or twice a week.",
    dayOptions: [3, 6],
    buildSessions(daysPerWeek) {
      const template = [
        { title: "Push", groups: [{ key: "chest", count: 2 }, { key: "shoulders", count: 1 }, { key: "triceps", count: 1 }] },
        { title: "Pull", groups: [{ key: "back", count: 2 }, { key: "biceps", count: 2 }] },
        { title: "Legs", groups: [{ key: "quads", count: 1 }, { key: "hamstrings", count: 1 }, { key: "glutes", count: 1 }, { key: "calves", count: 1 }, { key: "core", count: 1 }] },
      ];
      const sessions = [];
      for (let i = 0; i < daysPerWeek; i++) {
        const t = template[i % 3];
        const variant = Math.floor(i / 3);
        sessions.push({
          title: daysPerWeek > 3 ? `${t.title} ${String.fromCharCode(65 + variant)}` : t.title,
          groups: t.groups,
          variant,
        });
      }
      return sessions;
    },
  },
  {
    key: "body_part",
    name: "Body Part Split",
    description: 'One or two muscle groups per day ("bro split") — high volume per muscle, once a week.',
    dayOptions: [5],
    buildSessions() {
      // Order follows the common real-world bro split schedule: Chest, Back, Shoulders, Legs, Arms.
      return [
        { title: "Chest", groups: [{ key: "chest", count: 4 }, { key: "core", count: 1 }], variant: 0 },
        { title: "Back", groups: [{ key: "back", count: 4 }, { key: "core", count: 1 }], variant: 0 },
        { title: "Shoulders", groups: [{ key: "shoulders", count: 4 }, { key: "core", count: 1 }], variant: 0 },
        { title: "Legs", groups: [{ key: "quads", count: 2 }, { key: "hamstrings", count: 1 }, { key: "glutes", count: 1 }, { key: "calves", count: 1 }, { key: "core", count: 1 }], variant: 0 },
        { title: "Arms", groups: [{ key: "biceps", count: 2 }, { key: "triceps", count: 2 }, { key: "core", count: 1 }], variant: 0 },
      ];
    },
  },
  {
    key: "arnold",
    name: "Arnold Split",
    description: "Chest+Back, Shoulders+Arms, Legs — each hit twice a week. High-volume, 6 days.",
    dayOptions: [6],
    buildSessions() {
      const a = { title: "Chest & Back", groups: [{ key: "chest", count: 2 }, { key: "back", count: 2 }, { key: "core", count: 1 }] };
      const b = { title: "Shoulders & Arms", groups: [{ key: "shoulders", count: 2 }, { key: "biceps", count: 1 }, { key: "triceps", count: 1 }, { key: "core", count: 1 }] };
      const c = { title: "Legs", groups: [{ key: "quads", count: 2 }, { key: "hamstrings", count: 1 }, { key: "glutes", count: 1 }, { key: "calves", count: 1 }] };
      return [
        { ...a, variant: 0 },
        { ...b, variant: 0 },
        { ...c, variant: 0 },
        { ...a, variant: 1 },
        { ...b, variant: 1 },
        { ...c, variant: 1 },
      ];
    },
  },
];

export function todayDow() {
  return (new Date().getDay() + 6) % 7;
}

export function generatePlan({ splitKey, daysPerWeek, focus, shuffleSeed = 0 }) {
  const split = SPLITS.find((s) => s.key === splitKey) || SPLITS[0];
  const days = split.dayOptions.includes(daysPerWeek) ? daysPerWeek : split.dayOptions[0];
  const sessions = split.buildSessions(days);
  const trainingDows = SCHEDULE_BY_DAYS[days] || SCHEDULE_BY_DAYS[3];
  const focusDef = FOCUS_OPTIONS.find((f) => f.key === focus) || FOCUS_OPTIONS[1];

  const weekDays = WEEKDAY_NAMES.map((name, dow) => {
    const posIndex = trainingDows.indexOf(dow);
    if (posIndex === -1) {
      return { dow, name, isRest: true, title: "Rest Day", exercises: [] };
    }
    const session = sessions[posIndex];
    const exercises = session.groups.flatMap((g) => {
      const offset = (session.variant || 0) * 2 + shuffleSeed;
      return pickExercises(g.key, g.count, offset).map((ex) => ({
        ...ex,
        sets: focusDef.sets,
        reps: focusDef.reps,
      }));
    });
    return { dow, name, isRest: false, title: session.title, exercises };
  });

  return { splitKey: split.key, daysPerWeek: days, focus: focusDef.key, days: weekDays };
}
