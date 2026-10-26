import React from 'react';

/**
 * GeoGebra classic SVG icons designed to match the authentic GeoGebra desktop/web UI.
 */
export const GeoGebraMoveIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28" style={{ display: 'block' }}>
    <path
      d="M10 6 L10 27 L16 22 L20 30 L23 28.5 L19.2 21 L26 21 Z"
      fill="#ffffff"
      stroke="#1e293b"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path
      d="M11 8.5 L11 24.5 L15.5 20.8 L19.2 28 L21.2 27 L17.5 19.8 L23.5 19.8 Z"
      fill="#1e293b"
    />
  </svg>
);

export const GeoGebraPlaneIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28" style={{ display: 'block' }}>
    <polygon
      points="13,8 28,18 9,28"
      fill="rgba(217, 119, 6, 0.28)"
      stroke="#b45309"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="13" cy="8" r="3.2" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
    <circle cx="28" cy="18" r="3.2" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
    <circle cx="9" cy="28" r="3.2" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
  </svg>
);

export const GeoGebraPointIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28" style={{ display: 'block' }}>
    <circle cx="12" cy="22" r="4.5" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
    <text
      x="18"
      y="16"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="17"
      fontWeight="900"
      fill="#1d4ed8"
    >
      A
    </text>
  </svg>
);

export const GeoGebraLineIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28" style={{ display: 'block' }}>
    <line x1="6" y1="28" x2="30" y2="8" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="23" r="3.5" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
    <circle cx="24" cy="13" r="3.5" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
  </svg>
);

export const GeoGebraParallelIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28" style={{ display: 'block' }}>
    <line x1="5" y1="25" x2="31" y2="25" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="5" y1="11" x2="31" y2="11" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="18" cy="11" r="3.5" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
  </svg>
);

export const GeoGebraPerpIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28" style={{ display: 'block' }}>
    <line x1="5" y1="26" x2="31" y2="21" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="16" y1="6" x2="20" y2="30" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="17.6" cy="15.5" r="3.5" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
  </svg>
);

export const GeoGebraIntersectIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28" style={{ display: 'block' }}>
    <line x1="7" y1="27" x2="29" y2="9" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
    <line x1="7" y1="9" x2="29" y2="27" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="18" cy="18" r="4.2" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
  </svg>
);

export const GeoGebraPerpBisectorIcon = () => (
  <svg viewBox="0 0 36 36" width="28" height="28" style={{ display: 'block' }}>
    {/* Base segment */}
    <line x1="8" y1="28" x2="28" y2="8" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="9" cy="27" r="3.2" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
    <circle cx="27" cy="9" r="3.2" fill="#2563eb" stroke="#0f172a" strokeWidth="1.2" />
    {/* Red perpendicular bisector line */}
    <line x1="9" y1="9" x2="27" y2="27" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/**
 * GeoGebra Toolbar component
 */
export const GeoGebraToolbar = ({
  tools = [],
  activeTool,
  onSelectTool,
  title = 'Công cụ'
}) => {
  return (
    <div className="geogebra-toolbar-wrapper">
      <div className="geogebra-toolbar-header">
        <span className="geogebra-toolbar-title">
          <span className="geogebra-brand-dot"></span>
          {title}
        </span>
      </div>

      <div className="geogebra-toolbar-bar">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          const IconComp = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              className={`geogebra-tool-button ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTool(tool.id)}
              title={`${tool.name}${tool.shortDesc ? `: ${tool.shortDesc}` : ''}`}
            >
              <IconComp />
              {/* Corner dropdown triangle indicator (GeoGebra signature) */}
              <span className="ggb-triangle" />
              {/* Optional count badge if custom elements exist */}
              {tool.badgeCount > 0 && (
                <span className="geogebra-tool-badge" title={`${tool.badgeCount} đối tượng đã tạo`}>
                  {tool.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GeoGebraToolbar;
