import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, MousePointer2, ChevronLeft, ChevronRight } from 'lucide-react';
import './DerivativeMeaning.css';

const DerivativeMeaning = () => {
  const [x0, setX0] = useState(1);
  const [dx, setDx] = useState(2);
  const [showTangent, setShowTangent] = useState(false);
  
  const svgRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(null); // 'x0', 'M', or null
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStartCanvas, setDragStartCanvas] = useState({ x: 0, y: 0 });
  
  const [scale, setScale] = useState(60); // 60px = 1 unit

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
  const cy = svgSize.height * 0.75 + offset.y; // Origin slightly lower

  const toPx = (x, y) => {
    return {
      px: cx + x * scale,
      py: cy - y * scale
    };
  };

  const toMath = (px, py) => {
    return {
      x: (px - cx) / scale,
      y: (cy - py) / scale
    };
  };

  const f = (x) => 0.5 * x * x - 2;
  const df = (x) => x;

  const y0 = f(x0);
  const x = x0 + dx;
  const y = f(x);

  const dy = y - y0;
  const secantSlope = dx !== 0 ? dy / dx : df(x0);
  const tangentSlope = df(x0);

  const handlePointerDown = (e, point) => {
    if (e.button && e.button !== 0) return;
    e.stopPropagation();
    setIsDragging(point);
  };

  const handlePointerDownCanvas = (e) => {
    if (e.button && e.button !== 0) return;
    setIsDraggingCanvas(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setDragStartCanvas({ x: clientX - offset.x, y: clientY - offset.y });
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

  const handleResetPan = () => {
    setOffset({ x: 0, y: 0 });
    setScale(60);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging || !svgRef.current) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = clientX - rect.left;
      
      let mathX = (svgX - cx) / scale;
      
      // Snap to 0.1 increments
      mathX = Math.round(mathX * 10) / 10;
      
      if (isDragging === 'x0') {
        if (mathX > 4) mathX = 4;
        if (mathX < -4) mathX = -4;
        setX0(mathX);
      } else if (isDragging === 'M') {
        let newDx = mathX - x0;
        newDx = Math.round(newDx * 10) / 10;
        if (newDx > 5) newDx = 5;
        if (newDx < -5) newDx = -5;
        setDx(newDx);
      }
    };

    const handleMoveCanvas = (e) => {
      if (!isDraggingCanvas) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      setOffset({ x: clientX - dragStartCanvas.x, y: clientY - dragStartCanvas.y });
    };

    const handleUp = () => {
      setIsDragging(null);
      setIsDraggingCanvas(false);
    };

    if (isDragging || isDraggingCanvas) {
      window.addEventListener('mousemove', isDragging ? handleMove : handleMoveCanvas);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', isDragging ? handleMove : handleMoveCanvas, { passive: false });
      window.addEventListener('touchend', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', isDragging ? handleMove : handleMoveCanvas);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', isDragging ? handleMove : handleMoveCanvas);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, isDraggingCanvas, cx, cy, scale, x0, dragStartCanvas]);

  // Curve path
  const getCurvePath = () => {
    let path = "";
    for (let i = -10; i <= 10; i += 0.1) {
      const { px, py } = toPx(i, f(i));
      if (i === -10) path += `M ${px} ${py} `;
      else path += `L ${px} ${py} `;
    }
    return path;
  };

  // Secant Line
  const getSecantLine = () => {
    // line equation: y - y0 = secantSlope * (x_val - x0)
    // x_val = -10 to 10
    const { px: px1, py: py1 } = toPx(-10, secantSlope * (-10 - x0) + y0);
    const { px: px2, py: py2 } = toPx(10, secantSlope * (10 - x0) + y0);
    return { px1, py1, px2, py2 };
  };

  // Tangent Line
  const getTangentLine = () => {
    const { px: px1, py: py1 } = toPx(-10, tangentSlope * (-10 - x0) + y0);
    const { px: px2, py: py2 } = toPx(10, tangentSlope * (10 - x0) + y0);
    return { px1, py1, px2, py2 };
  };

  const p0 = toPx(x0, y0);
  const pM = toPx(x, y);
  const secant = getSecantLine();
  const tangent = getTangentLine();

  return (
    <div className="derivative-container">
      <div className="derivative-sidebar">
        <h3 className="derivative-title">Ý Nghĩa Của Đạo Hàm</h3>


        <div className="derivative-controls">
          <div className="control-group">
            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="math-text-normal" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                Điểm x₀ = {x0.toFixed(1).replace('.', ',')}
              </span>
              <div className="stepper-controls">
                <button onClick={() => setX0(prev => Math.max(-4, parseFloat((prev - 0.1).toFixed(1))))}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setX0(prev => Math.min(4, parseFloat((prev + 0.1).toFixed(1))))}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <input 
              type="range" min="-4" max="4" step="0.1" 
              value={x0} 
              onChange={(e) => setX0(parseFloat(e.target.value))} 
            />
          </div>

          <div className="control-group" style={{marginTop: '15px'}}>
            <div className="slider-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="math-text-normal" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                Số gia Δx = {dx.toFixed(1).replace('.', ',')}
              </span>
              <div className="stepper-controls">
                <button onClick={() => setDx(prev => Math.max(-5, parseFloat((prev - 0.1).toFixed(1))))}>
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setDx(prev => Math.min(5, parseFloat((prev + 0.1).toFixed(1))))}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <input 
              type="range" min="-5" max="5" step="0.1" 
              value={dx} 
              onChange={(e) => setDx(parseFloat(e.target.value))} 
            />
          </div>

          <div className="control-group checkbox-group" style={{marginTop: '15px'}}>
            <label>
              <input 
                type="checkbox" 
                checked={showTangent} 
                onChange={(e) => setShowTangent(e.target.checked)} 
              />
              Hiển thị tiếp tuyến tại M₀
            </label>
          </div>

          <div className="math-calculations">
            <div className="calc-item">
              <span className="calc-label">Hàm số:</span>
              <span className="calc-value math-text-normal">y = ½x² - 2</span>
            </div>
            <div className="calc-item">
              <span className="calc-label">Điểm M₀:</span>
              <span className="calc-value math-text-normal">
                ({x0.toFixed(1)}; {y0.toFixed(2)})
              </span>
            </div>
            <div className="calc-item" style={{ color: '#3b82f6' }}>
              <span className="calc-label">Điểm M:</span>
              <span className="calc-value math-text-normal">
                ({x.toFixed(1)}; {y.toFixed(2)})
              </span>
            </div>
            <hr className="calc-divider" />
            <div className="calc-item" style={{ color: '#10b981' }}>
              <span className="calc-label">Hệ số góc cát tuyến k:</span>
              <span className="calc-value math-text-normal">
                k = Δy/Δx = {dx !== 0 ? secantSlope.toFixed(2) : "Không xác định"}
              </span>
            </div>
            <div className="calc-item" style={{ color: '#f59e0b', fontWeight: 'bold' }}>
              <span className="calc-label">Hệ số góc tiếp tuyến f'(x₀):</span>
              <span className="calc-value math-text-normal">
                f'({x0.toFixed(1)}) = {tangentSlope.toFixed(2)}
              </span>
            </div>
            {Math.abs(dx) < 0.05 && (
              <div className="calc-item conclusion-text">
                Khi Δx → 0, điểm M → M₀, và Cát tuyến → Tiếp tuyến.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="derivative-main">
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
          onMouseDown={handlePointerDownCanvas}
          onTouchStart={handlePointerDownCanvas}
          style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
        >
          {/* Grid lines and Numbers */}
          <g className="grid-lines">
            {Array.from({ length: 30 }).map((_, i) => {
              const val = i - 15;
              const xPos = cx + val * scale;
              return (
                <g key={`vx-${i}`}>
                  <line x1={xPos} y1={0} x2={xPos} y2={svgSize.height} stroke="#e2e8f0" strokeWidth="1" />
                  {val !== 0 && (
                    <text x={xPos} y={cy + 15} fill="#64748b" fontSize="12" textAnchor="middle" className="math-text-normal">
                      {val}
                    </text>
                  )}
                </g>
              );
            })}
            {Array.from({ length: 30 }).map((_, i) => {
              const val = i - 15;
              const yPos = cy - val * scale;
              return (
                <g key={`hy-${i}`}>
                  <line x1={0} y1={yPos} x2={svgSize.width} y2={yPos} stroke="#e2e8f0" strokeWidth="1" />
                  {val !== 0 && (
                    <text x={cx - 8} y={yPos + 4} fill="#64748b" fontSize="12" textAnchor="end" className="math-text-normal">
                      {val}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Origin O */}
            <text x={cx - 10} y={cy + 15} fill="#64748b" fontSize="14" textAnchor="end" fontWeight="bold" className="math-text-normal">O</text>
          </g>

          {/* Axes */}
          <line x1={0} y1={cy} x2={svgSize.width} y2={cy} stroke="#475569" strokeWidth="2" />
          <line x1={cx} y1={0} x2={cx} y2={svgSize.height} stroke="#475569" strokeWidth="2" />

          {/* Curve */}
          <path d={getCurvePath()} fill="none" stroke="#64748b" strokeWidth="3" />

          {/* Delta x, Delta y triangle */}
          {dx !== 0 && (
            <>
              <line x1={p0.px} y1={p0.py} x2={pM.px} y2={p0.py} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
              <line x1={pM.px} y1={p0.py} x2={pM.px} y2={pM.py} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
              <text x={(p0.px + pM.px) / 2} y={p0.py + (dx > 0 ? 20 : -10)} fill="#475569" fontSize="14" textAnchor="middle" className="math-text-normal">Δx</text>
              <text x={pM.px + (dy > 0 ? 15 : -25)} y={(p0.py + pM.py) / 2} fill="#475569" fontSize="14" alignmentBaseline="middle" className="math-text-normal">Δy</text>
            </>
          )}

          {/* Tangent Line */}
          {(showTangent || Math.abs(dx) < 0.05) && (
            <line 
              x1={tangent.px1} y1={tangent.py1} 
              x2={tangent.px2} y2={tangent.py2} 
              stroke="#f59e0b" strokeWidth={Math.abs(dx) < 0.05 ? 3 : 2} 
            />
          )}

          {/* Secant Line */}
          {dx !== 0 && (
            <line 
              x1={secant.px1} y1={secant.py1} 
              x2={secant.px2} y2={secant.py2} 
              stroke="#10b981" strokeWidth="2.5" 
            />
          )}

          {/* Points */}
          <g
            className="draggable-point"
            onPointerDown={(e) => handlePointerDown(e, 'x0')}
            style={{ cursor: 'grab' }}
          >
            <circle cx={p0.px} cy={p0.py} r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
            <text x={p0.px - 15} y={p0.py - 15} fill="#ef4444" fontWeight="bold" className="math-text-normal">M₀</text>
          </g>

          {dx !== 0 && (
            <g
              className="draggable-point"
              onPointerDown={(e) => handlePointerDown(e, 'M')}
              style={{ cursor: 'grab' }}
            >
              <circle cx={pM.px} cy={pM.py} r="8" fill="#3b82f6" stroke="#ffffff" strokeWidth="3" />
              <text x={pM.px + 15} y={pM.py - 15} fill="#3b82f6" fontWeight="bold" className="math-text-normal">M</text>
            </g>
          )}

        </svg>
      </div>
    </div>
  );
};

export default DerivativeMeaning;
