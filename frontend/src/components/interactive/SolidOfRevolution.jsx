import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  RotateCw, 
  MousePointer2, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  ZoomIn, 
  ZoomOut,
  Target,
  Box,
  Square,
  Sparkles
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'mathlive';
import './SolidOfRevolution.css';

// Safe math compiler for user expressions
const compileExpression = (expr) => {
  if (!expr || typeof expr !== 'string' || !expr.trim()) {
    return { f: () => 0, error: 'Chưa nhập biểu thức' };
  }
  try {
    let jsExpr = expr.normalize('NFKC').toLowerCase().trim();
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
    jsExpr = jsExpr.replace(/(\))(\()/g, '$1*$2');
    jsExpr = jsExpr.replace(/(\d)(\()/g, '$1*$2');
    jsExpr = jsExpr.replace(/(\))(\d)/g, '$1*$2');
    
    // eslint-disable-next-line no-new-func
    const f = new Function('x', `return ${jsExpr};`);
    f(1); // test execution
    return { f, error: null };
  } catch {
    return { f: () => 0, error: 'Biểu thức không hợp lệ' };
  }
};

const evalSafe = (f, x) => {
  if (!f) return 0;
  try {
    const val = f(x);
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 0;
    return val;
  } catch {
    return 0;
  }
};

// 3D projection: yaw around Y-axis, pitch around X-axis
const project = (x, y, z, pitch, yaw) => {
  const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
  const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
  const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
  return { u: x1, v: -y2, z: z2 };
};

// Find intersection roots between f and g
const findIntersections = (f, g, xMin = -6, xMax = 8, step = 0.04) => {
  const roots = [];
  const diff = (x) => {
    try {
      const v1 = f(x);
      const v2 = g(x);
      if (isNaN(v1) || isNaN(v2) || !isFinite(v1) || !isFinite(v2)) return null;
      return v1 - v2;
    } catch {
      return null;
    }
  };

  let prevX = xMin;
  let prevD = diff(prevX);

  for (let x = xMin + step; x <= xMax + 1e-5; x += step) {
    const d = diff(x);
    if (prevD !== null && d !== null) {
      if (Math.abs(prevD) < 1e-7) {
        if (!roots.some(r => Math.abs(r - prevX) < 0.05)) {
          roots.push(Number(prevX.toFixed(2)));
        }
      } else if (prevD * d < 0) {
        let lo = prevX, hi = x;
        for (let iter = 0; iter < 16; iter++) {
          const mid = (lo + hi) / 2;
          const dMid = diff(mid);
          if (dMid === null || Math.abs(dMid) < 1e-8) {
            lo = mid;
            break;
          }
          if (prevD * dMid <= 0) hi = mid;
          else lo = mid;
        }
        const root = (lo + hi) / 2;
        if (!roots.some(r => Math.abs(r - root) < 0.05)) {
          roots.push(Number(root.toFixed(2)));
        }
      }
    }
    prevX = x;
    prevD = d;
  }
  return roots.sort((a, b) => a - b);
};

// Numerical integration via Simpson's rule
const calculatePieceVolume = (f, g, a, b, n = 1000) => {
  const minX = Math.min(a, b);
  const maxX = Math.max(a, b);
  if (Math.abs(maxX - minX) < 1e-7) return 0;
  const h = (maxX - minX) / n;
  const integrand = (x) => {
    const y1 = evalSafe(f, x);
    const y2 = evalSafe(g, x);
    return Math.abs(y1 * y1 - y2 * y2);
  };
  let sum = integrand(minX) + integrand(maxX);
  for (let i = 1; i < n; i++) {
    const x = minX + i * h;
    sum += integrand(x) * (i % 2 === 0 ? 2 : 4);
  }
  return Math.PI * (sum * h) / 3;
};

// MathInput component wrapper for MathLive
const MathInput = ({ value, onChange, style, readOnly }) => {
  const mfRef = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;
    if (!isInternalChange.current && mf.value !== value) {
      mf.value = value || '';
    }
    isInternalChange.current = false;
  }, [value]);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf || readOnly) return;
    const handleInput = () => {
      isInternalChange.current = true;
      const val = mf.value;
      let ascii = mf.getValue('ascii-math') || '';
      ascii = ascii.replace(/\\cdot/g, '*');
      onChange?.(val, ascii);
    };
    mf.addEventListener('input', handleInput);
    return () => mf.removeEventListener('input', handleInput);
  }, [onChange, readOnly]);

  return (
    <math-field
      ref={mfRef}
      style={{
        width: '100%',
        minHeight: '38px',
        fontSize: '16px',
        padding: '5px 8px',
        backgroundColor: 'var(--surface-color, #ffffff)',
        border: '1.5px solid var(--border-color, #e2e8f0)',
        borderRadius: '8px',
        color: 'var(--text-primary, #0f172a)',
        display: 'block',
        ...style
      }}
      read-only={readOnly ? '' : undefined}
    />
  );
};


// MathLatex component for rendering LaTeX with KaTeX
const MathLatex = ({ math, display = false, className = '', style = {} }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math || '', { throwOnError: false, displayMode: display });
    } catch {
      return math || '';
    }
  }, [math, display]);

  return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};

// Sequential boundary letters: a -> b -> c -> d -> e...
const BOUND_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'm', 'n', 'p', 'q'];
const getBoundLabel = (index) => BOUND_LETTERS[index] || `x_{${index}}`;

// Subscript helpers for piece functions f₁(x), f₂(x)...
const SUB_DIGITS = ['₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
const getSubscript = (num) => SUB_DIGITS[num - 1] || num;

// Generate piecewise function LaTeX representation:
// f(x) = \begin{cases} expr_1 & ,\; a_1 < x < b_1 \\ expr_2 & ,\; a_2 < x < b_2 \end{cases}
const getPiecewiseFunctionLatex = (pieces, funcKey = 'latexF', funcName = 'f') => {
  if (!pieces || pieces.length === 0) return `${funcName}(x) = 0`;

  const rows = pieces.map((p, idx) => {
    const expr = p[funcKey] && String(p[funcKey]).trim() ? String(p[funcKey]).trim() : `${funcName}_{${idx + 1}}(x)`;
    const aVal = p.a !== undefined && p.a !== '' ? p.a : (BOUND_LETTERS[idx] || 'a');
    const bVal = p.b !== undefined && p.b !== '' ? p.b : (BOUND_LETTERS[idx + 1] || 'b');
    const op1 = p.op1 === '<=' ? '\\le' : '<';
    const op2 = p.op2 === '<=' ? '\\le' : '<';

    return `${expr} & ,\\; ${aVal} ${op1} x ${op2} ${bVal}`;
  });

  return `${funcName}(x) = \\begin{cases} ${rows.join(' \\\\ ')} \\end{cases}`;
};

// Generate generalized formula LaTeX for both single and piecewise
const getGeneralFormulaLatex = (formulaMode, hasSecondFunc, piecesCount) => {
  if (formulaMode === 'single' || piecesCount <= 1) {
    return hasSecondFunc
      ? "V = \\pi \\int_a^b \\left| f^2(x) - g^2(x) \\right| dx"
      : "V = \\pi \\int_a^b f^2(x) dx";
  }

  // Piecewise mode: dynamic multi-interval sum
  if (piecesCount <= 4) {
    const terms = [];
    for (let i = 0; i < piecesCount; i++) {
      const lower = getBoundLabel(i);
      const upper = getBoundLabel(i + 1);
      const sub = i + 1;
      if (hasSecondFunc) {
        terms.push(`\\pi \\int_{${lower}}^{${upper}} \\left| f_{${sub}}^2(x) - g_{${sub}}^2(x) \\right| dx`);
      } else {
        terms.push(`\\pi \\int_{${lower}}^{${upper}} f_{${sub}}^2(x) dx`);
      }
    }
    return `V = ${terms.join(' + ')}`;
  }

  // For > 4 pieces, use dots
  const term1Lower = getBoundLabel(0);
  const term1Upper = getBoundLabel(1);
  const term2Lower = getBoundLabel(1);
  const term2Upper = getBoundLabel(2);
  const lastLower = getBoundLabel(piecesCount - 1);
  const lastUpper = getBoundLabel(piecesCount);

  if (hasSecondFunc) {
    return `V = \\pi \\int_{${term1Lower}}^{${term1Upper}} \\left| f_1^2(x) - g_1^2(x) \\right| dx + \\pi \\int_{${term2Lower}}^{${term2Upper}} \\left| f_2^2(x) - g_2^2(x) \\right| dx + \\dots + \\pi \\int_{${lastLower}}^{${lastUpper}} \\left| f_{${piecesCount}}^2(x) - g_{${piecesCount}}^2(x) \\right| dx`;
  }
  return `V = \\pi \\int_{${term1Lower}}^{${term1Upper}} f_1^2(x) dx + \\pi \\int_{${term2Lower}}^{${term2Upper}} f_2^2(x) dx + \\dots + \\pi \\int_{${lastLower}}^{${lastUpper}} f_{${piecesCount}}^2(x) dx`;
};

// Generate combined volume integral formula with actual user formulas and bounds
const getCombinedVolumeFormulaLatex = (pieces, hasSecond) => {
  if (!pieces || pieces.length === 0) return 'V = 0';

  const terms = pieces.map((p) => {
    const aVal = p.a !== undefined && p.a !== '' ? p.a : 'a';
    const bVal = p.b !== undefined && p.b !== '' ? p.b : 'b';
    const fStr = p.latexF && String(p.latexF).trim() ? String(p.latexF).trim() : 'f(x)';

    if (hasSecond) {
      const gStr = p.latexG && String(p.latexG).trim() ? String(p.latexG).trim() : '0';
      return `\\pi \\int_{${aVal}}^{${bVal}} \\left| \\left(${fStr}\\right)^2 - \\left(${gStr}\\right)^2 \\right| dx`;
    }
    return `\\pi \\int_{${aVal}}^{${bVal}} \\left(${fStr}\\right)^2 dx`;
  });

  return `V = ${terms.join(' + ')}`;
};

// Color palettes for multi-segment visualization
const SEGMENT_PALETTES = [
  { outerHue: 335, innerHue: 195, label: 'Khúc 1', dotColor: '#ec4899' },
  { outerHue: 38, innerHue: 215, label: 'Khúc 2', dotColor: '#f59e0b' },
  { outerHue: 265, innerHue: 165, label: 'Khúc 3', dotColor: '#8b5cf6' },
  { outerHue: 155, innerHue: 320, label: 'Khúc 4', dotColor: '#10b981' },
];

const PRESETS = [
  // ==========================================
  // 1 CÔNG THỨC (Single Formula) - 11 Bài
  // ==========================================
  {
    id: 'p1_sqrt',
    name: '1. y = √x trên [0, 4] (Cơ bản SGK)',
    mode: 'single',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 4, latexF: '\\sqrt{x}', exprF: 'sqrt(x)', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p_thpt_xe_x',
    name: '2. y = √(x·eˣ) trên [0, 1] (Đề THPT QG 2021)',
    mode: 'single',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 1, latexF: '\\sqrt{x e^x}', exprF: 'sqrt(x * exp(x))', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p2_two_curves_intersection',
    name: '3. y = √x và y = x² trên [0, 1] (Đề THPT QG)',
    mode: 'single',
    hasSecond: true,
    pieces: [
      { id: 1, a: 0, b: 1, latexF: '\\sqrt{x}', exprF: 'sqrt(x)', latexG: 'x^2', exprG: 'x^2' }
    ]
  },
  {
    id: 'p_thpt_x_lnx',
    name: '4. y = x·ln(x) và trục Ox trên [1, e] (Đề Tham Khảo BGD)',
    mode: 'single',
    hasSecond: false,
    pieces: [
      { id: 1, a: 1, b: 2.72, latexF: 'x\\ln(x)', exprF: 'x * ln(x)', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p8_sphere',
    name: '5. Khối cầu R=2: y = √(4 - x²) trên [-2, 2]',
    mode: 'single',
    hasSecond: false,
    pieces: [
      { id: 1, a: -2, b: 2, latexF: '\\sqrt{4 - x^2}', exprF: 'sqrt(4 - x^2)', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p_parabol_up',
    name: '6. Parabol úp: y = -x² + 2x trên [0, 2] (Sở Hà Nội)',
    mode: 'single',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 2, latexF: '-x^2 + 2x', exprF: '2*x - x^2', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p_sphere_cap',
    name: '7. Chỏm cầu: y = √(9 - x²) và y = √5 (Chuyên Lam Sơn)',
    mode: 'single',
    hasSecond: true,
    pieces: [
      { id: 1, a: -2, b: 2, latexF: '\\sqrt{9 - x^2}', exprF: 'sqrt(9 - x^2)', latexG: '\\sqrt{5}', exprG: 'sqrt(5)' }
    ]
  },
  {
    id: 'p_exp_two',
    name: '8. y = eˣ và y = e⁻ˣ trên [0, 1] (Chuyên ĐH Sư Phạm)',
    mode: 'single',
    hasSecond: true,
    pieces: [
      { id: 1, a: 0, b: 1, latexF: 'e^x', exprF: 'exp(x)', latexG: 'e^{-x}', exprG: 'exp(-x)' }
    ]
  },
  {
    id: 'p_sin_curve',
    name: '9. y = sin(x) trên [0, π] (Múi khế - Sở Nam Định)',
    mode: 'single',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 3.14, latexF: '\\sin(x)', exprF: 'sin(x)', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p4_cone_hollow',
    name: '10. Nón cụt rỗng: y = x+1 và y = 0.5x (Chuyên KHTN)',
    mode: 'single',
    hasSecond: true,
    pieces: [
      { id: 1, a: 0, b: 3, latexF: 'x + 1', exprF: 'x + 1', latexG: '0.5x', exprG: '0.5*x' }
    ]
  },
  {
    id: 'p3_cylinder_hollow',
    name: '11. Trụ rỗng ruột: y = 2 và y = 1 trên [0, 3.5]',
    mode: 'single',
    hasSecond: true,
    pieces: [
      { id: 1, a: 0, b: 3.5, latexF: '2', exprF: '2', latexG: '1', exprG: '1' }
    ]
  },

  // ==========================================
  // NHIỀU CÔNG THỨC (Piecewise Formula) - 10 Bài
  // ==========================================
  {
    id: 'p5_vase_piecewise',
    name: '1. Bình hoa nghệ thuật (Chuyên ĐH Vinh - 2 khúc)',
    mode: 'piecewise',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 1, op1: '<', op2: '<', latexF: '\\sqrt{x}', exprF: 'sqrt(x)', latexG: '0', exprG: '0' },
      { id: 2, a: 1, b: 4, op1: '<', op2: '<', latexF: '1 + 0.2\\sin\\left(2x - 2\\right)', exprF: '1 + 0.2*sin(2*x - 2)', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p7_rocket_piecewise',
    name: '2. Mũi & Thân tên lửa vũ trụ (Sở Hà Nội - 2 khúc)',
    mode: 'piecewise',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 2, op1: '<', op2: '<', latexF: '1.2\\sqrt{x}', exprF: '1.2*sqrt(x)', latexG: '0', exprG: '0' },
      { id: 2, a: 2, b: 5, op1: '<', op2: '<', latexF: '1.7', exprF: '1.7', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p_wine_glass',
    name: '3. Cái ly rượu vang cao cấp (Sở Nghệ An - 3 khúc)',
    mode: 'piecewise',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 1.5, op1: '<', op2: '<', latexF: '1.8 - 0.4x', exprF: '1.8 - 0.4*x', latexG: '0', exprG: '0' },
      { id: 2, a: 1.5, b: 4, op1: '<', op2: '<', latexF: '0.35', exprF: '0.35', latexG: '0', exprG: '0' },
      { id: 3, a: 4, b: 7, op1: '<', op2: '<', latexF: '0.35 + 0.25(x - 4)^2', exprF: '0.35 + 0.25*(x - 4)^2', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p6_polyline_piecewise',
    name: '4. Đường gấp khúc 3 đoạn liên hoàn (Sở Nam Định)',
    mode: 'piecewise',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 1, op1: '<', op2: '<', latexF: '2x', exprF: '2*x', latexG: '0', exprG: '0' },
      { id: 2, a: 1, b: 3, op1: '<', op2: '<', latexF: '2', exprF: '2', latexG: '0', exprG: '0' },
      { id: 3, a: 3, b: 5, op1: '<', op2: '<', latexF: '5 - x', exprF: '5 - x', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p_ceramic_vase',
    name: '5. Bình gốm phong thủy uốn lượn (Chuyên KHTN - 2 khúc)',
    mode: 'piecewise',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 2.5, op1: '<', op2: '<', latexF: '2.4 - 0.2(x - 1.5)^2', exprF: '2.4 - 0.2*(x - 1.5)^2', latexG: '0', exprG: '0' },
      { id: 2, a: 2.5, b: 5, op1: '<', op2: '<', latexF: '2.2 + 0.25(x - 3.5)^2', exprF: '2.2 + 0.25*(x - 3.5)^2', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p_light_bulb',
    name: '6. Bóng đèn quả nhót trang trí (Cụm Hải Dương - 2 khúc)',
    mode: 'piecewise',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 1.5, op1: '<', op2: '<', latexF: '0.9', exprF: '0.9', latexG: '0', exprG: '0' },
      { id: 2, a: 1.5, b: 5, op1: '<', op2: '<', latexF: '\\sqrt{4 - 0.4(x - 3.5)^2}', exprF: 'sqrt(4 - 0.4*(x - 3.5)^2)', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p9_hollow_piecewise',
    name: '7. Phễu rót rỗng 2 khúc (Chuyên Lam Sơn - 2 hàm số)',
    mode: 'piecewise',
    hasSecond: true,
    pieces: [
      { id: 1, a: 0, b: 2, op1: '<', op2: '<', latexF: 'x + 1', exprF: 'x + 1', latexG: '0.5x', exprG: '0.5*x' },
      { id: 2, a: 2, b: 4, op1: '<', op2: '<', latexF: '3', exprF: '3', latexG: '1', exprG: '1' }
    ]
  },
  {
    id: 'p_bridge_pillar',
    name: '8. Trụ cầu bê tông uốn lượn (Sở Thái Bình - 2 khúc)',
    mode: 'piecewise',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 2, op1: '<', op2: '<', latexF: '1.2 + 0.3x', exprF: '1.2 + 0.3*x', latexG: '0', exprG: '0' },
      { id: 2, a: 2, b: 6, op1: '<', op2: '<', latexF: '1.8 + 0.3\\cos(1.5x - 3)', exprF: '1.8 + 0.3*cos(1.5*x - 3)', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p_water_barrel',
    name: '9. Thùng gỗ ủ rượu dáng cong (Sở Bắc Giang - 2 khúc)',
    mode: 'piecewise',
    hasSecond: false,
    pieces: [
      { id: 1, a: 0, b: 2.5, op1: '<', op2: '<', latexF: '1.5 + 0.6\\sqrt{x}', exprF: '1.5 + 0.6*sqrt(x)', latexG: '0', exprG: '0' },
      { id: 2, a: 2.5, b: 5, op1: '<', op2: '<', latexF: '2.45 - 0.15(x - 2.5)^2', exprF: '2.45 - 0.15*(x - 2.5)^2', latexG: '0', exprG: '0' }
    ]
  },
  {
    id: 'p_capsule_hollow',
    name: '10. Viên nang thuốc rỗng ruột (Sở Vĩnh Phúc - 2 hàm số 3 khúc)',
    mode: 'piecewise',
    hasSecond: true,
    pieces: [
      { id: 1, a: 0, b: 1.5, op1: '<', op2: '<', latexF: '1.5 + 0.3x', exprF: '1.5 + 0.3*x', latexG: '0.8 + 0.2x', exprG: '0.8 + 0.2*x' },
      { id: 2, a: 1.5, b: 4, op1: '<', op2: '<', latexF: '1.95', exprF: '1.95', latexG: '1.1', exprG: '1.1' },
      { id: 3, a: 4, b: 5.5, op1: '<', op2: '<', latexF: '1.95 - 0.3(x - 4)', exprF: '1.95 - 0.3*(x - 4)', latexG: '1.1 - 0.2(x - 4)', exprG: '1.1 - 0.2*(x - 4)' }
    ]
  }
];

const SolidOfRevolution = () => {
  // Mode: 'single' (1 interval) or 'piecewise' (multiple pieces)
  const [formulaMode, setFormulaMode] = useState('single');
  // Second function toggle: f(x) and g(x)
  const [hasSecondFunc, setHasSecondFunc] = useState(false);

  // Piecewise segments array
  const [pieces, setPieces] = useState([
    {
      id: 1,
      a: 0,
      b: 4,
      op1: '<',
      op2: '<',
      latexF: '\\sqrt{x}',
      exprF: 'sqrt(x)',
      latexG: '0',
      exprG: '0'
    }
  ]);

  // Selected preset tracker
  const [selectedPresetId, setSelectedPresetId] = useState('p1_sqrt');

  // View & Animation state
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'
  const [revolutionAngle, setRevolutionAngle] = useState(0); // 0 to 2PI
  const showWireframe = true;
  const showSolid = true;
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // 3D camera & 2D viewport state
  const [camera, setCamera] = useState({ pitch: 0.42, yaw: -0.55, scale: 55 });
  const [zoom2D, setZoom2D] = useState(1);
  const [pan2D, setPan2D] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);

  const canvasRef = useRef(null);

  // Apply preset handler
  const handleSelectPreset = (e) => {
    const pId = e.target.value;
    setSelectedPresetId(pId);
    const target = PRESETS.find(p => p.id === pId);
    if (!target) return;
    setFormulaMode(target.mode);
    setHasSecondFunc(target.hasSecond);
    setPieces(JSON.parse(JSON.stringify(target.pieces)));
  };

  // Available presets filtered by current formulaMode
  const availablePresets = useMemo(() => {
    return PRESETS.filter(p => p.mode === formulaMode);
  }, [formulaMode]);

  // Switch formula mode and auto-load default preset for that mode
  const handleToggleMode = (newMode) => {
    if (newMode === formulaMode) return;
    setFormulaMode(newMode);
    const available = PRESETS.filter(p => p.mode === newMode);
    if (available.length > 0) {
      const firstPreset = available[0];
      setSelectedPresetId(firstPreset.id);
      setHasSecondFunc(firstPreset.hasSecond);
      setPieces(JSON.parse(JSON.stringify(firstPreset.pieces)));
    }
  };

  // Auto-sync continuous bounds toggle (true by default)
  const [autoSyncBounds, setAutoSyncBounds] = useState(true);

  // Update a single piece's field
  const updatePiece = (id, field, value) => {
    setPieces(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Toggle inequality between '<' and '<='
  const togglePieceIneq = (id, opKey) => {
    setPieces(prev => prev.map(p => {
      if (p.id !== id) return p;
      const current = p[opKey] || '<';
      const nextOp = current === '<' ? '<=' : '<';
      return { ...p, [opKey]: nextOp };
    }));
  };

  // Synchronized boundary updater for piece intervals: [a, b], [b, c], [c, d]...
  const updatePieceBound = (pieceIndex, isLower, value) => {
    setPieces(prev => {
      const next = prev.map(p => ({ ...p }));
      if (formulaMode === 'single' || !autoSyncBounds) {
        if (isLower) next[pieceIndex].a = value;
        else next[pieceIndex].b = value;
        return next;
      }

      if (isLower) {
        next[pieceIndex].a = value;
        if (pieceIndex > 0) {
          next[pieceIndex - 1].b = value;
        }
      } else {
        next[pieceIndex].b = value;
        if (pieceIndex < next.length - 1) {
          next[pieceIndex + 1].a = value;
        }
      }
      return next;
    });
  };

  // Add a new segment
  const handleAddPiece = () => {
    const lastPiece = pieces[pieces.length - 1];
    const newA = lastPiece ? (lastPiece.b !== undefined ? lastPiece.b : 0) : 0;
    const newB = Number(newA) + 2;
    const newId = (lastPiece ? lastPiece.id : 0) + 1;
    setPieces(prev => [
      ...prev,
      {
        id: newId,
        a: newA,
        b: newB,
        op1: '<',
        op2: '<',
        latexF: '2',
        exprF: '2',
        latexG: '0',
        exprG: '0'
      }
    ]);
  };

  // Remove a segment
  const handleRemovePiece = (id) => {
    if (pieces.length <= 1) return;
    setPieces(prev => {
      const filtered = prev.filter(p => p.id !== id);
      for (let i = 1; i < filtered.length; i++) {
        if (filtered[i].a !== filtered[i - 1].b) {
          filtered[i] = { ...filtered[i], a: filtered[i - 1].b };
        }
      }
      return filtered;
    });
  };

  // Compiled segments
  const compiledPieces = useMemo(() => {
    return pieces.map(p => {
      const compiledF = compileExpression(p.exprF);
      const compiledG = compileExpression(p.exprG);
      const a = Number(p.a) || 0;
      const b = Number(p.b) || 0;
      const gFn = hasSecondFunc ? compiledG.f : () => 0;
      const volume = calculatePieceVolume(compiledF.f, gFn, a, b);

      return {
        ...p,
        a,
        b,
        f: compiledF.f,
        g: gFn,
        fError: compiledF.error,
        gError: hasSecondFunc ? compiledG.error : null,
        volume
      };
    });
  }, [pieces, hasSecondFunc]);

  // Total volume calculation
  const totalVolume = useMemo(() => {
    return compiledPieces.reduce((sum, p) => sum + p.volume, 0);
  }, [compiledPieces]);

  // Detected roots for single-interval 2-function intersection
  const detectedRoots = useMemo(() => {
    if (formulaMode !== 'single' || !hasSecondFunc || compiledPieces.length === 0) return [];
    const p = compiledPieces[0];
    if (p.fError || p.gError) return [];
    return findIntersections(p.f, p.g, -6, 8);
  }, [formulaMode, hasSecondFunc, compiledPieces]);

  // Apply roots as bounds
  const applyRootsAsBounds = () => {
    if (detectedRoots.length < 2) return;
    const rootA = detectedRoots[0];
    const rootB = detectedRoots[detectedRoots.length - 1];
    setPieces(prev => [{ ...prev[0], a: rootA, b: rootB }]);
  };

  // Auto-rotation loop
  useEffect(() => {
    if (!isAutoRotating || viewMode !== '3d') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }
    const step = () => {
      setCamera(prev => ({
        ...prev,
        yaw: (prev.yaw + 0.007) % (2 * Math.PI)
      }));
      animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoRotating, viewMode]);

  // Observe canvas container resizing for smooth real-time redrawing
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasDimensions({ width: rect.width, height: rect.height });
      }
    };
    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);
    window.addEventListener('resize', handleResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Main Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

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

    // View bounds across all pieces
    const allA = compiledPieces.map(p => p.a);
    const allB = compiledPieces.map(p => p.b);
    const minGlobalA = allA.length > 0 ? Math.min(...allA, ...allB) : 0;
    const maxGlobalB = allB.length > 0 ? Math.max(...allA, ...allB) : 4;

    // -------------------------------------------------------------------------
    // 2D Oxy Profile View
    // -------------------------------------------------------------------------
    if (viewMode === '2d') {
      const spanX = Math.max(4, maxGlobalB - minGlobalA + 2);
      const baseScale2D = Math.min((cw - 120) / spanX, (ch - 100) / 6, 65);
      const scale2D = baseScale2D * zoom2D;
      const midX = (minGlobalA + maxGlobalB) / 2;
      const originX = cx - midX * scale2D + pan2D.x;
      const originY = cy + 40 + pan2D.y;

      // Smart grid stepping based on zoom level
      let unitStep = 1;
      if (scale2D < 24) unitStep = 2;
      if (scale2D < 12) unitStep = 5;
      if (scale2D < 5) unitStep = 10;

      // Draw subtle grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridStep = scale2D * unitStep;
      const startGridX = ((originX % gridStep) + gridStep) % gridStep;
      for (let x = startGridX; x < cw; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ch);
        ctx.stroke();
      }
      const startGridY = ((originY % gridStep) + gridStep) % gridStep;
      for (let y = startGridY; y < ch; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        ctx.stroke();
      }

      // Draw Axes
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.8;
      // Ox
      ctx.beginPath();
      ctx.moveTo(20, originY);
      ctx.lineTo(cw - 20, originY);
      ctx.stroke();
      // Arrow Ox
      ctx.beginPath();
      ctx.moveTo(cw - 20, originY);
      ctx.lineTo(cw - 28, originY - 5);
      ctx.lineTo(cw - 28, originY + 5);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.fillText('x', cw - 15, originY + 4);

      // Oy
      ctx.beginPath();
      ctx.moveTo(originX, ch - 20);
      ctx.lineTo(originX, 20);
      ctx.stroke();
      // Arrow Oy
      ctx.beginPath();
      ctx.moveTo(originX, 20);
      ctx.lineTo(originX - 5, 28);
      ctx.lineTo(originX + 5, 28);
      ctx.fill();
      ctx.fillText('y', originX + 8, 20);

      // Dynamic Tick marks and numbers based on visible screen bounds
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      const minVisibleX = Math.floor(-originX / scale2D) - 1;
      const maxVisibleX = Math.ceil((cw - originX) / scale2D) + 1;
      for (let i = minVisibleX; i <= maxVisibleX; i++) {
        if (i % unitStep !== 0) continue;
        const tx = originX + i * scale2D;
        if (tx > 15 && tx < cw - 15) {
          ctx.beginPath();
          ctx.moveTo(tx, originY - 3);
          ctx.lineTo(tx, originY + 3);
          ctx.stroke();
          if (i !== 0) {
            ctx.fillText(i, tx - 4, originY + 16);
          }
        }
      }

      const minVisibleY = Math.floor((originY - ch) / scale2D) - 1;
      const maxVisibleY = Math.ceil(originY / scale2D) + 1;
      for (let i = minVisibleY; i <= maxVisibleY; i++) {
        if (i % unitStep !== 0) continue;
        const ty = originY - i * scale2D;
        if (ty > 15 && ty < ch - 15) {
          ctx.beginPath();
          ctx.moveTo(originX - 3, ty);
          ctx.lineTo(originX + 3, ty);
          ctx.stroke();
          if (i !== 0) {
            ctx.fillText(i, originX - 18, ty + 4);
          }
        }
      }

      // Draw Piecewise profiles & shaded regions
      compiledPieces.forEach((piece, idx) => {
        const pa = Math.min(piece.a, piece.b);
        const pb = Math.max(piece.a, piece.b);
        const steps = 120;
        const dx = (pb - pa) / steps;

        // Collect curve points
        const ptsF = [];
        const ptsG = [];
        for (let i = 0; i <= steps; i++) {
          const x = pa + i * dx;
          const yf = evalSafe(piece.f, x);
          const yg = evalSafe(piece.g, x);
          ptsF.push({ x: originX + x * scale2D, y: originY - yf * scale2D });
          ptsG.push({ x: originX + x * scale2D, y: originY - yg * scale2D });
        }

        // Shaded Region (H)
        ctx.beginPath();
        if (ptsF.length > 0) {
          ctx.moveTo(ptsF[0].x, ptsF[0].y);
          ptsF.forEach(pt => ctx.lineTo(pt.x, pt.y));
          for (let i = ptsG.length - 1; i >= 0; i--) {
            ctx.lineTo(ptsG[i].x, ptsG[i].y);
          }
          ctx.closePath();
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(236, 72, 153, 0.28)' : 'rgba(245, 158, 11, 0.28)';
          ctx.fill();
        }

        // Stroke Curves
        // f(x) in pink
        ctx.beginPath();
        ptsF.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // g(x) in cyan if active
        if (hasSecondFunc) {
          ctx.beginPath();
          ptsG.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Boundary dashed lines
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        // line at a
        ctx.beginPath();
        ctx.moveTo(ptsF[0].x, originY);
        ctx.lineTo(ptsF[0].x, Math.min(ptsF[0].y, ptsG[0].y));
        ctx.stroke();
        // line at b
        ctx.beginPath();
        ctx.moveTo(ptsF[ptsF.length - 1].x, originY);
        ctx.lineTo(ptsF[ptsF.length - 1].x, Math.min(ptsF[ptsF.length - 1].y, ptsG[ptsG.length - 1].y));
        ctx.stroke();
        ctx.restore();
      });

      // Rotation indicator arrow around Ox
      const rotCenterX = originX + ((minGlobalA + maxGlobalB) / 2) * scale2D;
      ctx.save();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(rotCenterX, originY, 14, 28, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(rotCenterX, originY + 28);
      ctx.lineTo(rotCenterX - 5, originY + 24);
      ctx.lineTo(rotCenterX - 5, originY + 32);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      ctx.font = '12px sans-serif';
      ctx.fillText('Quay quanh Ox', rotCenterX - 45, originY + 45);
      ctx.restore();

      return;
    }

    // -------------------------------------------------------------------------
    // 3D Solid of Revolution View
    // -------------------------------------------------------------------------
    const polygons = [];
    const lightDir = { x: 0.577, y: 0.577, z: 0.577 }; // Directional light vector

    // Coordinate Axes
    const xMinAxis = Math.min(-4, minGlobalA - 1.5);
    const xMaxAxis = Math.max(5, maxGlobalB + 1.5);
    const axes = [
      { start: [xMinAxis, 0, 0], end: [xMaxAxis, 0, 0], color: '#ef4444', label: 'x (Trục quay)' },
      { start: [0, -4, 0], end: [0, 4, 0], color: '#22c55e', label: 'y' },
      { start: [0, 0, -4], end: [0, 0, 4], color: '#3b82f6', label: 'z' }
    ];

    axes.forEach(axis => {
      const p1 = project(axis.start[0], axis.start[1], axis.start[2], camera.pitch, camera.yaw);
      const p2 = project(axis.end[0], axis.end[1], axis.end[2], camera.pitch, camera.yaw);
      polygons.push({
        type: 'axis',
        z: (p1.z + p2.z) / 2,
        p1,
        p2,
        color: axis.color,
        label: axis.label
      });
    });

    // Mesh resolution
    const xStepsPerPiece = 28;
    const thetaSteps = 36;
    const dTheta = revolutionAngle / thetaSteps;

    compiledPieces.forEach((piece, pieceIdx) => {
      const a = Math.min(piece.a, piece.b);
      const b = Math.max(piece.a, piece.b);
      const h = (b - a) / xStepsPerPiece;
      const palette = SEGMENT_PALETTES[pieceIdx % SEGMENT_PALETTES.length];

      if (showSolid || showWireframe) {
        for (let i = 0; i < xStepsPerPiece; i++) {
          const x1 = a + i * h;
          const x2 = x1 + h;

          const yf1 = evalSafe(piece.f, x1);
          const yf2 = evalSafe(piece.f, x2);
          const yg1 = evalSafe(piece.g, x1);
          const yg2 = evalSafe(piece.g, x2);

          const Rout1 = Math.max(Math.abs(yf1), Math.abs(yg1));
          const Rout2 = Math.max(Math.abs(yf2), Math.abs(yg2));
          const Rin1 = Math.min(Math.abs(yf1), Math.abs(yg1));
          const Rin2 = Math.min(Math.abs(yf2), Math.abs(yg2));

          for (let j = 0; j < thetaSteps; j++) {
            const t1 = j * dTheta;
            const t2 = (j + 1) * dTheta;
            if (t2 > revolutionAngle + 0.001) continue;

            const cos1 = Math.cos(t1), sin1 = Math.sin(t1);
            const cos2 = Math.cos(t2), sin2 = Math.sin(t2);

            // 1. Outer Shell Quad
            const pt1 = project(x1, Rout1 * cos1, Rout1 * sin1, camera.pitch, camera.yaw);
            const pt2 = project(x2, Rout2 * cos1, Rout2 * sin1, camera.pitch, camera.yaw);
            const pt3 = project(x2, Rout2 * cos2, Rout2 * sin2, camera.pitch, camera.yaw);
            const pt4 = project(x1, Rout1 * cos2, Rout1 * sin2, camera.pitch, camera.yaw);

            const avgZOut = (pt1.z + pt2.z + pt3.z + pt4.z) / 4;
            const crossOut = (pt2.u - pt1.u) * (pt4.v - pt1.v) - (pt2.v - pt1.v) * (pt4.u - pt1.u);
            const isFrontOut = crossOut > 0;

            // Simple 3D normal for lighting
            const midTheta = (t1 + t2) / 2;
            const nx = -(Rout2 - Rout1) / (h || 1);
            const ny = Math.cos(midTheta);
            const nz = Math.sin(midTheta);
            const normLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
            const dot = (nx * lightDir.x + ny * lightDir.y + nz * lightDir.z) / normLen;
            const brightnessOut = Math.max(0.35, Math.min(1.0, 0.45 + 0.55 * dot));

            polygons.push({
              type: 'patch-outer',
              z: avgZOut,
              pts: [pt1, pt2, pt3, pt4],
              isFront: isFrontOut,
              brightness: brightnessOut,
              hue: palette.outerHue,
              baseX: x1,
              a, b
            });

            // 2. Inner Hollow Shell Quad (when has second function and inner radius > 0)
            if (hasSecondFunc && (Rin1 + Rin2) / 2 > 0.01) {
              const in1 = project(x1, Rin1 * cos1, Rin1 * sin1, camera.pitch, camera.yaw);
              const in2 = project(x2, Rin2 * cos1, Rin2 * sin1, camera.pitch, camera.yaw);
              const in3 = project(x2, Rin2 * cos2, Rin2 * sin2, camera.pitch, camera.yaw);
              const in4 = project(x1, Rin1 * cos2, Rin1 * sin2, camera.pitch, camera.yaw);

              const avgZIn = (in1.z + in2.z + in3.z + in4.z) / 4;
              const crossIn = (in2.u - in1.u) * (in4.v - in1.v) - (in2.v - in1.v) * (in4.u - in1.u);

              polygons.push({
                type: 'patch-inner',
                z: avgZIn,
                pts: [in1, in2, in3, in4],
                isFront: crossIn > 0,
                hue: palette.innerHue,
                baseX: x1,
                a, b
              });
            }
          }

          // 3. Flat profile (H) or Cutaway Slice Faces
          if (revolutionAngle < 0.02) {
            // Flat 2D shape (H) in 3D space lying on XY plane before revolution starts
            const sl1 = project(x1, Rin1, 0, camera.pitch, camera.yaw);
            const sl2 = project(x2, Rin2, 0, camera.pitch, camera.yaw);
            const sl3 = project(x2, Rout2, 0, camera.pitch, camera.yaw);
            const sl4 = project(x1, Rout1, 0, camera.pitch, camera.yaw);
            polygons.push({
              type: 'slice',
              z: (sl1.z + sl2.z + sl3.z + sl4.z) / 4,
              pts: [sl1, sl2, sl3, sl4],
              hue: palette.outerHue
            });
          } else if (revolutionAngle < 2 * Math.PI - 0.03) {
            // Cut face at theta = 0
            const sl1_0 = project(x1, Rin1, 0, camera.pitch, camera.yaw);
            const sl2_0 = project(x2, Rin2, 0, camera.pitch, camera.yaw);
            const sl3_0 = project(x2, Rout2, 0, camera.pitch, camera.yaw);
            const sl4_0 = project(x1, Rout1, 0, camera.pitch, camera.yaw);
            polygons.push({
              type: 'slice',
              z: (sl1_0.z + sl2_0.z + sl3_0.z + sl4_0.z) / 4,
              pts: [sl1_0, sl2_0, sl3_0, sl4_0],
              hue: palette.outerHue
            });

            // Cut face at theta = revolutionAngle
            const cosEnd = Math.cos(revolutionAngle);
            const sinEnd = Math.sin(revolutionAngle);
            const sl1_e = project(x1, Rin1 * cosEnd, Rin1 * sinEnd, camera.pitch, camera.yaw);
            const sl2_e = project(x2, Rin2 * cosEnd, Rin2 * sinEnd, camera.pitch, camera.yaw);
            const sl3_e = project(x2, Rout2 * cosEnd, Rout2 * sinEnd, camera.pitch, camera.yaw);
            const sl4_e = project(x1, Rout1 * cosEnd, Rout1 * sinEnd, camera.pitch, camera.yaw);
            polygons.push({
              type: 'slice',
              z: (sl1_e.z + sl2_e.z + sl3_e.z + sl4_e.z) / 4,
              pts: [sl1_e, sl2_e, sl3_e, sl4_e],
              hue: palette.outerHue
            });
          }
        }

        // 4. End-Cap Washers at a and b
        const endCaps = [
          { x: a, Rout: Math.max(Math.abs(evalSafe(piece.f, a)), Math.abs(evalSafe(piece.g, a))), Rin: Math.min(Math.abs(evalSafe(piece.f, a)), Math.abs(evalSafe(piece.g, a))) },
          { x: b, Rout: Math.max(Math.abs(evalSafe(piece.f, b)), Math.abs(evalSafe(piece.g, b))), Rin: Math.min(Math.abs(evalSafe(piece.f, b)), Math.abs(evalSafe(piece.g, b))) }
        ];

        endCaps.forEach(cap => {
          if (cap.Rout - cap.Rin > 0.01) {
            for (let j = 0; j < thetaSteps; j++) {
              const t1 = j * dTheta;
              const t2 = (j + 1) * dTheta;
              if (t2 > revolutionAngle + 0.001) continue;

              const c1 = project(cap.x, cap.Rin * Math.cos(t1), cap.Rin * Math.sin(t1), camera.pitch, camera.yaw);
              const c2 = project(cap.x, cap.Rout * Math.cos(t1), cap.Rout * Math.sin(t1), camera.pitch, camera.yaw);
              const c3 = project(cap.x, cap.Rout * Math.cos(t2), cap.Rout * Math.sin(t2), camera.pitch, camera.yaw);
              const c4 = project(cap.x, cap.Rin * Math.cos(t2), cap.Rin * Math.sin(t2), camera.pitch, camera.yaw);

              polygons.push({
                type: 'cap',
                z: (c1.z + c2.z + c3.z + c4.z) / 4,
                pts: [c1, c2, c3, c4],
                hue: palette.outerHue
              });
            }
          }
        });
      }
    });

    // Painter's Algorithm: Sort polygons by depth (furthest to nearest)
    polygons.sort((pA, pB) => pA.z - pB.z);

    // Render sorted elements
    polygons.forEach(poly => {
      if (poly.type === 'axis') {
        ctx.beginPath();
        ctx.moveTo(cx + poly.p1.u * camera.scale, cy + poly.p1.v * camera.scale);
        ctx.lineTo(cx + poly.p2.u * camera.scale, cy + poly.p2.v * camera.scale);
        ctx.strokeStyle = poly.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = poly.color;
        ctx.font = '12px sans-serif';
        ctx.fillText(poly.label, cx + poly.p2.u * camera.scale + 6, cy + poly.p2.v * camera.scale + 4);
      } else {
        ctx.beginPath();
        ctx.moveTo(cx + poly.pts[0].u * camera.scale, cy + poly.pts[0].v * camera.scale);
        for (let i = 1; i < 4; i++) {
          ctx.lineTo(cx + poly.pts[i].u * camera.scale, cy + poly.pts[i].v * camera.scale);
        }
        ctx.closePath();

        if (showSolid) {
          if (poly.type === 'patch-outer') {
            const lightness = poly.isFront
              ? Math.floor(45 + poly.brightness * 25)
              : Math.floor(25 + poly.brightness * 15);
            ctx.fillStyle = `hsl(${poly.hue}, 80%, ${lightness}%)`;
            ctx.fill();
          } else if (poly.type === 'patch-inner') {
            // Inner hollow cavity in teal/cyan
            const inLightness = poly.isFront ? 35 : 22;
            ctx.fillStyle = `hsl(${poly.hue}, 85%, ${inLightness}%)`;
            ctx.fill();
          } else if (poly.type === 'cap') {
            ctx.fillStyle = `hsl(${poly.hue}, 70%, 42%)`;
            ctx.fill();
          } else if (poly.type === 'slice') {
            ctx.fillStyle = `hsla(${poly.hue}, 85%, 60%, 0.85)`;
            ctx.fill();
          }
        }

        if (showWireframe) {
          if (poly.type === 'patch-inner') {
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
          } else if (poly.type === 'slice') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          } else {
            ctx.strokeStyle = poly.isFront ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)';
          }
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    });
  }, [compiledPieces, revolutionAngle, camera, showWireframe, showSolid, hasSecondFunc, viewMode, zoom2D, pan2D, canvasDimensions]);

  // Pointer drag controls for 3D rotation and 2D panning
  const handlePointerDown = (e) => {
    setIsDragging(true);
    if (viewMode === '3d') {
      setIsAutoRotating(false);
    }
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

      if (viewMode === '3d') {
        setCamera(prev => ({
          ...prev,
          yaw: prev.yaw - dx * 0.01,
          pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.pitch + dy * 0.01))
        }));
      } else {
        setPan2D(prev => ({
          x: prev.x + dx,
          y: prev.y + dy
        }));
      }
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
  }, [isDragging, viewMode]);

  // Mouse wheel zoom listener for both 3D and 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (viewMode === '3d') {
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        setCamera(prev => ({
          ...prev,
          scale: Math.max(15, Math.min(300, prev.scale * factor))
        }));
      } else {
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        setZoom2D(prev => Math.max(0.25, Math.min(8, prev * factor)));
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [viewMode]);

  // Zoom controls (+ / - buttons)
  const handleZoom = (delta) => {
    if (viewMode === '3d') {
      setCamera(prev => ({
        ...prev,
        scale: Math.max(15, Math.min(300, prev.scale + delta))
      }));
    } else {
      const factor = delta > 0 ? 1.2 : 0.83;
      setZoom2D(prev => Math.max(0.25, Math.min(8, prev * factor)));
    }
  };

  // Reset viewport (both 3D camera and 2D pan/zoom)
  const handleResetCamera = () => {
    setCamera({ pitch: 0.42, yaw: -0.55, scale: 55 });
    setZoom2D(1);
    setPan2D({ x: 0, y: 0 });
    setIsAutoRotating(false);
  };

  return (
    <div className="solid-revolution-container">
      {/* Sidebar Controls */}
      <div className="solid-sidebar">
        <div className="solid-title-box">
          <h3 className="solid-title">Thể Tích Tròn Xoay</h3>
        </div>

        {/* Mode Selector */}
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-btn ${formulaMode === 'single' ? 'active' : ''}`}
            onClick={() => handleToggleMode('single')}
          >
            1 Công thức
          </button>
          <button
            type="button"
            className={`segmented-btn ${formulaMode === 'piecewise' ? 'active' : ''}`}
            onClick={() => handleToggleMode('piecewise')}
          >
            Nhiều công thức
          </button>
        </div>

        {/* Preset Selector (Filtered by active mode) */}
        <div className="preset-section">
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Bài toán mẫu ({formulaMode === 'single' ? '1 công thức' : 'nhiều công thức'}):
          </label>
          <select 
            className="preset-select" 
            value={selectedPresetId} 
            onChange={handleSelectPreset}
          >
            {availablePresets.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* 1 Func vs 2 Funcs Toggle */}
        <div className="control-panel">
          <label className="checkbox-row">
            <input 
              type="checkbox" 
              checked={hasSecondFunc} 
              onChange={e => setHasSecondFunc(e.target.checked)} 
            />
            <span>Giới hạn bởi 2 đồ thị hàm số</span>
          </label>

          {formulaMode === 'piecewise' ? (
            <div className="piecewise-display-box">
              <div className="piecewise-display-header">
                <span className="piecewise-display-title">
                  <Sparkles size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
                  Biểu diễn hàm số nhiều công thức:
                </span>
              </div>
              
              {/* Piecewise representation of f(x) */}
              <div className="piecewise-math-card">
                <MathLatex 
                  math={getPiecewiseFunctionLatex(pieces, 'latexF', 'f')} 
                  display={false} 
                />
              </div>

              {/* Piecewise representation of g(x) if active */}
              {hasSecondFunc && (
                <div className="piecewise-math-card" style={{ marginTop: '6px' }}>
                  <MathLatex 
                    math={getPiecewiseFunctionLatex(pieces, 'latexG', 'g')} 
                    display={false} 
                  />
                </div>
              )}

              {/* General Volume Formula */}
              <div className="piecewise-general-v">
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0284c7', marginBottom: '2px' }}>
                  💡 Công thức tính thể tích:
                </div>
                <div style={{ overflowX: 'auto', textAlign: 'center', padding: '2px 0' }}>
                  <MathLatex 
                    math={getGeneralFormulaLatex(formulaMode, hasSecondFunc, pieces.length)} 
                    display={false} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#0e7490', 
              background: '#ecfeff', 
              border: '1px solid #bae6fd', 
              padding: '8px 12px', 
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <span>💡 Công thức tổng quát:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 0', overflowX: 'auto', maxWidth: '100%' }}>
                <MathLatex
                  math={getGeneralFormulaLatex(formulaMode, hasSecondFunc, pieces.length)}
                  display={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pieces List */}
        <div className="pieces-container">
          {formulaMode === 'piecewise' && (
            <div className="pieces-section-header">
              <span>Tùy chỉnh các hàm số & điều kiện:</span>
              <label className="sync-bounds-toggle" title="Tự động giữ cận cuối khúc trước khớp với cận đầu khúc sau">
                <input 
                  type="checkbox" 
                  checked={autoSyncBounds} 
                  onChange={e => setAutoSyncBounds(e.target.checked)} 
                />
                <span>Khớp cận liên tục</span>
              </label>
            </div>
          )}

          {pieces.map((piece, index) => {
            const palette = SEGMENT_PALETTES[index % SEGMENT_PALETTES.length];
            const lowerLabel = formulaMode === 'single' ? 'a' : getBoundLabel(index);
            const upperLabel = formulaMode === 'single' ? 'b' : getBoundLabel(index + 1);

            return (
              <div key={piece.id} className="piece-card">
                <div className="piece-header">
                  <div className="piece-title-tag">
                    <span className="piece-color-dot" style={{ backgroundColor: palette.dotColor }} />
                    <span>{formulaMode === 'piecewise' ? `Khúc ${index + 1}` : 'Hàm số'}</span>
                  </div>
                  {formulaMode === 'piecewise' && pieces.length > 1 && (
                    <button 
                      type="button" 
                      className="btn-icon-danger" 
                      onClick={() => handleRemovePiece(piece.id)}
                      title="Xóa khúc này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Function f(x) */}
                <div>
                  <div className="func-label-row">
                    <span className="func-badge f">
                      {formulaMode === 'piecewise' ? `y = f${getSubscript(index + 1)}(x)` : 'y = f(x)'}
                    </span>
                  </div>
                  <MathInput
                    value={piece.latexF}
                    onChange={(latex, ascii) => {
                      updatePiece(piece.id, 'latexF', latex);
                      updatePiece(piece.id, 'exprF', ascii);
                    }}
                  />
                </div>

                {/* Function g(x) if active */}
                {hasSecondFunc && (
                  <div>
                    <div className="func-label-row">
                      <span className="func-badge g">
                        {formulaMode === 'piecewise' ? `y = g${getSubscript(index + 1)}(x)` : 'y = g(x)'}
                      </span>
                    </div>
                    <MathInput
                      value={piece.latexG}
                      onChange={(latex, ascii) => {
                        updatePiece(piece.id, 'latexG', latex);
                        updatePiece(piece.id, 'exprG', ascii);
                      }}
                    />
                  </div>
                )}

                {/* Domain Bounds: if piecewise, show "nếu a < x < b" */}
                {formulaMode === 'piecewise' ? (
                  <div className="piecewise-condition-box">
                    <span className="condition-prefix">Điều kiện:</span>
                    
                    <input 
                      type="number" 
                      step="any"
                      className="condition-bound-input"
                      value={piece.a !== undefined ? piece.a : ''} 
                      onChange={e => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        updatePieceBound(index, true, val);
                      }}
                      placeholder="a"
                    />

                    <button 
                      type="button"
                      className="condition-op-btn"
                      onClick={() => togglePieceIneq(piece.id, 'op1')}
                      title="Bấm để đổi dấu so sánh (< hoặc ≤)"
                    >
                      {piece.op1 === '<=' ? '≤' : '<'}
                    </button>

                    <span className="condition-variable">x</span>

                    <button 
                      type="button"
                      className="condition-op-btn"
                      onClick={() => togglePieceIneq(piece.id, 'op2')}
                      title="Bấm để đổi dấu so sánh (< hoặc ≤)"
                    >
                      {piece.op2 === '<=' ? '≤' : '<'}
                    </button>

                    <input 
                      type="number" 
                      step="any"
                      className="condition-bound-input"
                      value={piece.b !== undefined ? piece.b : ''} 
                      onChange={e => {
                        const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                        updatePieceBound(index, false, val);
                      }}
                      placeholder="b"
                    />
                  </div>
                ) : (
                  <div className="domain-inputs">
                    <div className="domain-field">
                      <label>Từ {lowerLabel} =</label>
                      <input 
                        type="number" 
                        step="any"
                        value={piece.a !== undefined ? piece.a : ''} 
                        onChange={e => {
                          const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                          updatePieceBound(index, true, val);
                        }}
                      />
                    </div>
                    <div className="domain-field">
                      <label>Đến {upperLabel} =</label>
                      <input 
                        type="number" 
                        step="any"
                        value={piece.b !== undefined ? piece.b : ''} 
                        onChange={e => {
                          const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                          updatePieceBound(index, false, val);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Quick Auto-Roots detector if single 2-function */}
                {formulaMode === 'single' && hasSecondFunc && detectedRoots.length >= 2 && (
                  <button 
                    type="button" 
                    className="roots-detect-btn"
                    onClick={applyRootsAsBounds}
                    title="Đặt cận tích phân bằng các hoành độ giao điểm"
                  >
                    <Target size={14} />
                    Lấy cận từ giao điểm [{detectedRoots[0]}; {detectedRoots[detectedRoots.length - 1]}]
                  </button>
                )}
              </div>
            );
          })}

          {formulaMode === 'piecewise' && (
            <button 
              type="button" 
              className="btn-add-piece"
              onClick={handleAddPiece}
            >
              <Plus size={16} /> Thêm khoảng công thức mới
            </button>
          )}
        </div>

        {/* Display and Angle Slider */}
        <div className="control-panel">
          <div className="slider-group">
            <div className="slider-top">
              <span>Góc quay (radians):</span>
              <span className="slider-badge">
                {(revolutionAngle / Math.PI).toFixed(2).replace('.', ',')}π ({Math.round(revolutionAngle * 180 / Math.PI)}°)
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="360" 
              step="1"
              value={Math.round(revolutionAngle * 180 / Math.PI)}
              onChange={e => setRevolutionAngle(parseFloat(e.target.value) * Math.PI / 180)}
            />
          </div>
        </div>

        {/* Volume Calculation Stats Card */}
        <div className="volume-card">
          <div className="volume-card-title">Kết quả thể tích (V)</div>
          
          <div className="volume-formula-container">
            <div style={{ overflowX: 'auto', padding: '6px 2px', textAlign: 'center' }}>
              <MathLatex
                math={`${getCombinedVolumeFormulaLatex(pieces, hasSecondFunc)} \\approx ${totalVolume.toFixed(4).replace('.', ',')}`}
                display={false}
                style={{ fontSize: '1.02rem', color: '#0f172a' }}
              />
            </div>

            <div className="volume-total-display">
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Thể tích tổng (V):
              </span>
              <span className="volume-total-val">
                {totalVolume.toFixed(4).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="solid-canvas-area">
        {/* Top Control Bar */}
        <div className="canvas-top-bar">
          <div className="view-mode-tabs">
            <button 
              type="button" 
              className={`view-mode-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              <Box size={14} /> Không gian 3D
            </button>
            <button 
              type="button" 
              className={`view-mode-btn ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => setViewMode('2d')}
            >
              <Square size={14} /> Mặt phẳng Oxy (2D)
            </button>
          </div>

          <div className="canvas-hint-badge">
            <MousePointer2 size={14} />
            {viewMode === '3d' 
              ? 'Kéo chuột để xoay 3D | Lăn chuột để thu phóng' 
              : 'Kéo chuột để di chuyển | Lăn chuột để thu phóng'}
          </div>
        </div>

        {/* Bottom Floating Canvas Controls */}
        <div className="canvas-floating-controls">
          {viewMode === '3d' && (
            <button 
              type="button"
              className={`canvas-btn ${isAutoRotating ? 'active' : ''}`}
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              title={isAutoRotating ? 'Dừng tự động xoay' : 'Tự động xoay 3D'}
            >
              {isAutoRotating ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}

          <button 
            type="button" 
            className="canvas-btn" 
            onClick={() => handleZoom(10)} 
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            type="button" 
            className="canvas-btn" 
            onClick={() => handleZoom(-10)} 
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            type="button" 
            className="canvas-btn" 
            onClick={handleResetCamera} 
            title="Đặt lại góc nhìn mặc định"
          >
            <RotateCw size={16} />
          </button>
        </div>

        {/* Interactive Canvas */}
        <canvas 
          ref={canvasRef}
          className="render-canvas"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
      </div>
    </div>
  );
};

export default SolidOfRevolution;
