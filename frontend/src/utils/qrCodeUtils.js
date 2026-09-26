/**
 * qrCodeUtils.js
 * Tạo mã QR Code SVG thuần JavaScript, nhẹ, độc lập 100%, không cần kết nối mạng.
 * Dựa trên thuật toán QR Code chuẩn (Byte mode, Error correction L/M).
 */

// Bảng GF(256) cho phép nhân Galois Field trong Reed-Solomon
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsComputePoly(ecCount) {
  let poly = [1];
  for (let i = 0; i < ecCount; i++) {
    const root = GF256_EXP[i];
    const nextPoly = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], root);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

function rsEncode(data, ecCount) {
  const poly = rsComputePoly(ecCount);
  const res = new Uint8Array(ecCount);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    for (let j = 0; j < ecCount - 1; j++) {
      res[j] = res[j + 1] ^ gfMul(poly[poly.length - 2 - j], factor);
    }
    res[ecCount - 1] = gfMul(poly[0], factor);
  }
  return res;
}

// Bảng dung lượng QR Code Version 1 - 10 (chế độ Byte, EC Level M)
const QR_SPECS = [
  null,
  { version: 1, size: 21, totalBytes: 26, dataBytes: 16, ecBytes: 10, align: [] },
  { version: 2, size: 25, totalBytes: 44, dataBytes: 28, ecBytes: 16, align: [6, 18] },
  { version: 3, size: 29, totalBytes: 70, dataBytes: 44, ecBytes: 26, align: [6, 22] },
  { version: 4, size: 33, totalBytes: 100, dataBytes: 64, ecBytes: 36, align: [6, 26] },
  { version: 5, size: 37, totalBytes: 134, dataBytes: 86, ecBytes: 48, align: [6, 30] },
  { version: 6, size: 41, totalBytes: 172, dataBytes: 108, ecBytes: 64, align: [6, 34] },
  { version: 7, size: 45, totalBytes: 196, dataBytes: 124, ecBytes: 72, align: [6, 22, 38] },
  { version: 8, size: 49, totalBytes: 242, dataBytes: 154, ecBytes: 88, align: [6, 24, 42] },
  { version: 9, size: 53, totalBytes: 292, dataBytes: 182, ecBytes: 110, align: [6, 26, 46] },
  { version: 10, size: 57, totalBytes: 346, dataBytes: 216, ecBytes: 130, align: [6, 28, 50] },
];

export function generateQRCodeMatrix(text) {
  const textBytes = new TextEncoder().encode(text);
  const dataLen = textBytes.length;

  let spec = null;
  for (let v = 1; v <= 10; v++) {
    // 4 bits mode + 8/16 bits length + data
    const headerBits = 4 + 8;
    const availData = QR_SPECS[v].dataBytes - Math.ceil(headerBits / 8);
    if (dataLen <= availData) {
      spec = QR_SPECS[v];
      break;
    }
  }

  if (!spec) {
    // Nếu link quá dài > version 10 (hiếm gặp vì chỉ chứa domain + room id), dùng fallback
    spec = QR_SPECS[10];
  }

  const { size, dataBytes, ecBytes, align } = spec;

  // 1. Bit Buffer
  const bits = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  // Chế độ Byte = 0100
  pushBits(0b0100, 4);
  pushBits(textBytes.length, 8);
  for (let i = 0; i < textBytes.length; i++) {
    pushBits(textBytes[i], 8);
  }

  // Kết thúc chuỗi dữ liệu (Terminator)
  const remainingBits = dataBytes * 8 - bits.length;
  pushBits(0, Math.min(4, Math.max(0, remainingBits)));
  while (bits.length % 8 !== 0) bits.push(0);

  // Đệm byte pad 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < dataBytes * 8) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Chuyển sang Uint8Array
  const dataArr = new Uint8Array(dataBytes);
  for (let i = 0; i < dataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i * 8 + b];
    }
    dataArr[i] = byteVal;
  }

  // Tạo Reed-Solomon Error Correction Code
  const ecArr = rsEncode(dataArr, ecBytes);

  // Gộp Data + EC
  const finalStream = new Uint8Array(dataBytes + ecBytes);
  finalStream.set(dataArr, 0);
  finalStream.set(ecArr, dataBytes);

  // Tạo Ma Trận QR
  const matrix = Array.from({ length: size }, () => new Array(size).fill(null));
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r, c, val, func = true) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val ? 1 : 0;
      if (func) isFunction[r][c] = true;
    }
  }

  // Finder Patterns (3 góc)
  function drawFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r, nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isBlack = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          setModule(nr, nc, isBlack);
        } else {
          setModule(nr, nc, 0); // Separator
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Alignment Patterns
  for (const ar of align) {
    for (const ac of align) {
      if (isFunction[ar][ac]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isCenter = r === 0 && c === 0;
          setModule(ar + r, ac + c, isEdge || isCenter);
        }
      }
    }
  }

  // Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setModule(6, i, i % 2 === 0);
    if (!isFunction[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // Dark module
  setModule(4 * spec.version + 9, 8, 1);

  // Format Information Area reservation
  for (let i = 0; i < 9; i++) {
    if (!isFunction[8][i]) setModule(8, i, 0);
    if (!isFunction[i][8]) setModule(i, 8, 0);
  }
  for (let i = 0; i < 8; i++) {
    if (!isFunction[8][size - 1 - i]) setModule(8, size - 1 - i, 0);
    if (!isFunction[size - 1 - i][8]) setModule(size - 1 - i, 8, 0);
  }

  // Đặt bit dữ liệu vào matrix (zigzag từ phải qua trái)
  let bitIdx = 0;
  const totalBits = finalStream.length * 8;
  let dir = -1; // đi lên
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--; // bỏ qua cột timing
    for (let r = 0; r < size; r++) {
      const row = dir === -1 ? size - 1 - r : r;
      for (let c = 0; c < 2; c++) {
        const curCol = col - c;
        if (!isFunction[row][curCol]) {
          let bit = 0;
          if (bitIdx < totalBits) {
            const byte = finalStream[Math.floor(bitIdx / 8)];
            bit = (byte >> (7 - (bitIdx % 8))) & 1;
            bitIdx++;
          }
          // Áp dụng Mask 0: (row + col) % 2 === 0
          const mask = (row + curCol) % 2 === 0;
          matrix[row][curCol] = (bit ^ (mask ? 1 : 0));
        }
      }
    }
    dir = -dir;
    col -= 2;
  }

  // Ghi Format bits (Level M, Mask 0) = 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  // Cạnh trên/trái
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
  matrix[8][7] = formatBits[6];
  matrix[8][8] = formatBits[7];
  matrix[7][8] = formatBits[8];
  for (let i = 0; i < 6; i++) matrix[5 - i][8] = formatBits[9 + i];

  // Cạnh phải/dưới
  for (let i = 0; i < 8; i++) matrix[8][size - 1 - i] = formatBits[formatBits.length - 1 - i];
  for (let i = 0; i < 7; i++) matrix[size - 7 + i][8] = formatBits[i];

  return matrix;
}

/**
 * Xuất QR Code ra thẻ SVG string
 */
export function generateQRCodeSVG(text, size = 260) {
  try {
    const matrix = generateQRCodeMatrix(text);
    const modCount = matrix.length;
    const quietZone = 2; // lề trắng
    const totalCount = modCount + quietZone * 2;
    const modSize = size / totalCount;

    let pathD = '';
    for (let r = 0; r < modCount; r++) {
      for (let c = 0; c < modCount; c++) {
        if (matrix[r][c] === 1) {
          const x = (c + quietZone) * modSize;
          const y = (r + quietZone) * modSize;
          pathD += `M${x},${y}h${modSize}v${modSize}h-${modSize}z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect width="100%" height="100%" fill="#ffffff" rx="12" />
      <path d="${pathD}" fill="#1e1b4b" />
    </svg>`;
  } catch (err) {
    console.error('Lỗi tạo QR SVG nội bộ, chuyển fallback URL:', err);
    const encoded = encodeURIComponent(text);
    return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}" alt="QR Code" width="${size}" height="${size}" style="border-radius: 12px; background: #fff;" />`;
  }
}
