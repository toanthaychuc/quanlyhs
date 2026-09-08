import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Trash2, ExternalLink, Save, X, Edit2 } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { getSetting, saveSetting } from '../services/settingService';
import './Forms.css';

const Forms = () => {
  const { isTeacher } = useRole();
  const [forms, setForms] = useState(() => {
    const saved = localStorage.getItem('edumanager_forms');
    return saved ? JSON.parse(saved) : [];
  });
  const [editing, setEditing] = useState(false);
  const isEditingRef = useRef(false);
  const [tempForms, setTempForms] = useState([...forms]);

  // Load from Supabase (Stale-While-Revalidate)
  useEffect(() => {
    getSetting('school_forms', [], false).then(localForms => {
      if (localForms && localForms.length > 0) {
        setForms(localForms);
        setTempForms(localForms);
      }
      getSetting('school_forms', [], true).then(remoteForms => {
        if (remoteForms && !isEditingRef.current) {
          setForms(remoteForms);
          setTempForms(remoteForms);
          localStorage.setItem('edumanager_forms', JSON.stringify(remoteForms));
        }
      }).catch(err => console.error('getSetting cloud error:', err));
    }).catch(err => console.error('getSetting local error:', err));
  }, []);

  const handleEdit = () => {
    setEditing(true);
    isEditingRef.current = true;
    setTempForms([...forms]);
  };

  const handleSave = async () => {
    // Lọc bỏ những form trống (không có tên hoặc URL)
    const validForms = tempForms.filter(f => f.name.trim() !== '' && f.url.trim() !== '');
    
    setForms(validForms);
    setTempForms(validForms);
    localStorage.setItem('edumanager_forms', JSON.stringify(validForms));
    setEditing(false);
    isEditingRef.current = false;
    try {
      await saveSetting('school_forms', validForms);
    } catch (err) {
      console.error('saveSetting error:', err);
    }
  };

  const handleCancel = () => {
    setTempForms([...forms]);
    setEditing(false);
    isEditingRef.current = false;
  };

  const addForm = () => {
    setTempForms([...tempForms, { id: Date.now().toString(), name: '', url: '' }]);
  };

  const updateForm = (id, field, value) => {
    setTempForms(tempForms.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const deleteForm = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa biểu mẫu này không?')) {
      setTempForms(tempForms.filter(f => f.id !== id));
    }
  };

  const displayForms = editing ? tempForms : forms;

  return (
    <div className="forms-page">
      <div className="forms-header">
        <div className="forms-title-area">
          <h1>
            <FileText className="text-primary" size={28} />
            Biểu Mẫu & Khảo Sát
          </h1>
          <p className="forms-subtitle">
            Truy cập các biểu mẫu, đơn từ và khảo sát nhanh do giáo viên cung cấp.
          </p>
        </div>
        
        {isTeacher && !editing && (
          <button className="btn btn-primary" onClick={handleEdit}>
            <Edit2 size={16} /> Quản lý biểu mẫu
          </button>
        )}
        {isTeacher && editing && (
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={handleCancel}>
              <X size={16} /> Hủy
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save size={16} /> Lưu thay đổi
            </button>
          </div>
        )}
      </div>

      <div className="forms-content">
        {displayForms.length === 0 && !editing ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <p>Hiện chưa có biểu mẫu nào.</p>
          </div>
        ) : (
          <div className="forms-grid">
            {displayForms.map((form) => (
              <div key={form.id} className="form-card">
                {editing ? (
                  <div className="form-edit-fields">
                    <div className="form-group">
                      <label>Tên biểu mẫu</label>
                      <input 
                        type="text" 
                        value={form.name}
                        onChange={(e) => updateForm(form.id, 'name', e.target.value)}
                        placeholder="VD: Đơn xin nghỉ học"
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Đường dẫn (URL)</label>
                      <input 
                        type="url" 
                        value={form.url}
                        onChange={(e) => updateForm(form.id, 'url', e.target.value)}
                        placeholder="https://docs.google.com/forms/..."
                        className="input"
                      />
                    </div>
                    <button 
                      className="btn-delete-form"
                      onClick={() => deleteForm(form.id)}
                      title="Xóa biểu mẫu"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <a href={form.url} target="_blank" rel="noopener noreferrer" className="form-view-card">
                    <div className="form-icon-wrapper">
                      <FileText size={24} color="#6366f1" />
                    </div>
                    <div className="form-info">
                      <h3 className="form-name">{form.name}</h3>
                      <p className="form-desc">Bấm để điền biểu mẫu trực tuyến</p>
                    </div>
                    <div className="form-action">
                      <ExternalLink size={20} className="action-icon" />
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {isTeacher && editing && (
          <button className="btn-add-form" onClick={addForm}>
            <Plus size={20} /> Thêm biểu mẫu mới
          </button>
        )}
      </div>
    </div>
  );
};

export default Forms;
