import React from 'react';
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0f172a',
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f87171' }}>
            ⚠️ Đã xảy ra lỗi tải trang
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Hệ thống đang tải lại phiên bản mới nhất. Vui lòng bấm nút bên dưới để khôi phục:
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: '#4f46e5',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🔄 Tải Lại Trang Web
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
