import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import 'mathlive';
import './ConicSections.css';

const ConicSections = () => {
  const [activeTab, setActiveTab] = useState('ellipse');
  
  // Ellipse state
  const [a_el, setA_el] = useState(5);
  const [b_el, setB_el] = useState(3);
  
  // Hyperbola state
  const [a_hyp, setA_hyp] = useState(4);
  const [b_hyp, setB_hyp] = useState(3);
  
  // Parabola state
  const [p_par, setP_par] = useState(2); // y^2 = 2px -> focus at (p/2, 0)
  
  const [angle, setAngle] = useState(45);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(3);
  
  // Display Options
  const [showVertices, setShowVertices] = useState(false);
  const [showBaseRect, setShowBaseRect] = useState(false);
  const [showDirectrix, setShowDirectrix] = useState(false);
  const [showEccentricity, setShowEccentricity] = useState(false);
  const [showFocalRadii, setShowFocalRadii] = useState(false);

  const requestRef = useRef();
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [labelOffsets, setLabelOffsets] = useState({});
  const [draggingLabel, setDraggingLabel] = useState(null);

  const animate = () => {
    if (isPlaying) {
      setAngle(prev => (prev + 0.5) % 360);
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);

  // Coordinate system limits
  const VIEW_SIZE = 48 / zoom; 
  const scale = 500 / VIEW_SIZE;
  const toSvgX = (x) => 250 + x * scale;
  const toSvgY = (y) => 250 - y * scale;

  const fmt = (v, precision = 1) => {
    let numStr = Number(v.toFixed(precision)).toString();
    if (numStr === '-0') numStr = '0';
    return numStr.replace('.', ',');
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + zoomFactor, 10));
    } else {
      setZoom(prev => Math.max(prev - zoomFactor, 0.1));
    }
  };

  const handleMouseDownM = (e) => {
    if (isPlaying) return;
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleLabelMouseDown = (e, id, defDx, defDy) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    const currentOffset = labelOffsets[id] || { dx: defDx, dy: defDy };
    setDraggingLabel({
      id,
      startSvgX: svgP.x,
      startSvgY: svgP.y,
      startDx: currentOffset.dx,
      startDy: currentOffset.dy
    });
  };

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
    
    if (draggingLabel) {
      const dx = draggingLabel.startDx + (svgP.x - draggingLabel.startSvgX);
      const dy = draggingLabel.startDy + (svgP.y - draggingLabel.startSvgY);
      setLabelOffsets(prev => ({ ...prev, [draggingLabel.id]: { dx, dy } }));
      return;
    }

    if (!isDragging) return;
    
    const mx = (svgP.x - 250) / scale;
    const my = (250 - svgP.y) / scale;

    if (activeTab === 'ellipse') {
      const rad = Math.atan2(my / b_el, mx / a_el);
      let deg = (rad * 180) / Math.PI;
      if (deg < 0) deg += 360;
      setAngle(deg);
    } 
    else if (activeTab === 'hyperbola') {
      let t = Math.asinh(my / b_hyp);
      t = Math.max(-2, Math.min(2, t));
      let rad = Math.asin(t / 2);
      if (mx < 0) {
        rad = Math.PI - rad;
      }
      let deg = (rad * 180) / Math.PI;
      if (deg < 0) deg += 360;
      setAngle(deg);
    }
    else if (activeTab === 'parabola') {
      let t = my;
      t = Math.max(-8, Math.min(8, t));
      const rad = Math.asin(t / 8);
      let deg = (rad * 180) / Math.PI;
      if (deg < 0) deg += 360;
      setAngle(deg);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingLabel(null);
  };

  const renderLabel = (id, px, py, defDx, defDy, fill, text, textAnchor="start", fontSize="13") => {
    const offset = labelOffsets[id] || { dx: defDx, dy: defDy };
    return (
      <text
        key={id}
        x={toSvgX(px) + offset.dx}
        y={toSvgY(py) + offset.dy}
        fill={fill}
        fontSize={fontSize}
        fontWeight="bold"
        textAnchor={textAnchor}
        style={{ cursor: 'move', userSelect: 'none' }}
        onMouseDown={(e) => handleLabelMouseDown(e, id, defDx, defDy)}
      >
        {text}
      </text>
    );
  };

  const renderGridAndAxes = () => {
    // Calculate visible range
    const halfView = VIEW_SIZE / 2;
    
    // Dynamic nice step algorithm
    const idealLabelStep = VIEW_SIZE / 10; 
    const pow10 = Math.pow(10, Math.floor(Math.log10(idealLabelStep)));
    const fraction = idealLabelStep / pow10;
    
    let nice = 1;
    if (fraction <= 1.5) nice = 1;
    else if (fraction <= 3.5) nice = 2;
    else if (fraction <= 7.5) nice = 5;
    else nice = 10;
    
    const labelStep = nice * pow10;
    const gridStep = labelStep;
    
    const minVal = -halfView;
    const maxVal = halfView;
    
    const lines = [];
    const labels = [];
    
    // Snap to gridStep to keep numbers round
    const startVal = Math.floor(minVal / gridStep) * gridStep;

    for (let val = startVal; val <= maxVal + gridStep; val += gridStep) {
      const v = parseFloat(val.toFixed(2));
      lines.push(
        <React.Fragment key={`grid-${v}`}>
          <line x1={toSvgX(v)} y1={0} x2={toSvgX(v)} y2={500} />
          <line x1={0} y1={toSvgY(v)} x2={500} y2={toSvgY(v)} />
        </React.Fragment>
      );
      
      // Add label if it falls exactly on a labelStep
      if (v !== 0 && Math.abs(v % labelStep) < gridStep * 0.1) {
        labels.push(
          <React.Fragment key={`label-${v}`}>
            <text x={toSvgX(v)} y={265} fill="#94a3b8" fontSize="11" textAnchor="middle">{v.toString().replace('.', ',')}</text>
            <text x={242} y={toSvgY(v) + 4} fill="#94a3b8" fontSize="11" textAnchor="end">{v.toString().replace('.', ',')}</text>
          </React.Fragment>
        );
      }
    }
    
    return (
      <>
        <g className="grid" stroke="#e2e8f0" strokeWidth="1">
          {lines}
        </g>
        <line x1={0} y1={250} x2={500} y2={250} stroke="#94a3b8" strokeWidth="2" />
        <line x1={250} y1={0} x2={250} y2={500} stroke="#94a3b8" strokeWidth="2" />
        <g className="axis-labels">
          {labels}
        </g>
        <text x={485} y={240} fill="#64748b" fontSize="14" fontWeight="bold">x</text>
        <text x={260} y={15} fill="#64748b" fontSize="14" fontWeight="bold">y</text>
        <text x={235} y={265} fill="#64748b" fontSize="14" fontWeight="bold">O</text>
      </>
    );
  };

  const mCursorStyle = { cursor: isPlaying ? 'default' : (isDragging ? 'grabbing' : 'grab') };

  const renderEllipse = () => {
    const isHorizontal = a_el >= b_el;
    const a = isHorizontal ? a_el : b_el; // major axis
    const c = Math.sqrt(Math.abs(a_el * a_el - b_el * b_el));
    const e_val = c / a;
    
    const F1 = isHorizontal ? { x: -c, y: 0 } : { x: 0, y: -c };
    const F2 = isHorizontal ? { x: c, y: 0 } : { x: 0, y: c };
    
    const rad = angle * Math.PI / 180;
    const M = { x: a_el * Math.cos(rad), y: b_el * Math.sin(rad) };
    
    const mf1 = Math.sqrt(Math.pow(M.x - F1.x, 2) + Math.pow(M.y - F1.y, 2));
    const mf2 = Math.sqrt(Math.pow(M.x - F2.x, 2) + Math.pow(M.y - F2.y, 2));

    const dirVal = a * a / c; // a/e

    return {
      svg: (
        <>
          {showBaseRect && (
            <>
              <rect x={toSvgX(-a_el)} y={toSvgY(b_el)} width={(2*a_el)*scale} height={(2*b_el)*scale} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
              {renderLabel('el_P', -a_el, b_el, -10, -10, '#64748b', 'P', 'end', '14')}
              {renderLabel('el_Q', -a_el, -b_el, -10, 20, '#64748b', 'Q', 'end', '14')}
              {renderLabel('el_R', a_el, -b_el, 10, 20, '#64748b', 'R', 'start', '14')}
              {renderLabel('el_S', a_el, b_el, 10, -10, '#64748b', 'S', 'start', '14')}
            </>
          )}

          {showDirectrix && c > 0 && (
            <>
              {isHorizontal ? (
                <>
                  <line x1={toSvgX(-dirVal)} y1={toSvgY(-18/zoom)} x2={toSvgX(-dirVal)} y2={toSvgY(18/zoom)} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1={toSvgX(dirVal)} y1={toSvgY(-18/zoom)} x2={toSvgX(dirVal)} y2={toSvgY(18/zoom)} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
                  {renderLabel('el_D1', -dirVal, 16/zoom, -10, 0, '#2563eb', `Δ₁: x=${fmt(-dirVal)}`, 'end', '14')}
                  {renderLabel('el_D2', dirVal, 16/zoom, 10, 0, '#2563eb', `Δ₂: x=${fmt(dirVal)}`, 'start', '14')}
                </>
              ) : (
                <>
                  <line x1={toSvgX(-18/zoom)} y1={toSvgY(-dirVal)} x2={toSvgX(18/zoom)} y2={toSvgY(-dirVal)} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1={toSvgX(-18/zoom)} y1={toSvgY(dirVal)} x2={toSvgX(18/zoom)} y2={toSvgY(dirVal)} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
                  {renderLabel('el_D1_v', -18/zoom, -dirVal, 0, -10, '#2563eb', `Δ₁: y=${fmt(-dirVal)}`, 'start', '14')}
                  {renderLabel('el_D2_v', 18/zoom, dirVal, 0, 20, '#2563eb', `Δ₂: y=${fmt(dirVal)}`, 'end', '14')}
                </>
              )}
            </>
          )}

          <ellipse cx={250} cy={250} rx={a_el * scale} ry={b_el * scale} fill="rgba(79, 70, 229, 0.1)" stroke="#4f46e5" strokeWidth="3" />
          
          <line x1={toSvgX(F1.x)} y1={toSvgY(F1.y)} x2={toSvgX(M.x)} y2={toSvgY(M.y)} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
          <line x1={toSvgX(F2.x)} y1={toSvgY(F2.y)} x2={toSvgX(M.x)} y2={toSvgY(M.y)} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
          
          <circle cx={toSvgX(F1.x)} cy={toSvgY(F1.y)} r="4" fill="#ef4444" />
          <circle cx={toSvgX(F2.x)} cy={toSvgY(F2.y)} r="4" fill="#ef4444" />
          {renderLabel('el_F1', F1.x, F1.y, 10, 20, '#ef4444', showVertices ? `F₁(${fmt(F1.x)}; ${fmt(F1.y)})` : 'F₁', 'start', '14')}
          {renderLabel('el_F2', F2.x, F2.y, -10, 20, '#ef4444', showVertices ? `F₂(${fmt(F2.x)}; ${fmt(F2.y)})` : 'F₂', 'end', '14')}

          {showVertices && (
            <>
              <circle cx={toSvgX(-a_el)} cy={toSvgY(0)} r="4" fill="#10b981" />
              {renderLabel('el_A1', -a_el, 0, -10, 20, '#10b981', `A₁(${fmt(-a_el)}; 0)`, 'end')}
              <circle cx={toSvgX(a_el)} cy={toSvgY(0)} r="4" fill="#10b981" />
              {renderLabel('el_A2', a_el, 0, 10, 20, '#10b981', `A₂(${fmt(a_el)}; 0)`)}
              <circle cx={toSvgX(0)} cy={toSvgY(-b_el)} r="4" fill="#10b981" />
              {renderLabel('el_B1', 0, -b_el, 10, 20, '#10b981', `B₁(0; ${fmt(-b_el)})`)}
              <circle cx={toSvgX(0)} cy={toSvgY(b_el)} r="4" fill="#10b981" />
              {renderLabel('el_B2', 0, b_el, 10, -10, '#10b981', `B₂(0; ${fmt(b_el)})`)}
            </>
          )}

          <g onMouseDown={handleMouseDownM} style={mCursorStyle}>
            <circle cx={toSvgX(M.x)} cy={toSvgY(M.y)} r="12" fill="transparent" />
            <circle cx={toSvgX(M.x)} cy={toSvgY(M.y)} r="6" fill="#111827" />
          </g>
          {renderLabel('el_M', M.x, M.y, 10, -10, '#111827', `M(${fmt(M.x)}; ${fmt(M.y)})`, 'start', '15')}
        </>
      ),
      sidebar: (
        <>
          <div className="control-group">
            <label>Bán trục lớn (a): {fmt(a_el, 1)}</label>
            <input type="range" min="1" max="11" step="0.5" value={a_el} onChange={(e) => setA_el(Number(e.target.value))} className="conic-slider" />
          </div>
          <div className="control-group">
            <label>Bán trục nhỏ (b): {fmt(b_el, 1)}</label>
            <input type="range" min="1" max="11" step="0.5" value={b_el} onChange={(e) => setB_el(Number(e.target.value))} className="conic-slider" />
          </div>
          <div className="math-panel">
            <h4>Định nghĩa Elip:</h4>
            <div className="math-display highlighted">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`MF_1 + MF_2 = 2${isHorizontal ? 'a' : 'b'} = ${fmt((2*a), 2)}`}
              </math-field>
            </div>
            <div className="math-calc">
              <span>MF₁ = {fmt(mf1, 2)}</span><span>+</span><span>MF₂ = {fmt(mf2, 2)}</span><span>=</span>
              <strong>{fmt((mf1 + mf2), 2)}</strong>
            </div>

            <h4>Phương trình chính tắc:</h4>
            <div className="math-display">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`\\frac{x^2}{${fmt((a_el*a_el), 2)}} + \\frac{y^2}{${fmt((b_el*b_el), 2)}} = 1`}
              </math-field>
            </div>
            
            <h4>Tiêu cự (2c):</h4>
            <div className="math-display">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`c = \\sqrt{|${fmt(a_el, 1)}^2 - ${fmt(b_el, 1)}^2|} = ${fmt(c, 2)}`}
              </math-field>
            </div>

            {showVertices && (
              <>
                <h4>Tọa độ:</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`A_1(-a; 0) = A_1(${fmt(-a_el)}; 0), \\; A_2(a; 0) = A_2(${fmt(a_el)}; 0)`}
                  </math-field>
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`B_1(0; -b) = B_1(0; ${fmt(-b_el)}), \\; B_2(0; b) = B_2(0; ${fmt(b_el)})`}
                  </math-field>
                </div>
              </>
            )}

            {showBaseRect && (
              <>
                <h4>Hình chữ nhật cơ sở PQRS:</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`2a \\times 2b = ${fmt((2*a_el), 1)} \\times ${fmt((2*b_el), 1)}`}
                  </math-field>
                </div>
              </>
            )}

            {showFocalRadii && (
              <>
                <h4>Bán kính qua tiêu:</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`MF_1 = a + e${isHorizontal ? 'x_M' : 'y_M'} = ${fmt((a + e_val * (isHorizontal ? M.x : M.y)), 2)}`}
                  </math-field>
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`MF_2 = a - e${isHorizontal ? 'x_M' : 'y_M'} = ${fmt((a - e_val * (isHorizontal ? M.x : M.y)), 2)}`}
                  </math-field>
                </div>
              </>
            )}

            {showEccentricity && (
              <>
                <h4>Tâm sai (e):</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`e = \\frac{c}{${isHorizontal ? 'a' : 'b'}} = \\frac{${fmt(c, 2)}}{${fmt(isHorizontal ? a_el.toFixed(1) : b_el, 1)}} = ${fmt(e_val, 2)}`}
                  </math-field>
                </div>
              </>
            )}

            {showDirectrix && c > 0 && (
              <>
                <h4>Đường chuẩn (Δ):</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`\\Delta_{1,2}: ${isHorizontal ? 'x' : 'y'} = \\pm \\frac{${isHorizontal ? 'a' : 'b'}}{e} = \\pm \\frac{${fmt((isHorizontal ? a_el : b_el), 1)}}{${fmt(e_val, 2)}} = \\pm ${fmt(dirVal, 2)}`}
                  </math-field>
                </div>
              </>
            )}
          </div>
        </>
      )
    };
  };

  const renderHyperbola = () => {
    const c = Math.sqrt(a_hyp * a_hyp + b_hyp * b_hyp);
    const e_val = c / a_hyp;
    const F1 = { x: -c, y: 0 };
    const F2 = { x: c, y: 0 };
    const dirVal = a_hyp * a_hyp / c;
    
    // Hyperbola parametric: x = +/- a cosh(t), y = b sinh(t)
    const tRaw = Math.sin(angle * Math.PI / 180) * 2; // t from -2 to 2
    const branch = Math.cos(angle * Math.PI / 180) > 0 ? 1 : -1;
    const M = { x: branch * a_hyp * Math.cosh(tRaw), y: b_hyp * Math.sinh(tRaw) };
    
    const mf1 = Math.sqrt(Math.pow(M.x - F1.x, 2) + Math.pow(M.y - F1.y, 2));
    const mf2 = Math.sqrt(Math.pow(M.x - F2.x, 2) + Math.pow(M.y - F2.y, 2));

    const pts1 = [];
    const pts2 = [];
    for (let t = -3; t <= 3; t += 0.1) {
      pts1.push(`${toSvgX(a_hyp * Math.cosh(t))},${toSvgY(b_hyp * Math.sinh(t))}`);
      pts2.push(`${toSvgX(-a_hyp * Math.cosh(t))},${toSvgY(b_hyp * Math.sinh(t))}`);
    }

    return {
      svg: (
        <>
          {showBaseRect && (
            <>
              <rect x={toSvgX(-a_hyp)} y={toSvgY(b_hyp)} width={(2*a_hyp)*scale} height={(2*b_hyp)*scale} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
              {renderLabel('hyp_P', -a_hyp, b_hyp, -10, -10, '#64748b', 'P', 'end', '14')}
              {renderLabel('hyp_Q', -a_hyp, -b_hyp, -10, 20, '#64748b', 'Q', 'end', '14')}
              {renderLabel('hyp_R', a_hyp, -b_hyp, 10, 20, '#64748b', 'R', 'start', '14')}
              {renderLabel('hyp_S', a_hyp, b_hyp, 10, -10, '#64748b', 'S', 'start', '14')}
            </>
          )}

          {showDirectrix && (
            <>
              <line x1={toSvgX(-dirVal)} y1={toSvgY(-18/zoom)} x2={toSvgX(-dirVal)} y2={toSvgY(18/zoom)} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
              <line x1={toSvgX(dirVal)} y1={toSvgY(-18/zoom)} x2={toSvgX(dirVal)} y2={toSvgY(18/zoom)} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
              {renderLabel('hyp_D1', -dirVal, 16/zoom, -10, 0, '#2563eb', `Δ₁: x=${fmt(-dirVal)}`, 'end', '14')}
              {renderLabel('hyp_D2', dirVal, 16/zoom, 10, 0, '#2563eb', `Δ₂: x=${fmt(dirVal)}`, 'start', '14')}
            </>
          )}

          <line x1={toSvgX(-30/zoom)} y1={toSvgY(-30/zoom * b_hyp / a_hyp)} x2={toSvgX(30/zoom)} y2={toSvgY(30/zoom * b_hyp / a_hyp)} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
          <line x1={toSvgX(-30/zoom)} y1={toSvgY(30/zoom * b_hyp / a_hyp)} x2={toSvgX(30/zoom)} y2={toSvgY(-30/zoom * b_hyp / a_hyp)} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />

          <polyline points={pts1.join(' ')} fill="none" stroke="#4f46e5" strokeWidth="3" />
          <polyline points={pts2.join(' ')} fill="none" stroke="#4f46e5" strokeWidth="3" />
          
          <line x1={toSvgX(F1.x)} y1={toSvgY(F1.y)} x2={toSvgX(M.x)} y2={toSvgY(M.y)} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
          <line x1={toSvgX(F2.x)} y1={toSvgY(F2.y)} x2={toSvgX(M.x)} y2={toSvgY(M.y)} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
          
          <circle cx={toSvgX(F1.x)} cy={toSvgY(F1.y)} r="4" fill="#ef4444" />
          <circle cx={toSvgX(F2.x)} cy={toSvgY(F2.y)} r="4" fill="#ef4444" />
          {renderLabel('hyp_F1', F1.x, F1.y, -10, 20, '#ef4444', showVertices ? `F₁(${fmt(F1.x)}; ${fmt(F1.y)})` : 'F₁', 'end', '14')}
          {renderLabel('hyp_F2', F2.x, F2.y, 10, 20, '#ef4444', showVertices ? `F₂(${fmt(F2.x)}; ${fmt(F2.y)})` : 'F₂', 'start', '14')}

          {showVertices && (
            <>
              <circle cx={toSvgX(-a_hyp)} cy={toSvgY(0)} r="4" fill="#10b981" />
              {renderLabel('hyp_A1', -a_hyp, 0, 10, 20, '#10b981', `A₁(${fmt(-a_hyp)}; 0)`, 'start')}
              <circle cx={toSvgX(a_hyp)} cy={toSvgY(0)} r="4" fill="#10b981" />
              {renderLabel('hyp_A2', a_hyp, 0, -10, 20, '#10b981', `A₂(${fmt(a_hyp)}; 0)`, 'end')}
            </>
          )}

          <g onMouseDown={handleMouseDownM} style={mCursorStyle}>
            <circle cx={toSvgX(M.x)} cy={toSvgY(M.y)} r="12" fill="transparent" />
            <circle cx={toSvgX(M.x)} cy={toSvgY(M.y)} r="6" fill="#111827" />
          </g>
          {renderLabel('hyp_M', M.x, M.y, 10, -10, '#111827', `M(${fmt(M.x)}; ${fmt(M.y)})`, 'start', '15')}
        </>
      ),
      sidebar: (
        <>
          <div className="control-group">
            <label>Bán trục thực (a): {fmt(a_hyp, 1)}</label>
            <input type="range" min="1" max="10" step="0.5" value={a_hyp} onChange={(e) => setA_hyp(Number(e.target.value))} className="conic-slider" />
          </div>
          <div className="control-group">
            <label>Bán trục ảo (b): {fmt(b_hyp, 1)}</label>
            <input type="range" min="1" max="10" step="0.5" value={b_hyp} onChange={(e) => setB_hyp(Number(e.target.value))} className="conic-slider" />
          </div>
          <div className="math-panel">
            <h4>Định nghĩa Hypebol:</h4>
            <div className="math-display highlighted">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`|MF_1 - MF_2| = 2a = ${fmt((2*a_hyp), 2)}`}
              </math-field>
            </div>
            <div className="math-calc">
              <span>| {fmt(mf1, 2)} - {fmt(mf2, 2)} |</span><span>=</span>
              <strong>{fmt(Math.abs(mf1 - mf2), 2)}</strong>
            </div>

            <h4>Phương trình chính tắc:</h4>
            <div className="math-display">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`\\frac{x^2}{${fmt((a_hyp*a_hyp), 2)}} - \\frac{y^2}{${fmt((b_hyp*b_hyp), 2)}} = 1`}
              </math-field>
            </div>
            
            <h4>Tiêu cự (2c):</h4>
            <div className="math-display">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`c = \\sqrt{${fmt(a_hyp, 1)}^2 + ${fmt(b_hyp, 1)}^2} = ${fmt(c, 2)}`}
              </math-field>
            </div>

            {showVertices && (
              <>
                <h4>Tọa độ:</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`A_1(-a; 0) = A_1(${fmt(-a_hyp)}; 0), \\; A_2(a; 0) = A_2(${fmt(a_hyp)}; 0)`}
                  </math-field>
                </div>
              </>
            )}

            {showBaseRect && (
              <>
                <h4>Hình chữ nhật cơ sở PQRS:</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`2a \\times 2b = ${fmt((2*a_hyp), 1)} \\times ${fmt((2*b_hyp), 1)}`}
                  </math-field>
                </div>
              </>
            )}

            {showFocalRadii && (
              <>
                <h4>Bán kính qua tiêu:</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`MF_1 = |a + ex_M| = ${fmt(Math.abs(a_hyp + e_val * M.x), 2)}`}
                  </math-field>
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`MF_2 = |a - ex_M| = ${fmt(Math.abs(a_hyp - e_val * M.x), 2)}`}
                  </math-field>
                </div>
              </>
            )}

            {showEccentricity && (
              <>
                <h4>Tâm sai (e):</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`e = \\frac{c}{a} = \\frac{${fmt(c, 2)}}{${fmt(a_hyp, 1)}} = ${fmt(e_val, 2)}`}
                  </math-field>
                </div>
              </>
            )}

            {showDirectrix && (
              <>
                <h4>Đường chuẩn (Δ):</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`\\Delta_{1,2}: x = \\pm \\frac{a}{e} = \\pm \\frac{${fmt(a_hyp, 1)}}{${fmt(e_val, 2)}} = \\pm ${fmt(dirVal, 2)}`}
                  </math-field>
                </div>
              </>
            )}
          </div>
        </>
      )
    };
  };

  const renderParabola = () => {
    const p = p_par;
    const F = { x: p / 2, y: 0 };
    const directrixX = -p / 2;
    
    // Parabola parametric: y^2 = 2px -> y = t, x = t^2 / (2p)
    const t = Math.sin(angle * Math.PI / 180) * 8; // y from -8 to 8
    const M = { x: (t * t) / (2 * p), y: t };
    
    const mf = Math.sqrt(Math.pow(M.x - F.x, 2) + Math.pow(M.y - F.y, 2));
    const md = Math.abs(M.x - directrixX);

    const pts = [];
    for (let y = -12; y <= 12; y += 0.2) {
      pts.push(`${toSvgX((y * y) / (2 * p))},${toSvgY(y)}`);
    }

    return {
      svg: (
        <>
          {showDirectrix && (
            <>
              <line x1={toSvgX(directrixX)} y1={toSvgY(-18/zoom)} x2={toSvgX(directrixX)} y2={toSvgY(18/zoom)} stroke="#2563eb" strokeWidth="2" strokeDasharray="5,5" />
              {renderLabel('par_D', directrixX, 16/zoom, -10, 0, '#2563eb', `Δ: x=${fmt(directrixX)}`, 'end', '14')}
            </>
          )}

          <polyline points={pts.join(' ')} fill="none" stroke="#4f46e5" strokeWidth="3" />
          
          <line x1={toSvgX(F.x)} y1={toSvgY(F.y)} x2={toSvgX(M.x)} y2={toSvgY(M.y)} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
          <line x1={toSvgX(directrixX)} y1={toSvgY(M.y)} x2={toSvgX(M.x)} y2={toSvgY(M.y)} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx={toSvgX(directrixX)} cy={toSvgY(M.y)} r="3" fill="#ef4444" />
          <text x={toSvgX(directrixX) - 15} y={toSvgY(M.y) + 5} fill="#ef4444" fontSize="14">H</text>
          
          <circle cx={toSvgX(F.x)} cy={toSvgY(F.y)} r="4" fill="#ef4444" />
          {renderLabel('par_F', F.x, F.y, 10, 20, '#ef4444', showVertices ? `F(${fmt(F.x)}; ${fmt(F.y)})` : 'F', 'start', '14')}

          {showVertices && (
            <>
              <circle cx={toSvgX(0)} cy={toSvgY(0)} r="4" fill="#10b981" />
              {renderLabel('par_O', 0, 0, -10, 20, '#10b981', 'O(0; 0)', 'end')}
            </>
          )}

          <g onMouseDown={handleMouseDownM} style={mCursorStyle}>
            <circle cx={toSvgX(M.x)} cy={toSvgY(M.y)} r="12" fill="transparent" />
            <circle cx={toSvgX(M.x)} cy={toSvgY(M.y)} r="6" fill="#111827" />
          </g>
          {renderLabel('par_M', M.x, M.y, 10, -10, '#111827', `M(${fmt(M.x)}; ${fmt(M.y)})`, 'start', '15')}
        </>
      ),
      sidebar: (
        <>
          <div className="control-group">
            <label>Tham số tiêu (p): {fmt(p_par, 1)}</label>
            <input type="range" min="1" max="10" step="0.5" value={p_par} onChange={(e) => setP_par(Number(e.target.value))} className="conic-slider" />
          </div>
          
          <div className="math-panel">
            <h4>Định nghĩa Parabol:</h4>
            <div className="math-display highlighted">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`MF = d(M, \\Delta)`}
              </math-field>
            </div>
            <div className="math-calc">
              <span>MF = {fmt(mf, 2)}</span><span>;</span><span>MH = {fmt(md, 2)}</span>
            </div>

            <h4>Phương trình chính tắc:</h4>
            <div className="math-display">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`y^2 = 2px = ${fmt((2*p_par), 1)}x`}
              </math-field>
            </div>
            
            <h4>Tiêu điểm F:</h4>
            <div className="math-display">
              <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                {`F(\\frac{p}{2}; 0) = F(${fmt(p_par/2)}; 0)`}
              </math-field>
            </div>

            {showVertices && (
              <>
                <h4>Tọa độ:</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    O(0; 0)
                  </math-field>
                </div>
              </>
            )}

            {showFocalRadii && (
              <>
                <h4>Bán kính qua tiêu:</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`MF = x_M + \\frac{p}{2} = ${fmt((M.x + p_par/2), 2)}`}
                  </math-field>
                </div>
              </>
            )}

            {showEccentricity && (
              <>
                <h4>Tâm sai (e):</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    e = 1
                  </math-field>
                </div>
              </>
            )}

            {showDirectrix && (
              <>
                <h4>Đường chuẩn (Δ):</h4>
                <div className="math-display">
                  <math-field read-only style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1.2rem' }}>
                    {`\\Delta: x = -\\frac{p}{2} = -\\frac{${fmt(p_par, 1)}}{2} = ${fmt(directrixX)}`}
                  </math-field>
                </div>
              </>
            )}
          </div>
        </>
      )
    };
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'ellipse': return renderEllipse();
      case 'hyperbola': return renderHyperbola();
      case 'parabola': return renderParabola();
      default: return renderEllipse();
    }
  };

  const content = getActiveContent();

  return (
    <div className="conic-wrapper">
      <div className="conic-tabs">
        <button className={`conic-tab ${activeTab === 'ellipse' ? 'active' : ''}`} onClick={() => setActiveTab('ellipse')}>Elip</button>
        <button className={`conic-tab ${activeTab === 'hyperbola' ? 'active' : ''}`} onClick={() => setActiveTab('hyperbola')}>Hypebol</button>
        <button className={`conic-tab ${activeTab === 'parabola' ? 'active' : ''}`} onClick={() => setActiveTab('parabola')}>Parabol</button>
      </div>

      <div className="conic-container">
        <div className="conic-visualizer" onWheel={handleWheel}>
          <div className="interaction-hint">
            Cuộn chuột để Thu/Phóng
          </div>
          
          <svg 
            ref={svgRef}
            width="100%" 
            height="100%" 
            viewBox="0 0 500 500" 
            style={{ background: '#f8fafc' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {renderGridAndAxes()}
            {content.svg}
          </svg>

          {/* Controls Overlay */}
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => setZoom(prev => Math.min(prev + 0.1, 10))} title="Phóng to">
              <ZoomIn size={20} />
            </button>
            <button className="zoom-btn" onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.1))} title="Thu nhỏ">
              <ZoomOut size={20} />
            </button>
          </div>
        </div>

        <div className="conic-sidebar">
          <div className="card-header">
            <h3>Điều chỉnh thông số</h3>
            <button className={`btn-toggle-play ${isPlaying ? 'playing' : ''}`} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Tạm dừng M' : 'Di chuyển M'}
            </button>
          </div>
          
          <div className="control-group">
            <label>Tùy chọn hiển thị:</label>
            <div className="checkbox-grid">
              <label><input type="checkbox" checked={showVertices} onChange={e => setShowVertices(e.target.checked)} /> Hiển thị tọa độ</label>
              {(activeTab === 'ellipse' || activeTab === 'hyperbola') && (
                <label><input type="checkbox" checked={showBaseRect} onChange={e => setShowBaseRect(e.target.checked)} /> Hình chữ nhật cơ sở</label>
              )}
              <label><input type="checkbox" checked={showFocalRadii} onChange={e => setShowFocalRadii(e.target.checked)} /> Bán kính qua tiêu</label>
              <label><input type="checkbox" checked={showEccentricity} onChange={e => setShowEccentricity(e.target.checked)} /> Tâm sai (e)</label>
              <label><input type="checkbox" checked={showDirectrix} onChange={e => setShowDirectrix(e.target.checked)} /> Đường chuẩn (Δ)</label>
            </div>
          </div>

          {content.sidebar}
        </div>
      </div>
    </div>
  );
};

export default ConicSections;
