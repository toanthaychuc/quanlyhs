import React, { useState, useRef, useEffect } from 'react';
import './SetOperations.css';

const compileExpression = (expr) => {
  if (!expr || expr.trim() === '') return () => false;
  
  let s = expr.toUpperCase();
  s = s.replace(/U/g, '∪');
  s = s.replace(/VÀ/g, '∩');
  s = s.replace(/HOẶC/g, '∪');
  s = s.replace(/C_E/g, ' ! ');
  
  // Convert math operators to JS boolean operators
  s = s.replace(/∪/g, ' || ');
  s = s.replace(/∩/g, ' && ');
  s = s.replace(/\\/g, ' && ! ');
  
  s = s.replace(/E/g, ' true ');
  
  try {
    const fn = new Function('A', 'B', 'C', `return !!(${s});`);
    fn(true, true, true); // test
    return fn;
  } catch (err) {
    return null; // Invalid expression
  }
};

const SetOperations = () => {
  const [posA, setPosA] = useState({ x: 250, y: 150 });
  const [posB, setPosB] = useState({ x: 400, y: 150 });
  const [posC, setPosC] = useState({ x: 325, y: 280 });
  
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const [customExpr, setCustomExpr] = useState('');
  const [isValidExpr, setIsValidExpr] = useState(true);
  
  const svgRef = useRef(null);
  const inputRef = useRef(null);
  const radius = 110;

  const [regions, setRegions] = useState({
    R1: false, R2: false, R3: false, R4: false, 
    R5: false, R6: false, R7: false, R8: false
  });

  useEffect(() => {
    const fn = compileExpression(customExpr);
    if (fn) {
      setIsValidExpr(true);
      setRegions({
        R1: fn(true, false, false),
        R2: fn(false, true, false),
        R3: fn(false, false, true),
        R4: fn(true, true, false),
        R5: fn(false, true, true),
        R6: fn(true, false, true),
        R7: fn(true, true, true),
        R8: fn(false, false, false),
      });
    } else {
      setIsValidExpr(false);
      setRegions({ R1:false, R2:false, R3:false, R4:false, R5:false, R6:false, R7:false, R8:false });
    }
  }, [customExpr]);

  const getMousePosition = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    
    // Create an SVG point
    const pt = svg.createSVGPoint();
    
    if (e.touches && e.touches.length > 0) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }
    
    // Convert to SVG coordinates
    const ctm = svg.getScreenCTM();
    if (ctm) {
      return pt.matrixTransform(ctm.inverse());
    }
    return { x: pt.x, y: pt.y };
  };

  const handleMouseDown = (e, circle) => {
    e.stopPropagation();
    const posSVG = getMousePosition(e);
    let pos = posA;
    if (circle === 'B') pos = posB;
    if (circle === 'C') pos = posC;
    setOffset({ x: posSVG.x - pos.x, y: posSVG.y - pos.y });
    setDragging(circle);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const posSVG = getMousePosition(e);
    const x = posSVG.x - offset.x;
    const y = posSVG.y - offset.y;
    if (dragging === 'A') setPosA({ x, y });
    else if (dragging === 'B') setPosB({ x, y });
    else if (dragging === 'C') setPosC({ x, y });
  };

  const handleMouseUp = () => setDragging(null);
  
  const handleTouchStart = (e, circle) => {
    e.stopPropagation();
    const posSVG = getMousePosition(e);
    let pos = posA;
    if (circle === 'B') pos = posB;
    if (circle === 'C') pos = posC;
    setOffset({ x: posSVG.x - pos.x, y: posSVG.y - pos.y });
    setDragging(circle);
  };
  
  const handleTouchMove = (e) => {
    if (!dragging) return;
    // e.preventDefault(); // Moved to passive:false listener if needed, but here it might cause passive event warnings
    const posSVG = getMousePosition(e);
    const x = posSVG.x - offset.x;
    const y = posSVG.y - offset.y;
    if (dragging === 'A') setPosA({ x, y });
    else if (dragging === 'B') setPosB({ x, y });
    else if (dragging === 'C') setPosC({ x, y });
  };

  const insertChar = (char) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      const newExpr = customExpr.substring(0, start) + char + customExpr.substring(end);
      setCustomExpr(newExpr);
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + char.length, start + char.length);
      }, 0);
    } else {
      setCustomExpr(customExpr + char);
    }
  };

  const fillColor = "rgba(59, 130, 246, 0.4)";

  return (
    <div className="set-ops-container">
      <div className="set-ops-controls">
        <h3>Các Phép Toán Trên Tập Hợp</h3>
        
        <div className="custom-expr-area">
          <label className="expr-label">Nhập phép toán (Ví dụ: <span className="math-text">A ∪ (B \ C)</span>):</label>
          <div className={`expr-input-wrapper ${!isValidExpr && customExpr !== '' ? 'invalid' : ''}`}>
            <input 
              ref={inputRef}
              type="text" 
              value={customExpr}
              onChange={(e) => setCustomExpr(e.target.value)}
              className="expr-input math-text"
              placeholder="A, B, C, E, ∪, ∩, \, (, )"
            />
          </div>
          
          <div className="expr-keyboard">
            <button onClick={() => insertChar('A')} className="math-text">A</button>
            <button onClick={() => insertChar('B')} className="math-text">B</button>
            <button onClick={() => insertChar('C')} className="math-text">C</button>
            <button onClick={() => insertChar('E')} className="math-text" title="Tập vũ trụ">E</button>
            <div className="kbd-divider"></div>
            <button onClick={() => insertChar(' ∪ ')}>∪</button>
            <button onClick={() => insertChar(' ∩ ')}>∩</button>
            <button onClick={() => insertChar(' \\ ')}>\</button>
            <button onClick={() => insertChar('C_E ')}>C<sub>E</sub></button>
            <button onClick={() => insertChar('(')}>(</button>
            <button onClick={() => insertChar(')')}>)</button>
            <div className="kbd-divider"></div>
            <button className="clear-btn" onClick={() => setCustomExpr('')}>Xóa</button>
          </div>
        </div>

      </div>
      
      <div className="svg-container">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove} 
          onMouseUp={handleMouseUp} 
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className="set-ops-svg"
        >
          <defs>
            <clipPath id="clipA"><circle cx={posA.x} cy={posA.y} r={radius} /></clipPath>
            <clipPath id="clipB"><circle cx={posB.x} cy={posB.y} r={radius} /></clipPath>
            <clipPath id="clipC"><circle cx={posC.x} cy={posC.y} r={radius} /></clipPath>
            
            <mask id="mask_notA">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx={posA.x} cy={posA.y} r={radius} fill="black" />
            </mask>
            <mask id="mask_notB">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx={posB.x} cy={posB.y} r={radius} fill="black" />
            </mask>
            <mask id="mask_notC">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx={posC.x} cy={posC.y} r={radius} fill="black" />
            </mask>
            
            <mask id="mask_notB_notC">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx={posB.x} cy={posB.y} r={radius} fill="black" />
              <circle cx={posC.x} cy={posC.y} r={radius} fill="black" />
            </mask>
            <mask id="mask_notA_notC">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx={posA.x} cy={posA.y} r={radius} fill="black" />
              <circle cx={posC.x} cy={posC.y} r={radius} fill="black" />
            </mask>
            <mask id="mask_notA_notB">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx={posA.x} cy={posA.y} r={radius} fill="black" />
              <circle cx={posB.x} cy={posB.y} r={radius} fill="black" />
            </mask>
            <mask id="mask_notA_notB_notC">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <circle cx={posA.x} cy={posA.y} r={radius} fill="black" />
              <circle cx={posB.x} cy={posB.y} r={radius} fill="black" />
              <circle cx={posC.x} cy={posC.y} r={radius} fill="black" />
            </mask>
          </defs>

          {/* Universe Background */}
          <rect x="0" y="0" width="100%" height="100%" fill="#f8fafc" rx="8" />
          <text x="20" y="30" fill="#64748b" fontWeight="bold"   fontSize="20">E</text>

          {/* Render the 8 mutually exclusive regions based on logic evaluation */}
          {regions.R1 && <circle cx={posA.x} cy={posA.y} r={radius} fill={fillColor} mask="url(#mask_notB_notC)" />}
          {regions.R2 && <circle cx={posB.x} cy={posB.y} r={radius} fill={fillColor} mask="url(#mask_notA_notC)" />}
          {regions.R3 && <circle cx={posC.x} cy={posC.y} r={radius} fill={fillColor} mask="url(#mask_notA_notB)" />}
          
          {regions.R4 && <circle cx={posA.x} cy={posA.y} r={radius} fill={fillColor} clipPath="url(#clipB)" mask="url(#mask_notC)" />}
          {regions.R5 && <circle cx={posB.x} cy={posB.y} r={radius} fill={fillColor} clipPath="url(#clipC)" mask="url(#mask_notA)" />}
          {regions.R6 && <circle cx={posC.x} cy={posC.y} r={radius} fill={fillColor} clipPath="url(#clipA)" mask="url(#mask_notB)" />}
          
          {regions.R7 && <g clipPath="url(#clipC)"><circle cx={posA.x} cy={posA.y} r={radius} fill={fillColor} clipPath="url(#clipB)" /></g>}
          
          {regions.R8 && <rect x="0" y="0" width="100%" height="100%" fill={fillColor} mask="url(#mask_notA_notB_notC)" />}

          {/* Base outlines (dashed) */}
          <circle cx={posA.x} cy={posA.y} r={radius} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
          <circle cx={posB.x} cy={posB.y} r={radius} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
          <circle cx={posC.x} cy={posC.y} r={radius} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />

          {/* Interactive Overlays */}
          <g 
            onMouseDown={(e) => handleMouseDown(e, 'A')} 
            onTouchStart={(e) => handleTouchStart(e, 'A')}
            style={{ cursor: 'grab' }}
          >
            <circle cx={posA.x} cy={posA.y} r={radius} fill="transparent" stroke="#3b82f6" strokeWidth="3" />
            <text x={posA.x - radius - 30} y={posA.y - radius + 10} fill="#1e40af" fontWeight="bold" fontSize="26"  >A</text>
          </g>

          <g 
            onMouseDown={(e) => handleMouseDown(e, 'B')}
            onTouchStart={(e) => handleTouchStart(e, 'B')}
            style={{ cursor: 'grab' }}
          >
            <circle cx={posB.x} cy={posB.y} r={radius} fill="transparent" stroke="#ef4444" strokeWidth="3" />
            <text x={posB.x + radius + 15} y={posB.y - radius + 10} fill="#991b1b" fontWeight="bold" fontSize="26"  >B</text>
          </g>

          <g 
            onMouseDown={(e) => handleMouseDown(e, 'C')}
            onTouchStart={(e) => handleTouchStart(e, 'C')}
            style={{ cursor: 'grab' }}
          >
            <circle cx={posC.x} cy={posC.y} r={radius} fill="transparent" stroke="#22c55e" strokeWidth="3" />
            <text x={posC.x - 10} y={posC.y + radius + 35} fill="#166534" fontWeight="bold" fontSize="26"  >C</text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default SetOperations;
