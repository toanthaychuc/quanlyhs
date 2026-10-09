import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import './LinearInequalities.css';

const LinearInequalities = () => {
  const [inequalities, setInequalities] = useState([
    { id: 1, a: 1, b: 1, op: '<=', c: 4 },
    { id: 2, a: 1, b: 0, op: '>=', c: 0 },
    { id: 3, a: 0, b: 1, op: '>=', c: 0 }
  ]);

  const svgRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ width: 800, height: 600 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [scale, setScale] = useState(40); // 40px = 1 unit
  const [showVertices, setShowVertices] = useState(true);

  const validVertices = React.useMemo(() => {
    let pts = [];
    const n = inequalities.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const ineq1 = inequalities[i];
        const ineq2 = inequalities[j];
        const a1 = parseFloat(ineq1.a) || 0, b1 = parseFloat(ineq1.b) || 0, c1 = parseFloat(ineq1.c) || 0;
        const a2 = parseFloat(ineq2.a) || 0, b2 = parseFloat(ineq2.b) || 0, c2 = parseFloat(ineq2.c) || 0;
        const D = a1 * b2 - a2 * b1;
        if (Math.abs(D) > 1e-6) {
          const x = (c1 * b2 - c2 * b1) / D;
          const y = (a1 * c2 - a2 * c1) / D;
          
          let isValid = true;
          for (let k = 0; k < n; k++) {
            const ineq = inequalities[k];
            const a = parseFloat(ineq.a) || 0, b = parseFloat(ineq.b) || 0, c = parseFloat(ineq.c) || 0;
            const val = a * x + b * y;
            if (ineq.op === '<=') {
              if (val > c + 1e-5) isValid = false;
            } else {
              if (val < c - 1e-5) isValid = false;
            }
          }
          if (isValid) {
            if (!pts.some(p => Math.abs(p.x - x) < 1e-4 && Math.abs(p.y - y) < 1e-4)) {
              pts.push({ x, y });
            }
          }
        }
      }
    }
    return pts;
  }, [inequalities]);

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        setSvgSize({
          width: svgRef.current.clientWidth,
          height: svgRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const cx = svgSize.width / 2 + offset.x;
  const cy = svgSize.height / 2 + offset.y;

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    let newScale = scale * (1 - Math.sign(e.deltaY) * zoomFactor);
    newScale = Math.max(10, Math.min(200, newScale));
    setScale(newScale);
  };

  useEffect(() => {
    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => svgElement.removeEventListener('wheel', handleWheel);
    }
  }, [scale]);

  const handleResetPan = () => {
    setOffset({ x: 0, y: 0 });
    setScale(40);
  };

  // Mouse / Touch Dragging
  const handlePointerDown = (e) => {
    // Only drag on left click or touch
    if (e.button && e.button !== 0) return;
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, dragStart]);

  // Convert Math coords to SVG coords
  const toSvgX = (x) => cx + x * scale;
  const toSvgY = (y) => cy - y * scale;

  const addInequality = () => {
    const newId = Math.max(0, ...inequalities.map(i => i.id)) + 1;
    setInequalities([...inequalities, { id: newId, a: 1, b: 1, op: '<=', c: 0 }]);
  };

  const removeInequality = (id) => {
    setInequalities(inequalities.filter(i => i.id !== id));
  };

  const updateIneq = (id, field, value) => {
    setInequalities(inequalities.map(i => {
      if (i.id === id) {
        let val = value;
        if (field === 'a' || field === 'b' || field === 'c') {
          val = parseFloat(value) || 0;
          if (value === '' || value === '-') val = value; // allow typing negative sign
        }
        return { ...i, [field]: val };
      }
      return i;
    }));
  };

  const getInvalidHalfPlanePolygon = (ineq) => {
    const a = parseFloat(ineq.a) || 0;
    const b = parseFloat(ineq.b) || 0;
    const c = parseFloat(ineq.c) || 0;
    
    if (a === 0 && b === 0) return ""; 

    let px, py;
    if (Math.abs(a) > Math.abs(b)) {
      px = c / a;
      py = 0;
    } else {
      px = 0;
      py = c / b;
    }

    const len = Math.sqrt(a * a + b * b);
    const vx = -b / len;
    const vy = a / len;
    const nx = a / len;
    const ny = b / len;

    const HUGE = 3000;
    
    const p1x = px + HUGE * vx;
    const p1y = py + HUGE * vy;
    const p2x = px - HUGE * vx;
    const p2y = py - HUGE * vy;

    // Invalid direction is opposite to valid direction
    let sign = (ineq.op === '<=') ? 1 : -1;
    
    const p3x = p2x + sign * HUGE * nx;
    const p3y = p2y + sign * HUGE * ny;
    const p4x = p1x + sign * HUGE * nx;
    const p4y = p1y + sign * HUGE * ny;

    return `${toSvgX(p1x)},${toSvgY(p1y)} ${toSvgX(p2x)},${toSvgY(p2y)} ${toSvgX(p3x)},${toSvgY(p3y)} ${toSvgX(p4x)},${toSvgY(p4y)}`;
  };

  const getLineSegment = (ineq) => {
    const a = parseFloat(ineq.a) || 0;
    const b = parseFloat(ineq.b) || 0;
    const c = parseFloat(ineq.c) || 0;
    if (a === 0 && b === 0) return null;

    let px, py;
    if (Math.abs(a) > Math.abs(b)) {
      px = c / a; py = 0;
    } else {
      px = 0; py = c / b;
    }

    const len = Math.sqrt(a * a + b * b);
    const vx = -b / len;
    const vy = a / len;
    const HUGE = 2000;

    return {
      x1: toSvgX(px + HUGE * vx),
      y1: toSvgY(py + HUGE * vy),
      x2: toSvgX(px - HUGE * vx),
      y2: toSvgY(py - HUGE * vy)
    };
  };

  const getVisibleEndpointAndAngle = (ineq) => {
    const a = parseFloat(ineq.a) || 0;
    const b = parseFloat(ineq.b) || 0;
    const c = parseFloat(ineq.c) || 0;
    if (a === 0 && b === 0) return null;

    let dx = -b;
    let dy = -a;
    if (dx < 0 || (Math.abs(dx) < 1e-6 && dy < 0)) {
      dx = b;
      dy = a;
    }
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    const margin = 40; 
    const minX = (margin - cx) / scale;
    const maxX = (svgSize.width - margin - cx) / scale;
    const maxY = (cy - margin) / scale;
    const minY = (cy - svgSize.height + margin) / scale;

    let pts = [];
    
    if (Math.abs(b) > 1e-6) {
      const y1 = (c - a * minX) / b;
      if (y1 >= minY && y1 <= maxY) pts.push({x: minX, y: y1});
      const y2 = (c - a * maxX) / b;
      if (y2 >= minY && y2 <= maxY) pts.push({x: maxX, y: y2});
    }
    
    if (Math.abs(a) > 1e-6) {
      const x1 = (c - b * minY) / a;
      if (x1 >= minX && x1 <= maxX) pts.push({x: x1, y: minY});
      const x2 = (c - b * maxY) / a;
      if (x2 >= minX && x2 <= maxX) pts.push({x: x2, y: maxY});
    }

    if (pts.length === 0) return null;

    const svgPts = pts.map(p => ({ x: toSvgX(p.x), y: toSvgY(p.y) }));
    
    svgPts.sort((p1, p2) => {
      const dot1 = p1.x * dx + p1.y * dy;
      const dot2 = p2.x * dx + p2.y * dy;
      return dot2 - dot1;
    });

    return { x: svgPts[0].x, y: svgPts[0].y, angle };
  };

  const formatEquation = (a, b, c) => {
    let parts = [];
    if (a !== 0) {
      if (a === 1) parts.push(<tspan >x</tspan>);
      else if (a === -1) parts.push(<tspan>-<tspan >x</tspan></tspan>);
      else parts.push(<tspan>{a}<tspan >x</tspan></tspan>);
    }
    if (b !== 0) {
      if (a !== 0) {
        if (b === 1) parts.push(<tspan> + <tspan >y</tspan></tspan>);
        else if (b === -1) parts.push(<tspan> - <tspan >y</tspan></tspan>);
        else if (b > 0) parts.push(<tspan> + {b}<tspan >y</tspan></tspan>);
        else parts.push(<tspan> - {-b}<tspan >y</tspan></tspan>);
      } else {
        if (b === 1) parts.push(<tspan >y</tspan>);
        else if (b === -1) parts.push(<tspan>-<tspan >y</tspan></tspan>);
        else parts.push(<tspan>{b}<tspan >y</tspan></tspan>);
      }
    }
    parts.push(<tspan> = {c}</tspan>);
    return parts.map((p, i) => React.cloneElement(p, { key: i }));
  };

  // (Removed intersectionRegion logic)

  return (
    <div className="ineq-container">
      <div className="ineq-sidebar">
        <h3 className="ineq-title">Hệ Bất Phương Trình</h3>

        
        <div className="ineq-list">
          {inequalities.map((ineq, index) => (
            <div key={ineq.id} className="ineq-item">
              <div className="ineq-inputs math-text">
                <span className="line-label">d<sub>{index + 1}</sub>:</span>
                <input 
                  type="text" 
                  value={ineq.a} 
                  onChange={(e) => updateIneq(ineq.id, 'a', e.target.value)} 
                  className="coeff-input"
                />
                <span className="var-label"><span>x</span></span>
                <span className="plus-sign">+</span>
                <input 
                  type="text" 
                  value={ineq.b} 
                  onChange={(e) => updateIneq(ineq.id, 'b', e.target.value)} 
                  className="coeff-input"
                />
                <span className="var-label"><span>y</span></span>
                <select 
                  value={ineq.op} 
                  onChange={(e) => updateIneq(ineq.id, 'op', e.target.value)}
                  className="op-select"
                >
                  <option value="<=">≤</option>
                  <option value=">=">≥</option>
                </select>
                <input 
                  type="text" 
                  value={ineq.c} 
                  onChange={(e) => updateIneq(ineq.id, 'c', e.target.value)} 
                  className="coeff-input"
                />
              </div>
              <button className="remove-btn" onClick={() => removeInequality(ineq.id)}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <button className="add-ineq-btn" onClick={addInequality}>
          <Plus size={16} /> Thêm bất phương trình
        </button>

        <div className="ineq-options" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#475569', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={showVertices} 
              onChange={(e) => setShowVertices(e.target.checked)} 
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Hiển thị tọa độ các đỉnh miền nghiệm
          </label>
        </div>
      </div>

      <div className="ineq-canvas">
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={() => setScale(s => Math.max(10, s - 10))} title="Thu nhỏ">
            <ZoomOut size={20} />
          </button>
          <button className="zoom-btn" onClick={() => setScale(s => Math.min(200, s + 10))} title="Phóng to">
            <ZoomIn size={20} />
          </button>
          <button className="zoom-btn" onClick={handleResetPan} title="Mặc định">
            <MousePointer2 size={20} />
          </button>
        </div>
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        >
          <defs>
            <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
            </pattern>
            
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
          </defs>

          {/* Invalid Regions (Hatched) */}
          {inequalities.map(ineq => {
            if ((parseFloat(ineq.a)||0) === 0 && (parseFloat(ineq.b)||0) === 0) return null;
            return (
              <polygon 
                key={`invalid-${ineq.id}`} 
                points={getInvalidHalfPlanePolygon(ineq)} 
                fill="url(#diagonalHatch)" 
              />
            );
          })}

          {/* Grid lines and Ticks */}
          <g className="grid-lines">
            {(() => {
              const startX = Math.floor(-cx / scale) - 1;
              const endX = Math.ceil((svgSize.width - cx) / scale) + 1;
              const startY = Math.floor(-cy / scale) - 1;
              const endY = Math.ceil((svgSize.height - cy) / scale) + 1;
              
              const lines = [];
              
              // Vertical Grid
              for (let val = startX; val <= endX; val++) {
                if (val === 0) continue;
                const x = cx + val * scale;
                lines.push(
                  <React.Fragment key={`vx${val}`}>
                    <line x1={x} y1="0" x2={x} y2="100%" stroke="#f1f5f9" strokeWidth="1" />
                    <text x={x} y={cy + 16} fill="#94a3b8" fontSize="12" textAnchor="middle" fontFamily='"Latin Modern Math", "Cambria Math", serif'>{val}</text>
                  </React.Fragment>
                );
              }

              // Horizontal Grid
              for (let val = startY; val <= endY; val++) {
                if (val === 0) continue;
                const y = cy + val * scale;
                const mathY = -val;
                lines.push(
                  <React.Fragment key={`hy${val}`}>
                    <line x1="0" y1={y} x2="100%" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={cx - 8} y={y + 4} fill="#94a3b8" fontSize="12" textAnchor="end" fontFamily='"Latin Modern Math", "Cambria Math", serif'>{mathY}</text>
                  </React.Fragment>
                );
              }

              return lines;
            })()}
          </g>

          {/* Axes */}
          <line x1="0" y1={cy} x2="100%" y2={cy} stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1={cx} y1="100%" x2={cx} y2="0" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
          
          {/* Axis labels */}
          <text x={svgSize.width - 20} y={cy + 20} fill="#475569" fontWeight="bold" className="math-text"><span>x</span></text>
          <text x={cx + 10} y={20} fill="#475569" fontWeight="bold" className="math-text"><span>y</span></text>
          <text x={cx - 15} y={cy + 15} fill="#475569" fontWeight="bold" className="math-text"><span>O</span></text>

          {showVertices && validVertices.map((v, idx) => {
            const vx = toSvgX(v.x);
            const vy = toSvgY(v.y);
            const formatNum = (n) => {
              const val = Math.abs(Math.round(n) - n) < 1e-4 ? Math.round(n) : Number(n.toFixed(1));
              return val.toString().replace('.', ',');
            };
            const textStr = `(${formatNum(v.x)}; ${formatNum(v.y)})`;
            const textWidth = textStr.length * 7.5 + 10;
            return (
              <g key={`vertex-${idx}`}>
                <circle cx={vx} cy={vy} r="5" fill="#0f172a" />
                <rect x={vx + 8} y={vy - 24} width={textWidth} height="22" fill="white" rx="4" fillOpacity="0.85" stroke="#cbd5e1" strokeWidth="1" />
                <text x={vx + 13} y={vy - 8} fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily='"Latin Modern Math", "Cambria Math", serif'>
                  {textStr}
                </text>
              </g>
            );
          })}

          {/* Boundary Lines and Labels */}
          {inequalities.map((ineq, i) => {
            const line = getLineSegment(ineq);
            if (!line) return null;
            const endpoint = getVisibleEndpointAndAngle(ineq);
            const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed'];
            const strokeColor = colors[i % colors.length];
            return (
              <g key={`line-group-${ineq.id}`}>
                <line 
                  x1={line.x1} y1={line.y1} 
                  x2={line.x2} y2={line.y2} 
                  stroke={strokeColor} 
                  strokeWidth="2"
                />
                {endpoint && (
                  <text 
                    x={endpoint.x} 
                    y={endpoint.y} 
                    dy="-6"
                    fill={strokeColor} 
                    fontWeight="bold" 
                    fontSize="16"
                    className="math-text"
                    textAnchor="end"
                    transform={`rotate(${endpoint.angle}, ${endpoint.x}, ${endpoint.y})`}
                  >
                    {formatEquation(parseFloat(ineq.a)||0, parseFloat(ineq.b)||0, parseFloat(ineq.c)||0)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default LinearInequalities;
