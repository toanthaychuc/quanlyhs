import React, { useState } from 'react';
import { MonitorPlay } from 'lucide-react';
import './InteractiveMaterials.css';
import SetOperations from '../components/interactive/SetOperations';
import LinearInequalities from '../components/interactive/LinearInequalities';
import QuadraticFunction from '../components/interactive/QuadraticFunction';
import TrigonometricCircle from '../components/interactive/TrigonometricCircle';
import DerivativeMeaning from '../components/interactive/DerivativeMeaning';
import FunctionInvestigation from '../components/interactive/FunctionInvestigation';
import RiemannSum from '../components/interactive/RiemannSum';
import SolidOfRevolution from '../components/interactive/SolidOfRevolution';
import RelativePositionsOxyz from '../components/interactive/RelativePositionsOxyz';
import ConicSections from '../components/interactive/ConicSections';
import CrossSection3D from '../components/interactive/CrossSection3D';
import SpaceGeometry3D from '../components/interactive/SpaceGeometry3D';
import PerpendicularGeometry3D from '../components/interactive/PerpendicularGeometry3D';

const MATERIALS_DATA = {
  '10': [
    { id: 'set-ops', title: 'Các phép toán trên tập hợp', chapter: 'Mệnh đề và Tập hợp' },
    { id: 'linear-inequalities', title: 'Miền nghiệm bất phương trình', chapter: 'Bất phương trình bậc nhất hai ẩn' },
    { id: 'quadratic-func', title: 'Hàm số bậc hai', chapter: 'Hàm số' },
    { id: 'conic-sections', title: 'Ba đường conic', chapter: 'Phương pháp tọa độ trong mặt phẳng' }
  ],
  '11': [
    { id: 'trig-circle', title: 'Đường tròn lượng giác', chapter: 'Hàm số lượng giác' },
    { id: 'derivatives', title: 'Ý nghĩa hình học của đạo hàm', chapter: 'Đạo hàm' },
    { id: 'space-geometry', title: 'Quan hệ song song', chapter: 'Hình học không gian' },
    { id: 'perpendicular-geometry', title: 'Quan hệ vuông góc', chapter: 'Hình học không gian' },
    { id: 'cross-section', title: 'Thiết diện trong không gian', chapter: 'Quan hệ song song' }
  ],
  '12': [
    { id: 'func-graph', title: 'Khảo sát hàm số', chapter: 'Khảo sát đồ thị' },
    { id: 'riemann-sum', title: 'Diện tích hình phẳng', chapter: 'Nguyên hàm & Tích phân' },
    { id: 'solid-revolution', title: 'Thể tích tròn xoay', chapter: 'Nguyên hàm & Tích phân' },
    { id: 'oxyz-relative-positions', title: 'Vị trí tương đối', chapter: 'Hình học Oxyz' }
  ]
};

const InteractiveMaterials = () => {
  const [activeGrade, setActiveGrade] = useState('10');
  const [activeMaterialId, setActiveMaterialId] = useState('set-ops');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && !sidebarCollapsed) {
        // Automatically collapse on resize to mobile
        setSidebarCollapsed(true);
      } else if (window.innerWidth > 768 && sidebarCollapsed) {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  const renderMaterial = () => {
    switch (activeMaterialId) {
      case 'set-ops':
        return <SetOperations />;
      case 'linear-inequalities':
        return <LinearInequalities />;
      case 'quadratic-func':
        return <QuadraticFunction />;
      case 'trig-circle':
        return <TrigonometricCircle />;
      case 'derivatives':
        return <DerivativeMeaning />;
      case 'func-graph':
        return <FunctionInvestigation />;
      case 'riemann-sum':
        return <RiemannSum />;
      case 'solid-revolution':
        return <SolidOfRevolution />;
      case 'oxyz-relative-positions':
        return <RelativePositionsOxyz />;
      case 'conic-sections':
        return <ConicSections />;
      case 'space-geometry':
        return <SpaceGeometry3D />;
      case 'perpendicular-geometry':
        return <PerpendicularGeometry3D />;
      case 'cross-section':
        return <CrossSection3D />;
      default:
        return (
          <div className="placeholder-material" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <h3>Đang phát triển</h3>
            <p>Học liệu này đang trong quá trình xây dựng.</p>
          </div>
        );
    }
  };

  return (
    <div className="formulas-page interactive-page-container">
      <div className="formulas-header">
        <div className="formulas-title-area" style={{ flexShrink: 0 }}>
          <h1>
            <MonitorPlay className="text-primary" size={28} style={{ marginRight: '8px' }} />
            HỌC LIỆU TƯƠNG TÁC
          </h1>
        </div>
      </div>
      
      <div className="formulas-layout">
        {/* Sidebar / Menu */}
        <div
          className={`formulas-sidebar glass interactive-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        >
          
          <div style={{ width: '300px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div className="grade-tabs">
              {['10', '11', '12'].map(grade => (
                <button 
                  key={grade}
                  className={`grade-tab ${activeGrade === grade ? 'active' : ''}`}
                  onClick={() => {
                    setActiveGrade(grade);
                    setActiveMaterialId(MATERIALS_DATA[grade][0].id); // Select first material of that grade
                  }}
                >
                  Lớp {grade}
                </button>
              ))}
            </div>
          </div>
          
          <div className="sidebar-title-container" onClick={() => setSidebarCollapsed(true)} title="Thu gọn danh mục">
            <h3 className="sidebar-title">Danh mục</h3>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>«</span>
          </div>
          
          <div className="sidebar-content-wrapper open">
            <ul className="formulas-list">
              {MATERIALS_DATA[activeGrade].map(mat => (
                <li 
                  key={mat.id}
                  className={`formula-item ${activeMaterialId === mat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveMaterialId(mat.id);
                    if (window.innerWidth <= 768) {
                      setSidebarCollapsed(true);
                    }
                  }}
                  style={{ cursor: 'pointer', padding: '12px 1rem' }}
                >
                  <span className="formula-name">
                    <div className="mat-title" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{mat.title}</div>
                    <div className="mat-chapter" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mat.chapter}</div>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="formulas-main glass" style={{ height: '100%', padding: '1.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              title="Hiện danh mục"
              style={{
                position: 'absolute', top: '12px', left: '12px', zIndex: 30,
                padding: '6px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                color: 'var(--text-primary)', background: 'var(--bg-primary, rgba(255,255,255,0.95))',
                border: '1px solid var(--border-color)', borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <MonitorPlay size={16} /> Danh mục
            </button>
          )}
          {renderMaterial()}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMaterials;
