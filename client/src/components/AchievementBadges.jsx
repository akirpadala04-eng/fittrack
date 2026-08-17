import { useEffect, useState } from "react";
import { api } from "../api";
import {
  IconSparkle,
  IconFire,
  IconDumbbell,
  IconMedal,
  IconTrophy,
  IconCamera,
  IconScale,
  IconDroplet,
  IconTarget,
  IconLock,
} from "./Icons";

const ICON_BY_KEY = {
  first_bite: IconSparkle,
  week_warrior: IconFire,
  consistency_champion: IconFire,
  first_sweat: IconDumbbell,
  iron_habit: IconDumbbell,
  pr_setter: IconMedal,
  strength_streak: IconTrophy,
  snap_shot: IconCamera,
  transformation: IconCamera,
  on_the_scale: IconScale,
  hydration_hero: IconDroplet,
  goal_getter: IconTarget,
};

export default function AchievementBadges() {
  const [achievements, setAchievements] = useState(null);

  useEffect(() => {
    api.getAchievements().then((r) => setAchievements(r.achievements));
  }, []);

  if (!achievements) {
    return (
      <div className="card">
        <div className="card-title">🏆 Achievements</div>
        <div className="text-sm text-muted mt-8">Loading…</div>
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="card">
      <div className="card-title">🏆 Achievements</div>
      <div className="text-sm text-muted mb-8">
        {unlockedCount} / {achievements.length} unlocked
      </div>
      <div className="badge-grid">
        {achievements.map((a) => {
          const Icon = ICON_BY_KEY[a.key] || IconSparkle;
          return (
            <div
              key={a.key}
              className={`badge-tile ${a.unlocked ? "badge-tile-unlocked" : "badge-tile-locked"}`}
              title={a.description}
            >
              <div className="badge-icon-circle">
                <Icon width={22} height={22} />
                {!a.unlocked && (
                  <span className="badge-lock-overlay">
                    <IconLock width={11} height={11} />
                  </span>
                )}
              </div>
              <div className="badge-label">{a.label}</div>
              <div className="badge-desc">{a.description}</div>
              {!a.unlocked && a.progress && (
                <div className="badge-progress">
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.min(100, (a.progress.current / a.progress.target) * 100)}%`,
                        background: "var(--brand)",
                      }}
                    />
                  </div>
                  <div className="badge-progress-label">
                    {a.progress.current} / {a.progress.target}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
