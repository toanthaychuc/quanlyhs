import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

const renderPortal = (content) => {
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body);
  }
  return content;
};

/**
 * EdgePointModal:
 * Popup dialog when user clicks an edge in 'point_on_edge' tool.
 * Allows choosing point label and ratio with quick presets (1/2, 1/3, 2/3, 1/4...).
 */
export const EdgePointModal = ({
  isOpen,
  edge,
  defaultLabel,
  existingLabels,
  onSubmit,
  onClose
}) => {
  const [label, setLabel] = useState(defaultLabel || 'M');
  const [placement, setPlacement] = useState('inside'); // 'inside' | 'extended_A' | 'extended_B'
  const [num, setNum] = useState(1);
  const [den, setDen] = useState(2);
  const [directK, setDirectK] = useState('0.5');
  const [isDirectK, setIsDirectK] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLabel(defaultLabel || 'M');
      setPlacement('inside');
      setNum(1);
      setDen(2);
      setDirectK('0.5');
      setIsDirectK(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultLabel]);

  if (!isOpen || !edge) return null;

  const [u, v] = edge;

  // Calculate ratio k based on current mode
  let ratio = 0.5;
  if (isDirectK) {
    const parsed = parseFloat(directK);
    ratio = isNaN(parsed) ? 0.5 : parsed;
  } else {
    const fraction = Number(num) / (Number(den) || 1);
    if (placement === 'inside') {
      ratio = Math.max(0.01, Math.min(0.99, fraction));
    } else if (placement === 'extended_A') {
      // Opposite ray of AB: A is midpoint of MB when AM = AB (fraction = 1 -> ratio = -1)
      ratio = -Math.max(0.01, fraction);
    } else {
      // Extended past B: B is midpoint of AM when BM = AB (fraction = 1 -> ratio = 2)
      ratio = 1 + Math.max(0.01, fraction);
    }
  }

  const setRatioPreset = (targetPlacement, n, d, targetK = null) => {
    setPlacement(targetPlacement);
    setNum(n);
    setDen(d);
    setIsDirectK(false);
    if (targetK !== null) {
      setDirectK(String(targetK));
    } else {
      const fr = n / d;
      const kVal = targetPlacement === 'inside' ? fr : targetPlacement === 'extended_A' ? -fr : 1 + fr;
      setDirectK(String(Math.round(kVal * 100) / 100));
    }
  };

  const handleDirectKChange = (val) => {
    setDirectK(val);
    setIsDirectK(true);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      if (parsed < 0) {
        setPlacement('extended_A');
        setNum(Math.abs(Math.round(parsed * 100)));
        setDen(100);
      } else if (parsed > 1) {
        setPlacement('extended_B');
        setNum(Math.round((parsed - 1) * 100));
        setDen(100);
      } else {
        setPlacement('inside');
        setNum(Math.round(parsed * 100));
        setDen(100);
      }
    }
  };

  const handlePlacementChange = (newPlacement) => {
    setPlacement(newPlacement);
    setIsDirectK(false);
    if (newPlacement === 'inside') {
      setNum(1);
      setDen(2);
      setDirectK('0.5');
    } else if (newPlacement === 'extended_A') {
      // Default to: A is midpoint of MB (k = -1)
      setNum(1);
      setDen(1);
      setDirectK('-1');
    } else {
      // Default to: B is midpoint of AM (k = 2)
      setNum(1);
      setDen(1);
      setDirectK('2');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cleanLabel = (label || '').trim().toUpperCase();
    if (!cleanLabel) return;
    if (existingLabels?.includes(cleanLabel)) {
      alert(`Điểm ${cleanLabel} đã tồn tại! Vui lòng chọn tên khác.`);
      return;
    }
    const finalRatio = Math.round(ratio * 1000) / 1000;
    onSubmit({
      edge,
      label: cleanLabel,
      ratio: finalRatio,
      num: Number(num),
      den: Number(den)
    });
  };

  return renderPortal(
    <div className="geom-modal-backdrop" onClick={onClose}>
      <div className="geom-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="geom-modal-header">
          <div className="geom-modal-title">
            <span className="geom-modal-icon">🔵</span>
            Lấy điểm trên đường thẳng <strong>{u}{v}</strong>
          </div>
          <button className="geom-modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="geom-modal-body">
          {/* Tên điểm */}
          <div className="geom-modal-row">
            <label>Tên điểm:</label>
            <input
              ref={inputRef}
              type="text"
              className="geom-modal-input"
              value={label}
              onChange={e => setLabel(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="M"
              required
            />
            <span className="geom-modal-subtext">∈ đường thẳng {u}{v}</span>
          </div>

          <div className="geom-modal-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
            <label>Vị trí điểm {label || 'M'}:</label>
            <div className="geom-placement-tabs">
              <button
                type="button"
                className={`geom-placement-tab ${placement === 'inside' ? 'active' : ''}`}
                onClick={() => handlePlacementChange('inside')}
              >
                📍 Trong đoạn {u}{v}
              </button>
              <button
                type="button"
                className={`geom-placement-tab ${placement === 'extended_A' ? 'active' : ''}`}
                onClick={() => handlePlacementChange('extended_A')}
              >
                ⬅️ Tia đối tia {u}{v} (phía {u})
              </button>
              <button
                type="button"
                className={`geom-placement-tab ${placement === 'extended_B' ? 'active' : ''}`}
                onClick={() => handlePlacementChange('extended_B')}
              >
                ➡️ Tia đối tia {v}{u} (phía {v})
              </button>
            </div>
          </div>

          {/* Các tỉ lệ / quan hệ điểm nhanh */}
          <div className="geom-modal-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#475569' }}>
              {placement === 'inside' && `Tỉ lệ trong đoạn (${u}${label || 'M'} / ${u}${v}):`}
              {placement === 'extended_A' && `Quan hệ điểm trên tia đối của tia ${u}${v} (phía ${u}):`}
              {placement === 'extended_B' && `Quan hệ điểm trên tia đối của tia ${v}${u} (phía ${v}):`}
            </label>

            {/* Presets for inside */}
            {placement === 'inside' && (
              <div className="geom-ratio-presets">
                {[
                  { label: '1/2 (Trung điểm)', n: 1, d: 2, k: 0.5 },
                  { label: '1/3', n: 1, d: 3, k: 1/3 },
                  { label: '2/3', n: 2, d: 3, k: 2/3 },
                  { label: '1/4', n: 1, d: 4, k: 0.25 },
                  { label: '3/4', n: 3, d: 4, k: 0.75 },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    className={`geom-ratio-chip ${!isDirectK && num === p.n && den === p.d ? 'active' : ''}`}
                    onClick={() => setRatioPreset('inside', p.n, p.d, p.k)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Presets for extended_A (opposite ray of AB) */}
            {placement === 'extended_A' && (
              <div className="geom-ratio-presets">
                {[
                  { label: `${u} là trung điểm ${label || 'M'}${v} (k = -1)`, n: 1, d: 1, k: -1 },
                  { label: `${u}${label || 'M'} = 1/2 ${u}${v} (k = -0.5)`, n: 1, d: 2, k: -0.5 },
                  { label: `${u}${label || 'M'} = 2 ${u}${v} (k = -2)`, n: 2, d: 1, k: -2 },
                  { label: `${u}${label || 'M'} = 1/3 ${u}${v} (k = -0.33)`, n: 1, d: 3, k: -1/3 },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    className={`geom-ratio-chip ${!isDirectK && num === p.n && den === p.d ? 'active' : ''}`}
                    onClick={() => setRatioPreset('extended_A', p.n, p.d, p.k)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Presets for extended_B (opposite ray of BA) */}
            {placement === 'extended_B' && (
              <div className="geom-ratio-presets">
                {[
                  { label: `${v} là trung điểm ${u}${label || 'M'} (k = 2)`, n: 1, d: 1, k: 2 },
                  { label: `${v}${label || 'M'} = 1/2 ${u}${v} (k = 1.5)`, n: 1, d: 2, k: 1.5 },
                  { label: `${v}${label || 'M'} = 2 ${u}${v} (k = 3)`, n: 2, d: 1, k: 3 },
                  { label: `${v}${label || 'M'} = 1/3 ${u}${v} (k = 1.33)`, n: 1, d: 3, k: 4/3 },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    className={`geom-ratio-chip ${!isDirectK && num === p.n && den === p.d ? 'active' : ''}`}
                    onClick={() => setRatioPreset('extended_B', p.n, p.d, p.k)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* Custom fraction inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px' }}>
                {placement === 'inside' && `Tỉ lệ ${u}${label || 'M'} =`}
                {placement === 'extended_A' && `Khoảng cách ${u}${label || 'M'} =`}
                {placement === 'extended_B' && `Khoảng cách ${v}${label || 'M'} =`}
              </span>
              <input
                type="number"
                className="geom-modal-input small"
                value={num}
                onChange={e => {
                  setIsDirectK(false);
                  setNum(Math.max(1, parseInt(e.target.value) || 1));
                }}
                min={1}
                max={99}
              />
              <span style={{ fontWeight: 'bold' }}>/</span>
              <input
                type="number"
                className="geom-modal-input small"
                value={den}
                onChange={e => {
                  setIsDirectK(false);
                  setDen(Math.max(1, parseInt(e.target.value) || 1));
                }}
                min={1}
                max={99}
              />
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{u}{v}</span>

              <span style={{ color: '#94a3b8', margin: '0 4px' }}>|</span>

              <span style={{ fontSize: '12px', color: '#64748b' }}>Hệ số k:</span>
              <input
                type="number"
                step="0.05"
                className="geom-modal-input small"
                style={{ width: '64px' }}
                value={isDirectK ? directK : (Math.round(ratio * 100) / 100).toString()}
                onChange={e => handleDirectKChange(e.target.value)}
              />
            </div>

            {/* Geometric explanation banner */}
            {Math.abs(ratio - (-1)) < 0.015 ? (
              <div className="geom-ratio-explainer highlight">
                📍 <strong>{u} là trung điểm của đoạn thẳng {label || 'M'}{v}</strong> ({label || 'M'} đối xứng {v} qua {u}, hệ số vector k = -1).
              </div>
            ) : Math.abs(ratio - 2) < 0.015 ? (
              <div className="geom-ratio-explainer highlight">
                📍 <strong>{v} là trung điểm của đoạn thẳng {u}{label || 'M'}</strong> ({label || 'M'} đối xứng {u} qua {v}, hệ số vector k = 2).
              </div>
            ) : Math.abs(ratio - 0.5) < 0.015 ? (
              <div className="geom-ratio-explainer success">
                📍 <strong>{label || 'M'} là trung điểm của đoạn thẳng {u}{v}</strong> (k = 1/2).
              </div>
            ) : ratio < 0 ? (
              <div className="geom-ratio-explainer">
                ⬅️ <strong>{label || 'M'} nằm trên tia đối của tia {u}{v}</strong> ({u} nằm giữa {label || 'M'} và {v}), {u}{label || 'M'} = {Math.abs(ratio).toFixed(2)} {u}{v} (k = {ratio.toFixed(2)}).
              </div>
            ) : ratio > 1 ? (
              <div className="geom-ratio-explainer">
                ➡️ <strong>{label || 'M'} nằm trên tia đối của tia {v}{u}</strong> ({v} nằm giữa {u} và {label || 'M'}), {v}{label || 'M'} = {(ratio - 1).toFixed(2)} {u}{v} (k = {ratio.toFixed(2)}).
              </div>
            ) : (
              <div className="geom-ratio-explainer">
                📍 <strong>{label || 'M'} nằm trong đoạn thẳng {u}{v}</strong>, {u}{label || 'M'} = {Math.round(ratio * 100)}% {u}{v} (k = {ratio.toFixed(2)}).
              </div>
            )}
          </div>

          <div className="geom-modal-footer">
            <button type="button" className="geom-modal-btn cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="geom-modal-btn confirm">
              Tạo điểm (Enter)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * IntersectionModal:
 * Popup dialog when user clicks 2 coplanar lines in 'intersection' tool.
 */
export const IntersectionModal = ({
  isOpen,
  line1,
  line2,
  defaultLabel,
  existingLabels,
  onSubmit,
  onClose
}) => {
  const [label, setLabel] = useState(defaultLabel || 'O');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLabel(defaultLabel || 'O');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultLabel]);

  if (!isOpen || !line1 || !line2) return null;

  const l1Str = `${line1[0]}${line1[1]}`;
  const l2Str = `${line2[0]}${line2[1]}`;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cleanLabel = (label || '').trim().toUpperCase();
    if (!cleanLabel) return;
    if (existingLabels?.includes(cleanLabel)) {
      alert(`Điểm ${cleanLabel} đã tồn tại! Vui lòng chọn tên khác.`);
      return;
    }
    onSubmit({
      line1,
      line2,
      label: cleanLabel
    });
  };

  return renderPortal(
    <div className="geom-modal-backdrop" onClick={onClose}>
      <div className="geom-modal-box" onClick={e => e.stopPropagation()}>
        <div className="geom-modal-header">
          <div className="geom-modal-title">
            <span className="geom-modal-icon">❌</span>
            Tìm giao điểm giữa <strong>{l1Str}</strong> và <strong>{l2Str}</strong>
          </div>
          <button className="geom-modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="geom-modal-body">
          <div className="geom-modal-row">
            <label>Đặt tên giao điểm:</label>
            <input
              ref={inputRef}
              type="text"
              className="geom-modal-input"
              value={label}
              onChange={e => setLabel(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="O"
              required
            />
            <span className="geom-modal-subtext">= {l1Str} ∩ {l2Str}</span>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
            Hệ thống đã xác định hai đường thẳng đồng phẳng và có giao điểm trong không gian.
          </p>

          <div className="geom-modal-footer">
            <button type="button" className="geom-modal-btn cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="geom-modal-btn confirm">
              Tạo giao điểm (Enter)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * PerpendicularModal:
 * Popup dialog when user clicks point & target line in 'perpendicular' tool.
 */
export const PerpendicularModal = ({
  isOpen,
  point,
  targetLine,
  defaultLabel,
  existingLabels,
  onSubmit,
  onClose
}) => {
  const [footLabel, setFootLabel] = useState(defaultLabel || 'H');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFootLabel(defaultLabel || 'H');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultLabel]);

  if (!isOpen || !point || !targetLine) return null;

  const targetStr = `${targetLine[0]}${targetLine[1]}`;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cleanLabel = (footLabel || '').trim().toUpperCase();
    if (!cleanLabel) return;
    if (existingLabels?.includes(cleanLabel)) {
      alert(`Điểm ${cleanLabel} đã tồn tại! Vui lòng chọn tên khác.`);
      return;
    }
    onSubmit({
      point,
      targetLine,
      footLabel: cleanLabel
    });
  };

  return renderPortal(
    <div className="geom-modal-backdrop" onClick={onClose}>
      <div className="geom-modal-box" onClick={e => e.stopPropagation()}>
        <div className="geom-modal-header">
          <div className="geom-modal-title">
            <span className="geom-modal-icon">📐</span>
            Hạ đường vuông góc từ <strong>{point}</strong> xuống <strong>{targetStr}</strong>
          </div>
          <button className="geom-modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="geom-modal-body">
          <div className="geom-modal-row">
            <label>Tên chân đường cao:</label>
            <input
              ref={inputRef}
              type="text"
              className="geom-modal-input"
              value={footLabel}
              onChange={e => setFootLabel(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="H"
              required
            />
            <span className="geom-modal-subtext">sao cho {point}{footLabel || 'H'} ⊥ {targetStr}</span>
          </div>

          <div className="geom-modal-footer">
            <button type="button" className="geom-modal-btn cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="geom-modal-btn confirm">
              Hạ đường vuông góc (Enter)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * PerpendicularBisectorModal:
 * Popup dialog when user clicks point & target line in 'perp_bisector' tool.
 * Allows choosing which plane the perpendicular bisector line should lie in.
 */
export const PerpendicularBisectorModal = ({
  isOpen,
  point,
  targetLine,
  shape,
  activeVertices,
  onSubmit,
  onClose
}) => {
  const [selectedPlaneId, setSelectedPlaneId] = useState('');

  // Compute candidate planes containing targetLine
  const candidatePlanes = useMemo(() => {
    if (!targetLine || targetLine.length < 2) return [];
    const l1 = targetLine[0].toUpperCase();
    const l2 = targetLine[1].toUpperCase();

    const candidates = [];
    const seenFaceSignatures = new Set();

    // 1. Check shape.faces
    (shape?.faces || []).forEach(f => {
      if (f.includes(l1) && f.includes(l2)) {
        const sig = [...f].sort().join('-');
        if (!seenFaceSignatures.has(sig)) {
          seenFaceSignatures.add(sig);
          const refPt = f.find(v => v !== l1 && v !== l2 && v !== point) || f.find(v => v !== l1 && v !== l2);
          const isBase = f.every(v => v !== 'S' && !v.includes('1'));
          const faceName = f.join('');
          candidates.push({
            id: faceName,
            label: `Mặt phẳng (${faceName})`,
            description: isBase ? 'Mặt đáy' : 'Mặt bên',
            refPt,
            face: f
          });
        }
      }
    });

    // 2. If fewer than 2 faces found (e.g. diagonal AC or internal line), check other vertices in shape
    if (candidates.length < 2 && shape?.labels) {
      shape.labels.forEach(v => {
        if (v !== l1 && v !== l2 && v !== point) {
          const isRepresented = candidates.some(c => c.refPt === v || (c.face && c.face.includes(v)));
          if (!isRepresented) {
            candidates.push({
              id: `${v}${l1}${l2}`,
              label: `Mặt phẳng (${v}${l1}${l2})`,
              description: `Mặt phẳng qua ${v} và ${l1}${l2}`,
              refPt: v,
              face: [v, l1, l2]
            });
          }
        }
      });
    }

    return candidates;
  }, [shape, targetLine, point]);

  useEffect(() => {
    if (isOpen && candidatePlanes.length > 0) {
      setSelectedPlaneId(candidatePlanes[0].id);
    }
  }, [isOpen, candidatePlanes]);

  if (!isOpen || !point || !targetLine) return null;

  const targetStr = `${targetLine[0]}${targetLine[1]}`;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const chosen = candidatePlanes.find(p => p.id === selectedPlaneId) || candidatePlanes[0];
    if (!chosen) {
      alert('Vui lòng chọn một mặt phẳng!');
      return;
    }
    onSubmit({
      point,
      targetLine,
      refPt: chosen.refPt,
      planeLabel: chosen.id
    });
  };

  return renderPortal(
    <div className="geom-modal-backdrop" onClick={onClose}>
      <div className="geom-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="geom-modal-header">
          <div className="geom-modal-title">
            <span className="geom-modal-icon">📐</span>
            Đường trung trực của <strong>{targetStr}</strong> qua <strong>{point}</strong>
          </div>
          <button className="geom-modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="geom-modal-body">
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
            Trong không gian, đường trung trực của đoạn thẳng <strong>{targetStr}</strong> phụ thuộc vào mặt phẳng chứa nó. Vui lòng chọn mặt phẳng vẽ đường trung trực:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {candidatePlanes.map(p => {
              const isSelected = selectedPlaneId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlaneId(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="bisector-plane"
                    checked={isSelected}
                    onChange={() => setSelectedPlaneId(p.id)}
                    style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: isSelected ? '#1d4ed8' : '#1e293b', fontSize: '14px' }}>
                      {p.label}
                    </div>
                    {p.description && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {p.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="geom-modal-footer">
            <button type="button" className="geom-modal-btn cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="geom-modal-btn confirm">
              Kẻ đường trung trực (Enter)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

