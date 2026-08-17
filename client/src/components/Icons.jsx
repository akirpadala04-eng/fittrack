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
