import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';
import crypto from 'crypto';

const execAsync = util.promisify(exec);

// ==========================================
// Setup Cache Directory
// ==========================================
const CACHE_DIR = path.join(process.cwd(), 'tikz_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// ==========================================
// Concurrency Queue (giới hạn luồng chạy đồng thời)
// ==========================================
class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(taskFn) {
    if (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.running++;
    try {
      return await taskFn();
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }
}
// Cho phép cấu hình giới hạn luồng chạy đồng thời qua biến môi trường (mặc định là 3)
const CONCURRENCY_LIMIT = process.env.CONCURRENCY_LIMIT ? parseInt(process.env.CONCURRENCY_LIMIT) : 3;
const compilerQueue = new TaskQueue(CONCURRENCY_LIMIT);
console.log(`[tikz-compiler] Khởi tạo hàng đợi với số luồng đồng thời: ${CONCURRENCY_LIMIT}`);

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend requests
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Hàm tiện ích: Đổi ID ngẫu nhiên cho thẻ SVG để tránh trùng lặp DOM trên web
function namespaceSvg(svgContent) {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  return svgContent
    .replace(/id="([^"]+)"/g, `id="$1-${uniqueId}"`)
    .replace(/href="#([^"]+)"/g, `href="#$1-${uniqueId}"`)
    .replace(/url\(\s*#([^)]+)\s*\)/g, `url(#$1-${uniqueId})`);
}

// Lọc bỏ các lệnh không tương thích với standalone class
function isIncompatibleLine(trimmed) {
  return /^(?:\\(?:geometry|setlength|pagestyle|thispagestyle|fancyhf|fancyhead|fancyfoot|headheight|headsep|footskip|textheight|textwidth|topmargin|oddsidemargin|evensidemargin|marginpar|pagenumbering|newgeometry|restoregeometry|setcounter\{page\}|maketitle|tableofcontents|title|author|date|begin\{document\}|end\{document\}|documentclass)\b|\\usepackage(?:\[.*?\])?\{(?:geometry|fancyhdr|lastpage|hyperref|titlesec|tocloft|longtable)\})/.test(trimmed);
}

// Giải quyết \input{...}: đọc file, lọc lệnh không tương thích, chèn trực tiếp
function resolveAndSanitizePreamble(preamble) {
  if (!preamble) return '';
  const lines = preamble.split('\n');
  const result = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Phát hiện \input{đường dẫn file} — chuỗi thực: 1 backslash
    const inputMatch = trimmed.match(/^\\input\{(.+?)\}$/);
    if (inputMatch) {
      // Chuẩn hóa đường dẫn: thay \ thành / 
      const filePath = inputMatch[1].replace(/\\/g, '/');
      console.log('[tikz-compiler] Resolving \\input file:', filePath);
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          // Đệ quy: file được input có thể chứa \input khác
          const sanitized = resolveAndSanitizePreamble(fileContent);
          result.push(`% --- BEGIN inlined from: ${path.basename(filePath)} ---`);
          result.push(sanitized);
          result.push(`% --- END inlined from: ${path.basename(filePath)} ---`);
          console.log('[tikz-compiler] Successfully inlined:', filePath);
        } else {
          console.warn('[tikz-compiler] File not found:', filePath);
          result.push(`% WARNING: File not found: ${filePath}`);
        }
      } catch (e) {
        console.error('[tikz-compiler] Cannot read file:', filePath, e.message);
        result.push(`% WARNING: Cannot read file: ${filePath} (${e.message})`);
      }
      continue;
    }

    // Lọc bỏ dòng không tương thích với standalone
    if (!isIncompatibleLine(trimmed)) {
      result.push(line);
    }
  }

  return result.join('\n');
}

app.post('/api/compile-tikz', async (req, res) => {
  try {
    const { tikzCode, preamble } = req.body;
    
    if (!tikzCode) {
      return res.status(400).json({ error: 'tikzCode is required' });
    }
    
    const defaultPreamble = `\\usepackage[utf8]{inputenc}\n\\usepackage[T5]{fontenc}\n\\usepackage{amsmath,amssymb}\n\\usepackage{tikz}\n\\usepackage{tkz-tab}\n\\usepackage{tkz-euclide}\n\\usetikzlibrary{calc,intersections,angles,quotes,patterns,positioning,arrows,arrows.meta,decorations.pathreplacing,decorations.markings,shapes.geometric,math}`;
    
    const rawPreamble = preamble && preamble.trim().length > 0
      ? preamble.trim()
      : defaultPreamble;
    
    const cleanPreamble = resolveAndSanitizePreamble(rawPreamble);
    
    // Tự động sửa lỗi phổ biến trong mã TikZ trước khi biên dịch (Auto-fixer)
    const fixedTikzCode = tikzCode
      // Sửa \tkzTabVar chứa $$ trống hoặc dấu cấu trúc dư
      .replace(/\/\s*[+-]?\s*\$\$\s*([,}])/g, '/$1')
      .replace(/\xA0/g, ' ') // Xóa non-breaking space
      // Xóa font=\footnotesize vì gây lỗi trên cấu hình TeX cũ
      .replace(/font=\\footnotesize/g, '')
      // Thay \overrightarrow thành \vec vì gây lỗi fragile
      .replace(/\\overrightarrow/g, '\\vec');

    const intervalMacros = `
\\providecommand{\\IntervalLR}[2]{\\def\\pre{#1}\\def\\next{#2}}
\\providecommand{\\skipInterval}{0.5cm}
\\providecommand{\\colorInterval}{black}
\\providecommand{\\IntervalGRF}[4]{%
  \\coordinate [label={center:$#1$},label=below:$\\rule{0pt}{\\skipInterval}#2$] (a) at (\\pre,0);
  \\coordinate [label={center:$#3$},label=below:$\\rule{0pt}{\\skipInterval}#4$] (b) at (\\next,0);
  \\fill[pattern=north east lines,pattern color=\\colorInterval](\\pre,-3pt)rectangle(\\next,3pt);
}
`;

    const texContent = `\\documentclass[tikz,margin=2mm]{standalone}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T5]{fontenc}\n${cleanPreamble}\n${intervalMacros}\n\\begin{document}\n${fixedTikzCode}\n\\end{document}\n`;
    
    // ==========================================
    // 1. Kiểm tra Cache
    // ==========================================
    const hash = crypto.createHash('md5').update(texContent).digest('hex');
    const cachedSvgPath = path.join(CACHE_DIR, `${hash}.svg`);
    
    if (fs.existsSync(cachedSvgPath)) {
      console.log(`[Cache Hit] Trả về ảnh từ cache: ${hash}`);
      return res.json({ svg: namespaceSvg(fs.readFileSync(cachedSvgPath, 'utf8')) });
    }

    // ==========================================
    // 2. Nếu chưa có cache, đưa vào Hàng đợi (Queue)
    // ==========================================
    console.log(`[Cache Miss] Đưa vào hàng đợi biên dịch: ${hash}`);
    const compileTask = async () => {
      let tmpDir;
      try {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tikz-'));
        const texFile = path.join(tmpDir, 'main.tex');
        const pdfFile = path.join(tmpDir, 'main.pdf');
        const svgFile = path.join(tmpDir, 'main.svg');
        
        fs.writeFileSync(texFile, texContent);

        
        // Biên dịch ra PDF (có timeout 60 giây để cho phép server cấu hình thấp kịp chạy)
        try {
          await execAsync(`pdflatex -interaction=nonstopmode -halt-on-error -output-directory=${tmpDir} ${texFile}`, { timeout: 60000 });
        } catch (compileErr) {
          const logFile = path.join(tmpDir, 'main.log');
          let errorDetail = compileErr.message || 'Compilation failed';
          if (fs.existsSync(logFile)) {
            const logContent = fs.readFileSync(logFile, 'utf8');
            const errorLines = logContent.match(/^!.*$/gm);
            if (errorLines && errorLines.length > 0) {
              errorDetail = errorLines.slice(0, 3).join('\n');
            } else {
              // Get the last 10 lines of the log to understand the failure
              const allLines = logContent.split('\n');
              const lastLines = allLines.slice(Math.max(allLines.length - 15, 0)).join('\n');
              errorDetail = `LaTeX Log (No ! error):\n${lastLines}`;
            }
          }
          throw new Error(errorDetail);
        }
        
        // Chuyển đổi PDF sang SVG
        await execAsync(`pdftocairo -svg ${pdfFile} ${svgFile}`, { timeout: 30000 });
        
        // Đọc nội dung SVG
        let rawSvgContent = fs.readFileSync(svgFile, 'utf8');
        
        // Lưu vào bộ nhớ đệm
        fs.writeFileSync(cachedSvgPath, rawSvgContent);
        console.log(`[Cache Saved] Lưu SVG mới vào cache: ${hash}`);
        
        // Trả kết quả (Namespace ID)
        return namespaceSvg(rawSvgContent);
      } finally {
        if (tmpDir) {
          try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
          } catch (e) { }
        }
      }
    };

    const finalSvg = await compilerQueue.add(compileTask);
    res.json({ svg: finalSvg });
    
  } catch (err) {
    console.error('TikZ Compilation Error:', err);
    res.status(500).json({ error: err.message || 'Compilation failed' });
  }
});

app.listen(port, () => {
  console.log(`TikZ compilation backend listening at http://localhost:${port}`);
});

