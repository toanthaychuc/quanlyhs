import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  RotateCw,
  MousePointer2,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Target,
  Box,
  Square,
  Scissors
} from 'lucide-react';
import {
  compileExpression,
  evalSafe,
  findIntersections,
  MathInput,
  MathLatex
} from './calculusUtils';
import './CrossSectionSolidVolume.css';

// 3D projection where (x, y) is the horizontal Oxy floor and z >= 0 is vertical height UP
const project3D = (x, y, z, pitch, yaw) => {
  const x1 = x * Math.cos(yaw) - y * Math.sin(yaw);
  const y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
  const z1 = z;
  const u = x1;
  const v = -z1 * Math.cos(pitch) + y1 * Math.sin(pitch);
  const depth = y1 * Math.cos(pitch) + z1 * Math.sin(pitch);
  return { u, v, z: depth };
};

const formatCoeffLatex = (val) => {
  for (const denBase of [12, 20, 60, 300]) {
    const n = Math.round(val * denBase);
    if (Math.abs(val - n / denBase) < 1e-5) {
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(Math.abs(n), denBase);
      const p = n / g;
      const q = denBase / g;
      if (q === 1) return String(p);
      if (q <= 30) return `\\frac{${p}}{${q}}`;
    }
  }
  return String(Number(val.toFixed(3)));
};

const isAtomicTex = (tex) => /^([a-zA-Z]|\d+(?:\.\d+)?)$/.test(tex);

const extractPureSqrt = (tex) => {
  if (!tex || !tex.startsWith('\\sqrt{')) return null;
  let depth = 0;
  for (let i = 5; i < tex.length; i++) {
    if (tex[i] === '{') depth++;
    else if (tex[i] === '}') {
      depth--;
      if (depth === 0) {
        return i === tex.length - 1 ? tex.slice(6, i).trim() : null;
      }
    }
  }
  return null;
};

const hasBalancedOuterParens = (tex) => {
  if (tex.startsWith('\\left(') && tex.endsWith('\\right)')) return true;
  if (!tex.startsWith('(') || !tex.endsWith(')')) return false;
  let depth = 0;
  for (let i = 0; i < tex.length; i++) {
    if (tex[i] === '(') depth++;
    else if (tex[i] === ')') {
      depth--;
      if (depth === 0 && i < tex.length - 1) return false;
    }
  }
  return depth === 0;
};

const wrapPow2Tex = (tex) => {
  if (isAtomicTex(tex) || hasBalancedOuterParens(tex)) return `${tex}^2`;
  return `\\left(${tex}\\right)^2`;
};

const wrapFactorTex = (tex) => {
  if (isAtomicTex(tex) || hasBalancedOuterParens(tex) || /^\\sqrt\{[^}]+\}$/.test(tex)) return tex;
  return `\\left(${tex}\\right)`;
};

// Cross-section shape definitions
const SECTION_SHAPES = [
  {
    id: 'equilateral_triangle',
    name: 'Tam giác đều',
    shortSymbol: '△',
    desc: 'Thiết diện là tam giác đều cạnh d(x) nằm trên đáy (Oxy)',
    chordNoun: 'cạnh',
    getFactor: () => Math.sqrt(3) / 4,
    getHeightFactor: () => Math.sqrt(3) / 2,
    getCoeffLatex: (isSym) => (isSym ? '\\sqrt{3}' : '\\frac{\\sqrt{3}}{4}')
  },
  {
    id: 'square',
    name: 'Hình vuông',
    shortSymbol: '□',
    desc: 'Thiết diện là hình vuông cạnh d(x) vuông góc với trục Ox',
    chordNoun: 'cạnh',
    getFactor: () => 1,
    getHeightFactor: () => 1,
    getCoeffLatex: (isSym) => (isSym ? '4' : '')
  },
  {
    id: 'semicircle',
    name: 'Nửa hình tròn',
    shortSymbol: '◓',
    desc: 'Thiết diện là nửa hình tròn đường kính d(x) nằm trên (Oxy)',
    chordNoun: 'đường kính',
    getFactor: () => Math.PI / 8,
    getHeightFactor: () => 0.5,
    getCoeffLatex: (isSym) => (isSym ? '\\frac{\\pi}{2}' : '\\frac{\\pi}{8}')
  },
  {
    id: 'rectangle',
    name: 'Hình chữ nhật',
    shortSymbol: '▭',
    desc: 'Thiết diện là hình chữ nhật đáy d(x), chiều cao h(x) = k·d(x)',
    chordNoun: 'đáy',
    getFactor: ({ rectRatio }) => rectRatio,
    getHeightFactor: ({ rectRatio }) => rectRatio,
    getCoeffLatex: (isSym, { rectRatio }) => {
      const c = formatCoeffLatex(isSym ? 4 * rectRatio : rectRatio);
      return c === '1' ? '' : c;
    }
  },
  {
    id: 'right_triangle_leg',
    name: 'TG vuông cân (cạnh góc vuông)',
    shortSymbol: '📐',
    desc: 'Tam giác vuông cân có cạnh góc vuông d(x) nằm trên mặt đáy (Oxy)',
    chordNoun: 'cạnh góc vuông',
    getFactor: () => 0.5,
    getHeightFactor: () => 1,
    getCoeffLatex: (isSym) => (isSym ? '2' : '\\frac{1}{2}')
  },
  {
    id: 'right_triangle_hyp',
    name: 'TG vuông cân (cạnh huyền)',
    shortSymbol: '◣',
    desc: 'Tam giác vuông cân có cạnh huyền d(x) nằm trên mặt đáy (Oxy)',
    chordNoun: 'cạnh huyền',
    getFactor: () => 0.25,
    getHeightFactor: () => 0.5,
    getCoeffLatex: (isSym) => (isSym ? '' : '\\frac{1}{4}')
  },
  {
    id: 'wedge_angle',
    name: 'Cái nêm trụ (TG vuông góc α)',
    shortSymbol: '⛰',
    desc: 'Mặt phẳng nghiêng góc α cắt hình trụ theo thiết diện tam giác vuông',
    chordNoun: 'cạnh đáy',
    getFactor: ({ wedgeAngleDeg }) => 0.5 * Math.tan((wedgeAngleDeg * Math.PI) / 180),
    getHeightFactor: ({ wedgeAngleDeg }) => Math.tan((wedgeAngleDeg * Math.PI) / 180),
    getCoeffLatex: (isSym, { wedgeAngleDeg }) =>
      `${isSym ? '2' : '\\frac{1}{2}'}\\tan(${wedgeAngleDeg}^\\circ)\\,`
  },
  {
    id: 'parabola_arch',
    name: 'Vòm Parabol (2/3·đáy·cao)',
    shortSymbol: '⌒',
    desc: 'Thiết diện là mảnh parabol có đáy d(x) và chiều cao h(x) = k·d(x)',
    chordNoun: 'đáy',
    getFactor: ({ rectRatio }) => (2 / 3) * rectRatio,
    getHeightFactor: ({ rectRatio }) => rectRatio,
    getCoeffLatex: (isSym, { rectRatio }) => {
      const c = formatCoeffLatex((isSym ? 8 / 3 : 2 / 3) * rectRatio);
      return c === '1' ? '' : c;
    }
  }
];

const buildSectionAreaDetails = ({ baseMode, shapeDef, latexF, latexG, shapeParams }) => {
  const fClean = (latexF || '').trim() || 'f(x)';
  const gClean = (latexG || '').trim() || 'g(x)';
  const isSym = baseMode === 'symmetric';
  const coeff = shapeDef.getCoeffLatex(isSym, shapeParams);

  let sideLatex;
  let sqTerm;
  let simplifiedTerm = null;

  if (isSym) {
    sideLatex = `d(x) = 2${wrapFactorTex(fClean)}`;
    sqTerm = wrapPow2Tex(fClean);
    const sqrtInner = extractPureSqrt(fClean);
    if (sqrtInner) {
      simplifiedTerm = isAtomicTex(sqrtInner) ? sqrtInner : `\\left(${sqrtInner}\\right)`;
    }
  } else if (baseMode === 'two_funcs') {
    const gTerm = /[+-]/.test(gClean) && !hasBalancedOuterParens(gClean) ? `\\left(${gClean}\\right)` : gClean;
    const diff = `${fClean} - ${gTerm}`;
    sideLatex = `d(x) = \\left|${diff}\\right|`;
    sqTerm = `\\left(${diff}\\right)^2`;
  } else {
    sideLatex = `d(x) = ${fClean}`;
    sqTerm = wrapPow2Tex(fClean);
    const sqrtInner = extractPureSqrt(fClean);
    if (sqrtInner) {
      simplifiedTerm = isAtomicTex(sqrtInner) ? sqrtInner : `\\left(${sqrtInner}\\right)`;
    }
  }

  const exprMain = coeff ? `${coeff}${sqTerm}` : sqTerm;
  const exprSimple = simplifiedTerm ? (coeff ? `${coeff}${simplifiedTerm}` : simplifiedTerm) : null;
  const areaLatex = exprSimple ? `S(x) = ${exprMain} = ${exprSimple}` : `S(x) = ${exprMain}`;

  return { sideLatex, areaLatex };
};

// Generate 3D profile points [(y, z), ...] for a cross section at a given x
// where base chord goes from yLow to yHigh on z = 0
const buildSectionProfilePoints = (sectionType, yLow, yHigh, params, curveSteps = 20) => {
  const d = Math.max(0, yHigh - yLow);
  const yc = (yLow + yHigh) / 2;
  if (d < 1e-6) {
    return [
      { y: yc, z: 0 },
      { y: yc, z: 0 }
    ];
  }

  switch (sectionType) {
    case 'equilateral_triangle': {
      const h = (Math.sqrt(3) / 2) * d;
      return [
        { y: yLow, z: 0 },
        { y: yc, z: h },
        { y: yHigh, z: 0 }
      ];
    }
    case 'square': {
      return [
        { y: yLow, z: 0 },
        { y: yLow, z: d },
        { y: yHigh, z: d },
        { y: yHigh, z: 0 }
      ];
    }
    case 'rectangle': {
      const h = (params.rectRatio || 0.5) * d;
      return [
        { y: yLow, z: 0 },
        { y: yLow, z: h },
        { y: yHigh, z: h },
        { y: yHigh, z: 0 }
      ];
    }
    case 'semicircle': {
      const r = d / 2;
      const pts = [];
      for (let j = 0; j <= curveSteps; j++) {
        const theta = Math.PI - (j / curveSteps) * Math.PI;
        pts.push({
          y: yc + r * Math.cos(theta),
          z: r * Math.sin(theta)
        });
      }
      return pts;
    }
    case 'right_triangle_leg': {
      return [
        { y: yLow, z: 0 },
        { y: yLow, z: d },
        { y: yHigh, z: 0 }
      ];
    }
    case 'right_triangle_hyp': {
      return [
        { y: yLow, z: 0 },
        { y: yc, z: d / 2 },
        { y: yHigh, z: 0 }
      ];
    }
    case 'wedge_angle': {
      const alpha = ((params.wedgeAngleDeg || 45) * Math.PI) / 180;
      const h = d * Math.tan(alpha);
      return [
        { y: yLow, z: 0 },
        { y: yHigh, z: h },
        { y: yHigh, z: 0 }
      ];
    }
    case 'parabola_arch': {
      const h = (params.rectRatio || 0.75) * d;
      const pts = [];
      for (let j = 0; j <= curveSteps; j++) {
        const u = -1 + (2 * j) / curveSteps; // -1 to 1
        pts.push({
          y: yc + u * (d / 2),
          z: h * (1 - u * u)
        });
      }
      return pts;
    }
    default:
      return [
        { y: yLow, z: 0 },
        { y: yc, z: d },
        { y: yHigh, z: 0 }
      ];
  }
};

// Classroom & Exam Presets matching the reference sheet and Grade 12 Textbooks
const PRESETS = [
  {
    id: 'circle_equilateral',
    name: '1. Đáy hình tròn R=2, thiết diện Tam giác đều (SGK & Đề minh họa)',
    baseMode: 'symmetric',
    sectionType: 'equilateral_triangle',
    a: -2,
    b: 2,
    latexF: '\\sqrt{4 - x^2}',
    exprF: 'sqrt(4 - x^2)',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  },
  {
    id: 'steinmetz_bicylinder',
    name: '2. Giao 2 hình trụ vuông góc R=2 — Thiết diện Hình vuông S(x)=4(4-x²)',
    baseMode: 'symmetric',
    sectionType: 'square',
    a: -2,
    b: 2,
    latexF: '\\sqrt{4 - x^2}',
    exprF: 'sqrt(4 - x^2)',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  },
  {
    id: 'cylindrical_wedge',
    name: '3. Cái nêm hình trụ (Móng ngựa) R=2, góc nghiêng α=45° (SGK Toán 12)',
    baseMode: 'ox',
    sectionType: 'wedge_angle',
    a: -2,
    b: 2,
    latexF: '\\sqrt{4 - x^2}',
    exprF: 'sqrt(4 - x^2)',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  },
  {
    id: 'circle_rect_2r2',
    name: '4. Đáy hình tròn R=2, thiết diện Hình chữ nhật S(x)=2r²(x)',
    baseMode: 'symmetric',
    sectionType: 'rectangle',
    a: -2,
    b: 2,
    latexF: '\\sqrt{4 - x^2}',
    exprF: 'sqrt(4 - x^2)',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  },
  {
    id: 'parabola_equilateral',
    name: '5. Đáy Parabol y = ±√x trên [0, 4], thiết diện Tam giác đều',
    baseMode: 'symmetric',
    sectionType: 'equilateral_triangle',
    a: 0,
    b: 4,
    latexF: '\\sqrt{x}',
    exprF: 'sqrt(x)',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  },
  {
    id: 'parabola_arch_solid',
    name: '6. Thiết diện Vòm Parabol S(x) = (2/3)·a(x)·b(x) trên [0, 4]',
    baseMode: 'symmetric',
    sectionType: 'parabola_arch',
    a: 0,
    b: 4,
    latexF: '1 + 0.25x',
    exprF: '1 + 0.25*x',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.75,
    wedgeAngleDeg: 45
  },
  {
    id: 'ellipse_semicircle',
    name: '7. Đáy Elip x²/9 + y²/4 ≤ 1, thiết diện Nửa hình tròn',
    baseMode: 'symmetric',
    sectionType: 'semicircle',
    a: -3,
    b: 3,
    latexF: '\\frac{2}{3}\\sqrt{9 - x^2}',
    exprF: '(2/3)*sqrt(9 - x^2)',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  },
  {
    id: 'two_curves_square',
    name: '8. Đáy giới hạn bởi y = √x và y = x² trên [0, 1], thiết diện Hình vuông',
    baseMode: 'two_funcs',
    sectionType: 'square',
    a: 0,
    b: 1,
    latexF: '\\sqrt{x}',
    exprF: 'sqrt(x)',
    latexG: 'x^2',
    exprG: 'x^2',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  },
  {
    id: 'hyperbolic_waist_rect',
    name: '9. Khối eo cong y = ±(1 + 0.2x²) trên [-2, 2], thiết diện Hình vuông',
    baseMode: 'symmetric',
    sectionType: 'square',
    a: -2,
    b: 2,
    latexF: '1 + 0.2x^2',
    exprF: '1 + 0.2*x^2',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  },
  {
    id: 'sin_right_triangle',
    name: '10. Đáy y = sin(x) trên [0, π], thiết diện Tam giác vuông cân',
    baseMode: 'ox',
    sectionType: 'right_triangle_leg',
    a: 0,
    b: 3.14,
    latexF: '\\sin(x)',
    exprF: 'sin(x)',
    latexG: '0',
    exprG: '0',
    rectRatio: 0.5,
    wedgeAngleDeg: 45
  }
];

const CrossSectionSolidVolume = () => {
  const [selectedPresetId, setSelectedPresetId] = useState(PRESETS[0].id);
  const [baseMode, setBaseMode] = useState('symmetric'); // 'ox' | 'symmetric' | 'two_funcs'
  const [sectionType, setSectionType] = useState('equilateral_triangle');

  const [boundA, setBoundA] = useState(-2);
  const [boundB, setBoundB] = useState(2);
  const [latexF, setLatexF] = useState('\\sqrt{4 - x^2}');
  const [exprF, setExprF] = useState('sqrt(4 - x^2)');
  const [latexG, setLatexG] = useState('0');
  const [exprG, setExprG] = useState('0');

  const [rectRatio, setRectRatio] = useState(0.5);
  const [wedgeAngleDeg, setWedgeAngleDeg] = useState(45);

  // Interactive slicing plane position x0 in [a, b]
  const [sliceProgress, setSliceProgress] = useState(0.42); // 0..1 across [a, b]
  const [isPlayingSlice, setIsPlayingSlice] = useState(false);

  // Viewport states
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
  const [camera, setCamera] = useState({ pitch: 0.48, yaw: -0.62, scale: 58 });
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [zoom2D, setZoom2D] = useState(1);
  const [pan2D, setPan2D] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef(null);
  const inspectorCanvasRef = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const animRotRef = useRef(null);
  const animSliceRef = useRef(null);

  const compiledF = useMemo(() => compileExpression(exprF), [exprF]);
  const compiledG = useMemo(
    () => (baseMode === 'two_funcs' ? compileExpression(exprG) : { f: () => 0, error: null }),
    [exprG, baseMode]
  );

  const activeShapeDef = useMemo(
    () => SECTION_SHAPES.find((s) => s.id === sectionType) || SECTION_SHAPES[0],
    [sectionType]
  );

  const shapeParams = useMemo(
    () => ({ rectRatio, wedgeAngleDeg }),
    [rectRatio, wedgeAngleDeg]
  );

  // Helper returning [yLow, yHigh] at any x
  const getChordBoundsAtX = useMemo(() => {
    return (x) => {
      const vf = evalSafe(compiledF.f, x);
      if (baseMode === 'symmetric') {
        const r = Math.abs(vf);
        return [-r, r];
      }
      if (baseMode === 'two_funcs') {
        const vg = evalSafe(compiledG.f, x);
        return [Math.min(vf, vg), Math.max(vf, vg)];
      }
      return [Math.min(0, vf), Math.max(0, vf)];
    };
  }, [compiledF, compiledG, baseMode]);

  const minX = Math.min(Number(boundA) || 0, Number(boundB) || 0);
  const maxX = Math.max(Number(boundA) || 0, Number(boundB) || 0);
  const x0 = minX + sliceProgress * (maxX - minX);

  // Instantaneous values at x0
  const sliceStats = useMemo(() => {
    const [yLow, yHigh] = getChordBoundsAtX(x0);
    const d = Math.max(0, yHigh - yLow);
    const factor = activeShapeDef.getFactor(shapeParams);
    const hFactor = activeShapeDef.getHeightFactor(shapeParams);
    const h = d * hFactor;
    const area = factor * d * d;
    return { x0, yLow, yHigh, d, h, area, factor };
  }, [x0, getChordBoundsAtX, activeShapeDef, shapeParams]);

  // Exact numerical integration via Simpson's rule
  const totalVolume = useMemo(() => {
    const span = maxX - minX;
    if (span < 1e-7) return 0;
    const factor = activeShapeDef.getFactor(shapeParams);
    const n = 600;
    const h = span / n;
    const areaAt = (x) => {
      const [yl, yh] = getChordBoundsAtX(x);
      const d = Math.max(0, yh - yl);
      return factor * d * d;
    };
    let sum = areaAt(minX) + areaAt(maxX);
    for (let i = 1; i < n; i++) {
      sum += areaAt(minX + i * h) * (i % 2 === 0 ? 2 : 4);
    }
    return (sum * h) / 3;
  }, [minX, maxX, activeShapeDef, shapeParams, getChordBoundsAtX]);

  // Detect intersection roots when in 2-functions or Ox mode
  const detectedRoots = useMemo(() => {
    const gFunc = baseMode === 'two_funcs' ? compiledG.f : () => 0;
    return findIntersections(compiledF.f, gFunc, -6, 8);
  }, [compiledF, compiledG, baseMode]);

  const handleSelectPreset = (e) => {
    const id = e.target.value;
    setSelectedPresetId(id);
    const p = PRESETS.find((item) => item.id === id);
    if (!p) return;
    setBaseMode(p.baseMode);
    setSectionType(p.sectionType);
    setBoundA(p.a);
    setBoundB(p.b);
    setLatexF(p.latexF);
    setExprF(p.exprF);
    setLatexG(p.latexG);
    setExprG(p.exprG);
    setRectRatio(p.rectRatio ?? 0.5);
    setWedgeAngleDeg(p.wedgeAngleDeg ?? 45);
    setSliceProgress(0.42);
  };

  // Auto-play slice plane movement
  useEffect(() => {
    if (!isPlayingSlice) {
      if (animSliceRef.current) cancelAnimationFrame(animSliceRef.current);
      return;
    }
    let lastTime = performance.now();
    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setSliceProgress((prev) => {
        const next = prev + dt * 0.22;
        return next > 1 ? 0 : next;
      });
      animSliceRef.current = requestAnimationFrame(tick);
    };
    animSliceRef.current = requestAnimationFrame(tick);
    return () => {
      if (animSliceRef.current) cancelAnimationFrame(animSliceRef.current);
    };
  }, [isPlayingSlice]);

  // Auto-rotation loop
  useEffect(() => {
    if (!isAutoRotating || viewMode !== '3d') {
      if (animRotRef.current) cancelAnimationFrame(animRotRef.current);
      return;
    }
    const step = () => {
      setCamera((prev) => ({
        ...prev,
        yaw: (prev.yaw + 0.0065) % (2 * Math.PI)
      }));
      animRotRef.current = requestAnimationFrame(step);
    };
    animRotRef.current = requestAnimationFrame(step);
    return () => {
      if (animRotRef.current) cancelAnimationFrame(animRotRef.current);
    };
  }, [isAutoRotating, viewMode]);

  // Resize observer
  const [canvasDims, setCanvasDims] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasDims({ width: rect.width, height: rect.height });
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

  // Mini 2D Cross-Section Inspector Canvas Render
  useEffect(() => {
    const ic = inspectorCanvasRef.current;
    if (!ic) return;
    const ctx = ic.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 198;
    const h = 84;
    ic.width = w * dpr;
    ic.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Draw 2D shape of S(x0) scaled nicely into (w, h)
    const prof = buildSectionProfilePoints(
      sectionType,
      sliceStats.yLow,
      sliceStats.yHigh,
      shapeParams,
      28
    );
    const maxD = Math.max(0.5, sliceStats.d);
    const maxH = Math.max(0.5, sliceStats.h);
    const scale = Math.min((w - 44) / maxD, (h - 26) / maxH);
    const yc = (sliceStats.yLow + sliceStats.yHigh) / 2;
    const baseLineY = h - 14;
    const centerX = w / 2;

    // Baseline axis
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, baseLineY);
    ctx.lineTo(w - 10, baseLineY);
    ctx.stroke();

    if (sliceStats.d > 1e-4 && prof.length >= 2) {
      ctx.beginPath();
      prof.forEach((p, idx) => {
        const px = centerX + (p.y - yc) * scale;
        const py = baseLineY - p.z * scale;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.38)';
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Base segment AB
      const xA = centerX - (sliceStats.d / 2) * scale;
      const xB = centerX + (sliceStats.d / 2) * scale;
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('B', xA - 10, baseLineY + 3);
      ctx.fillText('A', xB + 4, baseLineY + 3);
      ctx.fillStyle = '#fde047';
      ctx.fillText('M', centerX - 4, baseLineY + 11);
    }
  }, [sectionType, sliceStats, shapeParams]);

  // Main Canvas Render (3D & 2D + Mini Section Inspector)
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
    const cy = ch * 0.54;

    // =========================================================================
    // 2D OXY BASE VIEW
    // =========================================================================
    if (viewMode === '2d') {
      const spanX = Math.max(4, maxX - minX + 2.5);
      const baseScale2D = Math.min((cw - 120) / spanX, (ch - 120) / 6, 68);
      const scale2D = baseScale2D * zoom2D;
      const midX = (minX + maxX) / 2;
      const originX = cx - midX * scale2D + pan2D.x;
      const originY = ch / 2 + pan2D.y;

      let unitStep = 1;
      if (scale2D < 24) unitStep = 2;
      if (scale2D < 12) unitStep = 5;

      // Grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
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

      // Axes
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(20, originY);
      ctx.lineTo(cw - 20, originY);
      ctx.moveTo(originX, ch - 20);
      ctx.lineTo(originX, 20);
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('x', cw - 16, originY + 4);
      ctx.fillText('y', originX + 8, 24);

      // Ticks
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      const minVisX = Math.floor(-originX / scale2D) - 1;
      const maxVisX = Math.ceil((cw - originX) / scale2D) + 1;
      for (let i = minVisX; i <= maxVisX; i++) {
        if (i === 0 || i % unitStep !== 0) continue;
        const tx = originX + i * scale2D;
        ctx.fillText(String(i), tx - 4, originY + 15);
      }

      // Base region (H)
      const steps = 140;
      const dx = (maxX - minX) / steps;
      const topPts = [];
      const botPts = [];
      for (let i = 0; i <= steps; i++) {
        const x = minX + i * dx;
        const [yl, yh] = getChordBoundsAtX(x);
        topPts.push({ x: originX + x * scale2D, y: originY - yh * scale2D });
        botPts.push({ x: originX + x * scale2D, y: originY - yl * scale2D });
      }

      if (topPts.length > 0) {
        ctx.beginPath();
        ctx.moveTo(topPts[0].x, topPts[0].y);
        topPts.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        for (let i = botPts.length - 1; i >= 0; i--) {
          ctx.lineTo(botPts[i].x, botPts[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.24)';
        ctx.fill();

        ctx.beginPath();
        topPts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        botPts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Draw active chord AB at x = x0
      const sx0 = originX + x0 * scale2D;
      const syLow = originY - sliceStats.yLow * scale2D;
      const syHigh = originY - sliceStats.yHigh * scale2D;

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(sx0, syLow);
      ctx.lineTo(sx0, syHigh);
      ctx.stroke();

      // Points A, B, M(x0, 0)
      [
        { x: sx0, y: syHigh, label: 'A', dy: -8 },
        { x: sx0, y: syLow, label: 'B', dy: 16 },
        { x: sx0, y: originY, label: `M(${x0.toFixed(2)})`, dy: 15 }
      ].forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(pt.label, pt.x + 7, pt.y + pt.dy);
      });

      return;
    }

    // =========================================================================
    // 3D SOLID & CROSS-SECTION VIEW
    // =========================================================================
    const polygons = [];
    const lightDir = { x: 0.45, y: -0.55, z: 0.7 };

    // Coordinate Axes in 3D (x, y on horizontal plane, z vertical up)
    const xMinAxis = Math.min(-3.5, minX - 1.2);
    const xMaxAxis = Math.max(4.5, maxX + 1.5);
    const axes = [
      { start: [xMinAxis, 0, 0], end: [xMaxAxis, 0, 0], color: '#ef4444', label: 'x' },
      { start: [0, -3.8, 0], end: [0, 3.8, 0], color: '#22c55e', label: 'y' },
      { start: [0, 0, -0.5], end: [0, 0, 4.2], color: '#38bdf8', label: 'z' }
    ];

    axes.forEach((axis) => {
      const p1 = project3D(axis.start[0], axis.start[1], axis.start[2], camera.pitch, camera.yaw);
      const p2 = project3D(axis.end[0], axis.end[1], axis.end[2], camera.pitch, camera.yaw);
      polygons.push({
        type: 'axis',
        z: (p1.z + p2.z) / 2 - 5,
        p1,
        p2,
        color: axis.color,
        label: axis.label
      });
    });

    // 1. Base Region (H) on z = 0 plane (complete domain [minX, maxX])
    const baseSteps = 44;
    const dxBase = (maxX - minX) / baseSteps;
    for (let i = 0; i < baseSteps; i++) {
      const x1 = minX + i * dxBase;
      const x2 = x1 + dxBase;
      const [yl1, yh1] = getChordBoundsAtX(x1);
      const [yl2, yh2] = getChordBoundsAtX(x2);

      const b1 = project3D(x1, yl1, 0, camera.pitch, camera.yaw);
      const b2 = project3D(x2, yl2, 0, camera.pitch, camera.yaw);
      const b3 = project3D(x2, yh2, 0, camera.pitch, camera.yaw);
      const b4 = project3D(x1, yh1, 0, camera.pitch, camera.yaw);

      polygons.push({
        type: 'base-floor',
        z: (b1.z + b2.z + b3.z + b4.z) / 4 - 0.1,
        pts: [b1, b2, b3, b4]
      });
    }

    // 2. Smooth 3D Extruded Solid Surface
    const xSpan = maxX - minX;

    if (xSpan > 1e-5) {
      // Smooth 3D solid mesh from minX to maxX
      const xSteps = 34;
      const dx = xSpan / xSteps;
      const profSteps = 18;

      for (let i = 0; i < xSteps; i++) {
        const x1 = minX + i * dx;
        const x2 = x1 + dx;
        const [yl1, yh1] = getChordBoundsAtX(x1);
        const [yl2, yh2] = getChordBoundsAtX(x2);

        const prof1 = buildSectionProfilePoints(sectionType, yl1, yh1, shapeParams, profSteps);
        const prof2 = buildSectionProfilePoints(sectionType, yl2, yh2, shapeParams, profSteps);
        const m = Math.min(prof1.length, prof2.length);

        for (let j = 0; j < m - 1; j++) {
          const p1 = prof1[j];
          const p2 = prof2[j];
          const p3 = prof2[j + 1];
          const p4 = prof1[j + 1];

          const pt1 = project3D(x1, p1.y, p1.z, camera.pitch, camera.yaw);
          const pt2 = project3D(x2, p2.y, p2.z, camera.pitch, camera.yaw);
          const pt3 = project3D(x2, p3.y, p3.z, camera.pitch, camera.yaw);
          const pt4 = project3D(x1, p4.y, p4.z, camera.pitch, camera.yaw);

          // Normal estimation for shading
          const uy = p4.y - p1.y;
          const uz = p4.z - p1.z;
          const ny = -uz;
          const nz = uy;
          const nLen = Math.sqrt(ny * ny + nz * nz) || 1;
          const dot = (ny * lightDir.y + nz * lightDir.z) / nLen;
          const brightness = Math.max(0.35, Math.min(1, 0.55 + 0.45 * dot));

          polygons.push({
            type: 'solid-shell',
            z: (pt1.z + pt2.z + pt3.z + pt4.z) / 4,
            pts: [pt1, pt2, pt3, pt4],
            brightness
          });
        }
      }

      // End caps at minX and maxX
      [minX, maxX].forEach((capX) => {
        const [yl, yh] = getChordBoundsAtX(capX);
        if (yh - yl > 1e-3) {
          const prof = buildSectionProfilePoints(sectionType, yl, yh, shapeParams, profSteps);
          const capPts = prof.map((p) => project3D(capX, p.y, p.z, camera.pitch, camera.yaw));
          const avgZ = capPts.reduce((s, p) => s + p.z, 0) / capPts.length;
          polygons.push({
            type: 'end-cap',
            z: avgZ,
            pts: capPts
          });
        }
      });
    }

    // 3. Highlighted Golden Cross-Section Slice S(x0) + Cutting Plane Frame (P)
    const [yl0, yh0] = getChordBoundsAtX(x0);
    const prof0 = buildSectionProfilePoints(sectionType, yl0, yh0, shapeParams, 24);
    const slicePts3D = prof0.map((p) => project3D(x0, p.y, p.z, camera.pitch, camera.yaw));
    const sliceAvgZ = slicePts3D.reduce((s, p) => s + p.z, 0) / (slicePts3D.length || 1);

    // Translucent cutting plane frame (P) perpendicular to Ox at x = x0
    const planePadY = Math.max(2.2, Math.abs(yh0) + 0.8, Math.abs(yl0) + 0.8);
    const planeMaxZ = Math.max(2.4, sliceStats.h + 0.7);
    const pl1 = project3D(x0, -planePadY, -0.2, camera.pitch, camera.yaw);
    const pl2 = project3D(x0, planePadY, -0.2, camera.pitch, camera.yaw);
    const pl3 = project3D(x0, planePadY, planeMaxZ, camera.pitch, camera.yaw);
    const pl4 = project3D(x0, -planePadY, planeMaxZ, camera.pitch, camera.yaw);

    polygons.push({
      type: 'cutting-plane',
      z: sliceAvgZ + 0.02,
      pts: [pl1, pl2, pl3, pl4]
    });

    polygons.push({
      type: 'active-slice',
      z: sliceAvgZ + 0.08,
      pts: slicePts3D,
      pA: project3D(x0, yh0, 0, camera.pitch, camera.yaw),
      pB: project3D(x0, yl0, 0, camera.pitch, camera.yaw),
      pM: project3D(x0, 0, 0, camera.pitch, camera.yaw)
    });

    // Sort by depth (Painter's algorithm)
    polygons.sort((a, b) => a.z - b.z);

    // Render all polygons
    polygons.forEach((poly) => {
      if (poly.type === 'axis') {
        ctx.beginPath();
        ctx.moveTo(cx + poly.p1.u * camera.scale, cy + poly.p1.v * camera.scale);
        ctx.lineTo(cx + poly.p2.u * camera.scale, cy + poly.p2.v * camera.scale);
        ctx.strokeStyle = poly.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = poly.color;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(poly.label, cx + poly.p2.u * camera.scale + 6, cy + poly.p2.v * camera.scale + 4);
        return;
      }

      if (!poly.pts || poly.pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(cx + poly.pts[0].u * camera.scale, cy + poly.pts[0].v * camera.scale);
      for (let i = 1; i < poly.pts.length; i++) {
        ctx.lineTo(cx + poly.pts[i].u * camera.scale, cy + poly.pts[i].v * camera.scale);
      }
      ctx.closePath();

      if (poly.type === 'base-floor') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      } else if (poly.type === 'solid-shell') {
        const light = Math.floor(38 + poly.brightness * 28);
        ctx.fillStyle = `hsla(196, 85%, ${light}%, 0.62)`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.28)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      } else if (poly.type === 'end-cap') {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.38)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else if (poly.type === 'cutting-plane') {
        ctx.save();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
        ctx.fill();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      } else if (poly.type === 'active-slice') {
        // Golden textbook cross-section S(x0)
        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Draw base chord AB and point M on Ox
        const { pA, pB, pM } = poly;
        ctx.beginPath();
        ctx.moveTo(cx + pA.u * camera.scale, cy + pA.v * camera.scale);
        ctx.lineTo(cx + pB.u * camera.scale, cy + pB.v * camera.scale);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Labels M, A, B
        [
          { pt: pM, text: 'M', color: '#fde047', dx: -14, dy: 15 },
          { pt: pA, text: 'A', color: '#38bdf8', dx: 6, dy: 12 },
          { pt: pB, text: 'B', color: '#38bdf8', dx: -14, dy: -6 }
        ].forEach((lbl) => {
          const sx = cx + lbl.pt.u * camera.scale;
          const sy = cy + lbl.pt.v * camera.scale;
          ctx.beginPath();
          ctx.arc(sx, sy, 3.8, 0, 2 * Math.PI);
          ctx.fillStyle = lbl.color;
          ctx.fill();
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(lbl.text, sx + lbl.dx, sy + lbl.dy);
        });
      }
    });
  }, [
    viewMode,
    camera,
    zoom2D,
    pan2D,
    minX,
    maxX,
    x0,
    sliceStats,
    getChordBoundsAtX,
    sectionType,
    shapeParams,
    canvasDims
  ]);

  // Pointer drag for 3D rotation & 2D pan
  const handlePointerDown = (e) => {
    setIsDragging(true);
    if (viewMode === '3d') setIsAutoRotating(false);
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    lastMouse.current = { x: clientX, y: clientY };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handlePointerMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      const dx = clientX - lastMouse.current.x;
      const dy = clientY - lastMouse.current.y;

      if (viewMode === '3d') {
        setCamera((prev) => ({
          ...prev,
          yaw: prev.yaw - dx * 0.01,
          pitch: Math.max(0.08, Math.min(Math.PI / 2 - 0.05, prev.pitch + dy * 0.01))
        }));
      } else {
        setPan2D((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      }
      lastMouse.current = { x: clientX, y: clientY };
    };
    const handlePointerUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, viewMode]);

  // Wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (viewMode === '3d') {
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        setCamera((prev) => ({
          ...prev,
          scale: Math.max(18, Math.min(260, prev.scale * factor))
        }));
      } else {
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        setZoom2D((prev) => Math.max(0.3, Math.min(6, prev * factor)));
      }
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [viewMode]);

  const handleZoom = (delta) => {
    if (viewMode === '3d') {
      setCamera((prev) => ({
        ...prev,
        scale: Math.max(18, Math.min(260, prev.scale + delta))
      }));
    } else {
      setZoom2D((prev) => Math.max(0.3, Math.min(6, prev * (delta > 0 ? 1.2 : 0.84))));
    }
  };

  const handleResetCamera = () => {
    setCamera({ pitch: 0.48, yaw: -0.62, scale: 58 });
    setZoom2D(1);
    setPan2D({ x: 0, y: 0 });
    setIsAutoRotating(false);
  };

  const applyIntersectionRoots = () => {
    if (detectedRoots.length < 2) return;
    setBoundA(detectedRoots[0]);
    setBoundB(detectedRoots[detectedRoots.length - 1]);
  };

  const sectionDetails = useMemo(
    () =>
      buildSectionAreaDetails({
        baseMode,
        shapeDef: activeShapeDef,
        latexF,
        latexG,
        shapeParams
      }),
    [baseMode, activeShapeDef, latexF, latexG, shapeParams]
  );

  return (
    <div className="csv-container">
      {/* LEFT SIDEBAR: CONTROLS & MATH */}
      <div className="csv-sidebar">
        <div className="csv-title-box">
          <h3 className="csv-title">Thể Tích Cắt Bởi Mặt Phẳng</h3>
        </div>

        {/* 1. Preset Selector */}
        <div className="csv-section">
          <label className="csv-label">
            <span>Bài toán mẫu (SGK & Đề thi THPT):</span>
          </label>
          <select
            className="csv-select"
            value={selectedPresetId}
            onChange={handleSelectPreset}
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Select Cross-section Shape */}
        <div className="csv-section">
          <label className="csv-label">
            <span>1. Mặt phẳng cắt (Thiết diện ⊥ Ox) là hình gì?</span>
          </label>
          <select
            className="csv-select"
            value={sectionType}
            onChange={(e) => setSectionType(e.target.value)}
            title={activeShapeDef.desc}
          >
            {SECTION_SHAPES.map((shape) => (
              <option key={shape.id} value={shape.id}>
                {shape.shortSymbol} {shape.name}
              </option>
            ))}
          </select>

          {/* Extra parameter slider if Rectangle, Parabola Arch, or Wedge Angle */}
          {(sectionType === 'rectangle' || sectionType === 'parabola_arch') && (
            <div className="csv-slider-group" style={{ marginTop: '4px' }}>
              <div className="csv-slider-header">
                <span>Tỉ lệ chiều cao h(x) = k·d(x):</span>
                <span className="csv-slider-badge">k = {rectRatio}</span>
              </div>
              <input
                type="range"
                className="csv-range"
                min="0.25"
                max="2"
                step="0.05"
                value={rectRatio}
                onChange={(e) => setRectRatio(parseFloat(e.target.value))}
              />
            </div>
          )}

          {sectionType === 'wedge_angle' && (
            <div className="csv-slider-group" style={{ marginTop: '4px' }}>
              <div className="csv-slider-header">
                <span>Góc nghiêng mặt phẳng cắt (α):</span>
                <span className="csv-slider-badge">α = {wedgeAngleDeg}°</span>
              </div>
              <input
                type="range"
                className="csv-range"
                min="15"
                max="75"
                step="5"
                value={wedgeAngleDeg}
                onChange={(e) => setWedgeAngleDeg(parseFloat(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* 3. Base Region & Bounds [a, b] */}
        <div className="csv-card">
          <div className="csv-label">
            <span>2. Miền đáy (H) trên mặt phẳng (Oxy) & Cận [a, b]:</span>
          </div>

          <div className="csv-segmented">
            <button
              type="button"
              className={`csv-seg-btn ${baseMode === 'symmetric' ? 'active' : ''}`}
              onClick={() => setBaseMode('symmetric')}
              title="Đáy đối xứng qua trục Ox: y = ±f(x) (VD: hình tròn, elip)"
            >
              Đối xứng y = ±f(x)
            </button>
            <button
              type="button"
              className={`csv-seg-btn ${baseMode === 'ox' ? 'active' : ''}`}
              onClick={() => setBaseMode('ox')}
              title="Đáy giới hạn bởi y = f(x) và trục Ox (y = 0)"
            >
              y = f(x) & trục Ox
            </button>
            <button
              type="button"
              className={`csv-seg-btn ${baseMode === 'two_funcs' ? 'active' : ''}`}
              onClick={() => setBaseMode('two_funcs')}
              title="Đáy giới hạn bởi 2 đồ thị y = f(x) và y = g(x)"
            >
              Giữa f(x) & g(x)
            </button>
          </div>

          <div className="csv-func-row">
            <span className="csv-func-badge f">
              {baseMode === 'symmetric' ? 'Biên đối xứng y = ±f(x)' : 'Hàm số y = f(x)'}
            </span>
            <MathInput
              value={latexF}
              onChange={(latex, ascii) => {
                setLatexF(latex);
                setExprF(ascii);
              }}
            />
          </div>

          {baseMode === 'two_funcs' && (
            <div className="csv-func-row">
              <span className="csv-func-badge g">Hàm số y = g(x)</span>
              <MathInput
                value={latexG}
                onChange={(latex, ascii) => {
                  setLatexG(latex);
                  setExprG(ascii);
                }}
              />
            </div>
          )}

          {/* Bounds a and b */}
          <div className="csv-bounds-grid">
            <div className="csv-bound-field">
              <label>Cận a =</label>
              <input
                type="number"
                step="any"
                value={boundA}
                onChange={(e) =>
                  setBoundA(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
              />
            </div>
            <div className="csv-bound-field">
              <label>Cận b =</label>
              <input
                type="number"
                step="any"
                value={boundB}
                onChange={(e) =>
                  setBoundB(e.target.value === '' ? '' : parseFloat(e.target.value))
                }
              />
            </div>
          </div>

          {detectedRoots.length >= 2 && (
            <button
              type="button"
              className="csv-roots-btn"
              onClick={applyIntersectionRoots}
            >
              <Target size={14} />
              Tự động lấy cận giao điểm [{detectedRoots[0]}; {detectedRoots[detectedRoots.length - 1]}]
            </button>
          )}
        </div>

        {/* 4. Interactive Slicing Plane & Pedagogical Controls */}
        <div className="csv-card">
          <div className="csv-slider-group">
            <div className="csv-slider-header">
              <span>
                <Scissors size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Vị trí mặt phẳng cắt (x₀):
              </span>
              <span className="csv-slider-badge">
                x₀ = {x0.toFixed(2).replace('.', ',')} | S(x₀) ≈ {sliceStats.area.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="csv-slider-row">
              <button
                type="button"
                className={`csv-play-slice-btn ${isPlayingSlice ? 'active' : ''}`}
                onClick={() => setIsPlayingSlice((v) => !v)}
                title={isPlayingSlice ? 'Tạm dừng quét mặt phẳng' : 'Tự động quét mặt phẳng cắt từ a đến b'}
              >
                {isPlayingSlice ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <input
                type="range"
                className="csv-range"
                min="0"
                max="1"
                step="0.005"
                value={sliceProgress}
                onChange={(e) => setSliceProgress(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* 5. Cross-Section Area Formula + Final Volume Result Card */}
        <div className="csv-volume-card">
          <div className="csv-volume-title">Công thức thiết diện S(x)</div>
          <div className="csv-volume-formula-box">
            <div className="csv-section-caption">
              {activeShapeDef.name} ({activeShapeDef.chordNoun}{' '}
              <MathLatex math={sectionDetails.sideLatex} display={false} />):
            </div>
            <div style={{ textAlign: 'center' }}>
              <MathLatex math={sectionDetails.areaLatex} display={false} />
            </div>
          </div>

          <div className="csv-volume-title" style={{ marginTop: '2px' }}>Kết quả thể tích vật thể (V)</div>
          <div className="csv-volume-formula-box">
            <div style={{ textAlign: 'center' }}>
              <MathLatex
                math={`V = \\int_{${minX}}^{${maxX}} S(x)\\,dx \\approx ${totalVolume.toFixed(4).replace('.', ',')}`}
                display={false}
              />
            </div>
          </div>

          <div className="csv-volume-total-row">
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Thể tích toàn khối (V):
            </span>
            <span className="csv-volume-total-val">
              {totalVolume.toFixed(4).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT CANVAS: 3D SOLID + 2D INSPECTOR */}
      <div className="csv-canvas-area">
        <div className="csv-canvas-top-bar">
          <div className="csv-view-tabs">
            <button
              type="button"
              className={`csv-view-btn ${viewMode === '3d' ? 'active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              <Box size={14} /> Khối 3D & Mặt phẳng cắt
            </button>
            <button
              type="button"
              className={`csv-view-btn ${viewMode === '2d' ? 'active' : ''}`}
              onClick={() => setViewMode('2d')}
            >
              <Square size={14} /> Miền đáy Oxy (2D)
            </button>
          </div>

          <div className="csv-hint-badge">
            <MousePointer2 size={14} />
            {viewMode === '3d'
              ? 'Kéo chuột để xoay 3D | Lăn chuột để thu phóng'
              : 'Kéo chuột để di chuyển | Lăn chuột để thu phóng'}
          </div>
        </div>

        {/* Bottom-left Live Cross-Section Inspector Overlay */}
        <div className="csv-inspector-overlay">
          <div className="csv-inspector-title">
            <span>🔍 Thiết diện S(x₀)</span>
            <span>{activeShapeDef.name}</span>
          </div>
          <canvas
            ref={inspectorCanvasRef}
            style={{
              width: '198px',
              height: '84px',
              display: 'block',
              margin: '0 auto 6px auto',
              background: 'rgba(2, 6, 23, 0.45)',
              borderRadius: '7px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          />
          <div className="csv-inspector-stats">
            <div>
              Hoành độ M: <strong>x₀ = {x0.toFixed(2)}</strong>
            </div>
            <div>
              Dây cung AB: <strong>d(x₀) = {sliceStats.d.toFixed(3)}</strong>
            </div>
            <div>
              Chiều cao: <strong>h(x₀) = {sliceStats.h.toFixed(3)}</strong>
            </div>
            <div>
              Diện tích lát cắt: <strong>S(x₀) = {sliceStats.area.toFixed(3)}</strong>
            </div>
          </div>
        </div>

        {/* Bottom-right Floating Controls */}
        <div className="csv-floating-controls">
          {viewMode === '3d' && (
            <button
              type="button"
              className={`csv-ctrl-btn ${isAutoRotating ? 'active' : ''}`}
              onClick={() => setIsAutoRotating((v) => !v)}
              title={isAutoRotating ? 'Dừng tự động xoay' : 'Tự động xoay khối 3D'}
            >
              {isAutoRotating ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          <button
            type="button"
            className="csv-ctrl-btn"
            onClick={() => handleZoom(10)}
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            className="csv-ctrl-btn"
            onClick={() => handleZoom(-10)}
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            className="csv-ctrl-btn"
            onClick={handleResetCamera}
            title="Đặt lại góc nhìn mặc định"
          >
            <RotateCw size={16} />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          className="csv-render-canvas"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
      </div>
    </div>
  );
};

export default CrossSectionSolidVolume;
