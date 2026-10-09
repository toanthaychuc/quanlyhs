import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import 'mathlive';
import './RiemannSum.css';

const formatNum = (num, decimals = 3) => {
  return num.toFixed(decimals).replace('.', ',');
};

const compileExpression = (expr) => {
  try {
    let jsExpr = expr.normalize('NFKC').toLowerCase();
    
    // Remove any lingering backslashes from MathLive
    jsExpr = jsExpr.replace(/\\/g, '');
    
    // Parse log with base: log_2(x) or log_2 x -> (Math.log(x)/Math.log(2))
    jsExpr = jsExpr.replace(/log\s*_?\s*\(?\{?([a-zA-Z0-9.]+)\}?\)?\s*(?:\(([^)]+)\)|([a-zA-Z0-9]+))/g, (match, base, arg1, arg2) => {
      const arg = arg1 || arg2;
      return `($FN_LOG(${arg})/$FN_LOG(${base}))`;
    });
    
    // Fraction fallback just in case MathLive outputs frac
    jsExpr = jsExpr.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))');
    jsExpr = jsExpr.replace(/frac\(([^)]+)\)\(([^)]+)\)/g, '(($1)/($2))');

    jsExpr = jsExpr.replace(/\bpi\b/g, '$CONST_PI');
    jsExpr = jsExpr.replace(/\be\b/g, '$CONST_E');
    jsExpr = jsExpr.replace(/\bln\b/g, '$FN_LOG');
    jsExpr = jsExpr.replace(/\blog\b/g, '$FN_LOG10');
    jsExpr = jsExpr.replace(/\bcot\b/g, '(1/$FN_TAN)');
    
    const funcs = ['sin', 'cos', 'tan', 'sqrt', 'exp', 'abs'];
    funcs.forEach(f => {
      jsExpr = jsExpr.replace(new RegExp(`\\b${f}\\b`, 'g'), `$FN_${f.toUpperCase()}`);
    });
    
    jsExpr = jsExpr.replace(/\^/g, '**');
    jsExpr = jsExpr.replace(/(\d)([xy])/gi, '$1*$2');
    jsExpr = jsExpr.replace(/([xy])(\()/g, '$1*$2');
    jsExpr = jsExpr.replace(/(\))([xy])/g, '$1*$2');
    
    // Restore JS Math functions
    jsExpr = jsExpr.replace(/\$FN_([A-Z0-9]+)/g, (m, f) => `Math.${f.toLowerCase()}`);
    jsExpr = jsExpr.replace(/\$CONST_PI/g, 'Math.PI');
    jsExpr = jsExpr.replace(/\$CONST_E/g, 'Math.E');

    let isImplicit = false;
    if (jsExpr.includes('=')) {
      const parts = jsExpr.split('=');
      jsExpr = `(${parts[0]}) - (${parts[1]})`;
      isImplicit = true;
    } else if (jsExpr.includes('y') && !jsExpr.includes('math.y')) {
      isImplicit = true;
    }

    if (isImplicit) {
      // eslint-disable-next-line no-new-func
      const f = new Function('x', 'y', `return ${jsExpr};`);
      f(1, 1);
      return { f, isImplicit: true, error: null };
    } else {
      // eslint-disable-next-line no-new-func
      const f = new Function('x', `return ${jsExpr};`);
      f(1); // Test execution
      return { f, isImplicit: false, error: null };
    }
  } catch (e) {
    console.warn('Compile error for expr:', expr, e);
    return { f: () => 0, error: 'Biểu thức không hợp lệ' };
  }
};

const calculateDefiniteIntegral = (f, g, a, b, n = 1000) => {
  const h = (b - a) / n;
  let sum = Math.abs(f(a) - g(a)) + Math.abs(f(b) - g(b));
  for (let i = 1; i < n; i++) {
    sum += Math.abs(f(a + i * h) - g(a + i * h)) * (i % 2 === 0 ? 2 : 4);
  }
  return (sum * h) / 3;
};

const RiemannSum = () => {
  const [customExpr, setCustomExpr] = useState('sqrt(x)'); // For evaluating
  const [customLatex, setCustomLatex] = useState('\\sqrt{x}'); // For MathLive
  const [customA, setCustomA] = useState(0);
  const [customB, setCustomB] = useState(4);
  const [method, setMethod] = useState('left'); // 'left', 'right', 'mid'
  const [n, setN] = useState(10);
  const [useTwoFuncs, setUseTwoFuncs] = useState(false);
  const [customExprG, setCustomExprG] = useState('sqrt(3*x)');
  const [customLatexG, setCustomLatexG] = useState('\\sqrt{3x}');
  const mfRef = useRef(null);
  const mfGRef = useRef(null);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;
    
    // Set initial value
    mf.value = customLatex;
    
    const handleInput = () => {
      setCustomLatex(mf.value);
      let ascii = mf.getValue('ascii-math');
      // Sometimes ascii-math returns \cdot for multiplication, or pi
      ascii = ascii.replace(/\\cdot/g, '*');
      setCustomExpr(ascii);
    };
    
    mf.addEventListener('input', handleInput);
    return () => mf.removeEventListener('input', handleInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mfG = mfGRef.current;
    if (!mfG) return;
    
    mfG.value = customLatexG;
    
    const handleInputG = () => {
      setCustomLatexG(mfG.value);
      let ascii = mfG.getValue('ascii-math');
      ascii = ascii.replace(/\\cdot/g, '*');
      setCustomExprG(ascii);
    };
    
    mfG.addEventListener('input', handleInputG);
    return () => mfG.removeEventListener('input', handleInputG);
  }, [useTwoFuncs]);
  
  // Viewport/panning state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(60); // px per unit
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ width: 600, height: 400 });

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

  // Center the coordinate system
  const cx = svgSize.width / 2 + pan.x;
  const cy = svgSize.height / 2 + pan.y;

  const toPx = (mathX, mathY) => {
    return {
      px: cx + mathX * scale,
      py: cy - mathY * scale
    };
  };

  const toMath = (px, py) => {
    return {
      x: (px - cx) / scale,
      y: (cy - py) / scale
    };
  };

  const compiled = compileExpression(customExpr);
  const compiledG = compileExpression(customExprG);
  const currentFunc = {
    label: 'Tùy chỉnh',
    mathString: customExpr,
    f: compiled.f,
    isImplicit: compiled.isImplicit,
    a: parseFloat(customA) || 0,
    b: parseFloat(customB) || 1,
    defaultPan: { x: 0, y: 100 }
  };
  const gFunc = useTwoFuncs ? compiledG.f : () => 0;

  const exactArea = currentFunc.isImplicit ? 0 : calculateDefiniteIntegral(currentFunc.f, gFunc, currentFunc.a, currentFunc.b);

  // Mouse events for panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  // Handle reset pan
  const handleResetPan = () => {
    setPan({ x: 0, y: 100 });
    setScale(60);
  };

  // Calculate Riemann sum data
  const calculateRiemann = () => {
    const { a, b, f } = currentFunc;
    const dx = (b - a) / n;
    let sum = 0;
    const rects = [];

    for (let i = 0; i < n; i++) {
      const xi = a + i * dx;
      let evalX;
      if (method === 'left') {
        evalX = xi;
      } else if (method === 'right') {
        evalX = xi + dx;
      } else { // mid
        evalX = xi + dx / 2;
      }
      
      const y1 = f(evalX);
      const y2 = gFunc(evalX);
      const hMath = Math.abs(y1 - y2);
      sum += hMath * dx;
      
      rects.push({
        xMath: xi,
        wMath: dx,
        hMath: hMath,
        evalX: evalX,
        y1: y1,
        y2: y2
      });
    }
    return { sum, rects };
  };

  const { sum: approxArea, rects } = currentFunc.isImplicit ? { sum: 0, rects: [] } : calculateRiemann();
  const error = Math.abs(exactArea - approxArea);

  // Render Grid
  const renderGrid = () => {
    const lines = [];
    const minX = Math.floor(toMath(0, 0).x);
    const maxX = Math.ceil(toMath(svgSize.width, 0).x);
    const minY = Math.floor(toMath(0, svgSize.height).y);
    const maxY = Math.ceil(toMath(0, 0).y);

    for (let x = minX; x <= maxX; x++) {
      const px = cx + x * scale;
      lines.push(
        <line key={`vx-${x}`} x1={px} y1={0} x2={px} y2={svgSize.height} stroke="#e2e8f0" strokeWidth={x === 0 ? 0 : 1} />
      );
      if (x !== 0) {
        lines.push(<text key={`tx-${x}`} x={px} y={cy + 15} fill="#94a3b8" fontSize="12" textAnchor="middle">{x}</text>);
      }
    }
    for (let y = minY; y <= maxY; y++) {
      const py = cy - y * scale;
      lines.push(
        <line key={`vy-${y}`} x1={0} y1={py} x2={svgSize.width} y2={py} stroke="#e2e8f0" strokeWidth={y === 0 ? 0 : 1} />
      );
      if (y !== 0) {
        lines.push(<text key={`ty-${y}`} x={cx - 10} y={py + 4} fill="#94a3b8" fontSize="12" textAnchor="end">{y}</text>);
      }
    }
    
    // Axes
    lines.push(<line key="axis-x" x1={0} y1={cy} x2={svgSize.width} y2={cy} stroke="#475569" strokeWidth="2" />);
    lines.push(<line key="axis-y" x1={cx} y1={0} x2={cx} y2={svgSize.height} stroke="#475569" strokeWidth="2" />);
    
    lines.push(<text key="label-o" x={cx - 15} y={cy + 15} fill="#475569" fontWeight="bold">O</text>);
    
    return lines;
  };

  const getImplicitPath = () => {
    if (!svgSize.width) return '';
    const res = 100;
    const minX = (0 - cx) / scale;
    const maxX = (svgSize.width - cx) / scale;
    const maxY = (cy - 0) / scale;
    const minY = (cy - svgSize.height) / scale;
    
    const dx = (maxX - minX) / res;
    const dy = (maxY - minY) / res;
    
    const v = new Float32Array((res + 1) * (res + 1));
    const idx = (i, j) => i * (res + 1) + j;
    
    for (let i = 0; i <= res; i++) {
      const x = minX + i * dx;
      for (let j = 0; j <= res; j++) {
        const y = minY + j * dy;
        v[idx(i, j)] = currentFunc.f(x, y);
      }
    }
    
    const edgesForCase = [
      [], [3, 0], [0, 1], [3, 1], [1, 2], [0, 1, 2, 3], [0, 2], [3, 2],
      [2, 3], [0, 2], [0, 3, 1, 2], [1, 2], [3, 1], [0, 1], [3, 0], []
    ];
    
    let path = '';
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const v0 = v[idx(i, j + 1)]; // TL
        const v1 = v[idx(i + 1, j + 1)]; // TR
        const v2 = v[idx(i + 1, j)]; // BR
        const v3 = v[idx(i, j)]; // BL
        
        let caseIdx = 0;
        if (v0 > 0) caseIdx |= 1;
        if (v1 > 0) caseIdx |= 2;
        if (v2 > 0) caseIdx |= 4;
        if (v3 > 0) caseIdx |= 8;
        
        if (caseIdx === 0 || caseIdx === 15) continue;
        
        const x0 = minX + i * dx;
        const x1 = minX + (i + 1) * dx;
        const y0 = minY + (j + 1) * dy;
        const y1 = minY + j * dy;
        
        const lerp = (va, vb, a, b) => a + (b - a) * (va / (va - vb || 1e-5));
        const pt = (edge) => {
          if (edge === 0) return { x: lerp(v0, v1, x0, x1), y: y0 };
          if (edge === 1) return { x: x1, y: lerp(v1, v2, y0, y1) };
          if (edge === 2) return { x: lerp(v3, v2, x0, x1), y: y1 };
          if (edge === 3) return { x: x0, y: lerp(v0, v3, y0, y1) };
        };
        
        const appendLine = (eA, eB) => {
          const pA = pt(eA), pB = pt(eB);
          const pxA = toPx(pA.x, pA.y), pxB = toPx(pB.x, pB.y);
          path += `M ${pxA.px} ${pxA.py} L ${pxB.px} ${pxB.py} `;
        };
        
        const edges = edgesForCase[caseIdx];
        if (edges.length === 2) {
          appendLine(edges[0], edges[1]);
        } else if (edges.length === 4) {
          appendLine(edges[0], edges[1]);
          appendLine(edges[2], edges[3]);
        }
      }
    }
    return path;
  };

  const getFunctionPath = (funcToDraw) => {
    const minX = Math.min(currentFunc.a, currentFunc.b);
    const maxX = Math.max(currentFunc.a, currentFunc.b);
    let d = '';
    const step = (maxX - minX) / 500;
    
    let first = true;
    for (let x = minX; x <= maxX; x += step) {
      const y = funcToDraw(x);
      if (isNaN(y) || !isFinite(y)) {
        first = true;
        continue;
      }
      const { px, py } = toPx(x, y);
      if (py < -5000 || py > 5000) {
        first = true;
        continue;
      }
      
      if (first) {
        d += `M ${px} ${py} `;
        first = false;
      } else {
        d += `L ${px} ${py} `;
      }
    }
    
    const yMax = funcToDraw(maxX);
    if (!isNaN(yMax) && isFinite(yMax)) {
      const pMax = toPx(maxX, yMax);
      if (!first) {
        d += `L ${pMax.px} ${pMax.py}`;
      }
    }
    
    return d;
  };

  return (
    <div className="riemann-container">
      {/* Sidebar Controls */}
      <div className="riemann-sidebar">
        <h3 className="riemann-title">Diện tích hình phẳng</h3>
        
        <div className="control-group">
          <label>Hàm số f(x)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div>
              <math-field 
                ref={mfRef} 
                style={{ 
                  width: '100%', 
                  fontSize: '18px', 
                  padding: '8px', 
                  backgroundColor: 'var(--surface-color)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)' 
                }}
              ></math-field>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>Từ a = </label>
                <input 
                  type="number" 
                  className="func-select" 
                  value={customA} 
                  onChange={(e) => setCustomA(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>Đến b = </label>
                <input 
                  type="number" 
                  className="func-select" 
                  value={customB} 
                  onChange={(e) => setCustomB(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={useTwoFuncs} 
              onChange={e => setUseTwoFuncs(e.target.checked)} 
            />
            Giới hạn bởi hai hàm số
          </label>
        </div>
        
        {useTwoFuncs && (
          <div className="control-group" style={{ marginTop: '10px' }}>
            <label>Hàm số g(x)</label>
            <div style={{ marginTop: '10px' }}>
              <math-field 
                ref={mfGRef} 
                style={{ 
                  width: '100%', 
                  fontSize: '18px', 
                  padding: '8px', 
                  backgroundColor: 'var(--surface-color)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)' 
                }}
              ></math-field>
            </div>
          </div>
        )}

        {!currentFunc.isImplicit && (
          <>
            <div className="control-group">
              <label>Cách chọn điểm</label>
              <div className="method-selector">
                <button 
                  className={`method-btn ${method === 'left' ? 'active' : ''}`}
                  onClick={() => setMethod('left')}
                >
                  Trái
                </button>
                <button 
                  className={`method-btn ${method === 'mid' ? 'active' : ''}`}
                  onClick={() => setMethod('mid')}
                >
                  Giữa
                </button>
                <button 
                  className={`method-btn ${method === 'right' ? 'active' : ''}`}
                  onClick={() => setMethod('right')}
                >
                  Phải
                </button>
              </div>
            </div>

            <div className="control-group">
              <div className="slider-container">
                <div className="slider-header">
                  <span>Số hình chữ nhật (n)</span>
                  <span className="slider-val">{n}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={n} 
                  onChange={(e) => setN(parseInt(e.target.value))} 
                />
              </div>
            </div>
          </>
        )}

        <div className="stats-card">
          {!currentFunc.isImplicit ? (
            <>
              <div className="stat-row">
                <span className="stat-label">Khoảng xét tích phân:</span>
                <span className="stat-val">[{formatNum(currentFunc.a, 1)}; {formatNum(currentFunc.b, 1)}]</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
              <div className="stat-row">
                <span className="stat-label">Diện tích tính bằng tích phân (S):</span>
                <span className="stat-val exact">{formatNum(exactArea)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Diện tích xấp xỉ (Sₙ):</span>
                <span className="stat-val approx">{formatNum(approxArea)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Sai số tuyệt đối |S - Sₙ|:</span>
                <span className="stat-val error">{formatNum(error)}</span>
              </div>
            </>
          ) : (
            <div className="stat-row" style={{ justifyContent: 'center' }}>
              <span className="stat-label">Đang hiển thị đồ thị hàm ẩn (vd: Đường tròn)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="riemann-main">
        <div 
          className="svg-container"
          ref={svgRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg width="100%" height="100%">
            {/* Defs for patterns */}
            <defs>
              <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8">
                <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* Grid */}
            {renderGrid()}
            
            {/* Riemann Rectangles */}
            {rects.map((rect, i) => {
              const { px: px1, py: py1 } = toPx(rect.xMath, rect.y1);
              const { px: px2, py: py2 } = toPx(rect.xMath + rect.wMath, rect.y2);
              
              const x = px1;
              const y = Math.min(py1, py2);
              const w = Math.abs(toPx(rect.wMath, 0).px - cx);
              const h = Math.abs(py1 - py2);

              return (
                <g key={`rect-${i}`}>
                  <rect 
                    x={x} 
                    y={y} 
                    width={w} 
                    height={h} 
                    fill="url(#hatch)" 
                    stroke="#2563eb" 
                    strokeWidth="1.5" 
                    opacity="0.8"
                  />
                  {/* Point at which the function is evaluated */}
                  {n <= 30 && (
                    <>
                      <circle 
                        cx={toPx(rect.evalX, rect.y1).px} 
                        cy={toPx(rect.evalX, rect.y1).py} 
                        r="3" 
                        fill="#ef4444" 
                      />
                      {useTwoFuncs && (
                        <circle 
                          cx={toPx(rect.evalX, rect.y2).px} 
                          cy={toPx(rect.evalX, rect.y2).py} 
                          r="3" 
                          fill="#f59e0b" 
                        />
                      )}
                    </>
                  )}
                </g>
              );
            })}

            {/* Function Curve */}
            {currentFunc.isImplicit ? (
              <path d={getImplicitPath()} fill="none" stroke="#0f172a" strokeWidth="2.5" />
            ) : (
              <>
                <path d={getFunctionPath(currentFunc.f)} fill="none" stroke="#0f172a" strokeWidth="2.5" />
                {useTwoFuncs && (
                  <path d={getFunctionPath(gFunc)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                )}
              </>
            )}

            {/* Highlight integral domain on x-axis */}
            <line 
              x1={toPx(currentFunc.a, 0).px} 
              y1={cy} 
              x2={toPx(currentFunc.b, 0).px} 
              y2={cy} 
              stroke="#ef4444" 
              strokeWidth="4" 
            />
            {/* Domain text markers */}
            <text x={toPx(currentFunc.a, 0).px} y={cy + 25} fill="#ef4444" fontWeight="bold" textAnchor="middle">a</text>
            <text x={toPx(currentFunc.b, 0).px} y={cy + 25} fill="#ef4444" fontWeight="bold" textAnchor="middle">b</text>

            <text x="20" y="30" fill="#64748b" fontSize="14" fontWeight="500">
              <tspan>Kéo chuột để di chuyển đồ thị</tspan>
              <tspan x="20" dy="20">Cuộn chuột để thu/phóng</tspan>
            </text>
          </svg>
        </div>

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
      </div>
    </div>
  );
};

export default RiemannSum;
