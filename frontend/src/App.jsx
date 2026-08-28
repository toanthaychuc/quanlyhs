import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Exams from './pages/Exams';
import Classes from './pages/Classes';
import Assignments from './pages/Assignments';
import Forum from './pages/Forum';
import Leaderboard from './pages/Leaderboard';
import MyRank from './pages/MyRank';

function App() {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="classes" element={<Classes />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="documents" element={<Documents />} />
            <Route path="exams" element={<Exams />} />
            <Route path="forum" element={<Forum />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="my-rank" element={<MyRank />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </RoleProvider>
  );
}

export default App;
