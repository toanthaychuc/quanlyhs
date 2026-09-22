import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import LogoIntroSplash from './components/LogoIntroSplash';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Formulas from './pages/Formulas';
import Exams from './pages/Exams';
import Classes from './pages/Classes';
import Assignments from './pages/Assignments';
import Forum from './pages/Forum';
import Forms from './pages/Forms';
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
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                  window.location.href = '/';
                });
              } else {
                window.location.href = '/';
              }
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
  const [showSplash, setShowSplash] = useState(true);
  const [isRadiating, setIsRadiating] = useState(false);

  useEffect(() => {
    const handleReplayIntro = () => {
      setIsRadiating(false);
      setShowSplash(true);
    };
    window.addEventListener('play_logo_intro', handleReplayIntro);
    return () => window.removeEventListener('play_logo_intro', handleReplayIntro);
  }, []);

  return (
    <ErrorBoundary>
      {showSplash && (
        <LogoIntroSplash 
          onRadiate={() => setIsRadiating(true)}
          onFinish={() => {
            setShowSplash(false);
            setIsRadiating(false);
          }} 
        />
      )}
      <div 
        style={{
          width: '100%',
          height: '100%',
          opacity: showSplash && !isRadiating ? 0 : 1,
          transform: showSplash && !isRadiating ? 'scale(0.96)' : 'scale(1)',
          filter: showSplash && !isRadiating ? 'blur(12px)' : 'none',
          transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), filter 0.75s ease-out',
          pointerEvents: showSplash ? 'none' : 'auto'
        }}
      >
        <RoleProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="classes" element={<Classes />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="documents" element={<Documents />} />
                <Route path="formulas" element={<Formulas />} />
                <Route path="exams" element={<Exams />} />
                <Route path="forum" element={<Forum />} />
                <Route path="forms" element={<Forms />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="my-rank" element={<MyRank />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </RoleProvider>
      </div>
    </ErrorBoundary>
  );
}

export default App;
