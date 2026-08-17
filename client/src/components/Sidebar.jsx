import { NavLink } from "react-router-dom";
import { IconHome, IconBook, IconApple, IconDumbbell, IconCamera, IconGear } from "./Icons";

const links = [
  { to: "/", label: "Dashboard", icon: IconHome, end: true },
  { to: "/diary", label: "Food Diary", icon: IconBook },
  { to: "/foods", label: "Food Database", icon: IconApple },
  { to: "/workouts", label: "Workouts", icon: IconDumbbell },
  { to: "/progress", label: "Progress Photos", icon: IconCamera },
  { to: "/settings", label: "Settings", icon: IconGear },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">FT</div>
        <div className="sidebar-brand-name">FitTrack</div>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">Track nutrition &amp; workouts</div>
    </aside>
  );
}
