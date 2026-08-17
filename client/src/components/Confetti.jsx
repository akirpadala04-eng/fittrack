import { useEffect, useRef, useState } from "react";

const COLORS = ["var(--brand)", "var(--series-protein)", "var(--series-carbs)", "var(--series-fat)"];
const PIECE_COUNT = 40;

function makePieces() {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 0.3,
    duration: 1.6 + Math.random() * 0.7,
    rotate: Math.random() * 360,
    drift: (Math.random() - 0.5) * 60,
  }));
}

// Lightweight, dependency-free confetti burst. Renders a fresh burst any time
// `active` flips from false -> true (or is re-triggered while already active),
// and unmounts itself automatically after the animation finishes.
export default function Confetti({ active }) {
  const [burstKey, setBurstKey] = useState(0);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);
  const wasActive = useRef(false);

  useEffect(() => {
    if (active && !wasActive.current) {
      setBurstKey((k) => k + 1);
      setVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setVisible(false), 2200);
    }
    wasActive.current = active;
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active]);

  if (!visible) return null;

  const pieces = makePieces();

  return (
    <div className="confetti-layer" key={burstKey}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--confetti-drift": `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
