import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  FileCode, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Settings, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff,
  Minus,
  Plus,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { pushAllLocalDataToCloud, pullAllDataFromCloud } from '../services/syncService';
import MathView from './MathView';

export const GUEST_MENU_OPTIONS = [
  { path: '/exams', label: 'Thi thử' },
  { path: '/documents', label: 'Tài liệu' },
  { path: '/forum', label: 'Hỏi đáp' },
  { path: '/formulas', label: 'Tra công thức' },
  { path: '/', label: 'Dashboard' },
  { path: '/classes', label: 'Lớp học' },
  { path: '/assignments', label: 'Bài tập' },
  { path: '/forms', label: 'Biểu mẫu' },
  { path: '/leaderboard', label: 'Xếp hạng' },
  { path: '/my-rank', label: 'Huy hiệu' },
];

export const DEFAULT_LATEX_PREAMBLE = `\\usepackage{amsmath,amssymb}
\\usepackage{tikz}
\\usepackage{tkz-tab}
\\usetikzlibrary{calc,intersections,angles,quotes,patterns,positioning,arrows,arrows.meta,decorations.pathreplacing,decorations.markings,shapes.geometric,math}`;

const SettingsModal = ({ isOpen, onClose }) => {
  const { isTeacherAccount, isTeacher } = useRole();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'cloud' | 'latex' | 'ai'
  const [fontScale, setFontScale] = useState(100);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiModel, setAiModel] = useState('gemini-1.5-flash');
  const [latexPreamble, setLatexPreamble] = useState(DEFAULT_LATEX_PREAMBLE);
  const [guestAllowed, setGuestAllowed] = useState(['/exams', '/documents', '/forum']);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customModel, setCustomModel] = useState('');

  // Cloud Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Nạp cấu hình từ localStorage khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (isTeacher) {
        const savedKey = localStorage.getItem('app_teacher_ai_apikey') || '';
        const savedModel = localStorage.getItem('app_teacher_ai_model') || 'gemini-1.5-flash';
        const savedPreamble = localStorage.getItem('app_teacher_latex_preamble');
        const savedGuest = localStorage.getItem('app_teacher_guest_allowed_paths');
        setApiKey(savedKey);
        setAiModel(savedModel);
        setLatexPreamble(savedPreamble !== null ? savedPreamble : DEFAULT_LATEX_PREAMBLE);

        if (savedGuest) {
          try {
            const parsed = JSON.parse(savedGuest);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setGuestAllowed(parsed);
            } else {
              setGuestAllowed(['/exams', '/documents', '/forum']);
            }
          } catch (e) {
            setGuestAllowed(['/exams', '/documents', '/forum']);
          }
        } else {
          setGuestAllowed(['/exams', '/documents', '/forum']);
        }
      }
      const savedScale = Number(localStorage.getItem('app_font_scale')) || 100;
      setFontScale(savedScale);
      setSaveSuccess(false);
      if (!isTeacher) {
        setActiveTab('general');
      }
    }
  }, [isOpen, isTeacher]);

  if (!isOpen) return null;

  const handleUpdateFontScale = (scale) => {
    const validScale = Math.min(130, Math.max(75, scale));
    setFontScale(validScale);
    document.documentElement.style.setProperty('--app-font-scale', `${validScale}%`);
    document.documentElement.style.setProperty('--app-font-scale-mobile', `${(validScale * 0.8).toFixed(1)}%`);
  };

  const handleClose = () => {
    // Hoàn tác về tỉ lệ font đã lưu nếu người dùng bấm đóng mà chưa bấm Lưu
    const savedScale = Number(localStorage.getItem('app_font_scale')) || 100;
    document.documentElement.style.setProperty('--app-font-scale', `${savedScale}%`);
    document.documentElement.style.setProperty('--app-font-scale-mobile', `${(savedScale * 0.8).toFixed(1)}%`);
    onClose();
  };

  const handleSave = () => {
    localStorage.setItem('app_font_scale', fontScale.toString());
    if (isTeacher) {
      localStorage.setItem('app_teacher_ai_apikey', apiKey.trim());
      localStorage.setItem('app_teacher_ai_model', aiModel === 'custom' ? customModel.trim() : aiModel);
      localStorage.setItem('app_teacher_latex_preamble', latexPreamble);
      localStorage.setItem('app_teacher_guest_allowed_paths', JSON.stringify(guestAllowed));
      // Kích hoạt sự kiện để các component khác (MathView, TikZ, MainLayout) nhận biết thay đổi
      window.dispatchEvent(new Event('app-settings-updated'));
      window.dispatchEvent(new CustomEvent('guest_permissions_updated', { detail: { allowedPaths: guestAllowed } }));
    }

    window.dispatchEvent(new CustomEvent('app_font_scale_updated', { detail: { scale: fontScale } }));

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetPreamble = () => {
    if (window.confirm('Khôi phục phần Preamble về mặc định tiêu chuẩn (hỗ trợ tikz, tkz-tab, amsmath)?')) {
      setLatexPreamble(DEFAULT_LATEX_PREAMBLE);
    }
  };

  const handlePushAllToCloud = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Đang tải toàn bộ dữ liệu lên Supabase...');
    const res = await pushAllLocalDataToCloud();
    setIsSyncing(false);
    if (res.success) {
      setSyncStatusMsg('🎉 Đã đồng bộ toàn bộ Dữ liệu (Lớp học, Học sinh, Đề thi, Bài tập, Tài liệu, Thông báo) lên Đám mây Supabase thành công!');
    } else {
      setSyncStatusMsg(`❌ Có lỗi khi đồng bộ: ${res.error}`);
    }
  };

  const handlePullAllFromCloud = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('Đang tải dữ liệu mới nhất từ Supabase...');
    const res = await pullAllDataFromCloud();
    setIsSyncing(false);
    if (res.success) {
      setSyncStatusMsg('🎉 Đã tải và cập nhật toàn bộ dữ liệu từ Đám mây về máy thành công!');
      setTimeout(() => window.location.reload(), 1200);
    } else {
      setSyncStatusMsg(`❌ Lỗi tải dữ liệu: ${res.error}`);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={handleClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div className="flex items-center" style={{ gap: '0.85rem' }}>
            <div 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, var(--primary-color), #06b6d4)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#ffffff', 
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
                flexShrink: 0
              }}
            >
              <Settings size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                {isTeacher ? 'Cấu Hình Hệ Thống & Đồng Bộ' : 'Cài Đặt Cỡ Chữ & Giao Diện'}
              </h3>
            </div>
          </div>
          <button className="btn-icon" onClick={handleClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation (Chỉ hiển thị khi là Giáo viên có nhiều tab) */}
        {isTeacher && (
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.85rem 1.5rem 0', background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'general' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
                color: activeTab === 'general' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'general' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Settings size={16} />
              <span>Cài đặt</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cloud')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'cloud' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
                color: activeTab === 'cloud' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'cloud' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span>☁️ Đồng bộ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('latex')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'latex' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
                color: activeTab === 'latex' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'latex' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <FileCode size={16} />
              <span>Preamer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'ai' ? '2.5px solid var(--primary-color)' : '2.5px solid transparent',
                color: activeTab === 'ai' ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'ai' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Sparkles size={16} />
              <span>AI</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Bộ điều khiển tỉ lệ font */}
              <div style={{
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Tỉ lệ cỡ chữ:</span>
                    <span style={{
                      background: 'rgba(79, 70, 229, 0.1)',
                      color: 'var(--primary-color)',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.95rem'
                    }}>
                      {fontScale}% {fontScale === 100 ? '(Tiêu chuẩn)' : ''}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleUpdateFontScale(100)}
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    disabled={fontScale === 100}
                    title="Khôi phục về cỡ chữ chuẩn 100%"
                  >
                    <RotateCcw size={13} /> Đặt lại 100%
                  </button>
                </div>

                {/* Thanh trượt & Nút tăng giảm */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateFontScale(Math.max(75, fontScale - 5))}
                    className="btn btn-secondary"
                    style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                    disabled={fontScale <= 75}
                    title="Giảm 5%"
                  >
                    <Minus size={16} />
                  </button>

                  <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <input
                      type="range"
                      min="75"
                      max="130"
                      step="5"
                      value={fontScale}
                      onChange={(e) => handleUpdateFontScale(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      <span>75% (Gọn)</span>
                      <span style={{ fontWeight: 600 }}>100% (Mặc định)</span>
                      <span>130% (Lớn)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUpdateFontScale(Math.min(130, fontScale + 5))}
                    className="btn btn-secondary"
                    style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                    disabled={fontScale >= 130}
                    title="Tăng 5%"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Các mức chọn nhanh */}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Các mức chọn nhanh:
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { val: 85, label: '85% (Nhỏ gọn)' },
                      { val: 90, label: '90% (Vừa)' },
                      { val: 100, label: '100% (Chuẩn)' },
                      { val: 110, label: '110% (Rõ nét)' },
                      { val: 120, label: '120% (Phóng to)' }
                    ].map(preset => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => handleUpdateFontScale(preset.val)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: fontScale === preset.val ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                          background: fontScale === preset.val ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-color)',
                          color: fontScale === preset.val ? 'var(--primary-color)' : 'var(--text-primary)',
                          fontWeight: fontScale === preset.val ? 700 : 500,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Khung xem trước trực tiếp */}
              <div style={{
                background: 'var(--bg-color)',
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  👁️ Xem trước:
                </div>
                <div style={{
                  background: 'var(--surface-color)',
                  padding: '1rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  lineHeight: 1.6
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.25rem' }}>
                    Toán 12: Đạo hàm & Khảo sát sự biến thiên
                  </div>
                  <div style={{ color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Cho hàm số bậc ba $y = ax^3 + bx^2 + cx + d$ ($a \neq 0$). Nghiệm đạo hàm xác định các điểm cực trị:
                  </div>
                  <div>
                    <MathView text={"$$\\int_{0}^{1} (3x^2 - 2x + 1)\\,dx = 1 \\quad \\text{và} \\quad f'(x) = 0$$"} />
                  </div>
                </div>
              </div>

              {/* Phân quyền cho học sinh ở chế độ Khách (Dành cho Giáo viên) */}
              {isTeacher && (
                <div style={{
                  background: 'var(--surface-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={18} style={{ color: 'var(--primary-color)' }} />
                      <span>Phân quyền Menu cho Học sinh dạng Khách:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setGuestAllowed(['/exams', '/documents', '/forum'])}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      title="Khôi phục quyền mặc định (Thi thử, Tài liệu, Hỏi đáp)"
                    >
                      <RotateCcw size={13} /> Mặc định
                    </button>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    Chọn các mục menu mà học sinh ở chế độ Khách (chưa đăng nhập) được phép truy cập. Những mục không được chọn sẽ tự động <strong>bị ẩn mờ hẳn đi và khóa lại</strong> trên thanh menu.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                    gap: '0.6rem',
                    marginTop: '0.25rem'
                  }}>
                    {GUEST_MENU_OPTIONS.map(opt => {
                      const isChecked = guestAllowed.includes(opt.path);
                      return (
                        <label 
                          key={opt.path}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            border: isChecked ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                            background: isChecked ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-color)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: isChecked ? 600 : 500,
                            color: isChecked ? 'var(--primary-color)' : 'var(--text-secondary)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGuestAllowed(prev => [...prev, opt.path]);
                              } else {
                                setGuestAllowed(prev => prev.filter(p => p !== opt.path));
                              }
                            }}
                            style={{ accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                          />
                          <span>{opt.label}</span>
                          {!isChecked && <Lock size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {isTeacher && activeTab === 'cloud' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--primary-color)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>☁️</span> Trung Tâm Đồng Bộ Đám Mây (Supabase)
                </h4>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Mọi dữ liệu (Danh sách lớp, Học sinh, Điểm số, Đề thi thử, Bài tập, Tài liệu, Thông báo) đều được lưu trữ trực tiếp trên đám mây để học sinh và thầy luôn thấy thông tin mới nhất.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.85rem 1.25rem', fontSize: '0.92rem', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={handlePushAllToCloud}
                  disabled={isSyncing}
                >
                  <span>☁️</span> {isSyncing ? 'Đang đồng bộ...' : 'Sao Lưu & Đẩy Toàn Bộ Dữ Liệu Lên Đám Mây (1 Chạm)'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={handlePullAllFromCloud}
                  disabled={isSyncing}
                >
                  <RotateCcw size={15} /> {isSyncing ? 'Đang tải...' : 'Lấy Dữ Liệu Mới Nhất Từ Đám Mây Về Máy'}
                </button>
              </div>

              {syncStatusMsg && (
                <div style={{ 
                  background: syncStatusMsg.startsWith('🎉') ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${syncStatusMsg.startsWith('🎉') ? '#bbf7d0' : '#fecaca'}`,
                  color: syncStatusMsg.startsWith('🎉') ? '#15803d' : '#b91c1c',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line'
                }}>
                  {syncStatusMsg}
                </div>
              )}
            </div>
          )}

          {isTeacher && activeTab === 'latex' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.5, display: 'flex', gap: '0.5rem' }}>
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Preamble cho pdflatex:</strong> Các gói lệnh <code>\usepackage{'{{...}}'}</code>, <code>\usetikzlibrary{'{{...}}'}</code> hoặc <code>\input{'{{...}}'}</code> đặt tại đây sẽ được tự động chèn vào trước <code>{`\\begin{document}`}</code> khi biên dịch TikZ và Bảng biến thiên (tkz-tab).
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                    Nội dung Preamble (LaTeX Header)
                  </label>
                  <button 
                    type="button" 
                    onClick={handleResetPreamble} 
                    className="btn btn-outline" 
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    title="Khôi phục preamble chuẩn"
                  >
                    <RotateCcw size={12} /> Mặc định
                  </button>
                </div>
                <textarea
                  className="input"
                  style={{
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.82rem',
                    lineHeight: '1.45',
                    minHeight: '220px',
                    whiteSpace: 'pre',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '0.75rem'
                  }}
                  value={latexPreamble}
                  onChange={(e) => setLatexPreamble(e.target.value)}
                  placeholder="Nhập các gói \usepackage{...}, \usetikzlibrary{...} hoặc \input{...}"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {isTeacher && activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#3730a3', lineHeight: 1.5, display: 'flex', gap: '0.5rem' }}>
                  <Sparkles size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Cấu hình Trí Tuệ Nhân Tạo (AI):</strong> Dùng để sinh đề thi, tự động soạn lời giải chi tiết, phân tích dạng toán và gợi ý hình vẽ TikZ.
                  </div>
                </div>
              </div>

              {/* API Key */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Key size={15} color="#4f46e5" /> API Key (Google AI Studio / OpenAI)
                </label>
                <div style={{ position: 'relative', marginTop: '0.35rem' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="input"
                    style={{ paddingRight: '2.5rem', fontFamily: showApiKey ? 'monospace' : 'inherit' }}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy... (Nhập Gemini API Key hoặc OpenAI Key)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem', display: 'block' }}>
                  Khóa API được lưu an toàn cục bộ trên trình duyệt của riêng bạn (LocalStorage).
                </span>
              </div>

              {/* Model AI */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Cpu size={15} color="#06b6d4" /> Chọn Model AI
                </label>
                <div style={{ marginTop: '0.35rem' }}>
                  <select
                    className="input"
                    value={['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gpt-4o', 'gpt-4o-mini'].includes(aiModel) ? aiModel : 'custom'}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setAiModel('custom');
                      } else {
                        setAiModel(e.target.value);
                      }
                    }}
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tốc độ cao, tối ưu toán học)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Phiên bản mới nhất)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Suy luận sâu, giải đề phức tạp)</option>
                    <option value="gpt-4o">GPT-4o (OpenAI)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                    <option value="custom">Tùy chỉnh model khác...</option>
                  </select>
                </div>

                {aiModel === 'custom' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      className="input"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="Nhập định danh model (vd: claude-3-5-sonnet-20241022, deepseek-r1)"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.5rem', background: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {saveSuccess && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--secondary-color)', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle size={16} /> Đã lưu cấu hình thành công!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Đóng
            </button>
            <button type="button" className="btn btn-primary flex items-center gap-1.5" onClick={handleSave}>
              <Save size={16} /> Lưu Cấu Hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
