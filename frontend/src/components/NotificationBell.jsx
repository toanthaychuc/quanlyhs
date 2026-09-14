import React, { useState, useEffect, useRef } from 'react';
import { Bell, BookOpen, MessageSquare, AlertCircle, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getNotices } from '../services/noticeService';
import { getExams, getStudentHistory } from '../services/examService';
import { getAssignments } from '../services/assignmentService';
import { getDocuments } from '../services/documentService';
import './NotificationBell.css';

import { Bell as I_Bell, BellRing as I_BellRing } from 'lucide';
import AnimatedIcon from './AnimatedIcon';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { currentStudentId, isStudent, isTeacher, currentUserEmail } = useRole();

  // Helper to extract grade from student ID or class name
  const getStudentGrade = (studentId) => {
    if (!studentId) return null;
    const match = studentId.match(/^(\d{2})/);
    return match ? match[1] : null; // returns '10', '11', '12'
  };

  const getStudentClass = (studentId) => {
    if (!studentId) return null;
    const match = studentId.match(/^([A-Za-z0-9]+)-/);
    return match ? match[1] : null; // returns '10T8' from '10T8-01'
  };

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
        const studentGrade = isStudent ? getStudentGrade(currentStudentId) : null;
        const studentClass = isStudent ? getStudentClass(currentStudentId) : null;
        const deletedIds = getDeletedNotifIds();

        const notices = await getNotices();
        const allNotices = Array.isArray(notices) ? notices : [];

        let notifs = [];
        
        // 1. Thêm Bảng tin (Notices)
        allNotices.forEach(notice => {
          let shouldAdd = isTeacher;
          if (isStudent) {
            const target = notice.targetClass || 'ALL';
            if (target === 'ALL') {
              shouldAdd = true;
            } else if (target.toLowerCase().startsWith('khoi ')) {
              const targetGrade = target.split(' ')[1]; // 'Khoi 12' -> '12'
              if (targetGrade === studentGrade) shouldAdd = true;
            } else if (target === studentClass) {
              shouldAdd = true;
            }
          }

          if (shouldAdd) {
            notifs.push({
              id: `notice_${notice.id}`,
              type: 'notice',
              title: `Bảng tin: ${notice.title}`,
              desc: notice.content ? (notice.content.substring(0, 50) + '...') : '',
              time: notice.date || 'Gần đây',
              createdAt: new Date(notice.createdAt || Date.now()).getTime(),
              link: '/',
              isNotice: true
            });
          }
        });

        // 2. Với học sinh: Bài tập, Đề thi, Tài liệu
        if (isStudent && currentStudentId) {
          const exams = await getExams() || [];
          const assignments = await getAssignments() || [];
          const documents = await getDocuments() || [];
          const history = await getStudentHistory(currentStudentId) || {};
          
          const submittedExamIds = new Set(Object.keys(history));
          
          // Gộp exam và assignment
          const tasks = [...exams, ...assignments];
          
          tasks.forEach(task => {
            // Kiểm tra grade
            const taskGrade = task.grade; // e.g. '12', '11', '10', 'DGNL', 'THPTQG'
            if (taskGrade) {
              const tG = taskGrade.toLowerCase();
              if ((tG === '12' || tG === 'dgnl' || tG === 'thptqg') && studentGrade !== '12') return;
              if (tG === '11' && studentGrade !== '11') return;
              if (tG === '10' && studentGrade !== '10') return;
            }

            if (task.deadline) {
              if (submittedExamIds.has(task.id)) return; // Đã nộp
              
              const parts = task.deadline.split('/');
              let deadlineDate = null;
              if (parts.length === 3) {
                deadlineDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59`);
              } else {
                deadlineDate = new Date(task.deadline);
              }
              
              if (isNaN(deadlineDate.getTime())) return;
              
              const now = new Date();
              const timeDiff = deadlineDate - now;
              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
              
              if (daysDiff >= 0 && daysDiff <= 3) {
                notifs.push({
                  id: `due_${task.id}`,
                  type: 'exam',
                  title: `Sắp đến hạn: ${task.title}`,
                  desc: task.isAssignment ? 'Bạn có bài tập sắp đến hạn nộp.' : 'Bạn có đề thi sắp đến hạn.',
                  time: `Hạn: ${task.deadline}`,
                  createdAt: deadlineDate.getTime() - 1000,
                  link: task.isAssignment ? '/assignments' : '/exams',
                  targetState: { targetExamId: task.id }
                });
              } else if (daysDiff > 3) {
                notifs.push({
                  id: `new_${task.id}`,
                  type: 'assignment',
                  title: task.isAssignment ? `Bài tập mới: ${task.title}` : `Đề thi mới: ${task.title}`,
                  desc: 'Giáo viên vừa giao bài tập/đề thi mới cho bạn.',
                  time: `Hạn: ${task.deadline}`,
                  createdAt: new Date(task.createdAt || Date.now()).getTime(),
                  link: task.isAssignment ? '/assignments' : '/exams',
                  targetState: { targetExamId: task.id }
                });
              }
            } else {
               // Không có hạn -> coi như đề thi mới bình thường, không tính nộp hay chưa nộp ở đây để đơn giản
               // Hoặc chỉ hiện nếu mới tạo trong tuần
               notifs.push({
                id: `new_no_dl_${task.id}`,
                type: 'assignment',
                title: task.isAssignment ? `Bài tập mới: ${task.title}` : `Đề thi mới: ${task.title}`,
                desc: 'Giáo viên vừa giao bài mới (Không giới hạn thời gian).',
                time: 'Mới đây',
                createdAt: new Date(task.createdAt || Date.now()).getTime(),
                link: task.isAssignment ? '/assignments' : '/exams',
                targetState: { targetExamId: task.id }
              });
            }
          });

          // Tài liệu mới
          documents.forEach(doc => {
            const cat = doc.category || ''; // 'grade-12', 'grade-11', 'grade-10', 'handbook'
            if (cat === 'grade-12' && studentGrade !== '12') return;
            if (cat === 'grade-11' && studentGrade !== '11') return;
            if (cat === 'grade-10' && studentGrade !== '10') return;

            notifs.push({
              id: `doc_${doc.id}`,
              type: 'document',
              title: `Tài liệu mới: ${doc.title}`,
              desc: doc.subject ? `Chuyên đề: ${doc.subject}` : 'Giáo viên vừa thêm tài liệu mới.',
              time: 'Mới đây',
              createdAt: new Date(doc.createdAt || Date.now()).getTime(),
              link: '/documents', // hoặc doc.driveLink nếu muốn
              isDoc: true,
              driveLink: doc.driveLink
            });
          });
        }

        // Lọc bỏ thông báo đã xóa
        notifs = notifs.filter(n => !deletedIds.includes(n.id));

        // Sắp xếp mới nhất lên đầu
        notifs.sort((a, b) => b.createdAt - a.createdAt);
        
        setNotifications(notifs);

        // Lấy thời gian đọc cuối cùng
        const storageKey = `edumanager_last_read_notif_${isTeacher ? currentUserEmail : currentStudentId}`;
        const readIds = JSON.parse(localStorage.getItem(`${storageKey}_ids`) || '[]');
        
        const unread = notifs.filter(n => !readIds.includes(n.id)).length;
        setUnreadCount(unread);

      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    // Polling mỗi 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isStudent, isTeacher, currentStudentId, currentUserEmail]);

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Khi mở ra thì đánh dấu tất cả là đã đọc
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
      // Mở tài liệu ở tab mới hoặc chuyển hướng
      window.open(notif.driveLink, '_blank');
      // Cũng có thể điều hướng sang trang documents: navigate('/documents');
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
              {notifications.map((notif, index) => (
                <li 
                  key={notif.id + index} 
                  className="notification-item"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className={`notification-icon ${notif.type}`}>
                    {notif.type === 'notice' ? <MessageSquare size={16} /> : 
                     notif.type === 'exam' ? <AlertCircle size={16} /> : 
                     notif.type === 'document' ? <BookOpen size={16} /> :
                     <BookOpen size={16} />}
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title">{notif.title}</h4>
                    <p className="notification-desc">{notif.desc}</p>
                    <span className="notification-time">{notif.time}</span>
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
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
