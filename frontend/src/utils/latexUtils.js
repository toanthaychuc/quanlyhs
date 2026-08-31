// Bộ xử lý và chuẩn hóa toàn diện theo ex_test.sty và bộ macro cá nhân của giáo viên

export const stripLatexComments = (text = '') => {
  if (!text) return '';
  return text
    .replace(/(^|[^\\])%.*$/gm, '$1')
    .trim();
};

// Chuẩn hóa và làm sạch câu hỏi (xóa bỏ \par thừa, chuẩn hóa dấu phẩy số thập phân 7,2)
export const cleanQuestionObj = (q) => {
  if (!q) return q;
  let content = (q.content || '')
    .replace(/\\par\s*$/gi, '')
    .replace(/\\par\s*(?=\\shortans)/gi, '')
    .trim();
  if (content === '\\par') content = '';

  let correctAnswer = q.correctAnswer || '';
  if (q.questionType === 'short_answer') {
    correctAnswer = String(correctAnswer)
      .replace(/\{,\}/g, ',')
      .replace(/\$/g, '')
      .trim();
  }

  return {
    ...q,
    content,
    correctAnswer
  };
};

export const extractBracedBlocks = (text = '') => {
  const list = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        list.push(text.slice(start, i));
        start = -1;
      }
    }
  }
  return list;
};

// Hàm bóc tách cấu trúc \immini / \imminiL kèm mọi tham số tuỳ chọn [thm], [d], [1]...
export const parseImminiBlock = (text = '') => {
  if (!text) return null;
  const match = text.match(/\\(?:immini|imminiL)\b/);
  if (!match) return null;
  const imIdx = match.index;
  const isLeftMode = match[0] === '\\imminiL';

  let pos = imIdx + match[0].length;
  // Bỏ qua khoảng trắng và toàn bộ các ngoặc vuông tuỳ chọn [thm], [d], [1]...
  while (pos < text.length) {
    if (/\s/.test(text[pos])) {
      pos++;
    } else if (text[pos] === '[') {
      const closeBracket = text.indexOf(']', pos);
      if (closeBracket !== -1) {
        pos = closeBracket + 1;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Hàm trích xuất 1 khối {...} cân bằng
  const extractNextBraced = (str, fromPos) => {
    while (fromPos < str.length && /\s/.test(str[fromPos])) fromPos++;
    if (fromPos >= str.length || str[fromPos] !== '{') return null;

    let depth = 0;
    let startContent = fromPos + 1;
    for (let i = fromPos; i < str.length; i++) {
      if (str[i] === '{') depth++;
      else if (str[i] === '}') {
        depth--;
        if (depth === 0) {
          return {
            content: str.slice(startContent, i),
            endPos: i + 1
          };
        }
      }
    }
    return null;
  };

  const firstArg = extractNextBraced(text, pos);
  if (!firstArg) return null;

  const secondArg = extractNextBraced(text, firstArg.endPos);
  if (!secondArg) return null;

  return {
    imIdx,
    fullEndPos: secondArg.endPos,
    isLeftMode,
    leftPart: firstArg.content,
    rightPart: secondArg.content,
    beforeText: text.slice(0, imIdx),
    afterText: text.slice(secondArg.endPos)
  };
};

// Hàm thay thế các macro LaTeX có dấu ngoặc nhọn {...} lồng nhau cân bằng
export const replaceMacroWithBraces = (text, macroName, transformFn) => {
  let result = '';
  let i = 0;
  while (i < text.length) {
    const idx = text.indexOf(macroName, i);
    if (idx === -1) {
      result += text.slice(i);
      break;
    }

    result += text.slice(i, idx);
    let openIdx = text.indexOf('{', idx + macroName.length);
    const inBetween = text.slice(idx + macroName.length, openIdx);

    if (openIdx === -1 || inBetween.trim() !== '') {
      result += macroName;
      i = idx + macroName.length;
      continue;
    }

    let depth = 1;
    let closeIdx = -1;
    for (let k = openIdx + 1; k < text.length; k++) {
      if (text[k] === '{') depth++;
      else if (text[k] === '}') {
        depth--;
        if (depth === 0) {
          closeIdx = k;
          break;
        }
      }
    }

    if (closeIdx === -1) {
      result += text.slice(idx);
      break;
    }

    const content = text.slice(openIdx + 1, closeIdx);
    
    // Bắt thêm đoạn hệ quả đi kèm phía sau (ví dụ: \heva{...} \Rightarrow \vv{AB}=\vv{DC})
    let trailingMath = '';
    let nextIdx = closeIdx + 1;
    const remaining = text.slice(nextIdx);
    const trailingMatch = remaining.match(/^(\s*\\(?:Rightarrow|Leftrightarrow|=)\s*[^$\n\r]+)/);
    if (trailingMatch) {
      trailingMath = trailingMatch[1];
      nextIdx += trailingMatch[0].length;
    }

    result += transformFn(content, trailingMath);
    i = nextIdx;
  }
  return result;
};

// Chuẩn hóa một khối công thức toán học KaTeX
const cleanMathContent = (content) => {
  if (!content) return '';
  let math = content
    .replace(/\$/g, '') // Khử mọi dấu $ lồng nhau
    .replace(/\\vv\s*\{([A-Za-z0-9_]{2,})\}/g, '\\overrightarrow{$1}')
    .replace(/\\vv\s*\{([A-Za-z0-9_])\}/g, '\\vec{$1}')
    .replace(/\\vv\s+([A-Za-z]{2,})\b/g, '\\overrightarrow{$1}')
    .replace(/\\vv\s+([A-Za-z])\b/g, '\\vec{$1}')
    .replace(/\\varparallel\b/g, '\\parallel')
    .replace(/\\goc\s*\{([^}]+)\}/g, '\\widehat{$1}')
    .replace(/\\degree/g, '^\\circ');

  // Đảm bảo văn bản tiếng Việt bên trong công thức được bao trong \text{...}
  const vietnamesePhrases = [
    'cùng hướng với',
    'ngược hướng với',
    'cùng phương với',
    'vuông góc với',
    'song song với',
    'thỏa mãn',
    'thoả mãn',
    'với mọi',
    'đúng',
    'sai'
  ];

  vietnamesePhrases.forEach(phrase => {
    const escaped = phrase.replace(/\s+/g, '\\s+');
    const regex = new RegExp(`(?<!\\\\text\\s*\\{[^}]*)(${escaped})(?![^{]*\\})`, 'gi');
    math = math.replace(regex, ' \\text{$1} ');
  });

  return math.trim();
};

export const normalizeLatexString = (str = '') => {
  if (!str) return '';

  let text = stripLatexComments(str);
  
  // Khử các khoảng trắng/tab thụt lề thừa từ source code LaTeX ở đầu mỗi dòng
  text = text.replace(/^[ \t]+/gm, '');

  // 1. Tự động loại bỏ Preamble khai báo gói và cài đặt trang nếu giáo viên dán cả file .tex
  text = text.replace(/\\documentclass(?:\[[^\]]*\])?\{[^}]*\}/gi, '');
  text = text.replace(/\\usepackage(?:\[[^\]]*\])?\{[^}]*\}/gi, '');
  text = text.replace(/\\usetikzlibrary\{[^}]*\}/gi, '');
  text = text.replace(/\\usepgfplotslibrary\{[^}]*\}/gi, '');
  text = text.replace(/\\pgfplotsset\{[^}]*\}/gi, '');
  text = text.replace(/\\DeclareSymbolFont\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}/gi, '');
  text = text.replace(/\\DeclareMathSymbol\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}/gi, '');
  text = text.replace(/\\titlespacing\*?\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}(?:\[[^\]]*\])?/gi, '');
  text = text.replace(/\\titleformat\*?\{[^}]*\}(?:\[[^\]]*\])?\{[^}]*\}\{[^}]*\}\{[^}]*\}\{[^}]*\}(?:\[[^\]]*\])?/gi, '');
  text = text.replace(/\\titlecontents\*?\{[^}]*\}(?:\[[^\]]*\])?\{[^}]*\}\{[^}]*\}\{[^}]*\}(?:\[[^\]]*\])?/gi, '');
  text = text.replace(/\\newcolumntype\{[^}]*\}\[[^\]]*\]\{[^}]*\}/gi, '');
  text = text.replace(/\\(?:makeatletter|makeatother|ExplSyntaxOn|ExplSyntaxOff|tableofcontents|cleardoublepage|thispagestyle|pagestyle|pagenumbering|Closesolutionfile|Opensolutionfile|indapan)\b(?:\{[^}]*\})*/gi, '');
  text = text.replace(/\\(?:newcounter|setcounter|stepcounter|addtocounter|renewcommand)\{[^}]*\}(?:\{[^}]*\})?/gi, '');
  // 2. Chuyển đổi các tiêu đề phần trắc nghiệm trong file của giáo viên (\caulc, \cauds, \caukq, \cautl)
  text = text.replace(/\\caulc\b/gi, '\n\n### 📋 PHẦN 1. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN\n\n');
  text = text.replace(/\\cauds\b/gi, '\n\n### ⚖️ PHẦN 2. CÂU TRẮC NGHIỆM ĐÚNG SAI\n\n');
  text = text.replace(/\\caukq\b/gi, '\n\n### ✍️ PHẦN 3. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN\n\n');
  text = text.replace(/\\cautl\b/gi, '\n\n### 📝 PHẦN 4. CÂU HỎI TỰ LUẬN\n\n');

  // 3. Khử môi trường bao bọc và căn lề:
  text = text.replace(/\\begin\{(?:center|flushleft|flushright|multicols|paracol|tcolorbox|window|onlysolution|document)\}(?:\[[^\]]*\])?/gi, '');
  text = text.replace(/\\end\{(?:center|flushleft|flushright|multicols|paracol|tcolorbox|window|onlysolution|document)\}/gi, '');
  text = text.replace(/\\(?:centering|noindent|raggedright|raggedleft|leavevmode|unskip|ignorespaces|hfill|dotfill|strut|filbreak|breakIM|vspaceIM|newpage|clearpage|break)\b/gi, '');
  text = text.replace(/\\vspace\*?\{[^}]*\}/gi, '');
  text = text.replace(/\\hspace\*?\{[^}]*\}/gi, '');
  text = text.replace(/\\setlength\{[^}]*\}\{[^}]*\}/gi, '');

  // 4. Xử lý các môi trường khối lý thuyết / bài tập của giáo viên:
  text = text.replace(/\\begin\{(?:dang|noidung|khung4|boxdl|boxdn|boxkn)\}(?:\[[^\]]*\])?\{([^}]+)\}/gi, '\n**📌 $1**\n');
  text = text.replace(/\\begin\{(?:vidu|luyentap|vandung|baitap|chuy|nx|ghichu|luuy|hd|dn|dl|tc|hq|binhluan|tomtat|gachsoc|mydn|mydl|mytc|myhq|mynx)\}(?:\[[^\]]*\])?/gi, '');
  text = text.replace(/\\end\{(?:dang|noidung|khung4|boxdl|boxdn|boxkn|vidu|luyentap|vandung|baitap|chuy|nx|ghichu|luuy|hd|dn|dl|tc|hq|binhluan|tomtat|gachsoc|mydn|mydl|mytc|myhq|mynx)\}/gi, '');

  // 5. Chuyển đổi FontAwesome & Icon symbols sang biểu tượng trực quan
  const iconMap = {
    '\\faGg': '💠',
    '\\faCheckSquareO': '☑️',
    '\\faCheckCircleO': '🔘',
    '\\faCheckCircle': '✅',
    '\\faPencilSquareO': '📝',
    '\\faStar': '⭐',
    '\\faFolderOpen': '📂',
    '\\faFolderOpenO': '📂',
    '\\faSunO': '☀️',
    '\\faClose': '❌',
    '\\faCubes': '🧊',
    '\\faPaperclip': '📎',
    '\\faEdit': '✏️',
    '\\faBell': '🔔',
    '\\faToggleOn': '▶️',
    '\\faAlignRight': '📐',
    '\\faCommenting': '💬',
    '\\iconGN': '📝',
    '\\iconNS': '⭐',
    '\\iconQS': '📂',
    '\\iconMT': '☀️',
    '\\iconX': '❌',
    '\\iconCH': '✅',
    '\\iconVD': '🧊',
    '\\iconCV': '📝',
    '\\itemKN': '☑️',
    '\\itemCI': '🔘'
  };

  Object.entries(iconMap).forEach(([macro, icon]) => {
    text = text.replaceAll(macro, icon);
  });

  // 6. Dấu ngoặc kép tiếng Việt \lq\lq ... \rq\rq
  text = text.replace(/\\lq\\lq/g, '“');
  text = text.replace(/\\rq\\rq/g, '”');
  text = text.replace(/\\lq/g, '‘');
  text = text.replace(/\\rq/g, '’');

  // 7. Môi trường danh sách: itemchoice, enumEX, enumEXV, listEX, taskEX
  text = text.replace(/\\begin\{(?:itemchoice|listEX|enumEX|enumEXV|taskEX|enumerate|itemize)\}(?:\[[^\]]*\])?(?:\([^)]*\))?/gi, '');
  text = text.replace(/\\end\{(?:itemchoice|listEX|enumEX|enumEXV|taskEX|enumerate|itemize)\}/gi, '');
  
  let itemchCounter = 0;
  text = text.replace(/\\itemch\b\s*/gi, () => {
    const chars = ['a) ', 'b) ', 'c) ', 'd) '];
    const bullet = chars[itemchCounter % 4];
    itemchCounter++;
    return `\n**${bullet}**`;
  });
  
  text = text.replace(/\\item\b\s*/gi, '\n• ');
  text = text.replace(/\\Eitem\b\s*/gi, '\n• ');
  text = text.replace(/\\Esubitemch\b\s*/gi, '\n• ');

  // 8. Xử lý các dạng \immini, \imminiL kèm mọi tuỳ chọn [thm], [d]...
  let imData;
  while ((imData = parseImminiBlock(text)) !== null) {
    const { imIdx, fullEndPos, leftPart, rightPart } = imData;
    text = text.slice(0, imIdx) + `${leftPart.trim()}\n\n${rightPart.trim()}` + text.slice(fullEndPos);
  }
  // Loại bỏ các thẻ [thm] độc lập nếu còn sót lại ở đầu văn bản
  text = text.replace(/^\s*\[(?:thm|[a-zA-Z0-9_-]+)\]\s*\{?/gmi, '');

  // 9. Chuẩn hóa vector \vv và \vec
  text = replaceMacroWithBraces(text, '\\vv', content => `\\overrightarrow{${content}}`);
  text = text.replace(/\\vv\s+([A-Za-z]{2,})\b/g, '\\overrightarrow{$1}');
  text = text.replace(/\\vv\s+([A-Za-z])\b/g, '\\vec{$1}');
  text = text.replace(/\\varparallel\b/g, '\\parallel');


  // 11. Chuẩn hóa góc \goc
  text = replaceMacroWithBraces(text, '\\goc', content => `\\widehat{${content}}`);

  // 12. Chuẩn hóa đơn vị đo độ và ký hiệu
  text = text.replace(/\\degree/g, '^\\circ');
  text = text.replace(/\\ang\{([^}]+)\}/g, '$1^\\circ');
  text = text.replace(/\\qedEX/g, '$\\square$');

  // 13. Định dạng font chữ (\textbf, \textit, \inden, \indam...)
  text = replaceMacroWithBraces(text, '\\inden', c => `**${c}**`);
  text = replaceMacroWithBraces(text, '\\indam', c => `**${c}**`);
  text = replaceMacroWithBraces(text, '\\indamm', c => `**${c}**`);
  text = replaceMacroWithBraces(text, '\\ind', c => `**${c}**`);
  text = replaceMacroWithBraces(text, '\\tron', c => `(${c})`);
  text = replaceMacroWithBraces(text, '\\boxmini', c => `[${c}]`);
  text = replaceMacroWithBraces(text, '\\boxminit', c => `[${c}]`);

  // Bỏ các lệnh không được hỗ trợ bởi KaTeX nhưng hay gặp
  text = text.replace(/\\allowdisplaybreaks\b/g, '');
  text = text.replace(/\\begin\{eqnarray\*?\}([\s\S]*?)\\end\{eqnarray\*?\}/g, (match, inner) => {
    const fixedInner = inner.replace(/&([^&]+)&/g, '&$1');
    return `\\begin{aligned}${fixedInner}\\end{aligned}`;
  });

  // Temporarily replace math blocks and tabulars with placeholders to protect internal LaTeX syntax (like \\ inside array/cases/matrix/tabular)
  const mathBlocks = [];
  text = text.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{(?:aligned|eqnarray|align|equation|cases|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array|tabular|xtabular|longtable)\*?\}(?:\[.*?\])?[\s\S]*?\\end\{(?:aligned|eqnarray|align|equation|cases|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array|tabular|xtabular|longtable)\*?\}|\$[^\$]+?\$|\\\([\s\S]*?\\\))/g, (match) => {
    mathBlocks.push(match);
    return `__MATH_BLOCK_PLACEHOLDER_${mathBlocks.length - 1}__`;
  });

  // 10. Bọc các lệnh \hoac, \heva mồ côi (không nằm trong math block)
  text = replaceMacroWithBraces(text, '\\heva', c => `$\\heva{${c}}$`);
  text = replaceMacroWithBraces(text, '\\hoac', c => `$\\hoac{${c}}$`);

  text = replaceMacroWithBraces(text, '\\textbf', c => `**${c}**`);
  text = replaceMacroWithBraces(text, '\\textit', c => `*${c}*`);
  text = replaceMacroWithBraces(text, '\\underline', c => `<u>${c}</u>`);
  text = text.replace(/\{\s*\\it(?![a-zA-Z])\s*([^}]+)\}/g, '*$1*');
  text = text.replace(/\{\s*\\bf(?![a-zA-Z])\s*([^}]+)\}/g, '**$1**');
  text = text.replace(/\\bfseries\b/g, '');
  text = text.replace(/\\rm\b/g, '');

  // 14. Các macro phụ trợ trong ex_test: \boxEX, \EXbox, \circled, \circEX, \squareEX, \TF
  text = text.replace(/\\TF\{([^}]+)\}/g, '$1');
  text = text.replace(/\\circled\{([^}]+)\}/g, '($1)');
  text = text.replace(/\\circEX(?:\[[^\]]*\])?\{([^}]+)\}/g, '($1)');
  text = text.replace(/\\squareEX(?:\[[^\]]*\])?\{([^}]+)\}/g, '[$1]');
  text = text.replace(/\\boxEX(?:\[[^\]]*\])?\{([^}]+)\}/g, '$1');
  text = text.replace(/\\tagEX\{([^}]+)\}/g, ' ($1)');

  // 15. Dấu xuống dòng \\ và lệnh \par trong văn bản
  text = text.replace(/\\par\b/gi, '\n\n');
  text = text.replace(/\\\\\s*/g, '\n');

  // Restore protected math blocks
  text = text.replace(/__MATH_BLOCK_PLACEHOLDER_(\d+)__/g, (match, idx) => {
    return mathBlocks[parseInt(idx, 10)];
  });

  return text;
};
