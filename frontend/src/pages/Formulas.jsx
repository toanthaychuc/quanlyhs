import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, X, Edit, Trash2, Upload, FileText, ChevronRight, Save, LayoutTemplate } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { getFormulas, addFormula, updateFormula, deleteFormula } from '../services/formulaService';
import MathView from '../components/MathView';
import './Formulas.css';

const Formulas = () => {
  const { isTeacher } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [formulas, setFormulas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const queryParams = new URLSearchParams(location.search);
  const activeFormulaId = queryParams.get('id');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', order_index: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFormulas = async () => {
    try {
      setIsLoading(true);
      const data = await getFormulas();
      setFormulas(data || []);
      if (data && data.length > 0 && !activeFormulaId) {
        navigate(`?id=${data[0].id}`, { replace: true });
      }
    } catch (error) {
      console.error('Lỗi khi tải công thức:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (e) e.stopPropagation();
    if (!isTeacher) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa mục công thức này?')) {
      try {
        await deleteFormula(id);
        const newData = formulas.filter(f => f.id !== id);
        setFormulas(newData);
        window.dispatchEvent(new Event('formulas_updated'));
        if (activeFormulaId === id) {
          if (newData.length > 0) {
            navigate(`?id=${newData[0].id}`);
          } else {
            navigate(`/formulas`);
          }
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
        window.dispatchEvent(new Event('formulas_updated'));
      } else {
        const added = await addFormula(formData);
        setFormulas([...formulas, added]);
        window.dispatchEvent(new Event('formulas_updated'));
        navigate(`?id=${added.id}`);
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

      <div className="formulas-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="formulas-main glass" style={{ width: '100%', margin: '0 auto', maxWidth: '1000px' }}>
          {activeFormula ? (
            <div className="formula-content-container">
              <div className="formula-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 className="formula-main-title" style={{ margin: 0, padding: 0, border: 'none' }}>{activeFormula.title}</h2>
                {isTeacher && (
                  <div className="formula-item-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={(e) => openEditModal(e, activeFormula)}>
                      <Edit size={16} /> Sửa
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={(e) => handleDelete(e, activeFormula.id)}>
                      <Trash2 size={16} /> Xóa
                    </button>
                  </div>
                )}
              </div>
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
              <p>Vui lòng chọn một mục từ menu bên trái để xem công thức</p>
            </div>
          )}
        </div>
      </div>

      {isTeacher && isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content formulas-modal glass">
            <div className="modal-header">
              <h3>{editId ? 'Sửa mục công thức' : 'Thêm mục công thức'}</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
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
              
              <div 
                className={`form-group file-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label>Nội dung (LaTeX) <span className="required">*</span></label>
                <div className="upload-wrapper">
                  <button type="button" className="btn btn-outline upload-btn" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={16} /> Nhập từ file .tex
                  </button>
                  <input 
                    type="file" 
                    accept=".tex,.txt" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    style={{display: 'none'}} 
                  />
                  <span className="upload-hint">Hoặc dán/nhập, kéo thả file .tex trực tiếp vào đây</span>
                </div>
                <textarea 
                  className="input textarea latex-editor" 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={10}
                  placeholder="Nhập mã LaTeX của bạn vào đây..."
                />
                {isDragging && (
                  <div className="drag-overlay">
                    <Upload size={48} className="text-primary" />
                    <p>Thả file .tex vào đây</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Thứ tự hiển thị</label>
                <input 
                  type="number" 
                  className="input" 
                  value={formData.order_index}
                  onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="modal-actions">
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
