import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, X, Link as LinkIcon, Image as ImageIcon, Book, Edit, Trash2, 
  Upload, Clipboard, Check, Folder, Bookmark, GraduationCap, BookOpen, ExternalLink,
  Lock, Eye
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { getDocuments, saveAllDocuments } from '../services/documentService';
import './Documents.css';

const CATEGORIES = [
  { id: 'grade-10', label: 'Lớp 10', icon: <GraduationCap size={18} /> },
  { id: 'grade-11', label: 'Lớp 11', icon: <GraduationCap size={18} /> },
  { id: 'grade-12', label: 'Lớp 12', icon: <GraduationCap size={18} /> },
  { id: 'handbook', label: 'Sổ tay', icon: <Bookmark size={18} /> },
];

const SUB_CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'book', label: 'Tài liệu sách' },
  { id: 'topic', label: 'Tài liệu chuyên đề' },
];

const STORAGE_KEY = 'edumanager_teacher_documents';

const Documents = () => {
  const { isTeacher } = useRole();
  const [activeCategory, setActiveCategory] = useState('grade-12');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Đọc dữ liệu từ localStorage/Supabase
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.error('Lỗi khi đọc tài liệu từ LocalStorage:', error);
    }
    return [];
  });

  // Tải tài liệu từ Supabase khi mount
  useEffect(() => {
    getDocuments().then(data => {
      if (data && data.length > 0) setDocuments(data);
    }).catch(err => console.error('getDocuments error:', err));
  }, []);

  // Tự động đồng bộ lên Supabase (debounced)
  const docSaveTimeoutRef = useRef(null);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    if (docSaveTimeoutRef.current) clearTimeout(docSaveTimeoutRef.current);
    docSaveTimeoutRef.current = setTimeout(() => {
      saveAllDocuments(documents);
    }, 1500);
    return () => {
      if (docSaveTimeoutRef.current) clearTimeout(docSaveTimeoutRef.current);
    };
  }, [documents]);

  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'grade-12',
    subCategory: 'book',
    subject: '',
    coverUrl: '',
    driveLink: ''
  });
  const [editId, setEditId] = useState(null);

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDoc.title.trim() || !newDoc.driveLink.trim()) return;

    if (editId) {
      setDocuments(documents.map(doc => doc.id === editId ? { ...doc, ...newDoc } : doc));
    } else {
      setDocuments([...documents, { id: Date.now(), ...newDoc }]);
    }

    closeModal();
  };

  const openAddModal = () => {
    if (!isTeacher) return;
    setEditId(null);
    setNewDoc({
      title: '',
      category: activeCategory,
      subCategory: activeCategory === 'handbook' ? 'handbook' : (activeSubCategory === 'all' ? 'book' : activeSubCategory),
      subject: '',
      coverUrl: '',
      driveLink: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e, doc) => {
    e.preventDefault();
    if (!isTeacher) return;
    setEditId(doc.id);
    setNewDoc({
      title: doc.title,
      category: doc.category || 'grade-12',
      subCategory: doc.subCategory || 'book',
      subject: doc.subject || '',
      coverUrl: doc.coverUrl || '',
      driveLink: doc.driveLink || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteDocument = (e, id) => {
    e.preventDefault();
    if (!isTeacher) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setPasteSuccess(false);
  };

  // Xử lý paste ảnh từ Clipboard
  const handlePasteImage = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setNewDoc(prev => ({ ...prev, coverUrl: event.target.result }));
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2500);
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewDoc(prev => ({ ...prev, coverUrl: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Lọc tài liệu theo tab lớn và tab con
  const filteredDocuments = documents.filter(doc => {
    if (doc.category !== activeCategory) return false;
    if (activeCategory !== 'handbook' && activeSubCategory !== 'all') {
      return doc.subCategory === activeSubCategory;
    }
    return true;
  });

  const getDocCountByCategory = (catId) => {
    return documents.filter(d => d.category === catId).length;
  };

  const getBookCoverBackground = (doc) => {
    if (doc.coverUrl && doc.coverUrl.trim() !== '') {
      return `url("${doc.coverUrl}")`;
    }
    if (doc.category === 'handbook') {
      return 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)';
    }
    if (doc.subCategory === 'topic') {
      return 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)';
    }
    return 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
  };

  return (
    <div className="documents-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="title-with-badge">
            <h2 className="page-title">Thư viện Tài liệu</h2>
            {!isTeacher && (
              <span className="student-view-pill">
                <Eye size={13} /> Chế độ xem học sinh
              </span>
            )}
          </div>
          <p className="page-subtitle">
            {isTeacher 
              ? 'Quản lý giáo trình, tài liệu chuyên đề và sổ tay kiến thức cho học sinh'
              : 'Tra cứu sách giáo khoa, bài giảng chuyên đề và sổ tay kiến thức mọi lúc mọi nơi'
            }
          </p>
        </div>

        {/* Nút thêm tài liệu chỉ hiện cho Giáo viên */}
        {isTeacher && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={20} />
            Thêm tài liệu mới
          </button>
        )}
      </div>

      {/* Main Category Tabs: Lớp 10, Lớp 11, Lớp 12, Sổ tay */}
      <div className="category-tabs-container">
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveSubCategory('all');
              }}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className="count-badge">{getDocCountByCategory(cat.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub Category Tabs */}
      {activeCategory !== 'handbook' && (
        <div className="sub-category-pills">
          {SUB_CATEGORIES.map(sub => (
            <button
              key={sub.id}
              className={`sub-pill ${activeSubCategory === sub.id ? 'active' : ''}`}
              onClick={() => setActiveSubCategory(sub.id)}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* Bookshelf */}
      {filteredDocuments.length > 0 ? (
        <div className="bookshelf">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="book-card card">
              {/* Vùng Bìa Sách Chính Diện */}
              <a 
                href={doc.driveLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="book-cover-link"
                title={`Mở tài liệu: ${doc.title}`}
              >
                <div 
                  className="book-cover-front" 
                  style={{ 
                    backgroundImage: getBookCoverBackground(doc)
                  }}
                >
                  {!doc.coverUrl && (
                    <div className="default-cover-pattern">
                      <BookOpen size={44} className="default-cover-icon" />
                      <span className="default-cover-text">{doc.title}</span>
                    </div>
                  )}
                  <div className="book-cover-hover-overlay">
                    <span className="btn-open-doc">
                      <ExternalLink size={16} /> Mở đọc tài liệu
                    </span>
                  </div>
                </div>
              </a>
              
              {/* Thông tin tài liệu đặt phía dưới bìa sách */}
              <div className="book-info">
                <div className="book-tags">
                  <span className="book-badge">
                    {doc.subCategory === 'topic' ? 'Chuyên đề' : (doc.subCategory === 'book' ? 'Sách' : 'Sổ tay')}
                  </span>
                  {doc.subject && <span className="book-subject-tag">{doc.subject}</span>}
                </div>
                <h3 className="book-title" title={doc.title}>{doc.title}</h3>
              </div>

              {/* Nút Sửa & Xóa CHỈ hiển thị khi là Giáo viên */}
              {isTeacher && (
                <div className="book-actions-bar">
                  <button className="btn-action edit-btn" onClick={(e) => openEditModal(e, doc)} title="Chỉnh sửa">
                    <Edit size={15} /> Sửa
                  </button>
                  <button className="btn-action delete-btn" onClick={(e) => handleDeleteDocument(e, doc.id)} title="Xóa">
                    <Trash2 size={15} /> Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <Folder size={48} className="empty-icon" />
          <h3>Chưa có tài liệu nào</h3>
          <p>
            Hiện chưa có tài liệu nào trong mục <strong>{CATEGORIES.find(c => c.id === activeCategory)?.label}</strong>
            {activeCategory !== 'handbook' && activeSubCategory !== 'all' && ` - ${SUB_CATEGORIES.find(s => s.id === activeSubCategory)?.label}`}.
          </p>
          {isTeacher && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={18} /> Thêm tài liệu mới ngay
            </button>
          )}
        </div>
      )}

      {/* Modal Thêm/Sửa Tài Liệu (Chỉ Giáo viên mới mở được) */}
      {isTeacher && isModalOpen && (
        <div className="modal-overlay" onPaste={handlePasteImage}>
          <div className="modal-content glass">
            <div className="modal-header">
              <h3>{editId ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}</h3>
              <button className="icon-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDocument} className="modal-form">
              {/* Chọn Lớp / Danh mục */}
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Khối lớp / Phân loại <span className="required">*</span></label>
                  <select 
                    className="input select-input"
                    value={newDoc.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setNewDoc({
                        ...newDoc, 
                        category: cat,
                        subCategory: cat === 'handbook' ? 'handbook' : 'book'
                      });
                    }}
                  >
                    <option value="grade-10">Lớp 10</option>
                    <option value="grade-11">Lớp 11</option>
                    <option value="grade-12">Lớp 12</option>
                    <option value="handbook">Sổ tay</option>
                  </select>
                </div>

                {newDoc.category !== 'handbook' && (
                  <div className="form-group flex-1">
                    <label>Loại tài liệu <span className="required">*</span></label>
                    <select 
                      className="input select-input"
                      value={newDoc.subCategory}
                      onChange={(e) => setNewDoc({ ...newDoc, subCategory: e.target.value })}
                    >
                      <option value="book">Tài liệu sách (SGK / SBT)</option>
                      <option value="topic">Tài liệu chuyên đề</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tên tài liệu / Cuốn sách <span className="required">*</span></label>
                <div className="input-wrapper">
                  <Book size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="input with-icon" 
                    placeholder="VD: Toán 12 Tập 1"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Mô tả ngắn / Chuyên đề nhỏ</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="VD: Toán học"
                  value={newDoc.subject}
                  onChange={(e) => setNewDoc({...newDoc, subject: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Link Google Drive <span className="required">*</span></label>
                <div className="input-wrapper">
                  <LinkIcon size={18} className="input-icon" />
                  <input 
                    type="url" 
                    className="input with-icon" 
                    placeholder="https://drive.google.com/..."
                    value={newDoc.driveLink}
                    onChange={(e) => setNewDoc({...newDoc, driveLink: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Paste / Upload Image Area */}
              <div className="form-group">
                <label>Ảnh bìa cuốn sách (Tùy chọn)</label>
                
                <div 
                  className={`image-drop-area ${newDoc.coverUrl ? 'has-image' : ''}`}
                  onPaste={handlePasteImage}
                  tabIndex="0"
                >
                  {newDoc.coverUrl ? (
                    <div className="cover-preview-container">
                      <img src={newDoc.coverUrl} alt="Cover preview" className="cover-preview-img" />
                      <div className="cover-preview-overlay">
                        <button 
                          type="button" 
                          className="btn-change-image"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={16} /> Đổi ảnh
                        </button>
                        <button 
                          type="button" 
                          className="btn-remove-image"
                          onClick={() => setNewDoc({...newDoc, coverUrl: ''})}
                        >
                          <Trash2 size={16} /> Xóa ảnh
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="paste-prompt" onClick={() => fileInputRef.current?.click()}>
                      <div className="paste-icon-group">
                        <Clipboard size={24} className="clipboard-icon" />
                        <Upload size={20} className="upload-icon" />
                      </div>
                      <p className="paste-main-text">
                        <strong>Bấm Ctrl + V</strong> để dán ảnh đã copy vào đây
                      </p>
                      <span className="paste-sub-text">hoặc click để tải ảnh từ máy tính</span>
                    </div>
                  )}
                </div>

                {pasteSuccess && (
                  <div className="paste-badge-success">
                    <Check size={14} /> Đã dán ảnh từ clipboard thành công!
                  </div>
                )}

                <div className="input-wrapper url-alt-wrapper">
                  <ImageIcon size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="input with-icon" 
                    placeholder="Hoặc dán đường link ảnh URL (https://...)"
                    value={newDoc.coverUrl.startsWith('data:image') ? '' : newDoc.coverUrl}
                    onChange={(e) => setNewDoc({...newDoc, coverUrl: e.target.value})}
                  />
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Cập nhật' : 'Lưu tài liệu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
