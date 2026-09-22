// Tiện ích bóc tách, băm (hash) và quản lý lưu trữ trước hình TikZ cho phần Tra công thức

/**
 * Tạo mã hash 64-bit tất định cho đoạn mã TikZ.
 * Chuẩn hóa khoảng trắng và dấu xuống dòng để cùng 1 đoạn mã luôn cho ra cùng 1 hash.
 */
export const getTikzHash = (code = '') => {
  if (!code) return '';
  const str = code
    .replace(/(^|[^\\])%.*$/gm, '$1')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n');
  let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 'tikz_' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
};

/**
 * Trích xuất tất cả các khối TikZ (kèm theo các định nghĩa màu trước nó nếu có)
 */
export const extractTikzBlocks = (text = '') => {
  if (!text) return [];
  const cleanText = text.replace(/(^|[^\\])%.*$/gm, '$1');
  // Regex đồng bộ với latexUtils.js
  const regex = /((?:(?:\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}\s*|\\colorlet\{[^}]+\}\{[^}]+\}\s*)*)\\begin\{tikzpicture(?:\[[^\]]*\])?\}?(?:\[[^\]]*\])?[\s\S]*?\\end\{tikzpicture\})/gi;
  const blocks = [];
  let match;
  while ((match = regex.exec(cleanText)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
};

/**
 * Gọi API backend để biên dịch 1 đoạn mã TikZ sang SVG
 */
export const compileSingleTikz = async (tikzCode, preamble, apiUrl = '') => {
  const url = apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const res = await fetch(`${url}/api/compile-tikz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tikzCode,
      preamble: preamble || undefined
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.svg;
};

/**
 * Duyệt qua tất cả các khối TikZ trong nội dung LaTeX,
 * giữ lại các SVG đã có trong cache và biên dịch các khối mới.
 */
export const buildFormulaCachedSvgs = async (content, existingCache = {}, preamble = null, onProgress = null) => {
  const blocks = extractTikzBlocks(content);
  if (blocks.length === 0) return {};

  // Lọc chỉ giữ lại các hình TikZ đang thực sự tồn tại trong nội dung hiện tại
  // (Tự động xóa các hình cũ bị sai hoặc bị xóa, đảm bảo hình mới ghi đè hoàn toàn)
  const currentHashes = new Set(blocks.map(b => getTikzHash(b)));
  const updatedCache = {};
  if (existingCache && typeof existingCache === 'object') {
    for (const [key, val] of Object.entries(existingCache)) {
      if (currentHashes.has(key)) {
        updatedCache[key] = val;
      }
    }
  }

  const storedPreamble = preamble !== null ? preamble : (localStorage.getItem('app_teacher_latex_preamble') || undefined);

  let processed = 0;
  for (const block of blocks) {
    const hash = getTikzHash(block);
    // Nếu khối này đã có SVG hợp lệ trong cache thì bỏ qua, không cần biên dịch lại
    if (!updatedCache[hash] || typeof updatedCache[hash] !== 'string' || !updatedCache[hash].includes('<svg')) {
      try {
        const svg = await compileSingleTikz(block, storedPreamble);
        updatedCache[hash] = svg;
      } catch (err) {
        console.warn(`[tikzCacheUtils] Không thể biên dịch block ${hash}:`, err.message);
      }
    }
    processed++;
    if (onProgress) {
      onProgress(processed, blocks.length);
    }
  }

  return updatedCache;
};
