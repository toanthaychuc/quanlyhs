import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TrigonometricCircle.css';

const SNAP_ANGLES = [
  0, Math.PI/6, Math.PI/4, Math.PI/3, Math.PI/2,
  2*Math.PI/3, 3*Math.PI/4, 5*Math.PI/6, Math.PI,
  7*Math.PI/6, 5*Math.PI/4, 4*Math.PI/3, 3*Math.PI/2,
  5*Math.PI/3, 7*Math.PI/4, 11*Math.PI/6, 2*Math.PI
];

const snapAngle = (rawAngle) => {
  const threshold = 0.08; 
  let sign = rawAngle < 0 ? -1 : 1;
  let absAngle = Math.abs(rawAngle);
  
  let turns = Math.floor(absAngle / (2 * Math.PI));
  let rem = absAngle - turns * 2 * Math.PI;
  
  for (let a of SNAP_ANGLES) {
    if (Math.abs(rem - a) < threshold) {
      rem = a;
      break;
    }
  }
  let snapped = sign * (turns * 2 * Math.PI + rem);
  if (snapped > 2 * Math.PI) snapped = 2 * Math.PI;
  if (snapped < -2 * Math.PI) snapped = -2 * Math.PI;
  return snapped;
};

const getAngleStringRad = (rad) => {
  const PI = Math.PI;
  const eps = 1e-4;
  if (Math.abs(rad) < eps) return "0";
  if (Math.abs(Math.abs(rad) - PI) < eps) return rad < 0 ? "-π" : "π";
  if (Math.abs(Math.abs(rad) - 2*PI) < eps) return rad < 0 ? "-2π" : "2π";
  
  for(let den of [2, 3, 4, 6]) {
    for(let num = -24; num <= 24; num++) {
      if (Math.abs(rad - (num * PI / den)) < eps) {
        if (num === 1) return `π/${den}`;
        if (num === -1) return `-π/${den}`;
        return `${num}π/${den}`;
      }
    }
  }
  return rad.toFixed(2);
};

const getExactValueString = (val) => {
  const eps = 1e-4;
  if (Math.abs(val) < eps) return "0";
  if (Math.abs(val - 1) < eps) return "1";
  if (Math.abs(val + 1) < eps) return "-1";
  if (Math.abs(val - 0.5) < eps) return "1/2";
  if (Math.abs(val + 0.5) < eps) return "-1/2";
  if (Math.abs(val - Math.sqrt(2)/2) < eps) return "√2/2";
  if (Math.abs(val + Math.sqrt(2)/2) < eps) return "-√2/2";
  if (Math.abs(val - Math.sqrt(3)/2) < eps) return "√3/2";
  if (Math.abs(val + Math.sqrt(3)/2) < eps) return "-√3/2";
  if (Math.abs(val - Math.sqrt(3)) < eps) return "√3";
  if (Math.abs(val + Math.sqrt(3)) < eps) return "-√3";
  if (Math.abs(val - Math.sqrt(3)/3) < eps) return "√3/3";
  if (Math.abs(val + Math.sqrt(3)/3) < eps) return "-√3/3";
  
  if (Math.abs(val) > 1000) return "Không xác định";
  return val.toFixed(2);
};

const TrigonometricCircle = () => {
  const [alpha, setAlpha] = useState(Math.PI / 3);
  const [showTanCot, setShowTanCot] = useState(true);
  
  const [showGraphSin, setShowGraphSin] = useState(false);
  const [showGraphCos, setShowGraphCos] = useState(false);
  const [showGraphTan, setShowGraphTan] = useState(false);
  const [showGraphCot, setShowGraphCot] = useState(false);
  
  const svgRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Calculate dynamic radius to ensure it fits the container (with padding for labels/axes)
  const R = Math.max(50, Math.min(220, Math.min(svgSize.width, svgSize.height) / 2 - 50));

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        setSvgSize(prev => {
          const w = svgRef.current.clientWidth;
          const h = svgRef.current.clientHeight;
          if (prev.width === w && prev.height === h) return prev;
          return { width: w, height: h };
        });
      }
    };
    
    updateSize();
    
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    
    if (svgRef.current) {
      resizeObserver.observe(svgRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);

  const cx = svgSize.width / 2;
  const cy = svgSize.height / 2;

  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    setIsDragging(true);
    updateAngleFromEvent(e);
  };

  const updateAngleFromEvent = (e) => {
    if (!svgRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = clientX - rect.left;
    const svgY = clientY - rect.top;
    
    const dx = svgX - cx;
    const dy = cy - svgY; // SVG y is inverted
    
    let rawAngle = Math.atan2(dy, dx);
    if (rawAngle < 0) rawAngle += 2 * Math.PI;
    
    setAlpha(prevAlpha => {
      let currentMod = prevAlpha % (2 * Math.PI);
      if (currentMod < 0) currentMod += 2 * Math.PI;
      
      let delta = rawAngle - currentMod;
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      
      let newAlpha = prevAlpha + delta;
      
      if (newAlpha > 2 * Math.PI) newAlpha = 2 * Math.PI;
      if (newAlpha < -2 * Math.PI) newAlpha = -2 * Math.PI;
      
      return snapAngle(newAlpha);
    });
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (isDragging) updateAngleFromEvent(e);
    };
    const handleUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  const handleStepAlpha = (stepDeg) => {
    setAlpha(prevAlpha => {
      let currentDeg = Math.round(prevAlpha * 180 / Math.PI);
      let newDeg = currentDeg + stepDeg;
      if (newDeg > 360) newDeg = 360;
      if (newDeg < -360) newDeg = -360;
      return newDeg * Math.PI / 180;
    });
  };

  const degAlpha = (alpha * 180 / Math.PI);

  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);
  const tanA = Math.tan(alpha);
  const cotA = 1 / Math.tan(alpha);

  const px = cx + R * cosA;
  const py = cy - R * sinA;

  // Arc path for alpha
  const getAlphaArcPath = () => {
    const r = 30; // arc radius
    const startX = cx + r;
    const startY = cy;
    const endX = cx + r * cosA;
    const endY = cy - r * sinA;
    
    const largeArcFlag = Math.abs(alpha) > Math.PI ? 1 : 0;
    const sweepFlag = alpha < 0 ? 1 : 0;
    
    if (Math.abs(alpha) < 0.01) return "";
    if (Math.abs(Math.abs(alpha) - 2*Math.PI) < 0.01) {
       return `M ${cx+r} ${cy} A ${r} ${r} 0 1 ${sweepFlag} ${cx-r} ${cy} A ${r} ${r} 0 1 ${sweepFlag} ${cx+r} ${cy}`;
    }
    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
  };

  const anyGraphShow = showGraphSin || showGraphCos || showGraphTan || showGraphCot;
  const graphCy = 125;
  const graphCx = svgSize.width / 2;
  const safeGraphScaleX = Math.max(10, (svgSize.width / 2 - 40) / (2 * Math.PI));
  const graphScaleY = 80;

  const renderGraphSeparate = (func, color, name = "") => {
    const points = 300;
    let paths = [];
    let currentPath = "";
    
    for(let i = 0; i <= points; i++) {
      const a = (i / points) * alpha;
      let val = func(a);
      
      if (Math.abs(val) > 4) { 
        if (currentPath) {
          paths.push(currentPath);
          currentPath = "";
        }
        continue;
      }
      
      const x = graphCx + a * safeGraphScaleX;
      const y = graphCy - val * graphScaleY;
      
      if (!currentPath) {
        currentPath = `M ${x} ${y}`;
      } else {
        currentPath += ` L ${x} ${y}`;
      }
    }
    if (currentPath) paths.push(currentPath);
    
    const currentVal = func(alpha);
    const showMarker = Math.abs(currentVal) <= 4;
    
    return (
      <g key={name}>
        {paths.map((p, idx) => (
          <path key={idx} d={p} fill="none" stroke={color} strokeWidth="2.5" opacity="0.8" />
        ))}
        {showMarker && paths.length > 0 && alpha > 0 && (
          <circle cx={graphCx + alpha * safeGraphScaleX} cy={graphCy - currentVal * graphScaleY} r="4" fill={color} />
        )}
      </g>
    );
  };

  const getCot = (a) => {
    const t = Math.tan(a);
    return Math.abs(t) < 0.0001 ? (t >= 0 ? 1000 : -1000) : 1 / t;
  };

  return (
    <div className="trig-container">
      <div className="trig-sidebar">
        <h3 className="trig-title">Đường Tròn Lượng Giác</h3>


        <div className="trig-controls">
          <div className="control-group">
            <div className="slider-header">
              <span className="math-text-normal" style={{ fontSize: '15px', fontWeight: 'bold', color: '#10b981' }}>
                Góc α = {Math.round(degAlpha)}° ({getAngleStringRad(alpha)} rad)
              </span>
              <div className="stepper-controls">
                <button onClick={() => handleStepAlpha(-1)}><ChevronLeft size={16} /></button>
                <button onClick={() => handleStepAlpha(1)}><ChevronRight size={16} /></button>
              </div>
            </div>
            
            <input 
              type="range" min="-360" max="360" step="1" 
              value={Math.round(degAlpha)} 
              onChange={(e) => setAlpha(snapAngle(parseInt(e.target.value) * Math.PI / 180))} 
            />
          </div>

          <div className="control-group checkbox-group" style={{marginTop: '5px'}}>
            <label>
              <input 
                type="checkbox" 
                checked={showTanCot} 
                onChange={(e) => setShowTanCot(e.target.checked)} 
              />
              Hiển thị trục Tan / Cot
            </label>
          </div>

          <div className="control-group checkbox-group" style={{marginTop: '5px'}}>
            <label style={{ color: '#ef4444', fontWeight: 'bold' }}>
              <input type="checkbox" checked={showGraphSin} onChange={(e) => setShowGraphSin(e.target.checked)} />
              Đồ thị sin(x)
            </label>
            <label style={{ color: '#2563eb', fontWeight: 'bold' }}>
              <input type="checkbox" checked={showGraphCos} onChange={(e) => setShowGraphCos(e.target.checked)} />
              Đồ thị cos(x)
            </label>
            <label style={{ color: '#d97706', fontWeight: 'bold' }}>
              <input type="checkbox" checked={showGraphTan} onChange={(e) => setShowGraphTan(e.target.checked)} />
              Đồ thị tan(x)
            </label>
            <label style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
              <input type="checkbox" checked={showGraphCot} onChange={(e) => setShowGraphCot(e.target.checked)} />
              Đồ thị cot(x)
            </label>
          </div>
        </div>

        <div className="trig-info">
          <table className="math-table trig-table">
            <tbody>
              <tr>
                <th className="label">sin(α)</th>
                <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{getExactValueString(sinA)}</td>
              </tr>
              <tr>
                <th className="label">cos(α)</th>
                <td style={{ color: '#2563eb', fontWeight: 'bold' }}>{getExactValueString(cosA)}</td>
              </tr>
              {showTanCot && (
                <>
                  <tr>
                    <th className="label">tan(α)</th>
                    <td style={{ color: '#d97706', fontWeight: 'bold' }}>{getExactValueString(tanA)}</td>
                  </tr>
                  <tr>
                    <th className="label">cot(α)</th>
                    <td style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{getExactValueString(cotA)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '20px' }}>
        <div className="trig-canvas" style={{ flex: 1, minHeight: 0 }}>
          <svg 
            ref={svgRef} 
            width="100%" height="100%"
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            style={{ cursor: isDragging ? 'grabbing' : 'crosshair', touchAction: 'none' }}
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
            <marker id="arrow-alpha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Unit Circle */}
          <circle cx={cx} cy={cy} r={R} fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          
          {/* Main Axes */}
          <line x1="20" y1={cy} x2={svgSize.width - 20} y2={cy} stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
          <line x1={cx} y1={svgSize.height - 20} x2={cx} y2="20" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
          
          <text x={svgSize.width - 20} y={cy + 25} fill="#475569" fontWeight="bold" fontSize="20" textAnchor="end" className="math-text-normal">cos</text>
          <text x={cx + 15} y={20} fill="#475569" fontWeight="bold" fontSize="20" className="math-text-normal">sin</text>
          <text x={cx - 15} y={cy + 20} fill="#475569" fontWeight="bold" fontSize="16" textAnchor="end" className="math-text-normal">O</text>

          {/* Values on axes (1, -1) */}
          <text x={cx + R + 8} y={cy + 22} fill="#475569" fontWeight="bold" fontSize="16" className="math-text-normal">1</text>
          <text x={cx - R - 22} y={cy + 22} fill="#475569" fontWeight="bold" fontSize="16" className="math-text-normal">-1</text>
          <text x={cx - 15} y={cy - R - 8} fill="#475569" fontWeight="bold" fontSize="16" textAnchor="end" className="math-text-normal">1</text>
          <text x={cx - 15} y={cy + R + 20} fill="#475569" fontWeight="bold" fontSize="16" textAnchor="end" className="math-text-normal">-1</text>

          {/* Tangent and Cotangent Axes */}
          {showTanCot && (
            <>
              {/* Tan axis (x = 1) */}
              <line x1={cx + R} y1={svgSize.height - 20} x2={cx + R} y2="20" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4,4" markerEnd="url(#arrow)" />
              <text x={cx + R + 15} y={20} fill="#d97706" fontWeight="bold" fontSize="20" className="math-text-normal">tan</text>
              
              {/* Cot axis (y = 1) */}
              <line x1="20" y1={cy - R} x2={svgSize.width - 20} y2={cy - R} stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,4" markerEnd="url(#arrow)" />
              <text x={svgSize.width - 20} y={cy - R - 15} fill="#8b5cf6" fontWeight="bold" fontSize="20" textAnchor="end" className="math-text-normal">cot</text>
            </>
          )}

          {/* Angle Arcs */}
          <path d={getAlphaArcPath()} fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-alpha)" />
          {alpha > 0.05 && (
            <text 
              x={cx + 45 * Math.cos(alpha/2)} 
              y={cy - 45 * Math.sin(alpha/2)} 
              fill="#10b981" fontWeight="bold" fontSize="16"
              textAnchor="middle" alignmentBaseline="middle"
              className="math-text-normal"
            >
              α
            </text>
          )}

          {/* Projections */}
          <line x1={px} y1={py} x2={px} y2={cy} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
          <line x1={px} y1={py} x2={cx} y2={py} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />

          {/* Value Segments on axes */}
          <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#2563eb" strokeWidth="4" />
          <line x1={cx} y1={cy} x2={cx} y2={py} stroke="#ef4444" strokeWidth="4" />

          {/* Tan/Cot Projections */}
          {showTanCot && (
            <>
              {/* Line passing through OM */}
              <line 
                x1={cx - 1000 * cosA} y1={cy + 1000 * sinA} 
                x2={cx + 1000 * cosA} y2={cy - 1000 * sinA} 
                stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" 
              />
              
              {/* Tan point */}
              {Math.abs(cosA) > 0.01 && (
                <>
                  <circle cx={cx + R} cy={cy - R * tanA} r="4" fill="#d97706" />
                  <line x1={cx + R} y1={cy} x2={cx + R} y2={cy - R * tanA} stroke="#d97706" strokeWidth="4" />
                </>
              )}
              
              {/* Cot point */}
              {Math.abs(sinA) > 0.01 && (
                <>
                  <circle cx={cx + R * cotA} cy={cy - R} r="4" fill="#8b5cf6" />
                  <line x1={cx} y1={cy - R} x2={cx + R * cotA} y2={cy - R} stroke="#8b5cf6" strokeWidth="4" />
                </>
              )}
            </>
          )}

          {/* Point M and vector OM */}
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="#0f172a" strokeWidth="2" />
          <circle cx={px} cy={py} r="8" fill="#0f172a" />
          <circle cx={px} cy={py} r="16" fill="transparent" stroke="#0f172a" strokeWidth="2" opacity="0.2" />
          <text 
            x={px + (cosA >= 0 ? 15 : -15)} 
            y={py + (sinA >= 0 ? -15 : 15)} 
            fill="#0f172a" fontWeight="bold" fontSize="16"
            textAnchor={cosA >= 0 ? "start" : "end"}
            className="math-text-normal"
          >
            M
          </text>
        </svg>
        </div>

        {anyGraphShow && (
          <div className="trig-graph-canvas" style={{ height: '250px', flexShrink: 0, border: '1px solid var(--border-color)', borderRadius: '8px', background: 'white', overflow: 'hidden', position: 'relative', minWidth: 0 }}>
            <svg width="100%" height="100%">
              <defs>
                <marker id="arrow-graph" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
              </defs>
              
              {/* X axis */}
              <line x1="20" y1={graphCy} x2={svgSize.width - 20} y2={graphCy} stroke="#475569" strokeWidth="2" markerEnd="url(#arrow-graph)" />
              <text x={svgSize.width - 20} y={graphCy - 10} fill="#475569" fontWeight="bold" fontSize="16" textAnchor="end" className="math-text-normal">x (rad)</text>

              {/* Y axis */}
              <line x1={graphCx} y1="230" x2={graphCx} y2="20" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow-graph)" />
              <text x={graphCx + 15} y={20} fill="#475569" fontWeight="bold" fontSize="16" className="math-text-normal">y</text>
              
              {/* Origin */}
              <text x={graphCx - 15} y={graphCy + 20} fill="#475569" fontWeight="bold" fontSize="14" textAnchor="end" className="math-text-normal">0</text>
              
              {/* Y-axis labels 1, -1 */}
              <line x1={graphCx - 5} y1={graphCy - graphScaleY} x2={graphCx + 5} y2={graphCy - graphScaleY} stroke="#475569" strokeWidth="2" />
              <text x={graphCx - 10} y={graphCy - graphScaleY + 5} fill="#475569" fontWeight="bold" fontSize="14" textAnchor="end" className="math-text-normal">1</text>
              <line x1={graphCx - 5} y1={graphCy + graphScaleY} x2={graphCx + 5} y2={graphCy + graphScaleY} stroke="#475569" strokeWidth="2" />
              <text x={graphCx - 10} y={graphCy + graphScaleY + 5} fill="#475569" fontWeight="bold" fontSize="14" textAnchor="end" className="math-text-normal">-1</text>

              {/* X-axis ticks */}
              {[-2*Math.PI, -3*Math.PI/2, -Math.PI, -Math.PI/2, Math.PI/2, Math.PI, 3*Math.PI/2, 2*Math.PI].map((tick, i) => (
                <g key={i}>
                  <line 
                    x1={graphCx + tick * safeGraphScaleX} y1={graphCy - 5} 
                    x2={graphCx + tick * safeGraphScaleX} y2={graphCy + 5} 
                    stroke="#475569" strokeWidth="2" 
                  />
                  <text 
                    x={graphCx + tick * safeGraphScaleX} y={graphCy + 25} 
                    fill="#475569" fontSize="14" textAnchor="middle" className="math-text-normal"
                  >
                    {['-2π', '-3π/2', '-π', '-π/2', 'π/2', 'π', '3π/2', '2π'][i]}
                  </text>
                </g>
              ))}
              
              {/* Vertical dotted line indicating current alpha */}
              {Math.abs(alpha) > 0.01 && (
                <>
                  <line 
                    x1={graphCx + alpha * safeGraphScaleX} y1={20} 
                    x2={graphCx + alpha * safeGraphScaleX} y2={230} 
                    stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" 
                  />
                  <text 
                    x={graphCx + alpha * safeGraphScaleX + 5} y={35} 
                    fill="#10b981" fontSize="14" fontWeight="bold" className="math-text-normal"
                  >
                    α
                  </text>
                </>
              )}
              
              {/* Graphs */}
              {showGraphSin && renderGraphSeparate(Math.sin, "#ef4444", "sin")}
              {showGraphCos && renderGraphSeparate(Math.cos, "#2563eb", "cos")}
              {showGraphTan && renderGraphSeparate(Math.tan, "#d97706", "tan")}
              {showGraphCot && renderGraphSeparate(getCot, "#8b5cf6", "cot")}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrigonometricCircle;
