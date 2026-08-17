// Minimal inline SVG icon set (stroke-based, 24x24 viewBox), no external deps.
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconHome = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9.5A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V10" />
    <path d="M9.5 21v-6h5v6" />
  </svg>
);

export const IconBook = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v18H5.5A1.5 1.5 0 0 1 4 19.5z" />
    <path d="M20 4.5A1.5 1.5 0 0 0 18.5 3H13v18h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
  </svg>
);

export const IconApple = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 8.5c1.2-1.6 3-2.3 4.6-1.7 1.8.7 2.9 2.7 2.9 5 0 4.3-3.4 9.2-6.2 9.2-1 0-1.5-.4-2.3-.4s-1.4.4-2.3.4C6 21 3 16 3 11.8c0-3.4 2.2-5.7 4.8-5.7 1.3 0 2.5.8 3.2 1.6" />
    <path d="M12.5 6.2C12.3 4.6 13.4 3.1 15 3c.2 1.6-1 3.1-2.5 3.2" />
  </svg>
);

export const IconDumbbell = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6.5 8.5v7M4 10v4" />
    <path d="M17.5 8.5v7M20 10v4" />
    <path d="M8.5 12h7" />
  </svg>
);

export const IconGear = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3.5v2.2M12 18.3v2.2M4.9 6.3l1.6 1.5M17.5 16.2l1.6 1.5M3.5 12h2.2M18.3 12h2.2M4.9 17.7l1.6-1.5M17.5 7.8l1.6-1.5" />
  </svg>
);

export const IconSearch = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);

export const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconTrash = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V4.8A.8.8 0 0 1 9.8 4h4.4a.8.8 0 0 1 .8.8V7" />
    <path d="M6.5 7 7 20a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20l.5-13" />
  </svg>
);

export const IconChevronLeft = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M15 5 8 12l7 7" />
  </svg>
);

export const IconChevronRight = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const IconFlame = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.2.5-2.1 1-3 .3 1 1 1.6 1.6 1.6-.4-2 .3-4 2.4-7.6Z" />
  </svg>
);

export const IconX = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconClock = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconTrendUp = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m4 16 5.5-6 4 3L20 6" />
    <path d="M14.5 6H20v5.5" />
  </svg>
);

export const IconCamera = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="12.5" r="3.6" />
  </svg>
);

export const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="4" y="5.5" width="16" height="15" rx="2" />
    <path d="M4 10h16" />
    <path d="M8 3.5v4M16 3.5v4" />
  </svg>
);

export const IconRefresh = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 12a8 8 0 0 1 13.66-5.66L20 8" />
    <path d="M20 4v4h-4" />
    <path d="M20 12a8 8 0 0 1-13.66 5.66L4 16" />
    <path d="M4 20v-4h4" />
  </svg>
);

export const IconScale = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M12 8.6v.9M12 14.5v.9M8.6 12h.9M14.5 12h.9" />
  </svg>
);

export const IconTrophy = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 5.5H4a3 3 0 0 0 3.5 5.4M17 5.5h3a3 3 0 0 1-3.5 5.4" />
    <path d="M12 14v3.5M8.5 20.5h7M9.5 17.5h5l.5 3h-6z" />
  </svg>
);

export const IconDroplet = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3.5s6 6.7 6 11a6 6 0 0 1-12 0c0-4.3 6-11 6-11z" />
  </svg>
);

export const IconStar = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m12 4 2.4 5.1 5.6.6-4.2 3.8 1.2 5.5L12 16.2l-5 2.8 1.2-5.5-4.2-3.8 5.6-.6z" />
  </svg>
);

export const IconStarFilled = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
    <path d="m12 4 2.4 5.1 5.6.6-4.2 3.8 1.2 5.5L12 16.2l-5 2.8 1.2-5.5-4.2-3.8 5.6-.6z" />
  </svg>
);

export const IconFire = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.2.5-2.1 1-3 .3 1 1 1.6 1.6 1.6-.4-2 .3-4 2.4-7.6Z" />
    <path d="M9.5 15.2c0 1.4 1.1 2.3 2.5 2.3s2.5-1 2.5-2.3" />
  </svg>
);

export const IconLock = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="15" r="1.4" />
  </svg>
);

export const IconTarget = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconMedal = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="m8 3 4 7 4-7" />
    <circle cx="12" cy="15" r="5.5" />
    <path d="M12 12.5v5M9.8 15h4.4" />
  </svg>
);

export const IconSparkle = (p) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3.5c.5 3.2 1.4 4.1 4.6 4.6-3.2.5-4.1 1.4-4.6 4.6-.5-3.2-1.4-4.1-4.6-4.6 3.2-.5 4.1-1.4 4.6-4.6Z" />
    <path d="M18.5 14c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5Z" />
  </svg>
);
