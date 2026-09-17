import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Edit, Trash2, Upload, FileText, ChevronRight, Save, LayoutTemplate, Search } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { getFormulas, addFormula, updateFormula, deleteFormula, updateFormulaOrders } from '../services/formulaService';
import MathView from '../components/MathView';
import './Formulas.css';

const Formulas = () => {
  const { isTeacher } = useRole();
  const [formulas, setFormulas] = useState([]);
  const [activeFormulaId, setActiveFormulaId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', order_index: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Drag and drop states for list reordering
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const fileInputRef = useRef(null);
  const texTextareaRef = useRef(null);
  const texSearchInputRef = useRef(null);

  const executeTexSearch = (query, fromIndex = 0) => {
    if (!texTextareaRef.current || !query) return;
    const textArea = texTextareaRef.current;
    const rawText = textArea.value || '';
    
    const searchString = query.trim().normalize('NFC');
    if (!searchString) return;

    const normalizedText = rawText.normalize('NFC');
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchWords = searchString.split(/\s+/).map(escapeRegExp);
    const regexPattern = searchWords.join('\\s+');
    
    try {
      const regex = new RegExp(regexPattern, 'ig');
      regex.lastIndex = fromIndex;
      
      let match = regex.exec(normalizedText);
      if (!match && fromIndex > 0) {
         regex.lastIndex = 0;
         match = regex.exec(normalizedText);
      }
      
      if (match) {
         const index = match.index;
         const matchLength = match[0].length;
         
         textArea.focus({ preventScroll: true });
         textArea.setSelectionRange(index, index + matchLength);
         
         const textBefore = rawText.substring(0, index);
         const lines = textBefore.split('\n');
         let visualLinesBefore = 0;
         for (let i = 0; i < lines.length; i++) {
             visualLinesBefore += Math.max(1, Math.ceil(lines[i].length / 90));
         }
         
         setTimeout(() => {
             const lineHeight = 19.5;
             textArea.scrollTop = Math.max(0, 16 + (visualLinesBefore - 5) * lineHeight);
         }, 10);
      } else {
         alert(`Không tìm thấy "${query}" trong mã nguồn!`);
      }
    } catch (err) {
      alert(`Không thể tìm kiếm từ khóa này!`);
    }
  };

  const handleTexSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = texSearchInputRef.current?.value;
      if (!query) return;

      let startIndex = 0;
      if (texTextareaRef.current) {
        if (texTextareaRef.current.selectionStart !== texTextareaRef.current.selectionEnd) {
          startIndex = texTextareaRef.current.selectionStart + 1;
        } else {
          startIndex = texTextareaRef.current.selectionEnd;
        }
      }
      executeTexSearch(query, startIndex);
    }
  };

  const handlePreviewDoubleClick = () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) return;
    const query = selection.toString().trim();
    executeTexSearch(query);
  };

  const fetchFormulas = async () => {
    try {
      setIsLoading(true);
      const data = await getFormulas();
      setFormulas(data || []);
      if (data && data.length > 0 && !activeFormulaId) {
        setActiveFormulaId(data[0].id);
      }
    } catch (error) {
      console.error('Lỗi khi tải công thức:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulas();
  }, []);

  const openAddModal = () => {
    if (!isTeacher) return;
    setEditId(null);
    setFormData({ title: '', content: '', order_index: formulas.length });
    setIsModalOpen(true);
  };

  const openEditModal = (e, formula) => {
    e.stopPropagation();
    if (!isTeacher) return;
    setEditId(formula.id);
    setFormData({ title: formula.title, content: formula.content || '', order_index: formula.order_index });
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!isTeacher) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa mục công thức này?')) {
      try {
        await deleteFormula(id);
        const newData = formulas.filter(f => f.id !== id);
        setFormulas(newData);
        if (activeFormulaId === id) {
          setActiveFormulaId(newData.length > 0 ? newData[0].id : null);
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editId) {
        const updated = await updateFormula(editId, formData);
        setFormulas(formulas.map(f => f.id === editId ? updated : f));
      } else {
        const added = await addFormula(formData);
        setFormulas([...formulas, added]);
        setActiveFormulaId(added.id);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu!');
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setFormData(prev => ({ ...prev, content }));
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Đặt lại value để có thể tải lên cùng 1 file nhiều lần nếu muốn
    e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleListDragStart = (e, formula) => {
    if (!isTeacher) return;
    setDraggedId(formula.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleListDragOver = (e, formula) => {
    e.preventDefault();
    if (!isTeacher || draggedId === formula.id) return;
    setDragOverId(formula.id);
  };

  const handleListDragLeave = () => {
    setDragOverId(null);
  };

  const handleListDrop = async (e, targetFormula) => {
    e.preventDefault();
    setDragOverId(null);
    if (!isTeacher || !draggedId || draggedId === targetFormula.id) {
      setDraggedId(null);
      return;
    }

    const newFormulas = [...formulas];
    const draggedIdx = newFormulas.findIndex(f => f.id === draggedId);
    const targetIdx = newFormulas.findIndex(f => f.id === targetFormula.id);

    const [draggedItem] = newFormulas.splice(draggedIdx, 1);
    newFormulas.splice(targetIdx, 0, draggedItem);

    setFormulas(newFormulas);
    setDraggedId(null);

    try {
      await updateFormulaOrders(newFormulas);
    } catch (error) {
      console.error(error);
      alert('Không thể lưu thứ tự mới!');
      // Re-fetch to revert if failed
      fetchFormulas();
    }
  };

  const handleListDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const activeFormula = formulas.find(f => f.id === activeFormulaId);

  return (
    <div className="formulas-page">
      <div className="formulas-header">
        <div className="formulas-title-area">
          <h1>
            <LayoutTemplate className="text-primary" size={28} />
            TRA CỨU CÔNG THỨC
          </h1>
        </div>
        {isTeacher && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={20} />
            Thêm mục mới
          </button>
        )}
      </div>

      <div className="formulas-layout">
        <div className="formulas-sidebar glass">
          <h3 className="sidebar-title">Danh mục</h3>
          {isLoading ? (
            <div className="loading-state">Đang tải...</div>
          ) : formulas.length > 0 ? (
            <ul className="formulas-list">
              {formulas.map(formula => (
                <li 
                  key={formula.id} 
                  className={`formula-item ${activeFormulaId === formula.id ? 'active' : ''} ${dragOverId === formula.id ? 'drag-over' : ''} ${draggedId === formula.id ? 'dragging-item' : ''}`}
                  onClick={() => setActiveFormulaId(formula.id)}
                  draggable={isTeacher}
                  onDragStart={(e) => handleListDragStart(e, formula)}
                  onDragOver={(e) => handleListDragOver(e, formula)}
                  onDragLeave={handleListDragLeave}
                  onDrop={(e) => handleListDrop(e, formula)}
                  onDragEnd={handleListDragEnd}
                >
                  <div className="formula-item-content">
                    <FileText size={18} className="item-icon" />
                    <span className="item-title">{formula.title}</span>
                  </div>
                  
                  {isTeacher && (
                    <div className="formula-item-actions">
                      <button className="icon-btn edit-btn" onClick={(e) => openEditModal(e, formula)} title="Sửa">
                        <Edit size={14} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={(e) => handleDelete(e, formula.id)} title="Xóa">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  {activeFormulaId === formula.id && !isTeacher && <ChevronRight size={16} className="active-indicator" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-sidebar">Chưa có dữ liệu</div>
          )}
        </div>

        <div className="formulas-main glass">
          {activeFormula ? (
            <div className="formula-content-container">
              <h2 className="formula-main-title">{activeFormula.title}</h2>
              <div className="formula-viewer">
                {activeFormula.content ? (
                  <MathView text={activeFormula.content} />
                ) : (
                  <div className="empty-content">Nội dung trống.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-main">
              <LayoutTemplate size={48} className="empty-icon" />
              <p>Vui lòng chọn một mục để xem công thức</p>
            </div>
          )}
        </div>
      </div>

      {isTeacher && isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content formulas-modal" style={{ maxWidth: '95vw', width: '1200px', height: '90vh' }}>
            <div className="modal-header">
              <h3>{editId ? 'Sửa mục công thức' : 'Thêm mục công thức'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-form flex-col h-full" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: '1rem' }}>
              <div className="form-group" style={{ flexShrink: 0 }}>
                <label>Tên mục <span className="required">*</span></label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ví dụ: Đạo hàm cơ bản"
                  required
                />
              </div>

              {/* Toolbar cho search/upload */}
              <div className="editor-toolbar" style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                 <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={16} /> Nhập từ file .tex
                 </button>
                 <input 
                    type="file" 
                    accept=".tex,.txt" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    style={{display: 'none'}} 
                 />
                 
                 <div className="search-bar" style={{ display: 'flex', flex: 1, gap: '0.5rem', alignItems: 'center' }}>
                    <Search size={18} className="text-muted" style={{ marginLeft: '1rem' }} />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Tìm kiếm trong mã LaTeX (nhấn Enter để tìm tiếp)..." 
                      ref={texSearchInputRef}
                      onKeyDown={handleTexSearchKeyDown}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => executeTexSearch(texSearchInputRef.current?.value)}
                    >
                      Tìm
                    </button>
                 </div>
                 <div className="hint-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                   Mẹo: Bôi đen chữ ở cột xem trước để tìm nhanh
                 </div>
              </div>

              <div 
                className={`split-view-container ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0, overflow: 'hidden' }}
              >
                <div className="editor-pane" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <textarea 
                    ref={texTextareaRef}
                    className="input textarea latex-editor w-full" 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Nhập mã LaTeX của bạn vào đây..."
                    style={{ flex: 1, resize: 'none', margin: 0, padding: '1rem', border: 'none', fontFamily: 'monospace' }}
                  />
                  {isDragging && (
                    <div className="drag-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={48} className="text-primary" />
                      <p>Thả file .tex vào đây</p>
                    </div>
                  )}
                </div>

                <div className="preview-pane" 
                     onMouseUp={handlePreviewDoubleClick}
                     style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
                  {formData.content ? (
                    <MathView text={formData.content} />
                  ) : (
                    <div className="empty-content" style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>Chưa có nội dung xem trước.</div>
                  )}
                </div>
              </div>

              <div className="modal-actions" style={{ flexShrink: 0, marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Formulas;
