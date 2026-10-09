import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import './QuadraticFunction.css';

const QuadraticFunction = () => {
  const [coeffs, setCoeffs] = useState({ a: 1, b: -2, c: -3 });
  
  const svgRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ width: 800, height: 600 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStartCanvas, setDragStartCanvas] = useState({ x: 0, y: 0 });
  const [isDraggingVertex, setIsDraggingVertex] = useState(false);
  
  const [scale, setScale] = useState(40); // 40px = 1 unit

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

  const toSvgX = (x) => cx + x * scale;
  const toSvgY = (y) => cy - y * scale;
  const toMathX = (svgX) => (svgX - cx) / scale;
  const toMathY = (svgY) => -(svgY - cy) / scale;

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

  // Math calculations
  const { a, b, c } = coeffs;
  const aVal = parseFloat(a) || 0;
  const bVal = parseFloat(b) || 0;
  const cVal = parseFloat(c) || 0;
  
  const isValidParabola = Math.abs(aVal) > 1e-6;
  const vertexX = isValidParabola ? -bVal / (2 * aVal) : 0;
  const vertexY = isValidParabola ? aVal * vertexX * vertexX + bVal * vertexX + cVal : 0;
  
  const delta = bVal * bVal - 4 * aVal * cVal;
  let roots = [];
  if (isValidParabola && delta >= 0) {
    if (delta === 0) {
      roots.push(-bVal / (2 * aVal));
    } else {
      roots.push((-bVal - Math.sqrt(delta)) / (2 * aVal));
      roots.push((-bVal + Math.sqrt(delta)) / (2 * aVal));
    }
  }

  const handleVertexDrag = (mathX, mathY) => {
    if (!isValidParabola) return;
    const newB = -2 * aVal * mathX;
    const newC = aVal * mathX * mathX + mathY;
    setCoeffs({ 
      a: aVal, 
      b: Math.round(newB * 100) / 100, 
      c: Math.round(newC * 100) / 100 
    });
  };

  const handleStep = (coeff, stepVal) => {
    setCoeffs(prev => {
      let newVal = parseFloat(prev[coeff]) + stepVal;
      newVal = Math.round(newVal * 10) / 10;
      if (newVal < -10) newVal = -10;
      if (newVal > 10) newVal = 10;
      return { ...prev, [coeff]: newVal };
    });
  };

  // Pointer Handlers
  const handlePointerDownCanvas = (e) => {
    if (e.button && e.button !== 0) return;
    setIsDraggingCanvas(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setDragStartCanvas({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerDownVertex = (e) => {
    if (e.button && e.button !== 0) return;
    e.stopPropagation(); // prevent canvas pan
    setIsDraggingVertex(true);
  };

  useEffect(() => {
    const handleMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      if (isDraggingCanvas) {
        setOffset({ x: clientX - dragStartCanvas.x, y: clientY - dragStartCanvas.y });
      } else if (isDraggingVertex && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const svgX = clientX - rect.left;
        const svgY = clientY - rect.top;
        handleVertexDrag(toMathX(svgX), toMathY(svgY));
      }
    };

    const handleUp = () => {
      setIsDraggingCanvas(false);
      setIsDraggingVertex(false);
    };

    if (isDraggingCanvas || isDraggingVertex) {
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
  }, [isDraggingCanvas, isDraggingVertex, dragStartCanvas, aVal]); // aVal dependency for handleVertexDrag closure

  const getParabolaPath = () => {
    if (!isValidParabola) {
      // Draw straight line if a=0
      const startX = Math.floor(-cx / scale) - 1;
      const endX = Math.ceil((svgSize.width - cx) / scale) + 1;
      return `M ${toSvgX(startX)} ${toSvgY(bVal * startX + cVal)} L ${toSvgX(endX)} ${toSvgY(bVal * endX + cVal)}`;
    }
    
    const startMathX = Math.floor(-cx / scale) - 1;
    const endMathX = Math.ceil((svgSize.width - cx) / scale) + 1;
    
    let path = "";
    const segments = 150;
    const step = (endMathX - startMathX) / segments;
    
    for (let x = startMathX; x <= endMathX; x += step) {
      const y = aVal * x * x + bVal * x + cVal;
      const svgX = toSvgX(x);
      const svgY = toSvgY(y);
      if (path === "") path += `M ${svgX} ${svgY} `;
      else path += `L ${svgX} ${svgY} `;
    }
    return path;
  };

  const renderGrid = () => {
    const startX = Math.floor(-cx / scale) - 1;
    const endX = Math.ceil((svgSize.width - cx) / scale) + 1;
    const startY = Math.floor(-cy / scale) - 1;
    const endY = Math.ceil((svgSize.height - cy) / scale) + 1;
    
    const lines = [];
    
    // Vertical
    for (let val = startX; val <= endX; val++) {
      if (val === 0) continue;
      const x = cx + val * scale;
      lines.push(
        <React.Fragment key={`vx${val}`}>
          <line x1={x} y1="0" x2={x} y2="100%" stroke="#f1f5f9" strokeWidth="1" />
          <text x={x} y={cy + 16} fill="#94a3b8" fontSize="12" textAnchor="middle" className="math-text-normal">{val}</text>
        </React.Fragment>
      );
    }

    // Horizontal
    for (let val = startY; val <= endY; val++) {
      if (val === 0) continue;
      const y = cy + val * scale;
      const mathY = -val;
      lines.push(
        <React.Fragment key={`hy${val}`}>
          <line x1="0" y1={y} x2="100%" y2={y} stroke="#f1f5f9" strokeWidth="1" />
          <text x={cx - 8} y={y + 4} fill="#94a3b8" fontSize="12" textAnchor="end" className="math-text-normal">{mathY}</text>
        </React.Fragment>
      );
    }
    return lines;
  };

  const formatNumber = (num) => (Math.round(num * 100) / 100).toString().replace('.', ',');

  return (
    <div className="quad-container">
      <div className="quad-sidebar">
        <h3 className="math-title">Hàm số bậc hai</h3>

        <div className="quad-input-box">
          <span className="math-text-normal"><span>y</span> = </span>
          <input 
            type="number" 
            className="coeff-input" 
            value={a} 
            step="0.1"
            onChange={(e) => setCoeffs({...coeffs, a: e.target.value})} 
          />
          <span className="math-text-normal"><span>x</span><sup>2</sup> + </span>
          <input 
            type="number" 
            className="coeff-input" 
            value={b} 
            step="0.1"
            onChange={(e) => setCoeffs({...coeffs, b: e.target.value})} 
          />
          <span className="math-text-normal"><span>x</span> + </span>
          <input 
            type="number" 
            className="coeff-input" 
            value={c} 
            step="0.1"
            onChange={(e) => setCoeffs({...coeffs, c: e.target.value})} 
          />
        </div>

        <div className="coeff-sliders">
          <div className="slider-group">
            <div className="slider-header">
              <span className="math-text-normal"><span>a</span> = {formatNumber(a)}</span>
              <div className="stepper-controls">
                <button onClick={() => handleStep('a', -0.1)}><ChevronLeft size={16} /></button>
                <button onClick={() => handleStep('a', 0.1)}><ChevronRight size={16} /></button>
              </div>
            </div>
            <input 
              type="range" min="-10" max="10" step="0.1" 
              value={a} onChange={(e) => setCoeffs({...coeffs, a: e.target.value})} 
            />
          </div>
          <div className="slider-group">
            <div className="slider-header">
              <span className="math-text-normal"><span>b</span> = {formatNumber(b)}</span>
              <div className="stepper-controls">
                <button onClick={() => handleStep('b', -0.1)}><ChevronLeft size={16} /></button>
                <button onClick={() => handleStep('b', 0.1)}><ChevronRight size={16} /></button>
              </div>
            </div>
            <input 
              type="range" min="-10" max="10" step="0.1" 
              value={b} onChange={(e) => setCoeffs({...coeffs, b: e.target.value})} 
            />
          </div>
          <div className="slider-group">
            <div className="slider-header">
              <span className="math-text-normal"><span>c</span> = {formatNumber(c)}</span>
              <div className="stepper-controls">
                <button onClick={() => handleStep('c', -0.1)}><ChevronLeft size={16} /></button>
                <button onClick={() => handleStep('c', 0.1)}><ChevronRight size={16} /></button>
              </div>
            </div>
            <input 
              type="range" min="-10" max="10" step="0.1" 
              value={c} onChange={(e) => setCoeffs({...coeffs, c: e.target.value})} 
            />
          </div>
        </div>

        <div className="quad-info">
          <div className="info-item">
            <strong>Phương trình:</strong>
            <div className="math-text-normal" style={{ fontSize: '1.2em', margin: '8px 0', color: '#2563eb' }}>
              <span>y</span> = {formatNumber(a)}<span>x</span><sup>2</sup> {b >= 0 ? '+' : '-'} {Math.abs(formatNumber(b))}<span>x</span> {c >= 0 ? '+' : '-'} {Math.abs(formatNumber(c))}
            </div>
          </div>
          
          {isValidParabola && (
            <>
              <div className="info-item">
                <strong>Đỉnh I:</strong>
                <span className="math-text-normal">({formatNumber(vertexX)}; {formatNumber(vertexY)})</span>
              </div>
              <div className="info-item">
                <strong>Trục đối xứng:</strong>
                <span className="math-text-normal"><span>x</span> = {formatNumber(vertexX)}</span>
              </div>
              <div className="info-item">
                <strong>Giao Ox:</strong>
                <span className="math-text-normal">
                  {roots.length === 0 && "Vô nghiệm (Không cắt)"}
                  {roots.length === 1 && `(${formatNumber(roots[0])}; 0)`}
                  {roots.length === 2 && `(${formatNumber(roots[0])}; 0) và (${formatNumber(roots[1])}; 0)`}
                </span>
              </div>
              <div className="info-item">
                <strong>Giao Oy:</strong>
                <span className="math-text-normal">(0; {formatNumber(c)})</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="quad-main">
        <div className="quad-canvas">
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
            width="100%" height="100%"
            onMouseDown={handlePointerDownCanvas}
            onTouchStart={handlePointerDownCanvas}
            style={{ cursor: isDraggingCanvas ? 'grabbing' : 'grab', touchAction: 'none' }}
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
            </defs>

            {renderGrid()}

            {/* Axes */}
            <line x1="0" y1={cy} x2="100%" y2={cy} stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1={cx} y1="100%" x2={cx} y2="0" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)" />
            
            <text x={svgSize.width - 20} y={cy + 20} fill="#475569" fontWeight="bold" className="math-text-normal"><span>x</span></text>
            <text x={cx + 10} y={20} fill="#475569" fontWeight="bold" className="math-text-normal"><span>y</span></text>
            <text x={cx - 15} y={cy + 15} fill="#475569" fontWeight="bold" className="math-text-normal"><span>O</span></text>

            {/* Axis of Symmetry */}
            {isValidParabola && (
              <g>
                <line 
                  x1={toSvgX(vertexX)} y1="0" 
                  x2={toSvgX(vertexX)} y2="100%" 
                  stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" 
                />
                <g transform={`translate(${toSvgX(vertexX) + 10}, 30)`} className="math-text-normal">
                  <text fill="#6b7280" fontWeight="bold" fontSize="14" x="0" y="5">x = -</text>
                  <text fill="#6b7280" fontWeight="bold" fontSize="13" x="35" y="-2">b</text>
                  <line x1="32" y1="3" x2="50" y2="3" stroke="#6b7280" strokeWidth="1.5" />
                  <text fill="#6b7280" fontWeight="bold" fontSize="13" x="33" y="15">2a</text>
                </g>
              </g>
            )}

            {/* Parabola */}
            <path 
              d={getParabolaPath()} 
              fill="none" 
              stroke="#2563eb" 
              strokeWidth="3" 
            />

            {/* Points */}
            {isValidParabola && (
              <>
                {/* Vertex */}
                <g 
                  onMouseDown={handlePointerDownVertex}
                  onTouchStart={handlePointerDownVertex}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={toSvgX(vertexX)} cy={toSvgY(vertexY)} r="8" fill="#ef4444" />
                  <circle cx={toSvgX(vertexX)} cy={toSvgY(vertexY)} r="12" fill="transparent" stroke="#ef4444" strokeWidth="2" opacity="0.3" />
                  <text x={toSvgX(vertexX) + 12} y={toSvgY(vertexY) - 12} fill="#ef4444" fontWeight="bold" fontSize="24" className="math-text-normal">I</text>
                </g>

                {/* Roots (Ox intercepts) */}
                {roots.map((rx, idx) => (
                  <g key={`root-${idx}`}>
                    <circle cx={toSvgX(rx)} cy={cy} r="5" fill="#16a34a" />
                    <text x={toSvgX(rx) + 6} y={cy - 10} fill="#16a34a" fontWeight="bold" fontSize="16" className="math-text-normal">
                      x<tspan dy="5" fontSize="11">{idx + 1}</tspan>
                    </text>
                  </g>
                ))}

                {/* Oy intercept */}
                <g>
                  <circle cx={cx} cy={toSvgY(cVal)} r="5" fill="#d97706" />
                  <text x={cx + 8} y={toSvgY(cVal) - 8} fill="#d97706" fontWeight="bold" fontSize="18" className="math-text-normal">c</text>
                </g>
              </>
            )}
          </svg>
        </div>

        {isValidParabola && (
          <div className="quad-tables">
            <div className="quad-table-box">
              <h4>Bảng Biến Thiên</h4>
              <table className="math-table">
                <tbody>
                  <tr>
                    <th className="label"><span>x</span></th>
                    <td>-∞</td>
                    <td>{formatNumber(vertexX)}</td>
                    <td>+∞</td>
                  </tr>
                  <tr>
                    <th className="label"><span>y</span></th>
                    <td colSpan="3" style={{ height: '70px', position: 'relative', padding: 0 }}>
                      {aVal > 0 ? (
                        <>
                          <span style={{ position: 'absolute', top: 5, left: 10 }}>+∞</span>
                          <span style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)' }}>{formatNumber(vertexY)}</span>
                          <span style={{ position: 'absolute', top: 5, right: 10 }}>+∞</span>
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                             <defs>
                               <marker id="arrow-head-1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                               </marker>
                             </defs>
                             <line x1="15%" y1="20%" x2="45%" y2="80%" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow-head-1)" />
                             <line x1="55%" y1="80%" x2="85%" y2="20%" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow-head-1)" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span style={{ position: 'absolute', bottom: 5, left: 10 }}>-∞</span>
                          <span style={{ position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)' }}>{formatNumber(vertexY)}</span>
                          <span style={{ position: 'absolute', bottom: 5, right: 10 }}>-∞</span>
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                             <defs>
                               <marker id="arrow-head-2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                 <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                               </marker>
                             </defs>
                             <line x1="15%" y1="80%" x2="45%" y2="20%" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow-head-2)" />
                             <line x1="55%" y1="20%" x2="85%" y2="80%" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow-head-2)" />
                          </svg>
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="quad-table-box">
              <h4>Bảng Xét Dấu</h4>
              <table className="math-table">
                <tbody>
                  {(() => {
                    let sortedRoots = [...roots].sort((a,b) => a - b);
                    if (sortedRoots.length === 2) {
                      return (
                        <>
                          <tr>
                            <th className="label"><span>x</span></th>
                            <td>-∞</td>
                            <td></td>
                            <td>{formatNumber(sortedRoots[0])}</td>
                            <td></td>
                            <td>{formatNumber(sortedRoots[1])}</td>
                            <td></td>
                            <td>+∞</td>
                          </tr>
                          <tr>
                            <th className="label"><span>f(x)</span></th>
                            <td></td>
                            <td>{aVal > 0 ? '+' : '-'}</td>
                            <td>0</td>
                            <td>{aVal > 0 ? '-' : '+'}</td>
                            <td>0</td>
                            <td>{aVal > 0 ? '+' : '-'}</td>
                            <td></td>
                          </tr>
                        </>
                      );
                    } else if (sortedRoots.length === 1) {
                      return (
                        <>
                          <tr>
                            <th className="label"><span>x</span></th>
                            <td>-∞</td>
                            <td></td>
                            <td>{formatNumber(sortedRoots[0])}</td>
                            <td></td>
                            <td>+∞</td>
                          </tr>
                          <tr>
                            <th className="label"><span>f(x)</span></th>
                            <td></td>
                            <td>{aVal > 0 ? '+' : '-'}</td>
                            <td>0</td>
                            <td>{aVal > 0 ? '+' : '-'}</td>
                            <td></td>
                          </tr>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <tr>
                            <th className="label"><span>x</span></th>
                            <td>-∞</td>
                            <td></td>
                            <td>+∞</td>
                          </tr>
                          <tr>
                            <th className="label"><span>f(x)</span></th>
                            <td></td>
                            <td>{aVal > 0 ? '+' : '-'}</td>
                            <td></td>
                          </tr>
                        </>
                      );
                    }
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuadraticFunction;
