import React, { useState, useEffect, useRef } from 'react';
import { Bell, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getNotices } from '../services/noticeService';
import { getExams, getStudentHistory } from '../services/examService';
import { getAssignments } from '../services/assignmentService';
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
        const notices = await getNotices();
        const allNotices = Array.isArray(notices) ? notices : [];

        let notifs = [];
        
        // 1. Thêm Bảng tin (Notices)
        // Với giáo viên: thấy tất cả. Với học sinh: thấy ALL hoặc lớp của mình.
        allNotices.forEach(notice => {
          notifs.push({
            id: `notice_${notice.id}`,
            type: 'notice',
            title: 'Bảng tin mới',
            desc: notice.title,
            time: notice.date || '',
            createdAt: new Date().getTime() - Math.random() * 86400000, // Mock timestamp nếu ko có
            link: '/' // Dashboard
          });
        });

        // 2. Với học sinh: Bài tập & Đề thi sắp đến hạn
        if (isStudent && currentStudentId) {
          const exams = await getExams() || [];
          const assignments = await getAssignments() || [];
          const history = await getStudentHistory(currentStudentId) || {};
          
          const submittedExamIds = new Set(Object.keys(history));
          
          // Gộp exam và assignment
          const tasks = [...exams, ...assignments];
          
          tasks.forEach(task => {
            if (!task.deadline) return;
            if (submittedExamIds.has(task.id)) return; // Đã nộp
            
            // Tính số ngày còn lại
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
            
            // Nếu còn hạn và dưới 3 ngày -> báo sắp đến hạn
            if (daysDiff >= 0 && daysDiff <= 3) {
              notifs.push({
                id: `due_${task.id}`,
                type: 'exam',
                title: 'Sắp đến hạn',
                desc: `${task.title} (Hạn: ${task.deadline})`,
                time: 'Sắp tới hạn',
                createdAt: deadlineDate.getTime() - 1000,
                link: task.isAssignment ? '/assignments' : '/exams'
              });
            } else if (daysDiff > 3) {
              notifs.push({
                id: `new_${task.id}`,
                type: 'assignment',
                title: task.isAssignment ? 'Bài tập mới' : 'Đề thi mới',
                desc: task.title,
                time: `Hạn: ${task.deadline}`,
                createdAt: Date.now() - Math.random() * 86400000, // Mock timestamp
                link: task.isAssignment ? '/assignments' : '/exams'
              });
            }
          });
        }

        // Sắp xếp mới nhất lên đầu
        notifs.sort((a, b) => b.createdAt - a.createdAt);
        
        setNotifications(notifs);

        // Lấy thời gian đọc cuối cùng
        const storageKey = `edumanager_last_read_notif_${isTeacher ? currentUserEmail : currentStudentId}`;
        const lastRead = localStorage.getItem(storageKey) || 0;
        
        // Tính số lượng chưa đọc (giả sử tất cả notices đều có createdAt giả lập mới)
        // Trong ứng dụng thực tế, nên lưu ID của notice đã đọc
        // Ở đây ta đơn giản hóa: đếm số thông báo từ localStorage
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

  const handleNotificationClick = (link) => {
    setIsOpen(false);
    if (link) {
      navigate(link);
    }
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
                  onClick={() => handleNotificationClick(notif.link)}
                >
                  <div className={`notification-icon ${notif.type}`}>
                    {notif.type === 'notice' ? <MessageSquare size={16} /> : 
                     notif.type === 'exam' ? <AlertCircle size={16} /> : 
                     <BookOpen size={16} />}
                  </div>
                  <div className="notification-content">
                    <h4 className="notification-title">{notif.title}</h4>
                    <p className="notification-desc">{notif.desc}</p>
                    <span className="notification-time">{notif.time}</span>
                  </div>
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
