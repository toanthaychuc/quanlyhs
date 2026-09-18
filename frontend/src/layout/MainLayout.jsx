import React, { useState, useEffect } from 'react';
import { useOutlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  MessageSquare,
  Award,
  ClipboardList,
  LogOut,
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
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  LayoutDashboard as I_LayoutDashboard, LayoutGrid as I_LayoutGrid,
  UserRound as I_UserRound, UserRoundCheck as I_UserRoundCheck,
  BookOpen as I_BookOpen, BookOpenCheck as I_BookOpenCheck,
  FileText as I_FileText, FileCheck2 as I_FileCheck2,
  Folder as I_Folder, FolderCheck as I_FolderCheck,
  ClipboardList as I_ClipboardList, ClipboardCheck as I_ClipboardCheck,
  MessageSquare as I_MessageSquare, MessageSquareCheck as I_MessageSquareCheck,
  Star as I_Star, StarCheck as I_StarCheck,
  Shield as I_Shield, ShieldCheck as I_ShieldCheck,
  Sliders as I_Sliders, Settings as I_Settings,
  Smartphone as I_Smartphone, Tablet as I_Tablet,
  Menu as I_Menu, X as I_X,
  SquareSigma as I_SquareSigma, SquareCheck as I_SquareCheck
} from 'lucide';
import { useRole, TEACHER_EMAIL } from '../context/RoleContext';
import WelcomeLandingModal from '../components/WelcomeLandingModal';
import SettingsModal from '../components/SettingsModal';
import StudentName from '../components/StudentName';
import NotificationBell from '../components/NotificationBell';
import { ThemeToggleIcon } from '../components/ThemeToggleIcon';
import AnimatedIcon from '../components/AnimatedIcon';
import { getClasses } from '../services/classService';
import { getGamification } from '../services/examService';
import { calculateRank } from '../utils/rankUtils';
import './MainLayout.css';

const NavItemRenderer = ({ item, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <NavLink 
      to={item.path} 
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      onClick={(e) => onClick(e, item.path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={item.label}
    >
      <AnimatedIcon 
        defaultIcon={item.iconDefault} 
        hoverIcon={item.iconHover} 
        size={20} 
        isHoveredExternal={isHovered} 
      />
      <span>{item.label}</span>
    </NavLink>
  );
};

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOutlet = useOutlet();
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

  // Xử lý chặn các mục menu đối với chế độ "Học mà không cần đăng nhập" (Guest Mode)
  const handleNavClick = (e, path) => {
    setIsMobileMenuOpen(false);
    if (!isTeacher && isGuestMode) {
      const allowedPaths = ['/exams', '/documents', '/forum'];
      if (!allowedPaths.includes(path)) {
        e.preventDefault();
        alert('Hãy vào hỏi đáp để liên hệ thầy nhé!');
        return;
      }
    }
  };

  // State modal đăng nhập email
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [studentXP, setStudentXP] = useState(0);

  useEffect(() => {
    if (!isTeacher && currentStudentId) {
      const fetchXP = async () => {
        try {
          const gami = await getGamification(currentStudentId);
          setStudentXP(gami?.xp || 0);
        } catch (err) {
          console.error('Error fetching gamification in layout:', err);
        }
      };
      fetchXP();

      const handleUpdate = () => fetchXP();
      window.addEventListener('gamification_updated', handleUpdate);
      return () => window.removeEventListener('gamification_updated', handleUpdate);
    }
  }, [currentStudentId, isTeacher]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
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
  const [levelUpData, setLevelUpData] = useState(null);

  // Lấy danh sách lớp và học sinh từ Supabase để học sinh chọn đúng lớp
  const [classesData, setClassesData] = useState([]);

  useEffect(() => {
    // 1. Lấy dữ liệu local
    getClasses(false).then(data => {
      if (Array.isArray(data)) setClassesData(data);
      // 2. Cập nhật nền từ mây
      getClasses(true).then(freshData => {
        if (Array.isArray(freshData)) setClassesData(freshData);
      }).catch(err => console.error('Background sync classes error:', err));
    }).catch(err => console.error('MainLayout getClasses error:', err));
  }, [role, hasEnteredApp]);

  // Nghe sự kiện thăng hạng
  useEffect(() => {
    const handleLevelUp = (e) => {
      const { newRank } = e.detail;
      setLevelUpData(newRank);
      
      // Kích hoạt pháo giấy 3 lần cho hoành tráng
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fca5a5', '#6ee7b7', '#fcd34d', '#93c5fd', '#c4b5fd']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fca5a5', '#6ee7b7', '#fcd34d', '#93c5fd', '#c4b5fd']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      
      // Tự động ẩn popup sau 5 giây
      setTimeout(() => {
        setLevelUpData(null);
      }, 5000);
    };

    window.addEventListener('level_up', handleLevelUp);
    return () => window.removeEventListener('level_up', handleLevelUp);
  }, []);

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

  // Đảm bảo classesData luôn là mảng an toàn
  const safeClassesData = Array.isArray(classesData) ? classesData : [];

  // Tìm học sinh hiện tại và lớp của học sinh đó
  let currentStudent = null;
  let currentStudentClass = null;
  for (const cls of safeClassesData) {
    const found = cls.students?.find(s => s.id === currentStudentId);
    if (found) {
      currentStudent = found;
      currentStudentClass = cls;
      break;
    }
  }

  // Avatar Sync State
  const getDefaultAvatar = () => {
    return isTeacher 
      ? "https://ui-avatars.com/api/?name=Cong+Chuc&background=4f46e5&color=fff" 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentStudent?.name || 'Hoc Sinh')}&background=10b981&color=fff`;
  };

  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('edumanager_avatar') || getDefaultAvatar();
  });

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setUserAvatar(localStorage.getItem('edumanager_avatar') || getDefaultAvatar());
    };
    window.addEventListener('avatar_updated', handleAvatarUpdate);
    return () => window.removeEventListener('avatar_updated', handleAvatarUpdate);
  }, [isTeacher, currentStudent]);

  // Danh sách tất cả học sinh để giáo viên/người dùng có thể giả lập chọn học sinh khác nhau
  const allStudentsWithClass = safeClassesData.flatMap(cls => 
    (cls.students || []).map(s => ({ ...s, className: cls.name, school: cls.school }))
  );

  const navItems = [
    { path: '/', iconDefault: I_LayoutDashboard, iconHover: I_LayoutGrid, label: 'Dashboard' },
    { path: '/classes', iconDefault: I_UserRound, iconHover: I_UserRoundCheck, label: 'Lớp học' },
    { path: '/assignments', iconDefault: I_BookOpen, iconHover: I_BookOpenCheck, label: 'Bài tập' },
    { path: '/exams', iconDefault: I_FileText, iconHover: I_FileCheck2, label: 'Thi thử' },
    { path: '/documents', iconDefault: I_Folder, iconHover: I_FolderCheck, label: 'Tài liệu' },
    { path: '/formulas', iconDefault: I_SquareSigma, iconHover: I_SquareCheck, label: 'Tra công thức' },
    { path: '/forms', iconDefault: I_ClipboardList, iconHover: I_ClipboardCheck, label: 'Biểu mẫu' },
    { path: '/forum', iconDefault: I_MessageSquare, iconHover: I_MessageSquareCheck, label: 'Hỏi đáp' },
    { path: '/leaderboard', iconDefault: I_Star, iconHover: I_StarCheck, label: 'Xếp hạng' },
    ...(!isTeacher ? [{ path: '/my-rank', iconDefault: I_Shield, iconHover: I_ShieldCheck, label: 'Huy hiệu' }] : []),
  ];

  return (
    <div className="layout-container">
      <motion.div
        className="app-morph-wrapper"
        initial={false}
        animate={{
          scale: hasEnteredApp ? 1 : 0.95,
          opacity: hasEnteredApp ? 1 : 0,
          filter: hasEnteredApp ? 'blur(0px)' : 'blur(10px)'
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', height: '100%', display: 'flex' }}
      >
      {/* Overlay cho Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">LC</div>
            <div className="logo-text-wrapper">
              <span className="logo-text-top">TOÁN THẦY</span>
              <span className="logo-text-main">Công Chức</span>
            </div>
          </div>
        </div>

        <div className="sidebar-menu-header">
          <button 
            className="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span className="collapse-text">Thu gọn</span>
          </button>
          
          <div className="sidebar-menu-label">MENU</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavItemRenderer key={item.path} item={item} onClick={handleNavClick} />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-section">
            
            <div className="sidebar-user-profile">
              <div 
                className={`user-profile ${!isTeacher ? 'student-avatar' : ''}`}
                onClick={isTeacher ? handleOpenLogin : undefined}
                style={{ cursor: isTeacher ? 'pointer' : 'default', flexShrink: 0 }}
                title={isTeacher ? `Giáo viên: ${currentUserEmail}` : `${currentStudent?.name || 'Học sinh'}`}
              >
                <img 
                  src={userAvatar}
                  alt="Profile" 
                  className="avatar" 
                  style={{ width: '40px', height: '40px' }}
                />
              </div>

              <div className="sidebar-user-info" style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {isTeacher ? 'Thầy Công Chức' : (currentStudent?.name || 'Học sinh')}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {isTeacher ? 'Quản trị viên' : calculateRank(studentXP).currentRank.name}
                </span>
              </div>
            </div>

            <button 
              className="btn-icon sidebar-logout-btn"
              style={{ color: '#ef4444', flexShrink: 0, padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}
              onClick={logout}
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
            
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header glass">
          <div className="header-left">
            <button 
              className="mobile-menu-btn group"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <AnimatedIcon defaultIcon={I_Menu} hoverIcon={I_X} size={24} />
            </button>

            {/* Mobile Header Logo (Hidden on Desktop) */}
            <div className="mobile-header-logo">
              <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '0.9rem', borderRadius: '8px' }}>LC</div>
              <div className="logo-text-wrapper" style={{ lineHeight: 1.25, paddingTop: '2px' }}>
                <span className="logo-text-top" style={{ fontSize: '0.65rem' }}>TOÁN THẦY</span>
                <span className="logo-text-main" style={{ fontSize: '0.95rem' }}>Công Chức</span>
              </div>
            </div>

            <div className="header-status-group flex flex-col gap-1.5" style={{ animation: 'fadeIn 0.5s ease' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1rem' }}>⛅</span>
                <span style={{ 
                  background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0px 2px 4px rgba(79, 70, 229, 0.1)'
                }}>
                  {(() => {
                    const now = new Date();
                    const gmt7Time = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
                    const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                    const dayName = days[gmt7Time.getDay()];
                    const date = gmt7Time.getDate();
                    const month = gmt7Time.getMonth() + 1;
                    const year = gmt7Time.getFullYear();
                    return `${dayName}, ngày ${date} tháng ${month} năm ${year}`;
                  })()}
                </span>
              </div>

              {isTeacher ? (
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <div className="flex items-center px-3 py-1 rounded-full" style={{ gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.3s ease', cursor: 'default' }} onMouseOver={e => Object.assign(e.currentTarget.style, { background: 'rgba(16, 185, 129, 0.15)', transform: 'translateY(-1px)', boxShadow: '0 4px 6px rgba(16,185,129,0.1)' })} onMouseOut={e => Object.assign(e.currentTarget.style, { background: 'rgba(16, 185, 129, 0.1)', transform: 'translateY(0)', boxShadow: 'none' })}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 rgba(16,185,129,0.7)', animation: 'pulse-green 2s infinite' }}></div>
                    Hệ thống ổn định
                  </div>
                  <div className="flex items-center text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', gap: '6px', transition: 'all 0.3s ease', cursor: 'default', border: '1px solid rgba(99, 102, 241, 0.2)' }} onMouseOver={e => Object.assign(e.currentTarget.style, { background: 'rgba(99, 102, 241, 0.15)', transform: 'translateY(-1px)', boxShadow: '0 4px 6px rgba(99, 102, 241, 0.1)' })} onMouseOut={e => Object.assign(e.currentTarget.style, { background: 'rgba(99, 102, 241, 0.1)', transform: 'translateY(0)', boxShadow: 'none' })}>
                    <Users size={12} /> Quản lý {allStudentsWithClass?.length || 0} học sinh
                  </div>
                </div>
              ) : (
                <div className="flex items-center" style={{ gap: '16px' }}>
                  <div className="flex items-center bg-white/60 px-2.5 py-1 rounded-full border border-gray-100 shadow-sm" style={{ gap: '8px' }}>
                    <img 
                      src={calculateRank(studentXP).currentRank.image} 
                      alt="Rank" 
                      style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', background: calculateRank(studentXP).currentRank.bg }} 
                    />
                    <div className="flex items-baseline" style={{ gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: calculateRank(studentXP).currentRank.color }}>
                        {calculateRank(studentXP).currentRank.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {studentXP} XP
                      </span>
                    </div>
                  </div>
                  
                  {calculateRank(studentXP).nextRank && (
                    <div className="flex flex-col justify-center" style={{ width: '130px' }}>
                      <div className="flex justify-between items-end mb-1" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <span>Tiến tới {calculateRank(studentXP).nextRank.name}</span>
                        <span style={{ color: calculateRank(studentXP).currentRank.color }}>{Math.round(calculateRank(studentXP).progressPercent)}%</span>
                      </div>
                      <div style={{ height: '5px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${calculateRank(studentXP).progressPercent}%`, 
                            background: calculateRank(studentXP).currentRank.color, 
                            borderRadius: '3px', 
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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


            <div className="header-tools" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginRight: '0.5rem' }}>
              {/* Nút Cài đặt Hệ thống (Dành riêng cho Giáo viên) */}
              {isTeacher && (
                <button 
                  className="btn btn-outline flex items-center justify-center group"
                  style={{ 
                    width: '38px', height: '38px', padding: 0,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: 'var(--primary-color)'
                  }}
                  onClick={() => setShowSettingsModal(true)}
                  title="Cài đặt hệ thống"
                >
                  <AnimatedIcon defaultIcon={I_Sliders} hoverIcon={I_Settings} size={20} />
                </button>
              )}



              {/* Nút Đổi Theme (Giao diện Sáng/Tối) */}
              <button 
                className="btn btn-outline flex items-center justify-center"
                style={{ 
                  width: '38px', height: '38px', padding: 0,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-color)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                onClick={toggleTheme}
                title={theme === 'light' ? 'Chuyển sang giao diện Tối' : 'Chuyển sang giao diện Sáng'}
              >
                <ThemeToggleIcon size={20} isDark={theme === 'light'} />
              </button>
            </div>

            <NotificationBell />

            <button 
              className="btn btn-outline flex items-center justify-center group"
              style={{ 
                width: '38px', height: '38px', padding: 0,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                marginLeft: '0.25rem'
              }}
              onClick={logout}
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        
        <div className="page-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {currentOutlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Native App Feel) */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/')}>
          <LayoutDashboard size={20} /><span>Trang chủ</span>
        </NavLink>
        <NavLink to="/classes" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/classes')}>
          <Users size={20} /><span>Lớp học</span>
        </NavLink>
        <NavLink to="/assignments" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/assignments')}>
          <BookOpen size={20} /><span>Bài tập</span>
        </NavLink>
        <NavLink to="/exams" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/exams')}>
          <GraduationCap size={20} /><span>Thi thử</span>
        </NavLink>
        <button className="bottom-nav-item" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={20} /><span>Mở rộng</span>
        </button>
      </nav>
      </motion.div>

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

      {/* Popup chúc mừng thăng hạng */}
      <AnimatePresence>
        {levelUpData && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              background: 'white',
              padding: '20px 40px',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              border: `4px solid ${levelUpData.color}`
            }}
          >
            <div style={{ fontSize: '48px', lineHeight: 1, position: 'relative' }}>
              {levelUpData.baseEmoji}
              {levelUpData.accessoryEmoji && <span style={{ fontSize: '0.5em', position: 'absolute', bottom: 0, right: 0 }}>{levelUpData.accessoryEmoji}</span>}
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem' }}>Chúc Mừng Thăng Hạng! 🎉</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Bạn đã đạt cấp <strong>{levelUpData.name}</strong></p>
            </div>
            <button 
              onClick={() => setLevelUpData(null)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px'
              }}
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Cài đặt Hệ thống (Chỉ Giáo viên) */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />


    </div>
  );
};

export default MainLayout;
