import { formatDateLabel, shiftDate, todayStr } from "../api";
import { IconChevronLeft, IconChevronRight } from "./Icons";

export default function DateNav({ date, onChange }) {
  return (
    <div className="date-nav">
      <button onClick={() => onChange(shiftDate(date, -1))} aria-label="Previous day">
        <IconChevronLeft width={16} height={16} />
      </button>
      <span className="date-label">{formatDateLabel(date)}</span>
      <button
        onClick={() => onChange(shiftDate(date, 1))}
        aria-label="Next day"
        disabled={date >= todayStr()}
        style={date >= todayStr() ? { opacity: 0.35, cursor: "default" } : undefined}
      >
        <IconChevronRight width={16} height={16} />
      </button>
    </div>
  );
}
