import React, { useState, useEffect } from 'react';
import { MessageCircle, Globe, MonitorPlay, Mail, Edit2, Save, X, ExternalLink } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import './Forum.css';

const DEFAULT_LINKS = {
  zalo: 'https://zalo.me/0123456789',
  facebook: 'https://facebook.com/thaycongchuc',
  youtube: 'https://youtube.com/@thaycongchuc',
  email: 'mailto:lecongchuc02@gmail.com'
};

const Forum = () => {
  const { isTeacher } = useRole();
  const [links, setLinks] = useState(() => {
    const saved = localStorage.getItem('edumanager_social_links');
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });

  const [editing, setEditing] = useState(false);
  const [tempLinks, setTempLinks] = useState({ ...links });

  const handleSave = () => {
    setLinks(tempLinks);
    localStorage.setItem('edumanager_social_links', JSON.stringify(tempLinks));
    setEditing(false);
  };

  const handleCancel = () => {
    setTempLinks({ ...links });
    setEditing(false);
  };

  return (
    <div className="forum-page">
      <div className="forum-header">
        <div className="forum-title-area">
          <h1>
            <MessageCircle className="text-primary" size={28} />
            Hỏi Đáp & Liên Hệ
          </h1>
          <p className="forum-subtitle">
            Kênh liên lạc trực tiếp với giáo viên để được giải đáp thắc mắc và hỗ trợ học tập.
          </p>
        </div>
        {isTeacher && !editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            <Edit2 size={16} /> Chỉnh sửa liên kết
          </button>
        )}
        {isTeacher && editing && (
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={handleCancel}>
              <X size={16} /> Hủy
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} /> Lưu lại
            </button>
          </div>
        )}
      </div>

      <div className="social-cards-grid">
        {/* Zalo */}
        <div className="social-card zalo">
          <div className="social-icon">
            <MessageCircle size={32} />
          </div>
          <div className="social-info">
            <h3>Zalo</h3>
            {editing && isTeacher ? (
              <input 
                type="text" 
                className="input" 
                value={tempLinks.zalo}
                onChange={e => setTempLinks({...tempLinks, zalo: e.target.value})}
                placeholder="Nhập link Zalo (vd: https://zalo.me/...)"
              />
            ) : (
              <a href={links.zalo} target="_blank" rel="noreferrer" className="social-link">
                Kết nối qua Zalo <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Facebook */}
        <div className="social-card facebook">
          <div className="social-icon">
            <Globe size={32} />
          </div>
          <div className="social-info">
            <h3>Facebook</h3>
            {editing && isTeacher ? (
              <input 
                type="text" 
                className="input" 
                value={tempLinks.facebook}
                onChange={e => setTempLinks({...tempLinks, facebook: e.target.value})}
                placeholder="Nhập link Facebook"
              />
            ) : (
              <a href={links.facebook} target="_blank" rel="noreferrer" className="social-link">
                Theo dõi Facebook <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* YouTube */}
        <div className="social-card youtube">
          <div className="social-icon">
            <MonitorPlay size={32} />
          </div>
          <div className="social-info">
            <h3>YouTube</h3>
            {editing && isTeacher ? (
              <input 
                type="text" 
                className="input" 
                value={tempLinks.youtube}
                onChange={e => setTempLinks({...tempLinks, youtube: e.target.value})}
                placeholder="Nhập link YouTube"
              />
            ) : (
              <a href={links.youtube} target="_blank" rel="noreferrer" className="social-link">
                Xem video bài giảng <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="social-card email">
          <div className="social-icon">
            <Mail size={32} />
          </div>
          <div className="social-info">
            <h3>Email</h3>
            {editing && isTeacher ? (
              <input 
                type="text" 
                className="input" 
                value={tempLinks.email}
                onChange={e => setTempLinks({...tempLinks, email: e.target.value})}
                placeholder="Nhập Email (vd: mailto:...)"
              />
            ) : (
              <a href={links.email} target="_blank" rel="noreferrer" className="social-link">
                Gửi Email <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
