import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  GraduationCap, 
  LogIn, 
  ArrowRight, 
  Sparkles, 
  X, 
  AlertCircle,
  User,
  School,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useRole, TEACHER_EMAIL } from '../context/RoleContext';
import './WelcomeLandingModal.css';

const WelcomeLandingModal = ({ isOpen, onClose, classesData = [] }) => {
  const navigate = useNavigate();
  const { 
    currentUserEmail, 
    loginWithEmail, 
    loginAsGuest, 
    selectEnrolledStudent,
    hasTeacherPassword,
    teacherPassword,
    setTeacherPassword,
    changeTeacherPassword,
    removeTeacherPassword
  } = useRole();

  // Mode: 'landing' | 'student_select' | 'google_teacher' | 'manage_password'
  const [modalStep, setModalStep] = useState('landing');
  const [teacherEmailInput, setTeacherEmailInput] = useState('');
  const [teacherPasswordInput, setTeacherPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(() => classesData[0]?.id || 'np-10t8');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentCodeInput, setStudentCodeInput] = useState('');
  const [studentError, setStudentError] = useState('');

  // Tự động chọn lớp hợp lệ khi classesData được tải về từ Supabase
  React.useEffect(() => {
    if (classesData && classesData.length > 0) {
      if (!selectedClassId || !classesData.some(c => c.id === selectedClassId)) {
        setSelectedClassId(classesData[0].id);
      }
    }
  }, [classesData, selectedClassId]);

  if (!isOpen) return null;

  // Xử lý học sinh chọn "Học mà không cần đăng nhập" (Guest Mode tự do làm bài thi thử)
  const handleGuestEntry = () => {
    loginAsGuest();
    navigate('/exams');
    onClose();
  };

  // Xử lý Giáo viên đăng nhập bằng Google (kèm kiểm tra mật khẩu)
  const handleTeacherGoogleLogin = (e) => {
    e.preventDefault();
    setTeacherError('');
    setTeacherSuccess('');
    const email = teacherEmailInput.trim().toLowerCase();
    if (email !== TEACHER_EMAIL.toLowerCase()) {
      setTeacherError(`⛔ Email không chính xác hoặc không có quyền quản trị Giáo viên!`);
      return;
    }

    // Nếu lần đầu chưa có mật khẩu và có nhập mật khẩu tạo mới
    if (!hasTeacherPassword && newPasswordInput.trim()) {
      if (newPasswordInput !== confirmPasswordInput) {
        setTeacherError('Mật khẩu xác nhận không khớp!');
        return;
      }
      setTeacherPassword(newPasswordInput.trim());
    }

    const res = loginWithEmail(TEACHER_EMAIL, teacherPasswordInput.trim() || newPasswordInput.trim());
    if (res.success) {
      alert(`🎉 Chào mừng Thầy Lê Công Chức đã đăng nhập vào hệ thống!`);
      onClose();
    } else {
      setTeacherError(res.message || 'Mật khẩu giáo viên không chính xác!');
    }
  };

  // Xử lý Đổi mật khẩu
  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setTeacherError('');
    setTeacherSuccess('');
    if (newPasswordInput !== confirmPasswordInput) {
      setTeacherError('Mật khẩu mới xác nhận không khớp!');
      return;
    }
    const res = changeTeacherPassword(oldPasswordInput.trim(), newPasswordInput.trim());
    if (res.success) {
      setTeacherSuccess('🎉 Đổi mật khẩu thành công!');
      setOldPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => setModalStep('google_teacher'), 1200);
    } else {
      setTeacherError(res.message);
    }
  };

  // Xử lý Xóa mật khẩu
  const handleRemovePasswordSubmit = (e) => {
    e.preventDefault();
    setTeacherError('');
    setTeacherSuccess('');
    const res = removeTeacherPassword(oldPasswordInput.trim());
    if (res.success) {
      setTeacherSuccess('🎉 Đã xóa mật khẩu bảo vệ thành công!');
      setOldPasswordInput('');
      setTimeout(() => setModalStep('google_teacher'), 1200);
    } else {
      setTeacherError(res.message);
    }
  };

  // Xử lý học sinh trong danh sách lớp xác nhận danh tính & đối chiếu Mã học sinh
  const handleStudentSelectConfirm = (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setStudentError('Vui lòng chọn tên học sinh của bạn trong danh sách lớp!');
      return;
    }

    const currentClassObj = classesData.find(c => c.id === selectedClassId) || classesData[0];
    const targetStudent = currentClassObj?.students?.find(s => s.id === selectedStudentId);

    const inputCode = studentCodeInput.trim().replace(/\s+/g, '');
    const studentId = (targetStudent.id || '').trim().toUpperCase();
    const studentPhone = (targetStudent.phone || '').trim().replace(/\s+/g, '');
    
    // Đối chiếu: Trùng Mã HS, hoặc Trùng Số điện thoại (kể cả trường hợp nhập có/không có số 0 đầu)
    const isCodeMatch = (inputCode.toUpperCase() === studentId) ||
                        (studentPhone && inputCode === studentPhone) ||
                        (studentPhone && inputCode.replace(/^0/, '') === studentPhone.replace(/^0/, '')) ||
                        (inputCode === targetStudent.id);

    if (!isCodeMatch) {
      setStudentError(`❌ Mã học sinh / Số điện thoại không chính xác!\nVui lòng nhập đúng Số điện thoại (Mã học sinh) đã đăng ký với Thầy Lê Công Chức.`);
      return;
    }

    selectEnrolledStudent(selectedStudentId, selectedClassId);
    alert(`🎉 Xác thực thành công! Chào mừng ${targetStudent.name} (${currentClassObj.name}) vào học.`);
    onClose();
  };

  const currentClassObj = classesData.find(c => c.id === selectedClassId) || classesData[0];
  const classStudents = currentClassObj?.students || [];

  return (
    <div className="welcome-overlay">
      <div className="welcome-backdrop-glow"></div>
      
      <div className="welcome-card-container">
        {/* Step 1: Slide Landing Chính */}
        {modalStep === 'landing' && (
          <div className="welcome-slide-content">
            {/* Hai logo trường: Logo đỏ THTH trước, Logo xanh NP bên cạnh */}
            <div className="welcome-school-logos">
              <div className="school-logo-item logo-red-wrapper" title="Trường Trung học Thực hành - ĐH Sư phạm TP.HCM (THTH)">
                <img src={`${import.meta.env.BASE_URL}logos/logo_thth.jpg`} alt="Logo Trường THTH" className="school-logo-img" />
              </div>
              <div className="school-logo-item logo-blue-wrapper" title="Trung tâm Tri thức NP">
                <img src={`${import.meta.env.BASE_URL}logos/logo_np_v2.jpg`} alt="Logo Trung tâm NP" className="school-logo-img" />
              </div>
            </div>

            {/* Logo Icon LC */}
            <div className="welcome-logo-badge">
              <span>LC</span>
            </div>

            {/* Tiêu đề lớn gradient */}
            <h1 className="welcome-main-title">
              Kỷ luật mỗi ngày - Làm chủ phòng thi
            </h1>

            {/* Tên thương hiệu phụ */}
            <div className="welcome-subtitle">
              <Sparkles size={18} className="sparkle-icon" />
              <span>Toán thầy Công Chức</span>
            </div>

            {/* 3 Nút lựa chọn vào hệ thống */}
            <div className="welcome-actions-group">
              {/* Nút 1: Đăng nhập để bắt đầu (Dành cho học sinh trong lớp) */}
              <button 
                className="welcome-action-pill pill-primary"
                onClick={() => setModalStep('student_select')}
              >
                <div className="google-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <div className="pill-text-block">
                  <span className="pill-title">Đăng nhập để bắt đầu</span>
                  <span className="pill-sub">Học sinh có trong danh sách lớp</span>
                </div>
              </button>

              {/* Nút 2: Học mà không cần đăng nhập */}
              <button 
                className="welcome-action-pill pill-secondary"
                onClick={handleGuestEntry}
              >
                <div className="pill-text-block text-center">
                  <span className="pill-title">Học mà không cần đăng nhập</span>
                  <span className="pill-sub">Luyện thi thử & xem tài liệu tự do</span>
                </div>
              </button>

              {/* Nút 3: Giáo viên */}
              <button 
                className="welcome-action-pill pill-teacher"
                onClick={() => {
                  setTeacherError('');
                  setModalStep('google_teacher');
                }}
                title="Đăng nhập tài khoản Google Giáo viên"
              >
                <div className="teacher-shield-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="pill-text-block">
                  <span className="pill-title">Giáo viên</span>
                  <span className="pill-sub">Quản trị & giao bài</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Dành cho Học sinh chọn lớp & tên */}
        {modalStep === 'student_select' && (
          <div className="welcome-step-card">
            <div className="step-header">
              <div className="flex items-center gap-2">
                <GraduationCap size={22} color="var(--primary-color)" />
                <h3>Chọn Lớp & Họ Tên Học Sinh</h3>
              </div>
              <button className="btn-icon" onClick={() => setModalStep('landing')}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStudentSelectConfirm} className="step-body">
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                Vui lòng chọn lớp bạn đang theo học và tên của bạn để theo dõi tiến độ và nhận bài tập riêng:
              </p>

              <div className="form-group">
                <label>1. Chọn Lớp Học:</label>
                <select 
                  className="input"
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedStudentId('');
                    setStudentCodeInput('');
                    setStudentError('');
                  }}
                >
                  {classesData.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.schoolFullName} ({cls.students?.length || 0} HS)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>2. Chọn Họ và Tên Của Bạn Trong Lớp:</label>
                <select 
                  className="input"
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setStudentError('');
                  }}
                  required
                >
                  <option value="">
                    {classStudents.length === 0 
                      ? "-- Lớp chưa có học sinh (Chờ GV nhập danh sách) --" 
                      : "-- Nhấn để chọn học sinh --"}
                  </option>
                  {classStudents.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} {st.note ? `(${st.note})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>3. Nhập Mã Học Sinh / Số Điện Thoại *:</label>
                <input 
                  type="text"
                  className="input"
                  style={{ fontFamily: 'monospace', letterSpacing: '0.05em', fontWeight: 600 }}
                  value={studentCodeInput}
                  onChange={(e) => {
                    setStudentCodeInput(e.target.value);
                    setStudentError('');
                  }}
                  placeholder="Nhập số điện thoại của bạn..."
                  required
                />
              </div>

              {studentError && (
                <div className="error-banner" style={{ whiteSpace: 'pre-line' }}>
                  <AlertCircle size={16} />
                  <span>{studentError}</span>
                </div>
              )}

              <div className="flex items-center justify-between" style={{ marginTop: '1.5rem', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalStep('landing')}>
                  Quay Lại
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <CheckCircle2 size={16} /> Xác Thực & Vào Học
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Dành cho Giáo viên đăng nhập tài khoản Google & Mật khẩu */}
        {modalStep === 'google_teacher' && (
          <div className="welcome-step-card">
            <div className="step-header">
              <div className="flex items-center gap-2">
                <ShieldCheck size={22} color="#4f46e5" />
                <h3>Đăng Nhập Google Giáo Viên</h3>
              </div>
              <button className="btn-icon" onClick={() => setModalStep('landing')}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTeacherGoogleLogin} className="step-body">
              <div className="form-group" style={{ marginTop: '0.25rem' }}>
                <label>Địa Chỉ Email Google Giáo Viên *</label>
                <input 
                  type="email" 
                  className="input" 
                  value={teacherEmailInput}
                  onChange={(e) => {
                    setTeacherEmailInput(e.target.value);
                    setTeacherError('');
                  }}
                  placeholder="Nhập email Google của giáo viên..."
                  required
                  autoFocus
                />
              </div>

              {/* Nếu Giáo viên ĐÃ CÓ MẬT KHẨU -> Hiện ô nhập mật khẩu để đăng nhập */}
              {hasTeacherPassword ? (
                <div className="form-group">
                  <div className="flex items-center justify-between">
                    <label style={{ margin: 0 }}>Mật Khẩu Giáo Viên *</label>
                    <button 
                      type="button" 
                      className="btn-text" 
                      style={{ fontSize: '0.75rem', color: '#6366f1', padding: 0, textDecoration: 'underline', cursor: 'pointer', border: 'none', background: 'none' }}
                      onClick={() => {
                        setTeacherError('');
                        setTeacherSuccess('');
                        setOldPasswordInput('');
                        setNewPasswordInput('');
                        setConfirmPasswordInput('');
                        setModalStep('manage_password');
                      }}
                    >
                      Đổi / Xóa mật khẩu
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="input" 
                      value={teacherPasswordInput}
                      onChange={(e) => {
                        setTeacherPasswordInput(e.target.value);
                        setTeacherError('');
                      }}
                      placeholder="Nhập mật khẩu của thầy..."
                      required
                    />
                    <button 
                      type="button" 
                      className="btn-icon" 
                      style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.25rem', color: '#64748b' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                /* Nếu LẦN ĐẦU CHƯA CÓ MẬT KHẨU -> Tùy chọn Tạo Mật Khẩu */
                <div className="form-group" style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div className="flex items-center gap-1.5" style={{ marginBottom: '0.5rem', color: '#4338ca', fontWeight: 600, fontSize: '0.825rem' }}>
                    <KeyRound size={15} />
                    <span>Tạo Mật Khẩu Bảo Vệ (Lần đầu - Tùy chọn)</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input 
                      type="password" 
                      className="input" 
                      style={{ fontSize: '0.85rem' }}
                      value={newPasswordInput}
                      onChange={(e) => {
                        setNewPasswordInput(e.target.value);
                        setTeacherError('');
                      }}
                      placeholder="Đặt mật khẩu mới (nếu muốn)..."
                    />
                    {newPasswordInput && (
                      <input 
                        type="password" 
                        className="input" 
                        style={{ fontSize: '0.85rem' }}
                        value={confirmPasswordInput}
                        onChange={(e) => {
                          setConfirmPasswordInput(e.target.value);
                          setTeacherError('');
                        }}
                        placeholder="Nhập lại mật khẩu để xác nhận..."
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {teacherError && (
                <div className="error-banner">
                  <AlertCircle size={16} />
                  <span>{teacherError}</span>
                </div>
              )}

              <div className="flex items-center justify-between" style={{ marginTop: '1.5rem', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalStep('landing')}>
                  Quay Lại
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <LogIn size={16} /> Tiếp Tục Với Google
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Quản lý Mật Khẩu (Đổi Mật Khẩu hoặc Xóa Mật Khẩu) */}
        {modalStep === 'manage_password' && (
          <div className="welcome-step-card">
            <div className="step-header">
              <div className="flex items-center gap-2">
                <KeyRound size={22} color="#4f46e5" />
                <h3>Quản Lý Mật Khẩu Giáo Viên</h3>
              </div>
              <button className="btn-icon" onClick={() => setModalStep('google_teacher')}>
                <X size={18} />
              </button>
            </div>

            <div className="step-body">
              {/* Tab 1: Đổi mật khẩu */}
              <form onSubmit={handleChangePasswordSubmit} style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <RefreshCw size={15} color="#4f46e5" /> 1. Đổi Mật Khẩu Mới
                </h4>
                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input 
                    type="password" 
                    className="input" 
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <input 
                    type="password" 
                    className="input" 
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input 
                    type="password" 
                    className="input" 
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <CheckCircle2 size={16} /> Lưu Mật Khẩu Mới
                </button>
              </form>

              {/* Tab 2: Xóa mật khẩu */}
              <form onSubmit={handleRemovePasswordSubmit}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trash2 size={15} color="#dc2626" /> 2. Xóa Mật Khẩu (Đăng nhập không cần mật khẩu)
                </h4>
                <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                  Nhập mật khẩu hiện tại để xác nhận hủy tính năng khóa mật khẩu:
                </p>
                <div className="form-group">
                  <input 
                    type="password" 
                    className="input" 
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại để xóa..."
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ width: '100%', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontWeight: 600 }}
                >
                  <Trash2 size={16} /> Xác Nhận Xóa Mật Khẩu
                </button>
              </form>

              {teacherError && (
                <div className="error-banner" style={{ marginTop: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{teacherError}</span>
                </div>
              )}

              {teacherSuccess && (
                <div className="flex items-center gap-2" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.825rem', marginTop: '1rem' }}>
                  <CheckCircle2 size={16} />
                  <span>{teacherSuccess}</span>
                </div>
              )}

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setModalStep('google_teacher')}>
                  Quay Lại Đăng Nhập
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeLandingModal;
