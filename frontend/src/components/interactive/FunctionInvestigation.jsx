import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import './FunctionInvestigation.css';
import { findRootsNumeric, solveQuadratic, formatNum } from './mathHelpers';

const FunctionInvestigation = () => {
  const [funcType, setFuncType] = useState('cubic'); // 'cubic' | 'rational11' | 'rational21'
  
  // Cubic: y = ax^3 + bx^2 + cx + d
  const [cA, setCA] = useState(1);
  const [cB, setCB] = useState(-3);
  const [cC, setCC] = useState(0);
  const [cD, setCD] = useState(2);
  
  // Rational 1/1: y = (ax + b) / (cx + d)
  const [r1A, setR1A] = useState(2);
  const [r1B, setR1B] = useState(-1);
  const [r1C, setR1C] = useState(1);
  const [r1D, setR1D] = useState(1);

  // Rational 2/1: y = (ax^2 + bx + c) / (dx + e)
  const [r2A, setR2A] = useState(1);
  const [r2B, setR2B] = useState(-3);
  const [r2C, setR2C] = useState(2);
  const [r2D, setR2D] = useState(1);
  const [r2E, setR2E] = useState(1);
  
  const svgRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ width: 800, height: 600 });
  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  const [scale, setScale] = useState(50);

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

  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isPanning) return;
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    };
    const handleUp = () => setIsPanning(false);

    if (isPanning) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isPanning, startPan]);

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
    setPan({ x: 0, y: 0 });
    setScale(50);
  };

  const cx = svgSize.width / 2 + pan.x;
  const cy = svgSize.height / 2 + pan.y;

  const toPx = (x, y) => ({
    px: cx + x * scale,
    py: cy - y * scale
  });

  const fCubic = (x) => cA * Math.pow(x, 3) + cB * x * x + cC * x + cD;
  const fRat11 = (x) => (r1A * x + r1B) / (r1C * x + r1D);
  const fRat21 = (x) => (r2A * x * x + r2B * x + r2C) / (r2D * x + r2E);

  const getCurrentF = () => {
    if (funcType === 'cubic') return fCubic;
    if (funcType === 'rational11') return fRat11;
    return fRat21;
  };

  const getPath = () => {
    let path = "";
    const step = 0.05;
    let isFirst = true;
    const f = getCurrentF();

    for (let x = -30; x <= 30; x += step) {
      let y = f(x);
      
      // Handle asymptotes (skip drawing line across asymptote)
      if (funcType === 'rational11' && Math.abs(r1C * x + r1D) < 0.1) {
        isFirst = true;
        continue;
      }
      if (funcType === 'rational21' && Math.abs(r2D * x + r2E) < 0.1) {
        isFirst = true;
        continue;
      }
      
      const { px, py } = toPx(x, y);
      
      if (py < -5000 || py > 5000 || isNaN(py)) {
        isFirst = true;
        continue;
      }

      if (isFirst) {
        path += `M ${px} ${py} `;
        isFirst = false;
      } else {
        path += `L ${px} ${py} `;
      }
    }
    return path;
  };

  const renderStepper = (val, setVal, label) => (
    <div className="coef-stepper">
      <span className="coef-label math-formula">{label}</span>
      <button onClick={() => setVal(parseFloat((val - 0.1).toFixed(1)))}><ChevronLeft size={16} /></button>
      <input 
        type="number" 
        value={val} 
        onChange={(e) => setVal(parseFloat(e.target.value) || 0)} 
        step="0.1"
      />
      <button onClick={() => setVal(parseFloat((val + 0.1).toFixed(1)))}><ChevronRight size={16} /></button>
    </div>
  );

  // Math Calculations
  let analysis = { ox: [], oy: 0, extrema: [], inflection: null, asymptotes: {} };
  const f = getCurrentF();

  if (funcType === 'cubic') {
    analysis.oy = f(0);
    analysis.ox = findRootsNumeric(f);
    const roots = solveQuadratic(3 * cA, 2 * cB, cC);
    analysis.extrema = roots.map(x => ({ x, y: f(x) }));
    if (cA !== 0) {
      const ix = -cB / (3 * cA);
      analysis.inflection = { x: ix, y: f(ix) };
    }
  } else if (funcType === 'rational11') {
    if (r1D !== 0) analysis.oy = f(0);
    if (r1A !== 0 && (-r1B/r1A) !== (-r1D/r1C)) analysis.ox = [-r1B/r1A];
    if (r1C !== 0) {
      const vx = -r1D/r1C;
      const hy = r1A/r1C;
      analysis.asymptotes.vertical = vx;
      analysis.asymptotes.horizontal = hy;
      analysis.inflection = { x: vx, y: hy }; // center of symmetry
    }
  } else if (funcType === 'rational21') {
    if (r2E !== 0) analysis.oy = f(0);
    analysis.ox = solveQuadratic(r2A, r2B, r2C).filter(x => r2D * x + r2E !== 0);
    if (r2D !== 0) {
      const vx = -r2E/r2D;
      analysis.asymptotes.vertical = vx;
      
      // Slant asymptote: y = (a/d)x + (bd - ae)/d^2
      const m = r2A / r2D;
      const n = (r2B * r2D - r2A * r2E) / (r2D * r2D);
      analysis.asymptotes.slant = { m, n };
      
      // Center of symmetry is intersection of vertical and slant
      const symY = m * vx + n;
      analysis.inflection = { x: vx, y: symY };
      
      // Extrema roots: y' = (A x^2 + B x + C) / (dx+e)^2
      const A = r2A * r2D;
      const B = 2 * r2A * r2E;
      const C = r2B * r2E - r2C * r2D;
      const extRoots = solveQuadratic(A, B, C);
      analysis.extrema = extRoots.map(x => ({ x, y: f(x) })).filter(p => !isNaN(p.y) && Math.abs(p.y) < 1000);
    }
  }

  const generateBBTData = () => {
    let criticalXs = [];
    if (funcType === 'cubic') {
      criticalXs = [...analysis.extrema.map(e => ({ type: 'ext', x: e.x }))];
    } else if (funcType === 'rational11') {
      if (analysis.asymptotes.vertical !== undefined) {
        criticalXs = [{ type: 'asy', x: analysis.asymptotes.vertical }];
      }
    } else if (funcType === 'rational21') {
      if (analysis.asymptotes.vertical !== undefined) {
        criticalXs.push({ type: 'asy', x: analysis.asymptotes.vertical });
      }
      analysis.extrema.forEach(e => {
        criticalXs.push({ type: 'ext', x: e.x });
      });
    }

    criticalXs.sort((a, b) => a.x - b.x);

    let items = [];
    const f = getCurrentF();
    
    let yInfMinus = '', yInfMinusPos = 'middle';
    let yInfPlus = '', yInfPlusPos = 'middle';
    
    if (funcType === 'cubic') {
       yInfMinus = cA > 0 ? '-∞' : '+∞'; yInfMinusPos = cA > 0 ? 'bottom' : 'top';
       yInfPlus = cA > 0 ? '+∞' : '-∞'; yInfPlusPos = cA > 0 ? 'top' : 'bottom';
    } else if (funcType === 'rational11') {
       const hy = formatNum(analysis.asymptotes.horizontal);
       yInfMinus = hy; yInfPlus = hy;
    } else if (funcType === 'rational21') {
       const m = analysis.asymptotes.slant ? analysis.asymptotes.slant.m : 1;
       yInfMinus = m > 0 ? '-∞' : '+∞'; yInfMinusPos = m > 0 ? 'bottom' : 'top';
       yInfPlus = m > 0 ? '+∞' : '-∞'; yInfPlusPos = m > 0 ? 'top' : 'bottom';
    }

    items.push({ xStr: '-∞', yStr: yInfMinus, yPos: yInfMinusPos });

    for (let i = 0; i < criticalXs.length; i++) {
       const cx1 = i === 0 ? criticalXs[0].x - 10 : criticalXs[i-1].x;
       const cx2 = criticalXs[i].x;
       const testX = (cx1 + cx2) / 2;
       
       const h = 1e-5;
       const yp = (f(testX + h) - f(testX - h)) / (2 * h);
       items.push({ interval: true, sign: yp > 0 ? '+' : '-' });
       
       if (criticalXs[i].type === 'asy') {
         const yLeft = f(cx2 - 1e-5) > 0 ? '+∞' : '-∞';
         const yRight = f(cx2 + 1e-5) > 0 ? '+∞' : '-∞';
         items.push({ 
           asymptote: true, xStr: formatNum(cx2),
           yLeft, yLeftPos: yLeft === '+∞' ? 'top' : 'bottom',
           yRight, yRightPos: yRight === '+∞' ? 'top' : 'bottom'
         });
       } else {
         const yv = f(cx2);
         const isMax = (yp > 0); 
         items.push({ xStr: formatNum(cx2), yPrime: '0', yStr: formatNum(yv), yPos: isMax ? 'top' : 'bottom' });
       }
    }
    
    const cxLast = criticalXs.length > 0 ? criticalXs[criticalXs.length - 1].x : 0;
    const testXLast = cxLast + 10;
    const h = 1e-5;
    const ypLast = (f(testXLast + h) - f(testXLast - h)) / (2 * h);
    items.push({ interval: true, sign: ypLast > 0 ? '+' : '-' });
    
    items.push({ xStr: '+∞', yStr: yInfPlus, yPos: yInfPlusPos });
    
    // Assign X coords
    const nonIntervals = items.filter(it => !it.interval);
    const n = nonIntervals.length;
    const W = 330;
    
    nonIntervals.forEach((it, idx) => {
      it.cx = 45 + idx * ((W - 45 - 20) / Math.max(1, n - 1));
    });
    
    let currentNonInterval = 0;
    items.forEach(it => {
       if (!it.interval) {
          it.cx = nonIntervals[currentNonInterval].cx;
          currentNonInterval++;
       }
    });
    for (let i=0; i<items.length; i++) {
       if (items[i].interval) {
          items[i].cx = (items[i-1].cx + items[i+1].cx) / 2;
       }
    }
    return items;
  };

  const renderBBTSVG = () => {
    const items = generateBBTData();
    const W = 330;
    const H = 140;

    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '8px', display: 'block', maxHeight: '160px' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
        </defs>
        
        {/* Rows lines */}
        <line x1={0} y1={30} x2={W} y2={30} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={0} y1={60} x2={W} y2={60} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={30} y1={0} x2={30} y2={H} stroke="#cbd5e1" strokeWidth="1" />
        
        {/* Headers */}
        <text x={15} y={20} textAnchor="middle" fontSize="14" fill="#1e293b" fontWeight="bold">x</text>
        <text x={15} y={48} textAnchor="middle" fontSize="14" fill="#1e293b" fontWeight="bold">y'</text>
        <text x={15} y={105} textAnchor="middle" fontSize="14" fill="#1e293b" fontWeight="bold">y</text>
        
        {/* Items */}
        {items.map((it, idx) => {
           if (it.interval) {
             return <text key={idx} x={it.cx} y={49} textAnchor="middle" fontSize="16" fill="#ef4444" fontWeight="bold">{it.sign}</text>;
           }
           if (it.asymptote) {
             return (
               <g key={idx}>
                 <text x={it.cx} y={20} textAnchor="middle" fontSize="13" fill="#1e293b">{it.xStr}</text>
                 <line x1={it.cx - 2} y1={30} x2={it.cx - 2} y2={H} stroke="#94a3b8" strokeWidth="1" />
                 <line x1={it.cx + 2} y1={30} x2={it.cx + 2} y2={H} stroke="#94a3b8" strokeWidth="1" />
                 <text x={it.cx - 6} y={it.yLeftPos === 'top' ? 80 : 130} textAnchor="end" fontSize="13" fill="#3b82f6">{it.yLeft}</text>
                 <text x={it.cx + 6} y={it.yRightPos === 'top' ? 80 : 130} textAnchor="start" fontSize="13" fill="#3b82f6">{it.yRight}</text>
               </g>
             );
           }
           return (
             <g key={idx}>
               <text x={it.cx} y={20} textAnchor="middle" fontSize="13" fill="#1e293b">{it.xStr}</text>
               <text x={it.cx} y={48} textAnchor="middle" fontSize="13" fill="#1e293b">{it.yPrime}</text>
               <text x={it.cx} y={it.yPos === 'top' ? 80 : (it.yPos === 'bottom' ? 130 : 105)} textAnchor="middle" fontSize="13" fill="#3b82f6" fontWeight="bold">{it.yStr}</text>
             </g>
           );
        })}

        {/* Arrows */}
        {(() => {
           let arrows = [];
           for (let i = 0; i < items.length - 2; i += 2) {
              const it1 = items[i];
              const it2 = items[i+2];
              
              const getY = (it, isRightSideOfIt) => {
                 let pos = 'middle';
                 if (it.asymptote) pos = isRightSideOfIt ? it.yRightPos : it.yLeftPos;
                 else pos = it.yPos;
                 return pos === 'top' ? 85 : (pos === 'bottom' ? 120 : 105);
              };
              
              let y1 = getY(it1, true);
              let y2 = getY(it2, false);
              
              let x1 = it1.cx + (it1.asymptote ? 15 : 15);
              let x2 = it2.cx - (it2.asymptote ? 15 : 15);

              // adjust if x is squeezed
              if (x2 - x1 < 10) {
                 x1 -= 5; x2 += 5;
              }

              if (x2 > x1) {
                 arrows.push(<line key={`arr-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" />);
              }
           }
           return arrows;
        })()}
      </svg>
    );
  };

  const drawPoint = (x, y, color, label, isInflection = false) => {
    if (isNaN(x) || isNaN(y)) return null;
    const { px, py } = toPx(x, y);
    
    let labelNode;
    if (typeof label === 'string' && label.startsWith('frac:')) {
      const parts = label.substring(5).split(',');
      const num = parts[0];
      const den = parts[1];
      labelNode = (
        <g transform={`translate(${px + 10}, ${py - 12})`}>
          <text x="6" y="0" fill={color} fontSize="15" fontWeight="bold" textAnchor="middle" className="math-text-normal">{num}</text>
          <line x1="0" y1="4" x2="12" y2="4" stroke={color} strokeWidth="1.5" />
          <text x="6" y="16" fill={color} fontSize="15" fontWeight="bold" textAnchor="middle" className="math-text-normal">{den}</text>
        </g>
      );
    } else {
      labelNode = <text x={px + 10} y={py - 10} fill={color} fontSize="18" fontWeight="bold" className="math-text-normal">{label}</text>;
    }

    return (
      <g key={`pt-${x}-${y}-${label}`}>
        <circle cx={px} cy={py} r={isInflection ? 5 : 7} fill={color} stroke="#fff" strokeWidth="2" />
        {labelNode}
      </g>
    );
  };

  const renderFraction = (num, den) => (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 4px', fontSize: '13px', lineHeight: '1.2' }}>
      <span style={{ padding: '0 4px' }}>{num}</span>
      <span style={{ borderTop: '1px solid currentColor', width: '100%' }}></span>
      <span style={{ padding: '0 4px' }}>{den}</span>
    </span>
  );

  const renderAnalysisItems = () => {
    const formatTerm = (coef, power, isFirst = false) => {
      if (Math.abs(coef) < 1e-5) return '';
      let sign = coef > 0 ? (isFirst ? '' : ' + ') : (isFirst ? '-' : ' - ');
      let val = Math.abs(coef);
      let valStr = val === 1 && power !== '' ? '' : formatNum(val);
      return `${sign}${valStr}${power}`;
    };

    const getDerivativeNode = () => {
      if (funcType === 'cubic') {
        const a = 3 * cA, b = 2 * cB, c = cC;
        let res = '';
        if (Math.abs(a) > 1e-5) res += formatTerm(a, 'x²', true);
        if (Math.abs(b) > 1e-5) res += formatTerm(b, 'x', res === '');
        if (Math.abs(c) > 1e-5) res += formatTerm(c, '', res === '');
        return res === '' ? '0' : res;
      } else if (funcType === 'rational11') {
        const num = r1A * r1D - r1B * r1C;
        const den = `(${formatNum(r1C)}x ${r1D >= 0 ? '+' : '-'} ${formatNum(Math.abs(r1D))})²`;
        return renderFraction(formatNum(num), den);
      } else if (funcType === 'rational21') {
        const a = r2A * r2D, b = 2 * r2A * r2E, c = r2B * r2E - r2C * r2D;
        let numStr = '';
        if (Math.abs(a) > 1e-5) numStr += formatTerm(a, 'x²', true);
        if (Math.abs(b) > 1e-5) numStr += formatTerm(b, 'x', numStr === '');
        if (Math.abs(c) > 1e-5) numStr += formatTerm(c, '', numStr === '');
        if (numStr === '') numStr = '0';
        const den = `(${formatNum(r2D)}x ${r2E >= 0 ? '+' : '-'} ${formatNum(Math.abs(r2E))})²`;
        return renderFraction(numStr, den);
      }
    };

    const getFunctionNode = () => {
      if (funcType === 'cubic') {
        const a = cA, b = cB, c = cC, d = cD;
        let res = '';
        if (Math.abs(a) > 1e-5) res += formatTerm(a, 'x³', true);
        if (Math.abs(b) > 1e-5) res += formatTerm(b, 'x²', res === '');
        if (Math.abs(c) > 1e-5) res += formatTerm(c, 'x', res === '');
        if (Math.abs(d) > 1e-5) res += formatTerm(d, '', res === '');
        return <span className="math-formula">{res === '' ? '0' : res}</span>;
      } else if (funcType === 'rational11') {
        const num = `${formatTerm(r1A, 'x', true)}${formatTerm(r1B, '', r1A === 0)}`;
        const den = `${formatTerm(r1C, 'x', true)}${formatTerm(r1D, '', r1C === 0)}`;
        return renderFraction(<span className="math-formula">{num || '0'}</span>, <span className="math-formula">{den || '0'}</span>);
      } else if (funcType === 'rational21') {
        let numStr = '';
        if (Math.abs(r2A) > 1e-5) numStr += formatTerm(r2A, 'x²', true);
        if (Math.abs(r2B) > 1e-5) numStr += formatTerm(r2B, 'x', numStr === '');
        if (Math.abs(r2C) > 1e-5) numStr += formatTerm(r2C, '', numStr === '');
        if (numStr === '') numStr = '0';
        
        const den = `${formatTerm(r2D, 'x', true)}${formatTerm(r2E, '', r2D === 0)}`;
        return renderFraction(<span className="math-formula">{numStr}</span>, <span className="math-formula">{den || '0'}</span>);
      }
    };

    const itemFunction = (
      <div className="analysis-item" style={{ display: 'flex', alignItems: 'center' }}>
        <strong style={{ marginRight: '8px' }}>Hàm số <span className="math-formula">y</span>:</strong> {getFunctionNode()}
      </div>
    );

    const itemDerivative = (
      <div className="analysis-item" style={{ display: 'flex', alignItems: 'center' }}>
        <strong style={{ marginRight: '8px' }}>Đạo hàm <span className="math-formula">y'</span>:</strong> {getDerivativeNode()}
      </div>
    );
    const itemOy = (
      <div className="analysis-item">
        <strong>Giao điểm <span className="math-formula">Oy</span>:</strong> (<span className="math-formula-normal">0; {formatNum(analysis.oy)}</span>)
      </div>
    );
    const itemOx = (
      <div className="analysis-item">
        <strong>Giao điểm <span className="math-formula">Ox</span>:</strong> {analysis.ox.length > 0 ? analysis.ox.map(x => <span key={x} className="math-formula-normal">({formatNum(x)}; 0)</span>).reduce((prev, curr) => [prev, ', ', curr]) : 'Không giao'}
      </div>
    );
    const itemExtrema = analysis.extrema.length > 0 && (
      <div className="analysis-item">
        <strong>Cực trị:</strong> {analysis.extrema.map((p, i) => <span key={i} className="math-formula-normal">{['A', 'B', 'C', 'D'][i] || ''}({formatNum(p.x)}; {formatNum(p.y)})</span>).reduce((prev, curr) => [prev, ', ', curr])}
      </div>
    );
    const itemInflection = analysis.inflection && (
      <div className="analysis-item">
        <strong>Tâm đối xứng:</strong> <span className="math-formula-normal">I({formatNum(analysis.inflection.x)}; {formatNum(analysis.inflection.y)})</span>
      </div>
    );
    const itemTCD = analysis.asymptotes.vertical !== undefined && (
      <div className="analysis-item">
        <strong>Tiệm cận đứng:</strong> <span className="math-formula">x = {formatNum(analysis.asymptotes.vertical)}</span>
      </div>
    );
    const itemTCN = analysis.asymptotes.horizontal !== undefined && (
      <div className="analysis-item">
        <strong>Tiệm cận ngang:</strong> <span className="math-formula">y = {formatNum(analysis.asymptotes.horizontal)}</span>
      </div>
    );
    const itemTCX = analysis.asymptotes.slant !== undefined && (
      <div className="analysis-item">
        <strong>Tiệm cận xiên:</strong> <span className="math-formula">y = {formatNum(analysis.asymptotes.slant.m)}x {analysis.asymptotes.slant.n >= 0 ? '+' : ''} {formatNum(analysis.asymptotes.slant.n)}</span>
      </div>
    );

    if (funcType === 'cubic') {
      return <>{itemFunction}{itemDerivative}{itemOy}{itemOx}{itemExtrema}{itemInflection}</>;
    } else if (funcType === 'rational11') {
      return <>{itemFunction}{itemDerivative}{itemTCD}{itemTCN}{itemOy}{itemOx}{itemInflection}</>;
    } else if (funcType === 'rational21') {
      return <>{itemFunction}{itemDerivative}{itemTCD}{itemTCX}{itemOy}{itemOx}{itemExtrema}{itemInflection}</>;
    }
    return null;
  };

  return (
    <div className="func-invest-container">
      <div className="func-invest-sidebar">
        <h3 className="func-invest-title">Khảo sát hàm số</h3>
        
        <div className="type-selector-col">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="radio" checked={funcType === 'cubic'} onChange={() => setFuncType('cubic')} />
            <span>Bậc 3: <span className="math-formula">y = ax³ + bx² + cx + d</span></span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="radio" checked={funcType === 'rational11'} onChange={() => setFuncType('rational11')} />
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Phân thức 1/1: <span className="math-formula" style={{ marginLeft: '4px' }}>y = </span>{renderFraction(<span className="math-formula">ax + b</span>, <span className="math-formula">cx + d</span>)}
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="radio" checked={funcType === 'rational21'} onChange={() => setFuncType('rational21')} />
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Phân thức 2/1: <span className="math-formula" style={{ marginLeft: '4px' }}>y = </span>{renderFraction(<span className="math-formula">ax² + bx + c</span>, <span className="math-formula">dx + e</span>)}
            </span>
          </label>
        </div>

        {/* Controls */}
        <div className="func-controls">
          {funcType === 'cubic' && (
            <div className="stepper-grid">
              {renderStepper(cA, setCA, 'a')}
              {renderStepper(cB, setCB, 'b')}
              {renderStepper(cC, setCC, 'c')}
              {renderStepper(cD, setCD, 'd')}
            </div>
          )}
          {funcType === 'rational11' && (
            <div className="stepper-grid">
              {renderStepper(r1A, setR1A, 'a')}
              {renderStepper(r1B, setR1B, 'b')}
              {renderStepper(r1C, setR1C, 'c')}
              {renderStepper(r1D, setR1D, 'd')}
            </div>
          )}
          {funcType === 'rational21' && (
            <div className="stepper-grid-3">
              {renderStepper(r2A, setR2A, 'a')}
              {renderStepper(r2B, setR2B, 'b')}
              {renderStepper(r2C, setR2C, 'c')}
              {renderStepper(r2D, setR2D, 'd')}
              {renderStepper(r2E, setR2E, 'e')}
            </div>
          )}
        </div>

        {/* Analysis Data */}
        <div className="func-analysis">
          <h4>Thông số nổi bật</h4>
          
          {renderAnalysisItems()}

          <div className="analysis-item" style={{ marginTop: '12px', background: 'transparent', border: 'none', padding: 0 }}>
            <strong>Bảng biến thiên:</strong>
            {renderBBTSVG()}
          </div>
        </div>
      </div>

      <div className="func-invest-main" onPointerDown={handlePointerDown}>
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
        >
          {/* Grid */}
          <g className="grid-lines">
            {Array.from({ length: 40 }).map((_, i) => {
              const val = i - 20 - Math.round(pan.x / scale);
              const xPos = cx + val * scale;
              return (
                <g key={`vx-${i}`}>
                  <line x1={xPos} y1={0} x2={xPos} y2={svgSize.height} stroke="#e2e8f0" strokeWidth="1" />
                  {val !== 0 && <text x={xPos} y={cy + 15} fill="#94a3b8" fontSize="12" textAnchor="middle">{val}</text>}
                </g>
              );
            })}
            {Array.from({ length: 40 }).map((_, i) => {
              const val = i - 20 + Math.round(pan.y / scale);
              const yPos = cy - val * scale;
              return (
                <g key={`hy-${i}`}>
                  <line x1={0} y1={yPos} x2={svgSize.width} y2={yPos} stroke="#e2e8f0" strokeWidth="1" />
                  {val !== 0 && <text x={cx - 8} y={yPos + 4} fill="#94a3b8" fontSize="12" textAnchor="end">{val}</text>}
                </g>
              );
            })}
          </g>

          {/* Axes */}
          <line x1={0} y1={cy} x2={svgSize.width} y2={cy} stroke="#475569" strokeWidth="2" />
          <line x1={cx} y1={0} x2={cx} y2={svgSize.height} stroke="#475569" strokeWidth="2" />
          <text x={cx - 15} y={cy + 15} fill="#475569" fontSize="14" fontWeight="bold">O</text>
          
          {/* Asymptotes */}
          {analysis.asymptotes.vertical !== undefined && (
            <line 
              x1={cx + analysis.asymptotes.vertical * scale} y1={0} 
              x2={cx + analysis.asymptotes.vertical * scale} y2={svgSize.height} 
              stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,5" 
            />
          )}
          {analysis.asymptotes.horizontal !== undefined && (
            <line 
              x1={0} y1={cy - analysis.asymptotes.horizontal * scale} 
              x2={svgSize.width} y2={cy - analysis.asymptotes.horizontal * scale} 
              stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" 
            />
          )}
          {analysis.asymptotes.slant !== undefined && (
            <line 
              x1={0} y1={cy - (analysis.asymptotes.slant.m * ((0 - cx)/scale) + analysis.asymptotes.slant.n) * scale} 
              x2={svgSize.width} y2={cy - (analysis.asymptotes.slant.m * ((svgSize.width - cx)/scale) + analysis.asymptotes.slant.n) * scale} 
              stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" 
            />
          )}

          {/* Function Curve */}
          <path d={getPath()} fill="none" stroke="#3b82f6" strokeWidth="3" />

          {/* Interesting Points */}
          {drawPoint(0, analysis.oy, '#eab308', funcType === 'rational11' ? 'frac:b,d' : (funcType === 'rational21' ? 'frac:c,e' : 'd'))}
          {analysis.ox.map((x, i) => drawPoint(x, 0, '#eab308', `x${['₁', '₂', '₃', '₄', '₅'][i] || i+1}`))}
          {analysis.extrema.map((p, i) => drawPoint(p.x, p.y, '#ef4444', ['A', 'B', 'C', 'D'][i] || ''))}
          {analysis.inflection && drawPoint(analysis.inflection.x, analysis.inflection.y, '#8b5cf6', 'I', true)}

        </svg>
      </div>
    </div>
  );
};

export default FunctionInvestigation;
