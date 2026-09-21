import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, X, ExternalLink, Tablet } from 'lucide-react';
import './MobileReviewModal.css';

const MobileReviewModal = ({ isOpen, onClose }) => {
  const [deviceWidth, setDeviceWidth] = useState(375);
  const [iframeKey, setIframeKey] = useState(0);

  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  // Chiều cao tiêu chuẩn của màn hình smartphone tỉ lệ 19.5:9
  const deviceHeight = deviceWidth === 375 ? 780 : 830;

  return (
    <div className="mobile-review-overlay" onClick={onClose}>
      {/* Floating Toolbar */}
      <div className="mobile-review-toolbar" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-review-title">
          <div className="icon-badge">
            <Smartphone size={16} />
          </div>
          <span>Xem Trước Di Động (Mobile Review)</span>
        </div>

        <div className="mobile-review-actions">
          {/* Device Width Switcher */}
          <div className="device-switcher">
            <button 
              className={`device-btn ${deviceWidth === 375 ? 'active' : ''}`}
              onClick={() => setDeviceWidth(375)}
              title="Khổ màn hình chuẩn 375px (iPhone 13/14/15/SE)"
            >
              <Smartphone size={13} />
              <span>375px</span>
            </button>
            <button 
              className={`device-btn ${deviceWidth === 414 ? 'active' : ''}`}
              onClick={() => setDeviceWidth(414)}
              title="Khổ màn hình lớn 414px (Plus / Pro Max)"
            >
              <Tablet size={13} />
              <span>414px</span>
            </button>
          </div>

          {/* Reload Iframe */}
          <button 
            className="toolbar-action-btn"
            onClick={() => setIframeKey(k => k + 1)}
            title="Tải lại trang xem trước"
          >
            <RotateCw size={15} />
          </button>

          {/* Open in external window */}
          <button 
            className="toolbar-action-btn"
            onClick={() => window.open(currentUrl, '_blank', 'width=375,height=780,menubar=no,toolbar=no')}
            title="Mở trong cửa sổ riêng biệt"
          >
            <ExternalLink size={15} />
          </button>

          {/* Close Modal */}
          <button 
            className="toolbar-action-btn close-btn"
            onClick={onClose}
            title="Đóng (ESC)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Smartphone Mockup Frame */}
      <div className="mobile-device-wrapper" onClick={(e) => e.stopPropagation()}>
        <div 
          className="smartphone-frame"
          style={{
            width: `${deviceWidth}px`,
            height: `min(${deviceHeight}px, 82vh)`,
          }}
        >
          {/* Status Bar with Dynamic Island */}
          <div className="phone-status-bar">
            <span className="status-time">9:41</span>
            <div className="dynamic-island">
              <div className="camera-lens"></div>
            </div>
            <div className="status-icons">
              <span style={{ fontSize: '10px', fontWeight: 700 }}>5G</span>
              <span style={{ fontSize: '10px', fontWeight: 700 }}>100%</span>
            </div>
          </div>

          {/* Embedded Webview */}
          <iframe 
            key={iframeKey}
            src={currentUrl}
            className="mobile-review-iframe"
            title="Giao diện di động học sinh"
          />

          {/* Home Indicator */}
          <div className="home-indicator"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileReviewModal;
