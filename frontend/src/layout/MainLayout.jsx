import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  MessageSquare,
  Award,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  Mail,
  LogIn,
  Lock,
  CheckCircle2,
  Sliders,
  X,
  Smartphone,
  Sun,
  Moon,
  Shield
} from 'lucide-react';
import { useRole, TEACHER_EMAIL } from '../context/RoleContext';
import WelcomeLandingModal from '../components/WelcomeLandingModal';
import SettingsModal from '../components/SettingsModal';
import StudentName from '../components/StudentName';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();
  const { 
    role, 
    setRole, 
    isTeacher, 
    isStudent, 
    currentUserEmail, 
    isTeacherAccount, 
    isGuestMode,
    hasEnteredApp,
    setHasEnteredApp,
    openWelcomeModal,
    loginWithEmail, 
    logout,
    currentStudentId, 
    setCurrentStudentId 
  } = useRole();

  // State modal đăng nhập email
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isIframe = window.self !== window.top;
  const [emailInput, setEmailInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Lấy danh sách lớp và học sinh để hiển thị thông tin học sinh hiện tại
  const [classesData, setClassesData] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('edumanager_classes_data');
    if (saved) {
      try {
        setClassesData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [role]);

  const handleOpenLogin = () => {
    setEmailInput(currentUserEmail || '');
    setLoginError('');
    setShowLoginModal(true);
  };

  const handleDoLogin = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setLoginError('Vui lòng nhập địa chỉ email.');
      return;
    }
    const res = loginWithEmail(emailInput);
    if (res.success) {
      setShowLoginModal(false);
      setLoginError('');
      alert(res.message);
    }
  };

  // Tìm học sinh hiện tại và lớp của học sinh đó
  let currentStudent = null;
  let currentStudentClass = null;
  for (const cls of classesData) {
    const found = cls.students?.find(s => s.id === currentStudentId);
    if (found) {
      currentStudent = found;
      currentStudentClass = cls;
      break;
    }
  }

  // Danh sách tất cả học sinh để giáo viên/người dùng có thể giả lập chọn học sinh khác nhau
  const allStudentsWithClass = classesData.flatMap(cls => 
    (cls.students || []).map(s => ({ ...s, className: cls.name, school: cls.school }))
  );

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/classes', icon: <Users size={20} />, label: 'Lớp học' },
    { path: '/assignments', icon: <BookOpen size={20} />, label: 'Bài tập' },
    { path: '/exams', icon: <GraduationCap size={20} />, label: 'Thi thử' },
    { path: '/documents', icon: <FileText size={20} />, label: 'Tài liệu' },
    { path: '/forum', icon: <MessageSquare size={20} />, label: 'Hỏi đáp' },
    { path: '/leaderboard', icon: <Award size={20} />, label: 'Xếp hạng' },
    ...(!isTeacher ? [{ path: '/my-rank', icon: <Shield size={20} />, label: 'Huy hiệu' }] : []),
  ];

  return (
    <div className="layout-container">
      {/* Overlay cho Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">LC</div>
            <div className="logo-text-wrapper">
              <span className="logo-text-top">Toán thầy</span>
              <span className="logo-text-main">Công Chức</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-tools" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {/* Nút Cài đặt Hệ thống (Dành riêng cho Giáo viên) */}
            {isTeacher && (
              <button 
                className="btn btn-outline flex items-center gap-1.5"
                style={{ 
                  padding: '0.4rem 0.75rem', 
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                  color: 'var(--primary-color)',
                  fontWeight: 600,
                  width: '100%',
                  justifyContent: 'flex-start'
                }}
                onClick={() => setShowSettingsModal(true)}
                title="Cài đặt hệ thống: API Key AI, Model & Preamble LaTeX"
              >
                <Sliders size={15} />
                <span>Cài đặt hệ thống</span>
              </button>
            )}

            {/* Nút Mô Phỏng Mobile (Chỉ Giáo viên và không ở trong iframe) */}
            {isTeacher && !isIframe && (
              <button 
                className="btn btn-outline flex items-center gap-1.5"
                style={{ 
                  padding: '0.4rem 0.75rem', 
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  color: '#d97706',
                  fontWeight: 600,
                  width: '100%',
                  justifyContent: 'flex-start'
                }}
                onClick={() => setIsMobileSimulator(true)}
                title="Mô phỏng Giao diện Điện thoại"
              >
                <Smartphone size={15} />
                <span>Mobile Preview</span>
              </button>
            )}

            {/* Nút Đổi Theme (Giao diện Sáng/Tối) */}
            <button 
              className="btn btn-outline flex items-center gap-1.5"
              style={{ 
                padding: '0.4rem 0.75rem', 
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-color)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                width: '100%',
                justifyContent: 'flex-start'
              }}
              onClick={toggleTheme}
              title={theme === 'light' ? 'Chuyển sang giao diện Tối' : 'Chuyển sang giao diện Sáng'}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              <span>{theme === 'light' ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
            </button>
          </div>

          <div className="current-mode-indicator">
            <span className="mode-dot"></span>
            <span>Chế độ: <strong>{isTeacher ? 'Giáo viên' : 'Học sinh'}</strong></span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header glass">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isTeacher 
                  ? 'Chào mừng, Thầy Lê Công Chức! 👋' 
                  : <>Chào mừng, <StudentName studentId={currentStudent?.id} name={currentStudent?.name || 'Học sinh'} /></>}
              </h2>
              <span className="user-role-badge">
                {isTeacher 
                  ? `Quyền Quản trị viên • Email: ${currentUserEmail}` 
                  : `Học sinh: ${currentStudentClass?.name || 'Lớp học'} • ${currentStudentClass?.schoolFullName || 'Toán Thầy Công Chức'}`}
              </span>
            </div>
          </div>

          <div className="header-right">
            {/* Thanh chọn 'Góc nhìn học sinh' - DÀNH RIÊNG CHO GIÁO VIÊN khi chuyển qua thẻ Học sinh */}
            {isTeacherAccount && isStudent && (
              <div 
                className="flex items-center gap-2" 
                style={{ 
                  background: 'rgba(99, 102, 241, 0.08)', 
                  border: '1px solid rgba(99, 102, 241, 0.3)', 
                  borderRadius: 'var(--radius-full)', 
                  padding: '0.2rem 0.6rem 0.2rem 0.75rem',
                  marginRight: '0.25rem' 
                }}
              >
                <div className="flex items-center gap-1.5" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>
                  <Users size={15} />
                  <span>Góc nhìn HS:</span>
                </div>
                {allStudentsWithClass.length > 0 ? (
                  <select 
                    className="input"
                    style={{ 
                      padding: '0.25rem 0.5rem', 
                      fontSize: '0.8rem', 
                      height: '30px', 
                      width: 'auto', 
                      maxWidth: '180px',
                      border: '1px solid rgba(99, 102, 241, 0.2)', 
                      background: 'transparent', 
                      borderRadius: 'var(--radius-full)'
                    }}
                    value={currentStudentId}
                    onChange={(e) => setCurrentStudentId(e.target.value)}
                    title="Chọn học sinh để đứng dưới góc nhìn thực tế của em đó"
                  >
                    {allStudentsWithClass.map(s => (
                      <option key={`${s.className}-${s.id}`} value={s.id} style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
                        {s.name} ({s.className})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', paddingRight: '0.25rem' }}>
                    (Chưa có HS trong lớp)
                  </span>
                )}
              </div>
            )}

            {/* Nút Đăng nhập / Tài khoản Email (Chỉ hiển thị khi là Giáo viên) */}
            {isTeacher && (
              <button 
                className="btn btn-outline flex items-center gap-2"
                style={{ 
                  padding: '0.4rem 0.75rem', 
                  fontSize: '0.8rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isTeacherAccount ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-color)',
                  borderColor: isTeacherAccount ? 'var(--primary-color)' : 'var(--border-color)',
                  color: isTeacherAccount ? 'var(--primary-color)' : 'var(--text-primary)'
                }}
                onClick={handleOpenLogin}
                title="Nhấn để đăng nhập hoặc đổi tài khoản email"
              >
                <Mail size={15} />
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {currentUserEmail || 'Đăng nhập Email'}
                </span>
              </button>
            )}

            {/* Bộ chuyển đổi vai trò (Role Switcher) */}
            <div className="role-switcher-container">
              <div className="role-switcher">
                <button 
                  className={`role-btn ${isTeacher ? 'active teacher' : ''}`}
                  onClick={() => setRole('teacher')}
                  title={isTeacherAccount ? "Chuyển sang chế độ Giáo viên" : "Chỉ tài khoản lecongchuc02@gmail.com mới được phép"}
                >
                  <ShieldCheck size={15} />
                  <span>Giáo viên</span>
                </button>
                <button 
                  className={`role-btn ${!isTeacher ? 'active student' : ''}`}
                  onClick={() => setRole('student')}
                  title="Chuyển sang chế độ Học sinh"
                >
                  <GraduationCap size={15} />
                  <span>Học sinh</span>
                </button>
              </div>
            </div>

            <div 
              className={`user-profile ${!isTeacher ? 'student-avatar' : ''}`}
              onClick={isTeacher ? handleOpenLogin : undefined}
              style={{ cursor: isTeacher ? 'pointer' : 'default' }}
              title={isTeacher ? `Giáo viên: ${currentUserEmail}` : `${currentStudent?.name || 'Học sinh'}`}
            >
              <img 
                src={isTeacher 
                  ? "https://ui-avatars.com/api/?name=Cong+Chuc&background=4f46e5&color=fff" 
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStudent?.name || 'Hoc Sinh')}&background=10b981&color=fff`
                } 
                alt="Profile" 
                className="avatar" 
              />
            </div>



            {/* Nút Đăng xuất / Mở lại Màn hình Chào mừng */}
            <button 
              className="btn-icon"
              style={{ color: '#64748b' }}
              onClick={logout}
              title="Đăng xuất / Mở lại màn hình chào mừng"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        
        <div className="page-container" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      {/* Modal Đăng nhập Email */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>LC</div>
                <h3 style={{ margin: 0 }}>Đăng Nhập Tài Khoản Email</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowLoginModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDoLogin}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                    🔑 <strong>Quy định phân quyền:</strong><br />
                    • Chỉ email <strong>{TEACHER_EMAIL}</strong> mới được cấp quyền truy cập vào <strong>Chế độ Giáo viên</strong>.<br />
                    • Mọi email khác đăng nhập sẽ ở <strong>Chế độ Học sinh</strong>.
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa Chỉ Email Của Bạn *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" 
                      className="input" 
                      style={{ paddingLeft: '2.5rem' }}
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Nhập địa chỉ email của bạn..."
                      required
                      autoFocus
                    />
                    <Mail size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  {loginError && (
                    <span style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.35rem', display: 'block' }}>
                      {loginError}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLoginModal(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  <LogIn size={16} /> Xác Nhận Đăng Nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide Chào mừng Đầu tiên (Landing Modal khi người dùng vào web) */}
      <WelcomeLandingModal 
        isOpen={!hasEnteredApp} 
        onClose={() => setHasEnteredApp(true)} 
        classesData={classesData} 
      />

      {/* Modal Cài đặt Hệ thống (Chỉ Giáo viên) */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />

      {/* Mobile Simulator Modal */}
      {isMobileSimulator && (
        <div className="mobile-simulator-overlay" onClick={() => setIsMobileSimulator(false)}>
          <div className="mobile-simulator-container" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-simulator-header">
              <div className="flex items-center gap-2">
                <Smartphone size={16} />
                <span>Mô Phỏng Giao Diện Điện Thoại</span>
              </div>
              <button className="btn-icon" onClick={() => setIsMobileSimulator(false)} style={{ padding: '0.2rem' }}>
                <X size={16} />
              </button>
            </div>
            <iframe 
              src={window.location.pathname} 
              className="mobile-simulator-iframe"
              title="Mobile Simulator"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
