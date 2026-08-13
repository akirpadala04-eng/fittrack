import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Diary from "./pages/Diary";
import Foods from "./pages/Foods";
import Workouts from "./pages/Workouts";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
