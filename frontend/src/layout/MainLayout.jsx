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
  ChevronRight,
  SquareSigma
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
  GraduationCap as I_GraduationCap, UserCheck as I_UserCheck,
  Menu as I_Menu, X as I_X,
  SquareSigma as I_SquareSigma, SquareCheck as I_SquareCheck
} from 'lucide';
import { useRole, TEACHER_EMAIL } from '../context/RoleContext';
import WelcomeLandingModal from '../components/WelcomeLandingModal';
import SettingsModal from '../components/SettingsModal';
import MobileReviewModal from '../components/MobileReviewModal';
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

const RANK_ACCENTS = {
  rank1: { light: '#475569', dark: '#94a3b8', glow: 'rgba(100, 116, 139, 0.4)' },
  rank2: { light: '#e11d48', dark: '#fb7185', glow: 'rgba(225, 29, 72, 0.4)' },
  rank3: { light: '#059669', dark: '#34d399', glow: 'rgba(5, 150, 105, 0.4)' },
  rank4: { light: '#d97706', dark: '#fbbf24', glow: 'rgba(217, 119, 6, 0.4)' },
  rank5: { light: '#2563eb', dark: '#60a5fa', glow: 'rgba(37, 99, 235, 0.4)' },
  rank6: { light: '#7c3aed', dark: '#a78bfa', glow: 'rgba(124, 58, 237, 0.4)' },
  rank7: { light: '#db2777', dark: '#f472b6', glow: 'rgba(219, 39, 119, 0.4)' },
  rank8: { light: '#0d9488', dark: '#2dd4bf', glow: 'rgba(13, 148, 136, 0.4)' },
  rank9: { light: '#b45309', dark: '#fcd34d', glow: 'rgba(180, 83, 9, 0.4)' }
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
  const [isMobileReviewOpen, setIsMobileReviewOpen] = useState(false);
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

  const studentRank = calculateRank(studentXP);
  const currentRankAccent = RANK_ACCENTS[studentRank?.currentRank?.id] || { 
    light: '#d97706', 
    dark: '#fbbf24', 
    glow: 'rgba(217, 119, 6, 0.4)' 
  };
  const rankColor = theme === 'dark' ? currentRankAccent.dark : currentRankAccent.light;

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
          <div 
            className="logo-container"
            onClick={() => window.dispatchEvent(new CustomEvent('play_logo_intro'))}
            title="Bấm để phát lại hiệu ứng chào mừng Toán thầy Công Chức"
          >
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
                className="user-profile"
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
                  {isTeacher ? 'Quản trị viên' : studentRank.currentRank.name}
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
            <div 
              className="mobile-header-logo cursor-pointer"
              onClick={() => window.dispatchEvent(new CustomEvent('play_logo_intro'))}
              title="Bấm để phát lại hiệu ứng chào mừng Toán thầy Công Chức"
              style={{ cursor: 'pointer' }}
            >
              <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '0.9rem', borderRadius: '8px' }}>LC</div>
              <div className="logo-text-wrapper" style={{ lineHeight: 1.25, paddingTop: '2px' }}>
                <span className="logo-text-top" style={{ fontSize: '0.65rem' }}>TOÁN THẦY</span>
                <span className="logo-text-main" style={{ fontSize: '0.95rem' }}>Công Chức</span>
              </div>
            </div>

            <div className="header-status-group flex items-center" style={{ animation: 'fadeIn 0.3s ease' }}>
              {isTeacher ? (
                <div style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.05rem' }}>⛅</span>
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
              ) : (
                <div className="flex items-center">
                  <div 
                    className="flex items-center cursor-pointer group"
                    onClick={() => navigate('/my-rank')}
                    title={`Kinh nghiệm: ${studentXP}/${studentRank.nextRank ? studentRank.nextRank.minXP : studentXP} XP - Nhấn để xem BXH & Huy hiệu`}
                    style={{ 
                      gap: '8px', 
                      background: 'transparent', 
                      border: 'none',
                      padding: '2px 4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'scale(1.03)' })}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'scale(1)' })}
                  >
                    <img 
                      src={studentRank.currentRank.image} 
                      alt="Rank" 
                      style={{ 
                        width: 26, 
                        height: 26, 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        boxShadow: `0 2px 8px ${currentRankAccent.glow}`,
                        border: `1.5px solid ${rankColor}`,
                        flexShrink: 0
                      }} 
                    />
                    <div className="flex items-baseline" style={{ gap: '6px' }}>
                      <span style={{ 
                        fontSize: '0.88rem', 
                        fontWeight: 800, 
                        color: rankColor,
                        letterSpacing: '-0.2px',
                        textShadow: theme === 'dark' ? `0 0 10px ${currentRankAccent.glow}` : 'none'
                      }}>
                        {studentRank.currentRank.name}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                        <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{studentXP}</strong>
                        <span style={{ color: 'var(--text-secondary)', opacity: 0.85 }}>
                          {studentRank.nextRank ? `/${studentRank.nextRank.minXP} XP` : ' XP'}
                        </span>
                      </span>
                    </div>
                  </div>
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
              {/* Nút Chuyển Chế độ Học sinh (Chỉ dành cho Giáo viên, nằm ngay bên trái Mobile Review) */}
              {isTeacherAccount && (
                <button 
                  className="btn btn-outline flex items-center justify-center group"
                  style={{ 
                    width: '38px', height: '38px', padding: 0,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isStudent ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.08)',
                    borderColor: isStudent ? 'rgba(16, 185, 129, 0.5)' : 'rgba(99, 102, 241, 0.3)',
                    color: isStudent ? '#10b981' : 'var(--primary-color)',
                    position: 'relative',
                    boxShadow: isStudent ? '0 0 10px rgba(16, 185, 129, 0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setRole(isStudent ? 'teacher' : 'student')}
                  title={isStudent ? "Đang ở Chế độ Học sinh (Bấm để quay lại Chế độ Giáo viên)" : "Chế độ học sinh (Xem giao diện học sinh khi điều chỉnh)"}
                >
                  <AnimatedIcon defaultIcon={I_GraduationCap} hoverIcon={I_UserCheck} size={20} />
                  {isStudent && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '1px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '1.5px solid var(--surface-color)',
                        boxShadow: '0 0 4px #10b981'
                      }} 
                    />
                  )}
                </button>
              )}

              {/* Nút Mobile Review (Dành riêng cho Giáo viên và không ở trong iframe) */}
              {isTeacherAccount && !isIframe && (
                <button 
                  className="btn btn-outline flex items-center justify-center group"
                  style={{ 
                    width: '38px', height: '38px', padding: 0,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    color: 'var(--primary-color)'
                  }}
                  onClick={() => setIsMobileReviewOpen(true)}
                  title="Xem trước giao diện điện thoại (Mobile Review)"
                >
                  <AnimatedIcon defaultIcon={I_Smartphone} hoverIcon={I_Tablet} size={20} />
                </button>
              )}

              {/* Nút Cài đặt Hệ thống / Giao diện (Hiển thị cho cả Giáo viên và Học sinh) */}
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
                title={isTeacher ? "Cài đặt hệ thống" : "Cài đặt cỡ chữ giao diện"}
              >
                <AnimatedIcon defaultIcon={I_Sliders} hoverIcon={I_Settings} size={20} />
              </button>



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
        <NavLink to="/formulas" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/formulas')}>
          <SquareSigma size={20} /><span>Công thức</span>
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

      {/* Modal Xem trước Di động (Chỉ Giáo viên) */}
      <MobileReviewModal 
        isOpen={isMobileReviewOpen} 
        onClose={() => setIsMobileReviewOpen(false)} 
      />


    </div>
  );
};

export default MainLayout;
