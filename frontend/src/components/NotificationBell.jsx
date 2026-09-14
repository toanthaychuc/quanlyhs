import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, MessageSquare, AlertCircle, X, Trash2, CheckSquare, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getClasses } from '../services/classService';
import { getNotices } from '../services/noticeService';
import { getExams, getStudentHistory } from '../services/examService';
import { getAssignments } from '../services/assignmentService';
import { getDocuments } from '../services/documentService';
import './NotificationBell.css';

import { Bell as I_Bell, BellRing as I_BellRing } from 'lucide';
import AnimatedIcon from './AnimatedIcon';

const formatNotifTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `Hôm nay, ${hours}:${minutes}`;
  }
  if (isYesterday) {
    return `Hôm qua, ${hours}:${minutes}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${hours}:${minutes}, ${day}/${month}`;
};

const formatDeadline = (deadlineStr) => {
  if (!deadlineStr) return null;
  const parts = deadlineStr.split('/');
  let d = null;
  if (parts.length === 3) {
    d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59`);
  } else {
    d = new Date(deadlineStr);
  }
  if (isNaN(d.getTime())) return `Hạn: ${deadlineStr}`;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `⏱️ Hạn nộp: ${hours}:${minutes} ngày ${day}/${month}/${year}`;
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { currentStudentId, isStudent, isTeacher, currentUserEmail } = useRole();

  // Lấy danh sách ID thông báo đã xóa
  const getDeletedNotifIds = () => {
    const key = `edumanager_deleted_notifs_${isTeacher ? currentUserEmail : currentStudentId}`;
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  const addDeletedNotifId = (id) => {
    const key = `edumanager_deleted_notifs_${isTeacher ? currentUserEmail : currentStudentId}`;
    const deleted = getDeletedNotifIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(key, JSON.stringify(deleted));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = (e) => {
    e.stopPropagation();
    if (notifications.length === 0) return;
    const key = `edumanager_deleted_notifs_${isTeacher ? currentUserEmail : currentStudentId}`;
    const allIds = notifications.map(n => n.id);
    const prevDeleted = getDeletedNotifIds();
    const newDeleted = Array.from(new Set([...prevDeleted, ...allIds]));
    localStorage.setItem(key, JSON.stringify(newDeleted));
    setNotifications([]);
    setUnreadCount(0);
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dữ liệu thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const classes = await getClasses() || [];
        let studentClassId = null;
        let studentClassName = null;
        let studentGrade = null;

        if (isStudent && currentStudentId) {
          const myClass = classes.find(c => (c.students || []).some(s => s.id === currentStudentId));
          if (myClass) {
            studentClassId = myClass.id;
            studentClassName = myClass.name;
            studentGrade = String(myClass.grade || '12');
          } else {
            const gMatch = currentStudentId.match(/^(\d{2})/);
            studentGrade = gMatch ? gMatch[1] : '12';
            const cMatch = currentStudentId.match(/^([A-Za-z0-9]+)-/);
            studentClassName = cMatch ? cMatch[1] : null;
          }
        }

        const deletedIds = getDeletedNotifIds();
        const notices = await getNotices() || [];
        const allNotices = Array.isArray(notices) ? notices : [];

        let notifs = [];

        // 1. BẢNG TIN (NOTICES)
        allNotices.forEach(notice => {
          let shouldAdd = isTeacher;
          if (isStudent) {
            const target = notice.targetClass || 'ALL';
            if (target === 'ALL') {
              shouldAdd = true;
            } else if (target.toLowerCase().startsWith('khoi ')) {
              const targetGrade = target.split(' ')[1];
              if (targetGrade === studentGrade) shouldAdd = true;
            } else if (target === studentClassId || target === studentClassName) {
              shouldAdd = true;
            }
          }

          if (shouldAdd) {
            let noticeTime = Date.now();
            if (notice.createdAt) noticeTime = new Date(notice.createdAt).getTime();
            else if (notice.date) noticeTime = new Date(notice.date).getTime();

            notifs.push({
              id: `notice_${notice.id}`,
              type: 'notice',
              title: `Bản tin: ${notice.title}`,
              desc: notice.content ? (notice.content.substring(0, 65) + '...') : 'Giáo viên vừa đăng thông báo mới.',
              deadlineText: null,
              createdAt: noticeTime,
              link: '/',
              isNotice: true
            });
          }
        });

        // 2. VỚI HỌC SINH: BÀI TẬP, ĐỀ THI, TÀI LIỆU
        if (isStudent && currentStudentId) {
          const exams = await getExams() || [];
          const assignments = await getAssignments() || [];
          const documents = await getDocuments() || [];
          const history = await getStudentHistory(currentStudentId) || {};
          const submittedExamIds = new Set(Object.keys(history));

          // A. BÀI TẬP (ASSIGNMENTS) - PHÂN BIỆT RÕ RÀNG VỚI ĐỀ THI
          assignments.forEach(asg => {
            // Lọc theo lớp: học sinh lớp nào chỉ thấy bài tập của lớp đó
            if (studentClassId && asg.classId && asg.classId !== studentClassId) {
              return;
            }
            // Ẩn với học sinh
            if (asg.isHidden) return;

            // Bỏ qua nếu học sinh đã nộp bài này
            if (asg.submissions) {
              const mySub = asg.submissions[currentStudentId] || 
                            asg.submissions[currentStudentId.replace('10T8-', 'HS')] || 
                            asg.submissions[currentStudentId.replace('HS', '10T8-')];
              if (mySub) return;
            }

            let asgTime = Date.now();
            if (asg.createdAt) asgTime = new Date(asg.createdAt).getTime();
            else if (asg.assignedAt) asgTime = new Date(asg.assignedAt).getTime();
            else if (asg.id && asg.id.startsWith('asg-')) {
              const ts = parseInt(asg.id.replace('asg-', ''), 10);
              if (!isNaN(ts)) asgTime = ts;
            }

            const deadlineText = asg.deadline ? formatDeadline(asg.deadline) : null;

            notifs.push({
              id: `asg_${asg.id}`,
              type: 'assignment',
              title: `Bài tập mới: ${asg.title}`,
              desc: `Lớp ${asg.className || studentClassName || ''} • Giáo viên vừa giao bài tập.`,
              deadlineText,
              createdAt: asgTime,
              link: '/assignments',
              targetState: { targetAssignmentId: asg.id, targetClassId: asg.classId }
            });
          });

          // B. ĐỀ THI THỬ (EXAMS) - PHÂN BIỆT RÕ VỚI BÀI TẬP
          exams.forEach(exam => {
            const examGrade = exam.grade ? String(exam.grade).toLowerCase() : '';
            if (examGrade) {
              if (studentGrade === '12') {
                const is12 = examGrade.includes('12') || examGrade.includes('thptqg');
                const isVact = examGrade.includes('vact');
                if (!is12 || isVact) return;
              } else if (studentGrade === '11') {
                if (!examGrade.includes('11')) return;
              } else if (studentGrade === '10') {
                if (!examGrade.includes('10')) return;
              }
            }

            // Nếu đề thi chỉ gán cho 1 lớp cụ thể
            if (exam.classId && studentClassId && exam.classId !== studentClassId) {
              return;
            }

            // Đề chưa công khai
            if (exam.isPublished === false) return;

            // Đã làm đề này rồi
            if (submittedExamIds.has(exam.id)) return;

            let examTime = Date.now();
            if (exam.createdAt) examTime = new Date(exam.createdAt).getTime();

            const deadlineText = exam.deadline ? formatDeadline(exam.deadline) : null;

            notifs.push({
              id: `exam_${exam.id}`,
              type: 'exam',
              title: `Đề thi mới: ${exam.title}`,
              desc: `Khối ${exam.grade ? exam.grade.replace('grade-', '').toUpperCase() : studentGrade || ''} • Thời gian làm bài: ${exam.duration || 45} phút.`,
              deadlineText,
              createdAt: examTime,
              link: '/exams',
              targetState: { targetExamId: exam.id }
            });
          });

          // C. TÀI LIỆU (DOCUMENTS)
          documents.forEach(doc => {
            const cat = doc.category || '';
            if (cat === 'grade-12' && studentGrade !== '12') return;
            if (cat === 'grade-11' && studentGrade !== '11') return;
            if (cat === 'grade-10' && studentGrade !== '10') return;

            let docTime = Date.now();
            if (doc.createdAt) docTime = new Date(doc.createdAt).getTime();

            notifs.push({
              id: `doc_${doc.id}`,
              type: 'document',
              title: `Tài liệu mới: ${doc.title}`,
              desc: doc.subject ? `Chuyên đề: ${doc.subject}` : 'Giáo viên vừa thêm tài liệu mới.',
              deadlineText: null,
              createdAt: docTime,
              link: '/documents',
              isDoc: true,
              driveLink: doc.driveLink
            });
          });
        }

        // Lọc bỏ thông báo đã xóa
        notifs = notifs.filter(n => !deletedIds.includes(n.id));

        // Deduplication chống lặp thông báo
        const uniqueNotifs = new Map();
        notifs.forEach(item => {
          if (!uniqueNotifs.has(item.id)) {
            uniqueNotifs.set(item.id, item);
          }
        });
        const finalNotifs = Array.from(uniqueNotifs.values());

        // Sắp xếp mới nhất lên đầu theo thời gian tạo
        finalNotifs.sort((a, b) => b.createdAt - a.createdAt);

        setNotifications(finalNotifs);

        // Lấy thời gian đọc cuối cùng
        const storageKey = `edumanager_last_read_notif_${isTeacher ? currentUserEmail : currentStudentId}`;
        const readIds = JSON.parse(localStorage.getItem(`${storageKey}_ids`) || '[]');
        const unread = finalNotifs.filter(n => !readIds.includes(n.id)).length;
        setUnreadCount(unread);

      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [isStudent, isTeacher, currentStudentId, currentUserEmail]);

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      const storageKey = `edumanager_last_read_notif_${isTeacher ? currentUserEmail : currentStudentId}`;
      localStorage.setItem(storageKey, Date.now().toString());
      
      const allIds = notifications.map(n => n.id);
      localStorage.setItem(`${storageKey}_ids`, JSON.stringify(allIds));
    }
  };

  const handleNotificationClick = (notif) => {
    setIsOpen(false);
    if (notif.isDoc && notif.driveLink) {
      window.open(notif.driveLink, '_blank');
    } else if (notif.link) {
      navigate(notif.link, { state: notif.targetState });
    }
  };

  const handleDeleteNotification = (e, id) => {
    e.stopPropagation();
    addDeletedNotifId(id);
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button 
        className="bell-btn group" 
        onClick={handleOpenDropdown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Thông báo"
      >
        <AnimatedIcon defaultIcon={I_Bell} hoverIcon={I_BellRing} size={20} isHoveredExternal={isOpen || isHovered || unreadCount > 0} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Thông báo</h3>
            <button onClick={() => setUnreadCount(0)}>Đánh dấu đã đọc</button>
          </div>
          
          {notifications.length === 0 ? (
            <div className="notification-empty">
              Bạn không có thông báo nào.
            </div>
          ) : (
            <ul className="notification-list">
              {notifications.map((notif) => (
                <li 
                  key={notif.id} 
                  className="notification-item"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={`notification-icon ${notif.type}`}>
                    {notif.type === 'notice' ? <MessageSquare size={16} /> : 
                     notif.type === 'assignment' ? <CheckSquare size={16} /> : 
                     notif.type === 'exam' ? <FileText size={16} /> : 
                     <BookOpen size={16} />}
                  </div>
                  <div className="notification-content">
                    <div className="notification-top">
                      <h4 className="notification-title" title={notif.title}>{notif.title}</h4>
                      <span className="notification-created-time">{formatNotifTime(notif.createdAt)}</span>
                    </div>
                    <p className="notification-desc">{notif.desc}</p>
                    {notif.deadlineText && (
                      <span className="notification-deadline">{notif.deadlineText}</span>
                    )}
                  </div>
                  <button 
                    className="delete-notif-btn" 
                    onClick={(e) => handleDeleteNotification(e, notif.id)}
                    title="Xóa thông báo này"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button className="clear-all-notifs-btn" onClick={handleClearAllNotifications}>
                <Trash2 size={13} /> Xóa tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
