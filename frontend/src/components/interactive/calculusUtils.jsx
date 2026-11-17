import React, { useRef, useEffect, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'mathlive';

// Safe math compiler for user expressions
export const compileExpression = (expr) => {
  if (!expr || typeof expr !== 'string' || !expr.trim()) {
    return { f: () => 0, error: 'Chưa nhập biểu thức' };
  }
  try {
    let jsExpr = expr.normalize('NFKC').toLowerCase().trim();
    jsExpr = jsExpr.replace(/\\/g, '');
    jsExpr = jsExpr.replace(
      /log\s*_?\s*\(?\{?([a-zA-Z0-9.]+)\}?\)?\s*(?:\(([^)]+)\)|([a-zA-Z0-9]+))/g,
      (match, base, arg1, arg2) => {
        const arg = arg1 || arg2;
        return `(Math.log(${arg})/Math.log(${base}))`;
      }
    );
    jsExpr = jsExpr.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))');
    jsExpr = jsExpr.replace(/frac\(([^)]+)\)\(([^)]+)\)/g, '(($1)/($2))');
    jsExpr = jsExpr.replace(/\bpi\b/g, 'Math.PI');
    jsExpr = jsExpr.replace(/\be\b/g, 'Math.E');
    jsExpr = jsExpr.replace(/\bln\b/g, 'Math.log');
    jsExpr = jsExpr.replace(/\bcot\b/g, '(1/Math.tan)');

    const funcs = ['sin', 'cos', 'tan', 'sqrt', 'exp', 'abs'];
    funcs.forEach((fn) => {
      jsExpr = jsExpr.replace(new RegExp(`\\b${fn}\\b`, 'g'), `Math.${fn}`);
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
    f(0.5);
    return { f, error: null };
  } catch {
    return { f: () => 0, error: 'Biểu thức không hợp lệ' };
  }
};

export const evalSafe = (f, x) => {
  if (!f) return 0;
  try {
    const val = f(x);
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 0;
    return val;
  } catch {
    return 0;
  }
};

// Find intersection roots between f and g on [xMin, xMax]
export const findIntersections = (f, g, xMin = -6, xMax = 8, step = 0.04) => {
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
        if (!roots.some((r) => Math.abs(r - prevX) < 0.05)) {
          roots.push(Number(prevX.toFixed(2)));
        }
      } else if (prevD * d < 0) {
        let lo = prevX;
        let hi = x;
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
        if (!roots.some((r) => Math.abs(r - root) < 0.05)) {
          roots.push(Number(root.toFixed(2)));
        }
      }
    }
    prevX = x;
    prevD = d;
  }
  return roots.sort((a, b) => a - b);
};

// MathLive input wrapper component
export const MathInput = ({ value, onChange, style, readOnly }) => {
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

// KaTeX renderer component
export const MathLatex = ({ math, display = false, className = '', style = {} }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math || '', { throwOnError: false, displayMode: display });
    } catch {
      return math || '';
    }
  }, [math, display]);

  return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};

