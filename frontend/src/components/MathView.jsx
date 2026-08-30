import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { normalizeLatexString, extractBracedBlocks, parseImminiBlock } from '../utils/latexUtils';
import { parseTikzToSvgData, getSmoothSvgPath } from '../utils/tikzParser';

// Component hiển thị hình vẽ TikZ & Đồ thị hàm số chuẩn xác 100% bằng Vector SVG Canvas
const TikzDiagramViewer = ({ tikzCode }) => {
  const [svgData, setSvgData] = React.useState(null);

  // Phân tích và nạp dữ liệu SVG hình vẽ tức thì
  React.useEffect(() => {
    if (tikzCode) {
      try {
        const data = parseTikzToSvgData(tikzCode);
        setSvgData(data);
      } catch (err) {
        console.warn("Parse TikZ error:", err);
      }
    }
  }, [tikzCode]);

  if (!tikzCode) return null;

  // Tính toán vẽ SVG Canvas fallback trực tiếp
  const renderFallbackSvg = () => {
    if (!svgData) return null;
    const { lines = [], curves = [], circles = [], labels = [], polygons = [] } = svgData;

    const allPoints = [];
    lines.forEach(l => {
      if (l && l.from && typeof l.from.x === 'number' && typeof l.from.y === 'number') allPoints.push(l.from);
      if (l && l.to && typeof l.to.x === 'number' && typeof l.to.y === 'number') allPoints.push(l.to);
    });
    curves.forEach(pts => {
      if (Array.isArray(pts)) {
        pts.forEach(p => {
          if (p && typeof p.x === 'number' && typeof p.y === 'number') allPoints.push(p);
        });
      }
    });
    circles.forEach(c => {
      if (c && typeof c.cx === 'number' && typeof c.cy === 'number') allPoints.push({ x: c.cx, y: c.cy });
    });
    labels.forEach(lb => {
      if (lb && typeof lb.x === 'number' && typeof lb.y === 'number') allPoints.push({ x: lb.x, y: lb.y });
    });

    const hasValidPoints = allPoints.length >= 2;
    let minX = 0, maxX = 1, minY = 0, maxY = 1;

    if (hasValidPoints) {
      minX = Math.min(...allPoints.map(p => p.x));
      maxX = Math.max(...allPoints.map(p => p.x));
      minY = Math.min(...allPoints.map(p => p.y));
      maxY = Math.max(...allPoints.map(p => p.y));
    }

    const rangeX = Math.max(maxX - minX, 0.001);
    const rangeY = Math.max(maxY - minY, 0.001);
    const isStraightLine = rangeY < 0.001;

    const hasCurves = curves.length > 0;
    const padding = 42;
    const targetWidth = hasCurves ? 420 : 320;
    const targetHeight = hasCurves ? 280 : 220;

    const scaleX = isStraightLine ? 1 : (targetWidth - 2 * padding) / rangeX;
    const scaleY = isStraightLine ? 1 : (targetHeight - 2 * padding) / rangeY;
    const scale = isStraightLine ? 1 : Math.min(scaleX, scaleY, 52);

    const drawWidth = isStraightLine ? 300 : rangeX * scale;
    const drawHeight = isStraightLine ? 0 : rangeY * scale;

    const svgWidth = isStraightLine ? 320 : Math.max(drawWidth + 2 * padding, 260);
    const svgHeight = isStraightLine ? 80 : Math.max(drawHeight + 2 * padding, 200);

    const offsetX = isStraightLine ? padding : (svgWidth - drawWidth) / 2;
    const offsetY = isStraightLine ? svgHeight / 2 : (svgHeight - drawHeight) / 2;

    const toScreenX = (x) => {
      if (typeof x !== 'number' || isNaN(x)) return svgWidth / 2;
      if (isStraightLine) return padding + ((x - minX) / rangeX) * (svgWidth - 2 * padding);
      return offsetX + (x - minX) * scale;
    };

    const toScreenY = (y) => {
      if (typeof y !== 'number' || isNaN(y)) return svgHeight / 2;
      if (isStraightLine) return svgHeight / 2 - 2;
      return (svgHeight - offsetY) - (y - minY) * scale;
    };

    if (!hasValidPoints) return null;

    return (
      <svg className="custom-fallback-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: svgWidth, height: svgHeight, maxWidth: '100%', opacity: 0.4 }}>
        <defs>
          <marker id="tikz-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 2 L 8 5 L 0 8 z" fill="#0f172a" />
          </marker>
        </defs>

        <rect width={svgWidth} height={svgHeight} rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />

        {polygons && polygons.map((poly, pIdx) => (
          <polygon key={`poly-${pIdx}`} points={poly.map(pt => `${toScreenX(pt?.x)},${toScreenY(pt?.y)}`).join(' ')} fill="rgba(59, 130, 246, 0.05)" />
        ))}

        {lines.map((l, idx) => (
          <line
            key={`l-${idx}`}
            x1={toScreenX(l.from.x)}
            y1={toScreenY(l.from.y)}
            x2={toScreenX(l.to.x)}
            y2={toScreenY(l.to.y)}
            stroke="#0f172a"
            strokeWidth={l.dashed ? '1.2' : '1.5'}
            strokeLinecap="round"
            strokeDasharray={l.dashed ? '3,3' : undefined}
            markerEnd={l.hasArrow ? 'url(#tikz-arr)' : undefined}
          />
        ))}

        {curves.map((curvePts, cIdx) => (
          <path key={`cv-${cIdx}`} d={getSmoothSvgPath(curvePts, toScreenX, toScreenY)} stroke="#2563eb" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        ))}

        {circles.map((c, idx) => (
          <circle key={`c-${idx}`} cx={toScreenX(c.cx)} cy={toScreenY(c.cy)} r="2.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
        ))}

        {labels.map((lb, idx) => {
          const sx = toScreenX(lb.x);
          const sy = toScreenY(lb.y);
          let ox = 0, oy = 0;
          const t = lb.text.trim();
          if (t === 'O' || t === '0') { ox = -10; oy = 14; }
          else if (t === 'x') { ox = 0; oy = 18; }
          else if (t === 'y') { ox = -18; oy = 0; }
          else {
            const rad = ((lb.angle !== undefined ? lb.angle : -90) * Math.PI) / 180;
            ox = 15 * Math.cos(rad);
            oy = -15 * Math.sin(rad);
          }

          let katexHtml = t;
          try {
            const mathExpr = t.startsWith('$') ? t.slice(1, -1) : t;
            katexHtml = katex.renderToString(mathExpr, { throwOnError: false, displayMode: false });
          } catch {
            katexHtml = t;
          }

          return (
            <foreignObject key={`lbl-${idx}`} x={sx + ox - 20} y={sy + oy - 12} width="40" height="24" style={{ overflow: 'visible', pointerEvents: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '13px', color: '#0f172a', fontFamily: 'KaTeX_Main, serif' }} dangerouslySetInnerHTML={{ __html: katexHtml }} />
            </foreignObject>
          );
        })}
      </svg>
    );
  };

  const containerRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [useFallback, setUseFallback] = React.useState(false);
  const [showLightbox, setShowLightbox] = React.useState(false);
  const [zoomScale, setZoomScale] = React.useState(1);
  const lightboxSvgRef = React.useRef(null);

  // Reset zoom khi mở lightbox
  React.useEffect(() => {
    if (showLightbox) {
      setZoomScale(1);
    }
  }, [showLightbox]);

  // Sync SVG vào lightbox khi mở hoặc thay đổi zoom
  React.useEffect(() => {
    if (showLightbox && lightboxSvgRef.current) {
      if (useFallback) {
         // Nếu dùng fallback thì renderFallbackSvg() trả về React node, containerRef sẽ rỗng innerHTML.
         // Do đó ta cần gán lại HTML từ node được render hoặc xử lý khác.
         // Một cách đơn giản là clone nội dung từ thẻ SVG hiển thị thực tế:
         const displayedSvg = containerRef.current?.querySelector('svg');
         if (displayedSvg) {
            lightboxSvgRef.current.innerHTML = displayedSvg.outerHTML;
         }
      } else if (containerRef.current) {
         lightboxSvgRef.current.innerHTML = containerRef.current.innerHTML;
      }
      
      const svg = lightboxSvgRef.current.querySelector('svg');
      if (svg) {
        svg.style.width = 'auto';
        svg.style.height = 'auto';
        svg.style.minWidth = '650px';
        svg.style.maxWidth = '100%';
        svg.style.transition = 'transform 0.15s ease-out';
        svg.style.transform = `scale(${zoomScale})`;
        svg.style.transformOrigin = 'top center';
        svg.style.display = 'block';
      }
    }
  }, [showLightbox, zoomScale, useFallback]);

  // Đóng bằng phím Escape, phím +/- để zoom
  React.useEffect(() => {
    if (!showLightbox) return;
    const handleKey = (e) => { 
      if (e.key === 'Escape') setShowLightbox(false);
      if (e.key === '+' || e.key === '=') setZoomScale(s => Math.min(s + 0.25, 4));
      if (e.key === '-' || e.key === '_') setZoomScale(s => Math.max(s - 0.25, 0.5));
      if (e.key === '0') setZoomScale(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showLightbox]);

  // Fetch compiled SVG from local API on mount or when tikzCode changes
  React.useEffect(() => {
    if (tikzCode) {
      const controller = new AbortController();
      const signal = controller.signal;

      const compileTikz = async () => {
        setLoading(true);
        setErrorMsg('');
        setUseFallback(false);
        try {
          const storedPreamble = localStorage.getItem('app_teacher_latex_preamble');
          const apiUrl = import.meta.env.VITE_API_URL || '';
          
          if (!apiUrl) {
             throw new Error('Offline Mode'); // Force fallback
          }

          const res = await fetch(`${apiUrl}/api/compile-tikz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              tikzCode,
              preamble: storedPreamble || undefined
            }),
            signal
          });
          
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Server error');
          }
          
          if (containerRef.current) {
            containerRef.current.innerHTML = data.svg;
          }
        } catch (err) {
          if (err.name === 'AbortError') return;
          console.error("TikZ API Error:", err);
          
          if (!import.meta.env.VITE_API_URL) {
            console.warn("No VITE_API_URL, switching to offline fallback viewer.");
            setUseFallback(true);
          } else {
            setErrorMsg(`Lỗi Backend: ${err.message}`);
          }
          
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        } finally {
          setLoading(false);
        }
      };
      
      const debounceTimer = setTimeout(() => {
        compileTikz();
      }, 500);
      
      return () => {
        clearTimeout(debounceTimer);
        controller.abort();
      };
    }
  }, [tikzCode]);

  const hasSvg = !loading && (!errorMsg || useFallback);

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoomScale(s => Math.min(Math.round((s + 0.25) * 100) / 100, 4));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setZoomScale(s => Math.max(Math.round((s - 0.25) * 100) / 100, 0.5));
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setZoomScale(1);
  };

  return (
    <>
      <div className="tikz-diagram-container" style={{ margin: '0.75rem 0', textAlign: 'center' }}>
        <div 
          className="tikz-render-output-box"
          onClick={() => hasSvg && setShowLightbox(true)}
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '120px',
            minWidth: '200px',
            maxWidth: '100%',
            overflowX: 'auto',
            position: 'relative',
            cursor: hasSvg ? 'zoom-in' : 'default',
            transition: 'box-shadow 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => { if (hasSvg) { e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.18)'; e.currentTarget.style.transform = 'scale(1.01)'; }}}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'scale(1)'; }}
          title={hasSvg ? 'Nhấn để phóng to hình vẽ' : ''}
        >
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 20 }}>
              <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600 }}>Đang biên dịch pdflatex...</span>
            </div>
          )}
          
          {errorMsg && !useFallback && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(254, 226, 226, 0.9)', zIndex: 20 }}>
              <span style={{ fontSize: '0.8rem', color: '#b91c1c', textAlign: 'center' }}>{errorMsg}</span>
            </div>
          )}

          {/* Icon zoom gợi ý */}
          {hasSvg && (
            <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(99,102,241,0.1)', borderRadius: '6px', padding: '3px 6px', fontSize: '0.7rem', color: '#4f46e5', fontWeight: 600, pointerEvents: 'none', opacity: 0.7 }}>
              🔍 Phóng to
            </div>
          )}

          <div 
            ref={containerRef} 
            className="tikzjax-wrapper"
            style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%', overflow: 'visible', opacity: (loading || (errorMsg && !useFallback)) ? 0.3 : 1 }}
          >
            {useFallback && renderFallbackSvg()}
          </div>
        </div>
      </div>

      {/* Lightbox popup phóng to có bộ điều khiển zoom */}
      {showLightbox && (
        <div
          onClick={() => setShowLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            onWheel={(e) => {
              if (e.deltaY < 0) handleZoomIn(e);
              else handleZoomOut(e);
            }}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '92vw',
              maxWidth: '1200px',
              height: '88vh',
              maxHeight: '920px',
              overflow: 'hidden',
              position: 'relative',
              animation: 'scaleIn 0.18s ease',
            }}
          >
            {/* Header thanh công cụ lightbox */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              {/* Nhóm nút điều khiển Zoom (+ / - / Reset / Đóng) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 0.5}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      width: '28px',
                      height: '28px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: zoomScale <= 0.5 ? '#cbd5e1' : '#334155',
                      cursor: zoomScale <= 0.5 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => { if (zoomScale > 0.5) e.currentTarget.style.background = '#e2e8f0'; }}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    title="Thu nhỏ (-)"
                  >
                    −
                  </button>

                  <button
                    type="button"
                    onClick={handleResetZoom}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '0 8px',
                      height: '28px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#4f46e5',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Đặt lại kích thước (0)"
                  >
                    {Math.round(zoomScale * 100)}%
                  </button>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomScale >= 4}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      width: '28px',
                      height: '28px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: zoomScale >= 4 ? '#cbd5e1' : '#334155',
                      cursor: zoomScale >= 4 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => { if (zoomScale < 4) e.currentTarget.style.background = '#e2e8f0'; }}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    title="Phóng to (+)"
                  >
                    +
                  </button>
                </div>

                {/* Nút đóng */}
                <button
                  type="button"
                  onClick={() => setShowLightbox(false)}
                  style={{
                    background: 'rgba(100,116,139,0.12)',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#475569',
                    fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginLeft: '0.4rem',
                    transition: 'background 0.15s, color 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#dc2626'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(100,116,139,0.12)'; e.currentTarget.style.color = '#475569'; }}
                  title="Đóng (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Vùng hiển thị SVG có hỗ trợ cuộn đầy đủ cả trên lẫn dưới khi zoom to */}
            <div 
              style={{
                width: '100%',
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '1.5rem 1rem 3rem 1rem'
              }}
            >
              <div
                ref={lightboxSvgRef}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  overflow: 'visible',
                  transition: 'all 0.15s ease-out'
                }}
              />
            </div>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes scaleIn { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          `}</style>
        </div>
      )}
    </>
  );
};




// Hàm render chữ kèm định dạng in đậm, nghiêng, gạch chân
const renderFormattedText = (raw) => {
  if (!raw) return null;
  const cleaned = raw
    .replace(/\\par\b/gi, '')
    .replace(/\\qquad/g, '        ')
    .replace(/\\quad/g, '    ')
    .replace(/\\[,;:]/g, ' ');
  const parts = cleaned.split(/(\*\*[^*]+\*\*|\*[^*]+\*|<u>[^<]+<\/u>)/g);
  return parts.map((sub, sIdx) => {
    if (sub.startsWith('**') && sub.endsWith('**')) {
      return <strong key={sIdx} style={{ fontWeight: 700 }}>{sub.slice(2, -2)}</strong>;
    }
    if (sub.startsWith('*') && sub.endsWith('*')) {
      return <em key={sIdx}>{sub.slice(1, -1)}</em>;
    }
    if (sub.startsWith('<u>') && sub.endsWith('</u>')) {
      return <u key={sIdx}>{sub.slice(3, -4)}</u>;
    }
    return <span key={sIdx}>{sub}</span>;
  });
};

const TabularViewer = ({ code }) => {
  if (!code) return null;
  const rows = code.split(/\\\\/g).map(r => r.trim()).filter(Boolean);
  return (
    <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
      <table className="latex-tabular-table" style={{ borderCollapse: 'collapse', margin: '0 auto', fontSize: '0.95em' }}>
        <tbody>
          {rows.map((row, rIdx) => {
            if (row === '\\hline') return null;
            const cleanRow = row.replace(/\\hline/g, '').trim();
            if (!cleanRow) return null;
            const cells = cleanRow.split('&').map(c => c.trim());
            return (
              <tr key={rIdx}>
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} style={{ border: '1px solid #ccc', padding: '8px 16px', textAlign: 'center' }}>
                    <RenderMathSegment rawText={cell} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Hàm hiển thị một đoạn văn bản/toán chuẩn KaTeX
const RenderMathSegment = ({ rawText = '', className = '' }) => {
  if (!rawText) return null;

  const normalized = normalizeLatexString(rawText);

  let segments = [{ type: 'content', value: normalized }];
  
  const tikzRegex = /(?:(?:\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}\s*|\\colorlet\{[^}]+\}\{[^}]+\}\s*)*)\\begin\{tikzpicture(?:\[[^\]]*\])?\}?(?:\[[^\]]*\])?[\s\S]*?\\end\{tikzpicture\}/gi;
  let newSegments = [];
  segments.forEach(seg => {
    if (seg.type !== 'content') {
      newSegments.push(seg);
      return;
    }
    let lastIdx = 0;
    let tikzMatch;
    while ((tikzMatch = tikzRegex.exec(seg.value)) !== null) {
      if (tikzMatch.index > lastIdx) {
        newSegments.push({ type: 'content', value: seg.value.substring(lastIdx, tikzMatch.index) });
      }
      newSegments.push({ type: 'tikz', value: tikzMatch[0] });
      lastIdx = tikzMatch.index + tikzMatch[0].length;
    }
    if (lastIdx < seg.value.length) {
      newSegments.push({ type: 'content', value: seg.value.substring(lastIdx) });
    }
  });
  segments = newSegments;

  const tabularRegex = /\\begin\{(tabular|xtabular|longtable)\}(?:\[[^\]]*\])?\s*\{[^}]*\}([\s\S]*?)\\end\{\1\}/gi;
  newSegments = [];
  segments.forEach(seg => {
    if (seg.type !== 'content') {
      newSegments.push(seg);
      return;
    }
    let lastIdx = 0;
    let tabMatch;
    while ((tabMatch = tabularRegex.exec(seg.value)) !== null) {
      if (tabMatch.index > lastIdx) {
        newSegments.push({ type: 'content', value: seg.value.substring(lastIdx, tabMatch.index) });
      }
      newSegments.push({ type: 'tabular', value: tabMatch[2] });
      lastIdx = tabMatch.index + tabMatch[0].length;
    }
    if (lastIdx < seg.value.length) {
      newSegments.push({ type: 'content', value: seg.value.substring(lastIdx) });
    }
  });
  segments = newSegments;

  const katexMacros = {
    "\\vv": "\\overrightarrow{#1}",
    "\\heva": "\\begin{cases} #1 \\end{cases}",
    "\\hoac": "\\left[\\begin{array}{l} #1 \\end{array}\\right.",
    "\\goc": "\\widehat{#1}",
    "\\ang": "#1^\\circ",
    "\\degree": "^\\circ",
    "\\vect": "\\overrightarrow{#1}",
    "\\varparallel": "\\parallel"
  };

  return (
    <span className={`math-rendered-container ${className}`}>
      {segments.map((seg, segIdx) => {
        if (seg.type === 'tikz') {
          return <TikzDiagramViewer key={segIdx} tikzCode={seg.value} />;
        }
        if (seg.type === 'tabular') {
          return <TabularViewer key={segIdx} code={seg.value} />;
        }

        const rawContent = seg.value;
        const parts = [];
        const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{(?:aligned|eqnarray|align|equation|cases|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\*?\}(?:\[.*?\])?[\s\S]*?\\end\{(?:aligned|eqnarray|align|equation|cases|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\*?\}|\$[^\$]+?\$|\\\([\s\S]*?\\\))/g;
        let lastMathIdx = 0;
        let mathMatch;

        while ((mathMatch = mathRegex.exec(rawContent)) !== null) {
          if (mathMatch.index > lastMathIdx) {
            parts.push({
              type: 'text',
              content: rawContent.substring(lastMathIdx, mathMatch.index)
            });
          }

          const raw = mathMatch[0];
          let isBlock = false;
          let math = raw;
          
          if (raw.startsWith('$$')) {
            isBlock = true;
            math = raw.slice(2, -2).trim();
          } else if (raw.startsWith('\\[')) {
            isBlock = true;
            math = raw.slice(2, -2).trim();
          } else if (raw.startsWith('\\begin')) {
            isBlock = true;
            math = raw.trim();
          } else if (raw.startsWith('\\(')) {
            isBlock = false;
            math = raw.slice(2, -2).trim();
          } else if (raw.startsWith('$')) {
            isBlock = false;
            math = raw.slice(1, -1).trim();
          }

          parts.push({
            type: 'math',
            content: math,
            isBlock
          });

          lastMathIdx = mathMatch.index + raw.length;
        }

        if (lastMathIdx < rawContent.length) {
          parts.push({
            type: 'text',
            content: rawContent.substring(lastMathIdx)
          });
        }

        return (
          <span key={segIdx} className="math-inline-segment">
            {parts.map((part, pIdx) => {
              if (part.type === 'text') {
                return (
                  <span key={pIdx} style={{ whiteSpace: 'pre-wrap' }}>
                    {renderFormattedText(part.content)}
                  </span>
                );
              }

              try {
                let normalizedMath = part.content
                  .replace(/\\vv\s*\{([A-Za-z0-9_]{2,})\}/g, '\\overrightarrow{$1}')
                  .replace(/\\vv\s*\{([A-Za-z0-9_])\}/g, '\\vec{$1}')
                  .replace(/\\vv\s+([A-Za-z]{2,})\b/g, '\\overrightarrow{$1}')
                  .replace(/\\vv\s+([A-Za-z])\b/g, '\\vec{$1}')
                  .replace(/\\varparallel\b/g, '\\parallel')
                  // Tự động sửa lỗi phổ biến của giáo viên: dùng & ở đầu dòng trong \begin{array}{l} (chỉ có 1 cột l)
                  .replace(/(\\begin\{array\}\{[lcr]\}\s*)&+/gi, '$1')
                  .replace(/(\\(?:hoac|heva)\s*\{\s*)&+/gi, '$1')
                  .replace(/(\\\\\s*)&+/g, '$1')
                  .replace(/^\$+/, '')
                  .replace(/\$+$/, '')
                  .trim();

                const html = katex.renderToString(normalizedMath, {
                  displayMode: part.isBlock,
                  throwOnError: true,
                  strict: false,
                  trust: true,
                  macros: katexMacros
                });

                return (
                  <span
                    key={pIdx}
                    dangerouslySetInnerHTML={{ __html: html }}
                    className={part.isBlock ? 'katex-block-display' : 'katex-inline-display'}
                  />
                );
              } catch (e) {
                return (
                  <span key={pIdx} className="katex-error-tooltip" style={{ position: 'relative', display: 'inline-block' }}>
                    <code style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                      ${part.content}$
                    </code>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#b91c1c', marginTop: '4px' }}>
                      ⚠️ Lỗi cú pháp toán học. Có thể do chứa chữ tiếng Việt (cần bọc trong \text&#123;...&#125;) hoặc sai cấu trúc lệnh.
                    </span>
                  </span>
                );
              }
            })}
          </span>
        );
      })}
    </span>
  );
};

const TkzTabViewer = ({ tikzCode }) => {
  const initMatch = tikzCode.match(/\\tkzTabInit(?:\[[^\]]*\])?\s*\{([^}]+)\}\s*\{([^}]+)\}/);
  if (!initMatch) return null;

  const rows = initMatch[1].split(',').map(s => s.split('/')[0].trim());
  const xVals = initMatch[2].split(',').map(s => s.trim());
  
  const lineMatch = tikzCode.match(/\\tkzTabLine\s*\{([^}]+)\}/);
  const signs = lineMatch ? lineMatch[1].split(',').map(s => s.trim()) : [];
  
  const varMatch = tikzCode.match(/\\tkzTabVar\s*\{([^}]+)\}/);
  const vars = varMatch ? varMatch[1].split(',').map(s => s.trim()) : [];

  const n = xVals.length;
  const colCount = 2 * n - 1;
  const uniqueId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);

  const points = vars.map((v, i) => {
    let [pos, val1, val2] = v.split('/').map(s => s?.trim());
    let leftPos = pos || '';
    let rightPos = pos || '';
    if (pos && pos.includes('D')) {
       const parts = pos.split('D');
       leftPos = parts[0] || '';
       rightPos = parts[1] || '';
    }
    return { index: i, leftPos, rightPos, val1, val2 };
  });

  return (
    <div className="tkz-tab-container" style={{ overflowX: 'auto', margin: '14px 0', fontFamily: 'system-ui', width: '100%' }}>
       <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '380px', border: '1.5px solid #1e293b' }}>
          <tbody>
            <tr>
               <td style={{ border: '1px solid #1e293b', borderRight: '1.5px solid #1e293b', borderBottom: '1.5px solid #1e293b', padding: '12px 8px', textAlign: 'center', width: '80px' }}>
                 <RenderMathSegment rawText={rows[0]} />
               </td>
               {Array.from({ length: colCount }).map((_, i) => (
                 <td key={`x-${i}`} style={{ borderBottom: '1.5px solid #1e293b', padding: '12px 4px', textAlign: 'center' }}>
                   {i % 2 === 0 ? <RenderMathSegment rawText={xVals[Math.floor(i / 2)]} /> : null}
                 </td>
               ))}
            </tr>
            
            {rows.length > 1 && (
            <tr>
               <td style={{ border: '1px solid #1e293b', borderRight: '1.5px solid #1e293b', borderBottom: '1.5px solid #1e293b', padding: '12px 8px', textAlign: 'center' }}>
                 <RenderMathSegment rawText={rows[1]} />
               </td>
               {Array.from({ length: colCount }).map((_, i) => {
                 let content = signs[i] || '';
                 if (content === '0') content = '0';
                 if (content === 'd') content = '||';
                 if (content === 'h') content = '';
                 
                 return (
                   <td key={`s-${i}`} style={{ borderBottom: '1.5px solid #1e293b', padding: '12px 4px', textAlign: 'center' }}>
                     {content === '||' ? (
                       <div style={{ borderLeft: '1px solid #1e293b', borderRight: '1px solid #1e293b', height: '24px', width: '4px', margin: '0 auto' }} />
                     ) : (
                       <RenderMathSegment rawText={content} />
                     )}
                   </td>
                 );
               })}
            </tr>
            )}

            {rows.length > 2 && (
            <tr>
               <td style={{ border: '1px solid #1e293b', borderRight: '1.5px solid #1e293b', padding: '12px 8px', textAlign: 'center' }}>
                 <RenderMathSegment rawText={rows[2]} />
               </td>
               {Array.from({ length: colCount }).map((_, i) => {
                  if (i % 2 !== 0) {
                     const leftVar = points[Math.floor(i / 2)];
                     const rightVar = points[Math.ceil(i / 2)];
                     if (!leftVar || !rightVar) return <td key={`v-${i}`} />;
                     
                     const isUp = (leftVar.rightPos === '-' && rightVar.leftPos === '+') || (leftVar.rightPos === '-' && rightVar.leftPos === 'R') || (leftVar.rightPos === 'R' && rightVar.leftPos === '+');
                     const isDown = (leftVar.rightPos === '+' && rightVar.leftPos === '-') || (leftVar.rightPos === '+' && rightVar.leftPos === 'R') || (leftVar.rightPos === 'R' && rightVar.leftPos === '-');
                     
                     return (
                       <td key={`v-${i}`} style={{ position: 'relative', minWidth: '60px', height: '110px', padding: 0 }}>
                         {(isUp || isDown) && (
                            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
                              <defs>
                                <marker id={`arrow-${uniqueId}-${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#1e293b" />
                                </marker>
                              </defs>
                              <line 
                                x1="10%" y1={isUp ? "85%" : "15%"} 
                                x2="90%" y2={isUp ? "15%" : "85%"} 
                                stroke="#1e293b" strokeWidth="1.2" 
                                markerEnd={`url(#arrow-${uniqueId}-${i})`} 
                              />
                            </svg>
                         )}
                       </td>
                     );
                  } else {
                     const pt = points[Math.floor(i / 2)];
                     if (!pt) return <td key={`v-${i}`} />;
                     const isDoubleBar = pt.leftPos.includes('D') || pt.rightPos.includes('D');
                     
                     return (
                       <td key={`v-${i}`} style={{ position: 'relative', width: '40px', height: '110px', padding: 0 }}>
                         {isDoubleBar && (
                           <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px', transform: 'translateX(-50%)', borderLeft: '1px solid #1e293b', borderRight: '1px solid #1e293b' }} />
                         )}
                         
                         {pt.val1 && (
                           <div style={{ 
                              position: 'absolute',
                              right: isDoubleBar ? '50%' : 'auto',
                              left: isDoubleBar ? 'auto' : '50%',
                              marginRight: isDoubleBar ? '6px' : '0',
                              transform: isDoubleBar ? 'none' : 'translateX(-50%)',
                              top: pt.leftPos === '+' ? '12px' : 'auto',
                              bottom: pt.leftPos === '-' ? '12px' : 'auto',
                              marginTop: (pt.leftPos !== '+' && pt.leftPos !== '-' && !isDoubleBar) ? '40px' : 0
                           }}>
                              <RenderMathSegment rawText={pt.val1} />
                           </div>
                         )}
                         
                         {(pt.val2) && (
                           <div style={{ 
                              position: 'absolute',
                              left: '50%',
                              marginLeft: '6px',
                              top: pt.rightPos === '+' ? '12px' : 'auto',
                              bottom: pt.rightPos === '-' ? '12px' : 'auto'
                           }}>
                              <RenderMathSegment rawText={pt.val2} />
                           </div>
                         )}
                       </td>
                     );
                  }
               })}
            </tr>
            )}
          </tbody>
       </table>
    </div>
  );
};

const MathView = ({ text = '', className = '' }) => {
  if (!text) return null;

  // 1. Tách cấu trúc \immini / \imminiL để hiển thị ghép ngang an toàn (hỗ trợ mọi tuỳ chọn [thm], [d]...)
  const imminiData = parseImminiBlock(text);
  if (imminiData) {
    const { isLeftMode, leftPart, rightPart, beforeText, afterText } = imminiData;

    return (
      <div className={`math-rendered-block ${className}`}>
        {beforeText && <RenderMathSegment rawText={beforeText} />}
        <div className={`immini-side-by-side-container ${isLeftMode ? 'immini-left-mode' : ''}`}>
          <div className="immini-text-pane">
            <RenderMathSegment rawText={leftPart} />
          </div>
          <div className="immini-diagram-pane">
            <RenderMathSegment rawText={rightPart} />
          </div>
        </div>
        {afterText && <RenderMathSegment rawText={afterText} />}
      </div>
    );
  }

  return <RenderMathSegment rawText={text} className={className} />;
};

export default MathView;
