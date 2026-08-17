import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatWidget from "./components/ChatWidget";
import Dashboard from "./pages/Dashboard";
import Diary from "./pages/Diary";
import Foods from "./pages/Foods";
import Workouts from "./pages/Workouts";
import SplitPlanner from "./pages/SplitPlanner";
import Measurements from "./pages/Measurements";
import PersonalRecords from "./pages/PersonalRecords";
import Progress from "./pages/Progress";
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
          <Route path="/split-planner" element={<SplitPlanner />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/records" element={<PersonalRecords />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <ChatWidget />
    </div>
  );
}
