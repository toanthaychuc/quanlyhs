import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Maximize, MousePointer2 } from 'lucide-react';
import 'mathlive';
import './RiemannSum.css'; // Reusing CSS from RiemannSum for styling layout

const compileExpression = (expr) => {
  try {
    let jsExpr = expr.normalize('NFKC').toLowerCase();
    jsExpr = jsExpr.replace(/\\/g, '');
    jsExpr = jsExpr.replace(/log\s*_?\s*\(?\{?([a-zA-Z0-9.]+)\}?\)?\s*(?:\(([^)]+)\)|([a-zA-Z0-9]+))/g, (match, base, arg1, arg2) => {
      const arg = arg1 || arg2;
      return `(Math.log(${arg})/Math.log(${base}))`;
    });
    jsExpr = jsExpr.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))');
    jsExpr = jsExpr.replace(/frac\(([^)]+)\)\(([^)]+)\)/g, '(($1)/($2))');
    jsExpr = jsExpr.replace(/\bpi\b/g, 'Math.PI');
    jsExpr = jsExpr.replace(/\be\b/g, 'Math.E');
    jsExpr = jsExpr.replace(/\bln\b/g, 'Math.log');
    jsExpr = jsExpr.replace(/\bcot\b/g, '(1/Math.tan)');
    
    const funcs = ['sin', 'cos', 'tan', 'sqrt', 'exp', 'abs'];
    funcs.forEach(f => {
      jsExpr = jsExpr.replace(new RegExp(`\\b${f}\\b`, 'g'), `Math.${f}`);
    });
    
    jsExpr = jsExpr.replace(/\^/g, '**');
    jsExpr = jsExpr.replace(/(\d)([x])/gi, '$1*$2');
    jsExpr = jsExpr.replace(/([x])(\()/g, '$1*$2');
    jsExpr = jsExpr.replace(/(\))([x])/g, '$1*$2');
    
    // eslint-disable-next-line no-new-func
    const f = new Function('x', `return ${jsExpr};`);
    f(1); // test
    return { f, error: null };
  } catch (e) {
    return { f: () => 0, error: 'Biểu thức không hợp lệ' };
  }
};

const project = (x, y, z, pitch, yaw) => {
  // Rotate around Y-axis
  const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
  const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
  // Rotate around X-axis
  const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
  return { u: x1, v: -y2, z: z2 }; // Invert Y for screen coordinates
};

const SolidOfRevolution = () => {
  const [customLatex, setCustomLatex] = useState('\\sqrt{x}');
  const [customExpr, setCustomExpr] = useState('sqrt(x)');
  const [customA, setCustomA] = useState(0);
  const [customB, setCustomB] = useState(4);
  const [revolutionAngle, setRevolutionAngle] = useState(2 * Math.PI); // 0 to 2PI
  const [showWireframe, setShowWireframe] = useState(true);
  const [showSolid, setShowSolid] = useState(true);
  
  const [camera, setCamera] = useState({ pitch: 0.4, yaw: -0.5, scale: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  
  const mfRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;
    mf.value = customLatex;
    const handleInput = () => {
      setCustomLatex(mf.value);
      let ascii = mf.getValue('ascii-math');
      ascii = ascii.replace(/\\cdot/g, '*');
      setCustomExpr(ascii);
    };
    mf.addEventListener('input', handleInput);
    return () => mf.removeEventListener('input', handleInput);
  }, []);

  const { f, error } = compileExpression(customExpr);
  
  // Calculate Volume
  let volume = 0;
  if (!error) {
    const n = 1000;
    const h = (customB - customA) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const x1 = customA + i * h;
      const x2 = x1 + h;
      const y1 = f(x1);
      const y2 = f(x2);
      sum += Math.PI * ((y1*y1 + y2*y2) / 2) * h;
    }
    volume = sum;
  }

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Handle resizing correctly for high DPI
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const cw = rect.width;
    const ch = rect.height;
    
    ctx.clearRect(0, 0, cw, ch);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    const cx = cw / 2;
    const cy = ch / 2;
    
    if (error) {
      ctx.fillStyle = '#ef4444';
      ctx.font = '16px sans-serif';
      ctx.fillText(error, 20, 30);
      return;
    }

    // Grid config
    const xSteps = 40;
    const thetaSteps = 36;
    
    let polygons = [];
    
    // Draw axes
    const axes = [
      { start: [-5, 0, 0], end: [5, 0, 0], color: '#ef4444', label: 'x' }, // X-axis (red)
      { start: [0, -5, 0], end: [0, 5, 0], color: '#22c55e', label: 'y' }, // Y-axis (green)
      { start: [0, 0, -5], end: [0, 0, 5], color: '#3b82f6', label: 'z' }  // Z-axis (blue)
    ];
    
    axes.forEach(axis => {
      const p1 = project(axis.start[0], axis.start[1], axis.start[2], camera.pitch, camera.yaw);
      const p2 = project(axis.end[0], axis.end[1], axis.end[2], camera.pitch, camera.yaw);
      
      // Calculate depth of axis
      const zDepth = (p1.z + p2.z) / 2;
      
      polygons.push({
        type: 'axis',
        z: zDepth,
        p1, p2,
        color: axis.color,
        label: axis.label
      });
    });

    // Generate mesh polygons
    const a = Math.min(customA, customB);
    const b = Math.max(customA, customB);
    const h = (b - a) / xSteps;
    const dTheta = revolutionAngle / thetaSteps;

    if (showSolid || showWireframe) {
      for (let i = 0; i < xSteps; i++) {
        const x1 = a + i * h;
        const x2 = x1 + h;
        const y1 = f(x1);
        const y2 = f(x2);
        
        for (let j = 0; j < thetaSteps; j++) {
          const t1 = j * dTheta;
          const t2 = (j + 1) * dTheta;
          
          if (t2 > revolutionAngle + 0.001) continue;
          
          // 4 points of the patch
          const pt1 = project(x1, y1 * Math.cos(t1), y1 * Math.sin(t1), camera.pitch, camera.yaw);
          const pt2 = project(x2, y2 * Math.cos(t1), y2 * Math.sin(t1), camera.pitch, camera.yaw);
          const pt3 = project(x2, y2 * Math.cos(t2), y2 * Math.sin(t2), camera.pitch, camera.yaw);
          const pt4 = project(x1, y1 * Math.cos(t2), y1 * Math.sin(t2), camera.pitch, camera.yaw);
          
          // Average Z for painter's algorithm
          const avgZ = (pt1.z + pt2.z + pt3.z + pt4.z) / 4;
          
          // Backface culling calculation using 2D cross product of screen coordinates
          const vec1x = pt2.u - pt1.u;
          const vec1y = pt2.v - pt1.v;
          const vec2x = pt4.u - pt1.u;
          const vec2y = pt4.v - pt1.v;
          const cross = vec1x * vec2y - vec1y * vec2x;
          
          // Only draw if facing camera, or if we want to show inside
          // Let's color them differently if inside vs outside
          const isFront = cross > 0;
          
          polygons.push({
            type: 'patch',
            z: avgZ,
            pts: [pt1, pt2, pt3, pt4],
            isFront,
            baseX: x1 // for color shading
          });
        }
      }
    }
    
    // Sort polygons by Z-depth (back to front)
    polygons.sort((a, b) => a.z - b.z);
    
    // Draw
    polygons.forEach(poly => {
      if (poly.type === 'axis') {
        ctx.beginPath();
        ctx.moveTo(cx + poly.p1.u * camera.scale, cy + poly.p1.v * camera.scale);
        ctx.lineTo(cx + poly.p2.u * camera.scale, cy + poly.p2.v * camera.scale);
        ctx.strokeStyle = poly.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = poly.color;
        ctx.font = '14px Arial';
        ctx.fillText(poly.label, cx + poly.p2.u * camera.scale + 5, cy + poly.p2.v * camera.scale + 5);
      } else if (poly.type === 'patch') {
        ctx.beginPath();
        ctx.moveTo(cx + poly.pts[0].u * camera.scale, cy + poly.pts[0].v * camera.scale);
        for (let i = 1; i < 4; i++) {
          ctx.lineTo(cx + poly.pts[i].u * camera.scale, cy + poly.pts[i].v * camera.scale);
        }
        ctx.closePath();
        
        if (showSolid) {
          // Shading based on X position to give 3D feel
          const normalizedX = (poly.baseX - a) / (b - a || 1);
          // Pinkish theme
          let hue = 330;
          let saturation = 80;
          let lightness = poly.isFront ? (50 + normalizedX * 20) : (35 + normalizedX * 10); // inside is darker
          
          ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          ctx.fill();
        }
        
        if (showWireframe) {
          ctx.strokeStyle = poly.isFront ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });
    
  }, [f, customA, customB, revolutionAngle, camera, showWireframe, showSolid, error]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    lastMouse.current = { x: clientX, y: clientY };
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const dx = clientX - lastMouse.current.x;
      const dy = clientY - lastMouse.current.y;
      
      setCamera(prev => ({
        ...prev,
        yaw: prev.yaw - dx * 0.01,
        pitch: Math.max(-Math.PI/2, Math.min(Math.PI/2, prev.pitch + dy * 0.01))
      }));
      
      lastMouse.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => setIsDragging(false);

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
  }, [isDragging]);

  const handleZoom = (delta) => {
    setCamera(prev => ({ ...prev, scale: Math.max(10, Math.min(200, prev.scale + delta)) }));
  };

  return (
    <div className="riemann-container" style={{ display: 'flex', gap: '20px', height: '100%' }}>
      <div className="riemann-sidebar">
        <h3 className="math-title">Thể Tích Tròn Xoay</h3>


        <div className="control-group">
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Hàm số f(x)</h4>
          <div style={{ marginBottom: '10px' }}>
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
                onChange={(e) => setCustomA(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px' }}>Đến b = </label>
              <input 
                type="number" 
                className="func-select" 
                value={customB} 
                onChange={(e) => setCustomB(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className="control-group">
          <div className="slider-container">
            <div className="slider-header">
              <span>Góc quay (radians)</span>
              <span className="slider-val">{(revolutionAngle / Math.PI).toFixed(2).replace('.', ',')}π</span>
            </div>
            <input 
              type="range" 
              min="0" max="360" step="1"
              value={revolutionAngle * 180 / Math.PI}
              onChange={e => setRevolutionAngle(parseFloat(e.target.value) * Math.PI / 180)}
            />
          </div>
        </div>

        <div className="control-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showSolid} onChange={e => setShowSolid(e.target.checked)} />
            Tô màu mặt khối
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={showWireframe} onChange={e => setShowWireframe(e.target.checked)} />
            Hiển thị lưới (Wireframe)
          </label>
        </div>

        <div className="stats-card">
          <div className="stat-row">
            <span className="stat-label">Thể tích vật thể tròn xoay (V):</span>
          </div>
          <div className="stat-row" style={{ marginTop: '10px', justifyContent: 'center' }}>
            <math-field 
              read-only 
              style={{ fontSize: '20px', backgroundColor: 'transparent', border: 'none', padding: 0 }}
            >
              {`V = \\pi \\int_{${customA}}^{${customB}} \\left(${customLatex}\\right)^2 dx \\approx ${volume.toFixed(4).replace('.', ',')}`}
            </math-field>
          </div>
        </div>
      </div>

      <div className="riemann-canvas-container" style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}>
        <div style={{ position: 'absolute', top: 15, left: 15, color: 'white', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '20px', fontSize: '14px' }}>
          <MousePointer2 size={16} /> Kéo chuột để xoay 3D
        </div>
        
        <div className="canvas-controls" style={{ position: 'absolute', bottom: 15, right: 15, display: 'flex', gap: '8px', zIndex: 10 }}>
          <button onClick={() => handleZoom(10)} className="btn-icon" style={{ background: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Phóng to">
            +
          </button>
          <button onClick={() => handleZoom(-10)} className="btn-icon" style={{ background: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Thu nhỏ">
            -
          </button>
          <button onClick={() => setCamera({ pitch: 0.4, yaw: -0.5, scale: 60 })} className="btn-icon" style={{ background: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }} title="Đặt lại góc nhìn">
            <RotateCw size={16} />
          </button>
        </div>

        <canvas 
          ref={canvasRef}
          style={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
      </div>
    </div>
  );
};

export default SolidOfRevolution;
