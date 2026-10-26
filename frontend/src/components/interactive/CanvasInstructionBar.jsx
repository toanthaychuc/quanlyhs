import React from 'react';

/**
 * Curated color palette for selection slots (distinct, vibrant, harmonious).
 * Ensures multiple planes can be instantly distinguished in 3D and 2D.
 */
export const SELECTION_SLOT_COLORS = [
  {
    name: 'Xanh dương',
    primary: '#2563eb', // Blue 600
    fill: '#3b82f6',    // Blue 500
    border: '#1d4ed8',  // Blue 700
    bg: '#eff6ff',      // Blue 50
    badge: '#dbeafe',   // Blue 100
    text: '#1e40af',    // Blue 800
    opacity: 0.35
  },
  {
    name: 'Cam hổ phách',
    primary: '#ea580c', // Orange 600
    fill: '#f97316',    // Orange 500
    border: '#c2410c',  // Orange 700
    bg: '#fff7ed',      // Orange 50
    badge: '#ffedd5',   // Orange 100
    text: '#9a3412',    // Orange 800
    opacity: 0.35
  },
  {
    name: 'Xanh lá ngọc',
    primary: '#059669', // Emerald 600
    fill: '#10b981',    // Emerald 500
    border: '#047857',  // Emerald 700
    bg: '#ecfdf5',      // Emerald 50
    badge: '#d1fae5',   // Emerald 100
    text: '#065f46',    // Emerald 800
    opacity: 0.35
  },
  {
    name: 'Tím hoa cà',
    primary: '#9333ea', // Purple 600
    fill: '#a855f7',    // Purple 500
    border: '#7e22ce',  // Purple 700
    bg: '#faf5ff',      // Purple 50
    badge: '#f3e8ff',   // Purple 100
    text: '#6b21a8',    // Purple 800
    opacity: 0.35
  },
  {
    name: 'Hồng sen',
    primary: '#e11d48', // Rose 600
    fill: '#f43f5e',    // Rose 500
    border: '#be123c',  // Rose 700
    bg: '#fff1f2',      // Rose 50
    badge: '#ffe4e6',   // Rose 100
    text: '#9f1239',    // Rose 800
    opacity: 0.35
  },
  {
    name: 'Vàng hổ phách',
    primary: '#d97706', // Amber 600
    fill: '#f59e0b',    // Amber 500
    border: '#b45309',  // Amber 700
    bg: '#fffbeb',      // Amber 50
    badge: '#fef3c7',   // Amber 100
    text: '#92400e',    // Amber 800
    opacity: 0.35
  }
];

/**
 * CanvasInstructionBar:
 * Floating visual guide on top of the 3D Canvas.
 * Gives immediate feedback on what tool is active, what elements to click next,
 * and quick-action chips (e.g., plane slots).
 */
export const CanvasInstructionBar = ({
  activeTool,
  activeSelectionSlot,
  setActiveSelectionSlot,
  selections = [],
  pickedPoints = [],
  pickedLine = null,
  pickedLines = [],
  onResetSelection
}) => {
  if (activeTool === 'pointer') return null;

  return (
    <div className="canvas-instruction-bar">
      {/* 1. Tool Plane / Line */}
      {activeTool === 'plane' && (
        <div className="instruction-content">
          <div className="instruction-lead">
            <span className="inst-badge">Mặt phẳng / Đường</span>
            <span className="inst-text">
              Bấm vào các đỉnh trên hình: <strong>2 điểm</strong> = Đường thẳng, <strong>3-4 điểm</strong> = Mặt phẳng.
            </span>
          </div>

          <div className="instruction-slot-pills">
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Đang chọn cho:</span>
            {selections.map((sel, idx) => {
              const colorInfo = SELECTION_SLOT_COLORS[idx % SELECTION_SLOT_COLORS.length];
              const isActive = activeSelectionSlot === idx;
              const hasSelection = sel.length > 0;
              return (
                <button
                  key={`slot-${idx}`}
                  type="button"
                  className={`slot-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveSelectionSlot(idx)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderColor: isActive ? colorInfo.border : (hasSelection ? colorInfo.fill : undefined),
                    backgroundColor: isActive ? colorInfo.primary : (hasSelection ? colorInfo.bg : undefined),
                    color: isActive ? '#ffffff' : (hasSelection ? colorInfo.text : undefined),
                    boxShadow: isActive ? `0 2px 6px ${colorInfo.fill}40` : undefined,
                    fontWeight: (isActive || hasSelection) ? 600 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span 
                    style={{ 
                      display: 'inline-block', 
                      width: '7px', 
                      height: '7px', 
                      borderRadius: '50%', 
                      backgroundColor: isActive ? '#ffffff' : colorInfo.primary, 
                      flexShrink: 0 
                    }} 
                  />
                  Mặt/Đường {idx + 1}
                  {hasSelection && (
                    <span 
                      className="slot-pill-count"
                      style={{
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : colorInfo.badge,
                        color: isActive ? '#ffffff' : colorInfo.text,
                        fontWeight: 'bold',
                        marginLeft: '2px',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        fontSize: '11px'
                      }}
                    >
                      ({sel.join('')})
                    </span>
                  )}
                </button>
              );
            })}

            {selections[activeSelectionSlot]?.length > 0 && (
              <button
                type="button"
                className="slot-pill clear"
                onClick={() => onResetSelection('plane_slot')}
                title="Xóa lựa chọn mặt hiện tại"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Tool Segment */}
      {activeTool === 'segment' && (
        <div className="instruction-content">
          <div className="instruction-lead">
            <span className="inst-badge purple">Nối đoạn thẳng</span>
            <span className="inst-text">
              {pickedPoints.length === 0 ? (
                <>Bấm chọn <strong>điểm thứ nhất</strong> trên hình 3D.</>
              ) : (
                <>
                  Đã chọn điểm <strong style={{ color: '#2563eb' }}>{pickedPoints[0]}</strong>. Bấm chọn <strong>điểm thứ hai</strong> để nối đoạn thẳng.
                </>
              )}
            </span>
          </div>

          {pickedPoints.length > 0 && (
            <button
              type="button"
              className="slot-pill clear"
              onClick={() => onResetSelection('segment')}
            >
              Hủy chọn
            </button>
          )}
        </div>
      )}

      {/* 3. Tool Point on Edge */}
      {activeTool === 'point_on_edge' && (
        <div className="instruction-content">
          <div className="instruction-lead">
            <span className="inst-badge green">Điểm trên cạnh</span>
            <span className="inst-text">
              Bấm trực tiếp vào một <strong>cạnh hoặc đoạn thẳng</strong> trên hình để mở bảng đặt tên và tỉ lệ.
            </span>
          </div>
        </div>
      )}

      {/* 4. Tool Parallel */}
      {activeTool === 'parallel' && (
        <div className="instruction-content">
          <div className="instruction-lead">
            <span className="inst-badge cyan">Kẻ song song</span>
            <span className="inst-text">
              {!pickedPoints[0] && !pickedLine ? (
                <>Bấm chọn <strong>1 điểm</strong> và <strong>1 cạnh/đường thẳng</strong> trên hình để kẻ đường song song.</>
              ) : pickedPoints[0] && !pickedLine ? (
                <>
                  Đã chọn điểm <strong style={{ color: '#2563eb' }}>{pickedPoints[0]}</strong>. Hãy bấm chọn <strong>cạnh/đường thẳng</strong> cần song song.
                </>
              ) : !pickedPoints[0] && pickedLine ? (
                <>
                  Đã chọn đường <strong style={{ color: '#f59e0b' }}>{pickedLine[0]}{pickedLine[1]}</strong>. Hãy bấm chọn <strong>điểm</strong> để kẻ đường thẳng đi qua.
                </>
              ) : null}
            </span>
          </div>

          {(pickedPoints[0] || pickedLine) && (
            <button
              type="button"
              className="slot-pill clear"
              onClick={() => onResetSelection('parallel')}
            >
              Hủy chọn
            </button>
          )}
        </div>
      )}

      {/* 5. Tool Perpendicular */}
      {activeTool === 'perpendicular' && (
        <div className="instruction-content">
          <div className="instruction-lead">
            <span className="inst-badge indigo">Kẻ vuông góc</span>
            <span className="inst-text">
              {!pickedPoints[0] && !pickedLine ? (
                <>Bấm chọn <strong>1 điểm</strong> và <strong>1 cạnh/đường thẳng</strong> trên hình để kẻ vuông góc.</>
              ) : pickedPoints[0] && !pickedLine ? (
                <>
                  Đã chọn điểm <strong style={{ color: '#2563eb' }}>{pickedPoints[0]}</strong>. Hãy bấm chọn <strong>cạnh/đường thẳng</strong> cần kẻ vuông góc đến.
                </>
              ) : !pickedPoints[0] && pickedLine ? (
                <>
                  Đã chọn đường <strong style={{ color: '#f59e0b' }}>{pickedLine[0]}{pickedLine[1]}</strong>. Hãy bấm chọn <strong>điểm</strong> để hạ đường vuông góc.
                </>
              ) : null}
            </span>
          </div>

          {(pickedPoints[0] || pickedLine) && (
            <button
              type="button"
              className="slot-pill clear"
              onClick={() => onResetSelection('perpendicular')}
            >
              Hủy chọn
            </button>
          )}
        </div>
      )}

      {/* 5b. Tool Perpendicular Bisector */}
      {activeTool === 'perp_bisector' && (
        <div className="instruction-content">
          <div className="instruction-lead">
            <span className="inst-badge red">Đường trung trực</span>
            <span className="inst-text">
              {!pickedPoints[0] && !pickedLine ? (
                <>Bấm chọn <strong>1 điểm</strong> và <strong>1 cạnh/đoạn thẳng</strong> trên hình để kẻ đường trung trực.</>
              ) : pickedPoints[0] && !pickedLine ? (
                <>
                  Đã chọn điểm <strong style={{ color: '#2563eb' }}>{pickedPoints[0]}</strong>. Hãy bấm chọn <strong>cạnh/đoạn thẳng</strong> cần kẻ đường trung trực.
                </>
              ) : !pickedPoints[0] && pickedLine ? (
                <>
                  Đã chọn đường <strong style={{ color: '#f59e0b' }}>{pickedLine[0]}{pickedLine[1]}</strong>. Hãy bấm chọn <strong>điểm</strong> để kẻ đường trung trực đi qua.
                </>
              ) : null}
            </span>
          </div>

          {(pickedPoints[0] || pickedLine) && (
            <button
              type="button"
              className="slot-pill clear"
              onClick={() => onResetSelection('perp_bisector')}
            >
              Hủy chọn
            </button>
          )}
        </div>
      )}

      {/* 6. Tool Intersection */}
      {activeTool === 'intersection' && (
        <div className="instruction-content">
          <div className="instruction-lead">
            <span className="inst-badge amber">Tìm giao điểm</span>
            <span className="inst-text">
              {pickedLines.length === 0 ? (
                <>Bấm chọn <strong>đường thẳng thứ nhất</strong> trên hình 3D.</>
              ) : (
                <>
                  Đã chọn đường <strong style={{ color: '#f59e0b' }}>{pickedLines[0][0]}{pickedLines[0][1]}</strong>. Bấm chọn <strong>đường thẳng thứ hai</strong> để tìm giao điểm.
                </>
              )}
            </span>
          </div>

          {pickedLines.length > 0 && (
            <button
              type="button"
              className="slot-pill clear"
              onClick={() => onResetSelection('intersection')}
            >
              Hủy chọn
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasInstructionBar;
