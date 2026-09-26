import React, { createContext, useContext, useState, useEffect } from 'react';
import { processDailyLogin } from '../services/examService';

const RoleContext = createContext();

export const TEACHER_EMAIL = 'lecongchuc02@gmail.com';

export const RoleProvider = ({ children }) => {
  const isRoomUrl = typeof window !== 'undefined' && window.location.href.includes('room=');

  // Email tài khoản đăng nhập hiện tại
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    try {
      const savedEmail = localStorage.getItem('edumanager_user_email');
      const savedRole = localStorage.getItem('edumanager_user_role');
      const savedStudentId = localStorage.getItem('edumanager_current_student_id');

      // Nếu đã đăng nhập danh tính học sinh chính thức
      if (savedRole === 'student' && savedStudentId && savedStudentId !== 'khach_tudolamde@gmail.com') {
        return `${String(savedStudentId).toLowerCase()}@school.edu.vn`;
      }
      if (savedEmail) {
        return savedEmail;
      }
      if (isRoomUrl) {
        return 'hocsinh_phongthi@school.edu.vn';
      }
      if (savedRole === 'teacher') {
        return TEACHER_EMAIL;
      }
      return 'hocsinh@school.edu.vn';
    } catch (_) {
      return 'hocsinh@school.edu.vn';
    }
  });

  // Vai trò: 'teacher' hoặc 'student'
  const [role, setRole] = useState(() => {
    try {
      if (isRoomUrl && !localStorage.getItem('edumanager_user_role')) {
        return 'student';
      }
      const savedRole = localStorage.getItem('edumanager_user_role');
      const savedEmail = localStorage.getItem('edumanager_user_email');
      if (savedEmail === TEACHER_EMAIL) {
        return savedRole || 'teacher';
      }
      return 'student';
    } catch (_) {
      return 'student';
    }
  });

  // Học sinh đang đăng nhập
  const [currentStudentId, setCurrentStudentId] = useState(() => {
    try {
      if (isRoomUrl && !localStorage.getItem('edumanager_current_student_id')) {
        return '';
      }
      return localStorage.getItem('edumanager_current_student_id') || '';
    } catch (_) {
      return '';
    }
  });

  // Khi email thay đổi, kiểm tra quyền nghiêm ngặt
  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem('edumanager_user_email', currentUserEmail);
    }
    const safeEmail = (currentUserEmail || '').trim().toLowerCase();
    if (safeEmail !== TEACHER_EMAIL.toLowerCase()) {
      // Nếu không phải email giáo viên, ép buộc chuyển về học sinh
      setRole('student');
      localStorage.setItem('edumanager_user_role', 'student');
    }
  }, [currentUserEmail]);

  useEffect(() => {
    localStorage.setItem('edumanager_user_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('edumanager_current_student_id', currentStudentId);
    
    // Nếu có mã học sinh chính thức -> Chắc chắn không phải là khách
    const hasRealId = currentStudentId && currentStudentId !== 'khach_tudolamde@gmail.com' && String(currentStudentId).trim() !== '';
    if (hasRealId) {
      setIsGuestMode(false);
      localStorage.setItem('edumanager_is_guest', 'false');
    }

    // Xử lý Streak (chuỗi đăng nhập) khi học sinh đăng nhập
    if (role === 'student' && currentStudentId && currentStudentId !== 'khach_tudolamde@gmail.com') {
      processDailyLogin(currentStudentId).then(() => {
        // trigger event if needed
      }).catch(err => {
        console.error('Error processing daily login:', err);
      });
    }
  }, [currentStudentId, role]);

  // Hàm chuyển đổi vai trò có bảo mật
  const handleSetRole = (newRole) => {
    if (newRole === 'teacher') {
      if (currentUserEmail.trim().toLowerCase() !== TEACHER_EMAIL.toLowerCase()) {
        alert('⛔ Quyền truy cập bị từ chối!\nBạn không có quyền truy cập vào chế độ Giáo viên.');
        return false;
      }
    }
    setRole(newRole);
    return true;
  };

  // Trạng thái đã vượt qua màn hình Chào mừng (Slide Landing) hay chưa
  const [hasEnteredApp, setHasEnteredApp] = useState(() => {
    if (isRoomUrl) {
      return true;
    }
    return localStorage.getItem('edumanager_has_entered') === 'true';
  });

  // Chế độ khách (Học mà không cần đăng nhập)
  const [isGuestMode, setIsGuestMode] = useState(() => {
    try {
      const savedRole = localStorage.getItem('edumanager_user_role');
      const savedStudentId = localStorage.getItem('edumanager_current_student_id');
      const hasRealStudent = savedStudentId && savedStudentId !== 'khach_tudolamde@gmail.com' && String(savedStudentId).trim() !== '';
      // Nếu là giáo viên hoặc đã có học sinh chính thức đăng nhập -> Tuyệt đối không phải khách
      if (savedRole === 'teacher' || hasRealStudent) {
        return false;
      }
      if (isRoomUrl) {
        return true;
      }
      return localStorage.getItem('edumanager_is_guest') === 'true';
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.href.includes('room=')) {
      setHasEnteredApp(true);
      const savedStudentId = localStorage.getItem('edumanager_current_student_id');
      const hasRealStudent = savedStudentId && savedStudentId !== 'khach_tudolamde@gmail.com' && String(savedStudentId).trim() !== '';
      if (hasRealStudent) {
        setIsGuestMode(false);
        localStorage.setItem('edumanager_is_guest', 'false');
      } else if (!localStorage.getItem('edumanager_user_email')) {
        setRole('student');
        setIsGuestMode(true);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('edumanager_has_entered', hasEnteredApp ? 'true' : 'false');
  }, [hasEnteredApp]);

  useEffect(() => {
    localStorage.setItem('edumanager_is_guest', isGuestMode ? 'true' : 'false');
  }, [isGuestMode]);

  // Hàm vào học dạng khách không cần đăng nhập
  const loginAsGuest = () => {
    setIsGuestMode(true);
    setCurrentStudentId('khach_tudolamde@gmail.com');
    setCurrentUserEmail('khach_tudolamde@gmail.com');
    setRole('student');
    setHasEnteredApp(true);
    localStorage.setItem('edumanager_is_guest', 'true');
    localStorage.setItem('edumanager_current_student_id', 'khach_tudolamde@gmail.com');
    localStorage.setItem('edumanager_user_email', 'khach_tudolamde@gmail.com');
    localStorage.setItem('edumanager_user_role', 'student');
  };

  // Hàm học sinh chọn danh tính từ danh sách lớp
  const selectEnrolledStudent = (studentId, classId) => {
    setIsGuestMode(false);
    setCurrentStudentId(studentId);
    const email = `${studentId.toLowerCase()}@school.edu.vn`;
    setCurrentUserEmail(email);
    setRole('student');
    setHasEnteredApp(true);
    localStorage.setItem('edumanager_is_guest', 'false');
    localStorage.setItem('edumanager_current_student_id', studentId);
    localStorage.setItem('edumanager_user_email', email);
    localStorage.setItem('edumanager_user_role', 'student');
  };

  // Hàm mở lại slide chào mừng
  const openWelcomeModal = () => {
    setHasEnteredApp(false);
  };

  // Mật khẩu bảo vệ tài khoản Giáo viên (lưu localStorage)
  const [teacherPassword, setTeacherPasswordState] = useState(() => {
    return localStorage.getItem('edumanager_teacher_password') || '';
  });

  const hasTeacherPassword = Boolean(teacherPassword && teacherPassword.trim().length > 0);

  // Tạo mới hoặc đổi mật khẩu
  const setTeacherPassword = (newPass) => {
    setTeacherPasswordState(newPass);
    localStorage.setItem('edumanager_teacher_password', newPass);
  };

  // Đổi mật khẩu (cần mật khẩu cũ nếu đã có)
  const changeTeacherPassword = (oldPass, newPass) => {
    if (hasTeacherPassword && oldPass !== teacherPassword) {
      return { success: false, message: 'Mật khẩu cũ không chính xác!' };
    }
    setTeacherPassword(newPass);
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  // Xóa mật khẩu (hủy mật khẩu để đăng nhập trực tiếp)
  const removeTeacherPassword = (currentPass) => {
    if (hasTeacherPassword && currentPass !== teacherPassword) {
      return { success: false, message: 'Mật khẩu xác nhận không chính xác!' };
    }
    setTeacherPasswordState('');
    localStorage.removeItem('edumanager_teacher_password');
    return { success: true, message: 'Đã xóa mật khẩu bảo vệ thành công!' };
  };

  // Hàm đăng nhập bằng email (kèm kiểm tra mật khẩu)
  const loginWithEmail = (email, password = '') => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed === TEACHER_EMAIL.toLowerCase()) {
      // Nếu giáo viên đã đặt mật khẩu thì kiểm tra
      if (hasTeacherPassword && password !== teacherPassword) {
        return { success: false, role: 'teacher', message: 'Mật khẩu giáo viên không chính xác!' };
      }
      setCurrentUserEmail(trimmed);
      setHasEnteredApp(true);
      setIsGuestMode(false);
      setRole('teacher');
      return { success: true, role: 'teacher', message: 'Đăng nhập thành công với quyền Giáo viên (Thầy Lê Công Chức)' };
    } else {
      setCurrentUserEmail(trimmed);
      setHasEnteredApp(true);
      setIsGuestMode(false);
      setRole('student');
      return { success: true, role: 'student', message: `Đăng nhập thành công với tài khoản Học sinh (${trimmed})` };
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setCurrentUserEmail('');
    setCurrentStudentId('');
    setRole('student');
    setHasEnteredApp(false);
    setIsGuestMode(false);
    localStorage.removeItem('edumanager_has_entered');
    localStorage.removeItem('edumanager_user_email');
    localStorage.removeItem('edumanager_user_role');
    localStorage.removeItem('edumanager_current_student_id');
    localStorage.removeItem('edumanager_is_guest');
  };

  const safeEmail = (currentUserEmail || '').trim().toLowerCase();
  const isTeacher = role === 'teacher' && safeEmail === TEACHER_EMAIL.toLowerCase();
  const isStudent = !isTeacher;
  const isTeacherAccount = safeEmail === TEACHER_EMAIL.toLowerCase();

  return (
    <RoleContext.Provider value={{ 
      role, 
      setRole: handleSetRole, 
      isTeacher, 
      isStudent,
      currentUserEmail,
      isTeacherAccount,
      isGuestMode,
      hasEnteredApp,
      setHasEnteredApp,
      teacherPassword,
      hasTeacherPassword,
      setTeacherPassword,
      changeTeacherPassword,
      removeTeacherPassword,
      loginAsGuest,
      selectEnrolledStudent,
      openWelcomeModal,
      loginWithEmail,
      logout,
      currentStudentId,
      setCurrentStudentId
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
