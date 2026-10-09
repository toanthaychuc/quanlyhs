// mathHelpers.js

export const findRootsNumeric = (f, min = -30, max = 30, step = 0.1) => {
  let roots = [];
  let prevY = f(min);
  let prevX = min;
  
  for (let x = min + step; x <= max; x += step) {
    let y = f(x);
    // Ignore jumps (like vertical asymptotes)
    if (Math.abs(y - prevY) > 50) {
      prevX = x;
      prevY = y;
      continue;
    }
    
    if (prevY * y <= 0) {
      // Linear interpolation for better precision
      let rootX = prevX - prevY * (x - prevX) / (y - prevY);
      
      // Avoid duplicate roots if it grazes 0
      if (roots.length === 0 || Math.abs(roots[roots.length - 1] - rootX) > 0.05) {
        roots.push(rootX);
      }
    }
    prevX = x;
    prevY = y;
  }
  return roots;
};

export const solveQuadratic = (a, b, c) => {
  if (Math.abs(a) < 1e-7) {
    if (Math.abs(b) < 1e-7) return [];
    return [-c / b];
  }
  const delta = b * b - 4 * a * c;
  if (delta < -1e-7) return [];
  if (Math.abs(delta) < 1e-7) return [-b / (2 * a)];
  return [
    (-b - Math.sqrt(delta)) / (2 * a),
    (-b + Math.sqrt(delta)) / (2 * a)
  ].sort((x1, x2) => x1 - x2);
};

export const formatNum = (num) => {
  if (Math.abs(num) < 1e-5) return "0";
  return (Number.isInteger(num) ? num.toString() : num.toFixed(2)).replace('.', ',');
};
