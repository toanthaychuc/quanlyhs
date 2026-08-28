import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const TEACHER_EMAIL = 'lecongchuc02@gmail.com';

export const RoleProvider = ({ children }) => {
  // Email tài khoản đăng nhập hiện tại
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem('edumanager_user_email') || 'lecongchuc02@gmail.com';
  });

  // Vai trò: 'teacher' hoặc 'student'
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('edumanager_user_role');
    const savedEmail = localStorage.getItem('edumanager_user_email');
    if (savedEmail === TEACHER_EMAIL) {
      return savedRole || 'teacher';
    }
    return 'student';
  });

  // Học sinh đang đăng nhập giả lập (mặc định là học sinh Nguyễn Văn An lớp 10T8)
  const [currentStudentId, setCurrentStudentId] = useState(() => {
    return localStorage.getItem('edumanager_current_student_id') || '10T8-01';
  });

  // Khi email thay đổi, kiểm tra quyền nghiêm ngặt
  useEffect(() => {
    localStorage.setItem('edumanager_user_email', currentUserEmail);
    if (currentUserEmail.trim().toLowerCase() !== TEACHER_EMAIL.toLowerCase()) {
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
    
    // Xử lý Streak (chuỗi đăng nhập) khi học sinh đăng nhập
    if (role === 'student' && currentStudentId && currentStudentId !== 'khach_tudolamde@gmail.com') {
      const gamiMap = JSON.parse(localStorage.getItem('edumanager_gamification') || '{}');
      const studentGami = gamiMap[currentStudentId] || { xp: 0, streak: 0, badges: [] };
      
      const today = new Date();
      // Reset về đầu ngày để so sánh chính xác theo ngày
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();
      
      let lastLoginDate = null;
      if (studentGami.lastLoginDate) {
        lastLoginDate = new Date(studentGami.lastLoginDate);
        lastLoginDate.setHours(0, 0, 0, 0);
      }

      let updated = false;

      if (!lastLoginDate) {
        // Lần đầu đăng nhập
        studentGami.streak = 1;
        studentGami.lastLoginDate = todayStr;
        updated = true;
      } else {
        const diffTime = Math.abs(today - lastLoginDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          // Đăng nhập liên tiếp
          studentGami.streak = (studentGami.streak || 0) + 1;
          studentGami.lastLoginDate = todayStr;
          
          // Cộng 100XP từ ngày thứ 2 trở đi
          if (studentGami.streak >= 2) {
            studentGami.xp = (studentGami.xp || 0) + 100;
          }
          updated = true;
        } else if (diffDays > 1) {
          // Chuỗi bị đứt gãy
          studentGami.streak = 1;
          studentGami.lastLoginDate = todayStr;
          updated = true;
        }
        // diffDays === 0 nghĩa là đã đăng nhập trong hôm nay, không làm gì cả
      }

      if (updated) {
        gamiMap[currentStudentId] = studentGami;
        localStorage.setItem('edumanager_gamification', JSON.stringify(gamiMap));
        // Kích hoạt custom event để các component khác (như StudentName) biết mà render lại
        window.dispatchEvent(new Event('gamification_updated'));
      }
    }
  }, [currentStudentId, role]);

  // Hàm chuyển đổi vai trò có bảo mật
  const handleSetRole = (newRole) => {
    if (newRole === 'teacher') {
      if (currentUserEmail.trim().toLowerCase() !== TEACHER_EMAIL.toLowerCase()) {
        alert(`⛔ Quyền truy cập bị từ chối!\nChỉ tài khoản email "${TEACHER_EMAIL}" mới được phép vào chế độ Giáo viên.`);
        return false;
      }
    }
    setRole(newRole);
    return true;
  };

  // Trạng thái đã vượt qua màn hình Chào mừng (Slide Landing) hay chưa
  const [hasEnteredApp, setHasEnteredApp] = useState(() => {
    return localStorage.getItem('edumanager_has_entered') === 'true';
  });

  // Chế độ khách (Học mà không cần đăng nhập)
  const [isGuestMode, setIsGuestMode] = useState(() => {
    return localStorage.getItem('edumanager_is_guest') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('edumanager_has_entered', hasEnteredApp ? 'true' : 'false');
  }, [hasEnteredApp]);

  useEffect(() => {
    localStorage.setItem('edumanager_is_guest', isGuestMode ? 'true' : 'false');
  }, [isGuestMode]);

  // Hàm vào học dạng khách không cần đăng nhập
  const loginAsGuest = () => {
    setIsGuestMode(true);
    setCurrentUserEmail('khach_tudolamde@gmail.com');
    setRole('student');
    setHasEnteredApp(true);
  };

  // Hàm học sinh chọn danh tính từ danh sách lớp
  const selectEnrolledStudent = (studentId, classId) => {
    setIsGuestMode(false);
    setCurrentStudentId(studentId);
    setCurrentUserEmail(`${studentId.toLowerCase()}@school.edu.vn`);
    setRole('student');
    setHasEnteredApp(true);
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
    setRole('student');
    setHasEnteredApp(false);
    setIsGuestMode(false);
    localStorage.removeItem('edumanager_has_entered');
  };

  const isTeacher = role === 'teacher' && currentUserEmail.trim().toLowerCase() === TEACHER_EMAIL.toLowerCase();
  const isStudent = !isTeacher;
  const isTeacherAccount = currentUserEmail.trim().toLowerCase() === TEACHER_EMAIL.toLowerCase();

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
