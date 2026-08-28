// Bộ phân tích và chuyển đổi hình học TikZ & đồ thị hàm số chuẩn xác 100%

// Hàm tạo đường cong Bezier mượt mà đi qua các điểm (Smooth Catmull-Rom Spline sang SVG Path)
export const getSmoothSvgPath = (points, toScreenX, toScreenY) => {
  if (!points || points.length < 2) return '';
  if (points.length === 2) {
    return `M ${toScreenX(points[0].x)} ${toScreenY(points[0].y)} L ${toScreenX(points[1].x)} ${toScreenY(points[1].y)}`;
  }

  const pts = points.map(p => ({ x: toScreenX(p.x), y: toScreenY(p.y) }));
  let path = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

// Làm sạch nhãn TikZ loại bỏ các macro định dạng kích thước \scriptsize, \footnotesize...
const cleanLabelText = (raw = '') => {
  return raw
    .replace(/\\(?:scriptsize|footnotesize|small|large|Large|normalsize|bfseries|rm|it|boldmath)\b/gi, '')
    .replace(/\$|\\|\{|\}/g, '')
    .trim();
};

export const parseTikzToSvgData = (rawTikzCode) => {
  if (!rawTikzCode) return null;

  try {
    let code = rawTikzCode
      .replace(/\\begin\{tikzpicture(?:\[[^\]]*\])?\}?(?:\[[^\]]*\])?/gi, '')
      .replace(/\\end\{tikzpicture\}\}?/gi, '')
      .replace(/\\(?:begin|end)\{scope\}(?:\[[^\]]*\])?/gi, '')
      .replace(/\\clip[^;]*;/gi, '')
      .trim();

    const coordinates = {}; // { A: {x, y}, ... }
    const lines = []; // [ { from, to, dashed, hasArrow } ]
    const curves = []; // [ [ {x,y}, ... ] ] (Đường cong đồ thị hàm số)
    const polygons = []; // [ [ {x,y}, ... ] ]
    const circles = []; // [ { cx, cy, r } ]
    const labels = []; // [ { x, y, text, angle, isAxis } ]
    const numberLines = [];

    // 1. Phân tích các biến hằng số: \def\a{5}, \def\b{3}, \def\gocB{50}, \pgfmathsetmacro{\a}{5}
    const defs = {};
    const defRegex = /\\(?:def|pgfmathsetmacro)\s*\\([a-zA-Z0-9_]+)\s*\{?([^};]+)\}?/g;
    let defMatch;
    while ((defMatch = defRegex.exec(rawTikzCode)) !== null) {
      const varName = defMatch[1];
      const rawVal = defMatch[2].replace(/[a-zA-Z\s{}]/g, '');
      const val = parseFloat(rawVal);
      if (!isNaN(val)) defs[varName] = val;
    }

    // 1.1 Phân tích các hàm số được khai báo: declare function = {f(\x) = -(\x)*(\x)-2*(\x);}, etc.
    const funcDefs = {};
    const funcRegex = /declare\s+function\s*=\s*\{([A-Za-z0-9_]+)\s*\((?:\\x|x)\)\s*=\s*([^;]+);?\}/gi;
    let fnMatch;
    while ((fnMatch = funcRegex.exec(rawTikzCode)) !== null) {
      funcDefs[fnMatch[1]] = fnMatch[2].trim();
    }

    const evaluateMath = (rawExpr, xVal) => {
      try {
        let expr = String(rawExpr || '').trim();
        const fnCallMatch = expr.match(/^([a-zA-Z0-9_]+)\s*\((?:\\x|x)\)$/);
        if (fnCallMatch && funcDefs[fnCallMatch[1]]) {
          expr = funcDefs[fnCallMatch[1]];
        }

        // Thay thế các biến số \a, \b, \c, \d, \e...
        Object.keys(defs).forEach(varName => {
          const val = defs[varName];
          const varRegex = new RegExp(`\\\\${varName}\\b|(?<![a-zA-Z0-9_])${varName}(?![a-zA-Z0-9_])`, 'g');
          if (varName !== 'x') {
            expr = expr.replace(varRegex, `(${val})`);
          }
        });

        let jsExpr = expr
          .replace(/\\x\b|x\b/g, `(${xVal})`)
          .replace(/\^/g, '**')
          .replace(/(\d)(\()/g, '$1*$2')
          .replace(/(\))(\()/g, '$1*$2')
          .replace(/(\))([0-9a-zA-Z])/g, '$1*$2')
          .replace(/sin\b/g, 'Math.sin')
          .replace(/cos\b/g, 'Math.cos')
          .replace(/tan\b/g, 'Math.tan')
          .replace(/sqrt\b/g, 'Math.sqrt')
          .replace(/abs\b/g, 'Math.abs');

        const result = Function(`return (${jsExpr});`)();
        return typeof result === 'number' && !isNaN(result) ? result : null;
      } catch (err) {
        return null;
      }
    };

    const resolveVal = (valStr) => {
      if (!valStr) return 0;
      valStr = String(valStr).trim();
      if (valStr.startsWith('\\')) {
        const varName = valStr.slice(1);
        if (defs[varName] !== undefined) return defs[varName];
      }
      if (defs[valStr] !== undefined) return defs[valStr];
      const cleanStr = valStr.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanStr);
      return isNaN(parsed) ? 0 : parsed;
    };

    const getLineIntersection = (p1, p2, p3, p4) => {
      if (!p1 || !p2 || !p3 || !p4) return { x: 0, y: 0 };
      const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
      if (Math.abs(denom) < 1e-6) return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
      return {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
      };
    };

    // 2. BÓC TÁCH ĐỒ THỊ HÀM SỐ DẠNG TOẠ ĐỘ: \draw plot[...] coordinates {(-3.5,-1)(-1,4)...};
    const plotCoordRegex = /\\draw[^{;]*?plot[^{;]*?coordinates\s*\{([\s\S]*?)\}/gi;
    let plotMatch;
    while ((plotMatch = plotCoordRegex.exec(code)) !== null) {
      const rawCoords = plotMatch[1];
      const ptMatches = rawCoords.matchAll(/\(([-0-9.]+)\s*,\s*([-0-9.]+)\)/g);
      const curvePts = [];
      for (const pm of ptMatches) {
        const px = parseFloat(pm[1]);
        let pyStr = pm[2];
        if (pyStr.startsWith('-.') || pyStr.startsWith('.')) {
          pyStr = pyStr.replace('.', '0.');
        }
        const py = parseFloat(pyStr);
        if (!isNaN(px) && !isNaN(py)) {
          curvePts.push({ x: px, y: py });
        }
      }
      if (curvePts.length >= 2) {
        curves.push(curvePts);
      }
    }

    // 2.1 BÓC TÁCH ĐỒ THỊ HÀM SỐ DẠNG CÔNG THỨC TOÁN HỌC: \draw plot (\x, {...}) hoặc \draw[samples=..., domain=...] plot ...
    const plotFnRegex = /\\draw[^{;]*?(?:domain\s*=\s*([-0-9.]+)\s*:\s*([-0-9.]+)[^{;]*?)?plot[^{;]*?(?:domain\s*=\s*([-0-9.]+)\s*:\s*([-0-9.]+)[^{;]*?)?\(\s*\\?x\s*,\s*(?:\{([^}]+)\}|([^);]+))\s*\)/gi;
    let pfnMatch;
    while ((pfnMatch = plotFnRegex.exec(code)) !== null) {
      const fullStmt = pfnMatch[0];
      const expr = (pfnMatch[5] || pfnMatch[6] || '').trim();

      let minD = -3.5, maxD = 3.5;
      const domMin = pfnMatch[1] || pfnMatch[3];
      const domMax = pfnMatch[2] || pfnMatch[4];
      if (domMin && domMax) {
        minD = parseFloat(domMin);
        maxD = parseFloat(domMax);
      } else {
        const domMatch = fullStmt.match(/domain\s*=\s*([-0-9.]+)\s*:\s*([-0-9.]+)/i);
        if (domMatch) {
          minD = parseFloat(domMatch[1]);
          maxD = parseFloat(domMatch[2]);
        }
      }

      const samples = 80;
      const step = (maxD - minD) / samples;
      const curvePts = [];
      for (let x = minD; x <= maxD + 0.0001; x += step) {
        const y = evaluateMath(expr, x);
        if (y !== null && Math.abs(y) <= 50) {
          curvePts.push({ x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 });
        }
      }
      if (curvePts.length >= 2) {
        curves.push(curvePts);
      }
    }

    const parseCoordExpr = (expr, defs, coordinates) => {
      if (!expr) return { x: 0, y: 0 };
      let str = expr.trim();
      
      const resolveVal = (valStr) => {
        if (!valStr) return 0;
        valStr = String(valStr).trim();
        if (valStr.startsWith('\\')) {
          const varName = valStr.slice(1);
          if (defs[varName] !== undefined) return defs[varName];
        }
        const cleanStr = valStr.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleanStr);
        return isNaN(parsed) ? 0 : parsed;
      };

      if (str.startsWith('$') && str.endsWith('$')) {
        str = str.slice(1, -1).trim();

        // 1. Dạng trung điểm hoặc tỉ lệ phân đoạn: $(B)!0.5!(C)$ hoặc $(A)!1/3!(B)$
        const ratioMatch = str.match(/^\(([^)]+)\)\s*!\s*([^!]+)\s*!\s*\(([^)]+)\)$/);
        if (ratioMatch) {
          const p1 = parseCoordExpr(ratioMatch[1], defs, coordinates);
          const p2 = parseCoordExpr(ratioMatch[3], defs, coordinates);
          let ratio = 0.5;
          try {
            const exprRatio = ratioMatch[2].replace(/[^\d./+-]/g, '');
            ratio = Function(`return (${exprRatio});`)();
          } catch {
            ratio = 0.5;
          }
          return {
            x: p1.x + ratio * (p2.x - p1.x),
            y: p1.y + ratio * (p2.y - p1.y)
          };
        }

        // 2. Dạng cộng trừ vector: $(C)-(B)+(A)$
        const terms = [];
        let currentTerm = '';
        let currentSign = 1;
        let i = 0;
        while (i < str.length) {
          if ((str[i] === '+' || str[i] === '-') && (i === 0 || str[i-1] === ')' || str[i-1] === ' ')) {
             if (currentTerm.trim()) terms.push({ text: currentTerm.trim(), sign: currentSign });
             currentTerm = '';
             currentSign = str[i] === '-' ? -1 : 1;
          } else {
             currentTerm += str[i];
          }
          i++;
        }
        if (currentTerm.trim()) terms.push({ text: currentTerm.trim(), sign: currentSign });

        let accX = 0, accY = 0;
        
        terms.forEach(t => {
           const inner = t.text.trim();
           if (inner.startsWith('(') && inner.endsWith(')')) {
              const innerContent = inner.slice(1, -1).trim();
              if (innerContent.includes(':')) {
                 const parts = innerContent.split(':');
                 const angle = resolveVal(parts[0]);
                 const dist = resolveVal(parts[1]);
                 const rad = (angle * Math.PI) / 180;
                 accX += t.sign * dist * Math.cos(rad);
                 accY += t.sign * dist * Math.sin(rad);
              } else if (innerContent.includes(',')) {
                 const parts = innerContent.split(',');
                 accX += t.sign * resolveVal(parts[0]);
                 accY += t.sign * resolveVal(parts[1]);
              } else if (coordinates[innerContent]) {
                 accX += t.sign * coordinates[innerContent].x;
                 accY += t.sign * coordinates[innerContent].y;
              }
           }
        });
        return { x: accX, y: accY };
      }
      
      if (str.includes(':')) {
         const parts = str.split(':');
         return { 
           x: resolveVal(parts[1]) * Math.cos(resolveVal(parts[0]) * Math.PI / 180), 
           y: resolveVal(parts[1]) * Math.sin(resolveVal(parts[0]) * Math.PI / 180) 
         };
      }
      
      if (str.includes(',')) {
         const parts = str.split(',');
         return { x: resolveVal(parts[0]), y: resolveVal(parts[1]) };
      }
      
      if (coordinates[str]) {
         return { x: coordinates[str].x, y: coordinates[str].y };
      }
      
      return { x: 0, y: 0 };
    };

    // 3. Phân tích các khai báo toạ độ \path / \coordinate
    let currentPos = { x: 0, y: 0 };
    const pathTokens = code.matchAll(/(?:\+\+|\+)?\s*\(([^)]+)\)\s*coordinate\s*\(([A-Za-z0-9_']+)\)/gi);
    for (const pt of pathTokens) {
      const isRelative = pt[0].trim().startsWith('++') || pt[0].trim().startsWith('+');
      const coordExpr = pt[1].trim();
      const coordName = pt[2].trim();
      const p = parseCoordExpr(coordExpr, defs, coordinates);
      if (isRelative) {
         currentPos = { x: currentPos.x + p.x, y: currentPos.y + p.y };
      } else {
         currentPos = { x: p.x, y: p.y };
      }
      coordinates[coordName] = { x: Math.round(currentPos.x * 1000) / 1000, y: Math.round(currentPos.y * 1000) / 1000, name: coordName };
    }

    const coordDefRegex = /\\coordinate(?:\[([^\]]*)\])?\s*\(([A-Za-z0-9_']+)\)\s*at\s*\((.*?)\)\s*;/gi;
    let coordDefMatch;
    while ((coordDefMatch = coordDefRegex.exec(code)) !== null) {
      const opts = coordDefMatch[1] || '';
      const coordName = coordDefMatch[2];
      const coordExpr = coordDefMatch[3];
      const p = parseCoordExpr(coordExpr, defs, coordinates);
      currentPos = { x: p.x, y: p.y };
      coordinates[coordName] = { x: Math.round(currentPos.x * 1000) / 1000, y: Math.round(currentPos.y * 1000) / 1000, name: coordName };
      
      const labelMatch = opts.match(/label\s*=\s*([a-zA-Z\s]+)?:\$([^$]+)\$/);
      if (labelMatch) {
         const posStr = labelMatch[1] || 'below';
         const text = labelMatch[2];
         let angle = -90;
         if (posStr.includes('below')) angle = -90;
         if (posStr.includes('left')) angle = 180;
         if (posStr.includes('right')) angle = 0;
         if (posStr.includes('above')) angle = 90;
         if (posStr.includes('above left')) angle = 135;
         if (posStr.includes('above right')) angle = 45;
         if (posStr.includes('below left')) angle = -135;
         if (posStr.includes('below right')) angle = -45;
         labels.push({ x: currentPos.x, y: currentPos.y, text, angle });
      }
    }

    // 4. Phân tích các lệnh vẽ: tách từng nhóm đường thẳng độc lập
    const drawStatements = code.split(';');
    drawStatements.forEach(stmt => {
      let cleanStmt = stmt.trim();
      const drawIdx = cleanStmt.search(/\\(?:draw|fill|path)\b/);
      if (drawIdx === -1) return;
      cleanStmt = cleanStmt.slice(drawIdx);

      const isDashed = cleanStmt.includes('dashed');
      const hasArrow = cleanStmt.includes('->') || cleanStmt.includes('stealth');

      // Tách từng nhóm toạ độ độc lập dạng (x1,y1)--(x2,y2)... hoặc (x1,y1)|-(x2,y2)...
      const pathGroups = cleanStmt.matchAll(/\(([^)]+)\)(?:\s*(?:--|\|-|-\|)\s*(?:\([^)]+\)|cycle))+/g);
      for (const pgm of pathGroups) {
        const groupStr = pgm[0];
        const isCycle = groupStr.includes('cycle');
        
        // Tokenize các đoạn toạ độ và toán tử kết nối (-- , |- , -|)
        const tokens = groupStr.split(/\s*(--|\|-|-\|)\s*/).filter(Boolean);
        const rawPoints = [];
        for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
          const tok = tokens[tIdx];
          if (tok === '--' || tok === '|-' || tok === '-|') continue;
          if (tok.includes('cycle')) continue;

          const coordMatch = tok.match(/\(([^)]+)\)/);
          let pt = null;
          if (coordMatch) {
            pt = parseCoordExpr(coordMatch[1], defs, coordinates);
          }

          if (pt) {
            const prevOp = tIdx > 1 ? tokens[tIdx - 1] : '--';
            if (rawPoints.length > 0 && prevOp === '|-') {
              const lastPt = rawPoints[rawPoints.length - 1];
              rawPoints.push({ x: lastPt.x, y: pt.y }); // Điểm gãy vuông góc
            } else if (rawPoints.length > 0 && prevOp === '-|') {
              const lastPt = rawPoints[rawPoints.length - 1];
              rawPoints.push({ x: pt.x, y: lastPt.y }); // Điểm gãy vuông góc
            }
            rawPoints.push(pt);
          }
        }

        if (rawPoints.length >= 2) {
          if (isCycle) {
            polygons.push(rawPoints);
            for (let i = 0; i < rawPoints.length; i++) {
              const nextIdx = (i + 1) % rawPoints.length;
              if (rawPoints[i] && rawPoints[nextIdx]) {
                lines.push({ from: rawPoints[i], to: rawPoints[nextIdx], dashed: isDashed, hasArrow: false });
              }
            }
          } else {
            for (let i = 0; i < rawPoints.length - 1; i++) {
              if (rawPoints[i] && rawPoints[i + 1]) {
                lines.push({
                  from: rawPoints[i],
                  to: rawPoints[i + 1],
                  dashed: isDashed,
                  hasArrow: hasArrow && i === rawPoints.length - 2
                });
              }
            }
          }
        }
      }

      // Trích xuất nhãn node[pos]{$x$}
      const nodeMatches = cleanStmt.matchAll(/\(([-0-9.]+)\s*,\s*([-0-9.]+)\)\s*node(?:\[([^\]]*)\])?\s*\{([^}]+)\}/gi);
      for (const nm of nodeMatches) {
        const px = parseFloat(nm[1]);
        const py = parseFloat(nm[2]);
        const pos = nm[3] || 'below';
        const text = cleanLabelText(nm[4]);
        if (text) {
          let angle = -90;
          if (pos.includes('below')) angle = -90;
          if (pos.includes('left')) angle = 180;
          if (pos.includes('right')) angle = 0;
          if (pos.includes('above')) angle = 90;
          if (!labels.some(l => l.text === text && Math.abs(l.x - px) < 0.1 && Math.abs(l.y - py) < 0.1)) {
            labels.push({ x: px, y: py, text, angle, isAxis: true });
          }
        }
      }

      // Trích xuất điểm tròn circle
      const circleMatches = cleanStmt.matchAll(/\(([-0-9.]+)\s*,\s*([-0-9.]+)\)\s*circle\s*\(([^)]+)\)/gi);
      for (const cm of circleMatches) {
        const cx = parseFloat(cm[1]);
        const cy = parseFloat(cm[2]);
        if (!isNaN(cx) && !isNaN(cy)) {
          circles.push({ cx, cy, r: 2.8 });
        }
      }
    });

    // 5. Bóc tách gốc toạ độ \node at (0,0) [below right]{$O$};
    const nodeAtMatches = code.matchAll(/\\node\s+at\s*\(([-0-9.]+)\s*,\s*([-0-9.]+)\)\s*(?:\[([^\]]*)\])?\s*\{([^}]+)\}/gi);
    for (const nam of nodeAtMatches) {
      const px = parseFloat(nam[1]);
      const py = parseFloat(nam[2]);
      const text = cleanLabelText(nam[4]);
      if (text) {
        labels.push({ x: px, y: py, text, angle: -135, isAxis: true });
      }
    }

    // 6. Bóc tách các nhãn toạ độ trên trục và điểm hình học: \foreach \x/\y/\l/\g in {...}, \foreach \x/\g in {...}, \foreach \y in {...}
    const foreachRegex = /\\foreach\s*\\([a-zA-Z0-9_]+)(?:\s*\/\s*\\([a-zA-Z0-9_]+))?(?:\s*\/\s*\\([a-zA-Z0-9_]+))?(?:\s*\/\s*\\([a-zA-Z0-9_]+))?\s*in\s*\{([^}]+)\}/gi;
    let feMatch;
    while ((feMatch = foreachRegex.exec(code)) !== null) {
      const var1 = feMatch[1].toLowerCase();
      const varCount = (feMatch[1] ? 1 : 0) + (feMatch[2] ? 1 : 0) + (feMatch[3] ? 1 : 0) + (feMatch[4] ? 1 : 0);
      const rawItems = feMatch[5].split(',');

      rawItems.forEach(item => {
        const parts = item.trim().split('/');
        if (parts.length === 0 || !parts[0]) return;

        if (varCount === 4 || parts.length >= 4) {
          // Dạng 4 biến: \x/\y/\l/\g (Toạ độ X, Toạ độ Y, Nhãn chữ, Góc độ)
          const px = parseFloat(parts[0]);
          const py = parseFloat(parts[1]);
          const labelText = cleanLabelText(parts[2]);
          const angle = parts[3] ? parseFloat(parts[3]) : -90;

          if (!isNaN(px) && !isNaN(py)) {
            if (labelText) {
              labels.push({ x: px, y: py, text: labelText, angle: isNaN(angle) ? -90 : angle, isAxis: px === 0 || py === 0 });
            }
            circles.push({ cx: px, cy: py, r: 2.5 });
          }
        } else if (varCount === 3 || parts.length === 3) {
          // Dạng 3 biến: \x/\y/\l
          const px = parseFloat(parts[0]);
          const py = parseFloat(parts[1]);
          const labelText = cleanLabelText(parts[2]);
          if (!isNaN(px) && !isNaN(py)) {
            if (labelText) {
              labels.push({ x: px, y: py, text: labelText, angle: -90, isAxis: px === 0 || py === 0 });
            }
            circles.push({ cx: px, cy: py, r: 2.5 });
          }
        } else {
          // Dạng 1 hoặc 2 biến: \x/\g hoặc \y/\g hoặc \x
          const isYAxis = var1.includes('y');
          const valStr = parts[0]?.trim();
          let gVal = parts[1] ? parseFloat(parts[1].trim()) : (isYAxis ? 180 : -90);
          if (isNaN(gVal)) gVal = isYAxis ? 180 : -90;

          const numVal = parseFloat(valStr);
          if (!isNaN(numVal)) {
            const posX = isYAxis ? 0 : numVal;
            const posY = isYAxis ? numVal : 0;
            if (!labels.some(l => l.text === String(numVal) && Math.abs(l.x - posX) < 0.1 && Math.abs(l.y - posY) < 0.1)) {
              labels.push({ x: posX, y: posY, text: String(numVal), angle: gVal, isAxis: true });
              circles.push({ cx: posX, cy: posY, r: 2.5 });
            }
          } else if (valStr && coordinates[valStr]) {
            const pt = coordinates[valStr];
            if (!labels.some(l => l.text === valStr)) {
              labels.push({ x: pt.x, y: pt.y, text: valStr, angle: gVal });
              circles.push({ cx: pt.x, cy: pt.y, r: 3.0 });
            }
          }
        }
      });
    }

    // 7. Gán nhãn cho các điểm toạ độ nếu chưa có
    Object.keys(coordinates).forEach(name => {
      const pt = coordinates[name];
      if (!circles.some(c => Math.abs(c.cx - pt.x) < 0.1 && Math.abs(c.cy - pt.y) < 0.1)) {
        circles.push({ cx: pt.x, cy: pt.y, r: 3.2 });
      }
      if (!labels.some(l => l.text === name && Math.abs(l.x - pt.x) < 0.1 && Math.abs(l.y - pt.y) < 0.1)) {
        labels.push({ x: pt.x, y: pt.y, text: name, angle: -90 });
      }
    });

    return { coordinates, lines, curves, polygons, circles, labels, numberLines };
  } catch (err) {
    console.error('Error parsing TikZ to SVG:', err);
    return null;
  }
};
