import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';

const execAsync = util.promisify(exec);

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend requests
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Lọc bỏ các lệnh không tương thích với standalone class
function isIncompatibleLine(trimmed) {
  // Chuỗi thực tế trong JS là 1 backslash (vd: \geometry)
  if (/^\\(geometry|setlength|pagestyle|thispagestyle|fancyhf|fancyhead|fancyfoot|headheight|headsep|footskip|textheight|textwidth|topmargin|oddsidemargin|evensidemargin|marginpar|pagenumbering|newgeometry|restoregeometry|setcounter\{page\})\b/.test(trimmed)) return true;
  if (/^\\usepackage(\[.*?\])?\{(geometry|fancyhdr|lastpage|hyperref|titlesec|tocloft|longtable)\}/.test(trimmed)) return true;
  if (/^\\(maketitle|tableofcontents|title|author|date|begin\{document\}|end\{document\}|documentclass)\b/.test(trimmed)) return true;
  return false;
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
  let tmpDir;
  try {
    const { tikzCode, preamble } = req.body;
    
    if (!tikzCode) {
      return res.status(400).json({ error: 'tikzCode is required' });
    }
    
    // Create a secure temporary directory
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tikz-'));
    const texFile = path.join(tmpDir, 'main.tex');
    const pdfFile = path.join(tmpDir, 'main.pdf');
    const svgFile = path.join(tmpDir, 'main.svg');
    
    const defaultPreamble = `\\usepackage[utf8]{inputenc}\n\\usepackage[T5]{fontenc}\n\\usepackage{amsmath,amssymb}\n\\usepackage{tikz}\n\\usepackage{tkz-tab}\n\\usetikzlibrary{calc,intersections,angles,quotes,patterns,positioning,arrows,arrows.meta,decorations.pathreplacing,decorations.markings,shapes.geometric,math}`;
    
    const rawPreamble = preamble && preamble.trim().length > 0
      ? preamble.trim()
      : defaultPreamble;
    
    const cleanPreamble = resolveAndSanitizePreamble(rawPreamble);
    
    // Tự động sửa lỗi phổ biến trong mã TikZ trước khi biên dịch
    const fixedTikzCode = tikzCode
      // Sửa \tkzTabVar{-/$$,...} → \tkzTabVar{-/,...} (bỏ $$ trống không hợp lệ)
      .replace(/(\/-)\s*\$\$\s*([,}])/g, '$1/$2')
      .replace(/(\/\+)\s*\$\$\s*([,}])/g, '$1/$2')
      // Dạng tổng quát: /$$  hoặc /$$ trong tkzTabVar
      .replace(/\/\$\$([,}])/g, '/$1');
    
    const texContent = `\\documentclass[tikz,margin=2mm]{standalone}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T5]{fontenc}\n${cleanPreamble}\n\\begin{document}\n${fixedTikzCode}\n\\end{document}\n`;
    
    fs.writeFileSync(texFile, texContent);
    // DEBUG: save the last compiled tikz code to workspace
    fs.writeFileSync(path.join(process.cwd(), 'last_compiled.tex'), texContent);
    
    // Compile using pdflatex
    try {
      await execAsync(`pdflatex -interaction=nonstopmode -halt-on-error -output-directory=${tmpDir} ${texFile}`);
    } catch (compileErr) {
      // Đọc log file để tìm lỗi cụ thể
      const logFile = path.join(tmpDir, 'main.log');
      let errorDetail = compileErr.message || 'Compilation failed';
      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf8');
        const errorLines = logContent.match(/^!.*$/gm);
        if (errorLines && errorLines.length > 0) {
          errorDetail = errorLines.slice(0, 3).join('\n');
        }
      }
      throw new Error(errorDetail);
    }
    
    // Convert to SVG using pdftocairo
    await execAsync(`pdftocairo -svg ${pdfFile} ${svgFile}`);
    // Read the generated SVG
    let svgContent = fs.readFileSync(svgFile, 'utf8');
    
    // Generate a unique ID for this SVG to prevent DOM conflicts when rendering multiple SVGs
    const uniqueId = Math.random().toString(36).substring(2, 9);
    
    // Namespace ALL IDs and references to them (href="#...", url(#...))
    svgContent = svgContent.replace(/id="([^"]+)"/g, `id="$1-${uniqueId}"`);
    svgContent = svgContent.replace(/href="#([^"]+)"/g, `href="#$1-${uniqueId}"`);
    svgContent = svgContent.replace(/url\(\s*#([^)]+)\s*\)/g, `url(#$1-${uniqueId})`);
    
    res.json({ svg: svgContent });
    
  } catch (err) {
    console.error('TikZ Compilation Error:', err);
    res.status(500).json({ error: err.message || 'Compilation failed' });
  } finally {
    if (tmpDir) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
});

app.listen(port, () => {
  console.log(`TikZ compilation backend listening at http://localhost:${port}`);
});
