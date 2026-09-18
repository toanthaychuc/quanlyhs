// Bộ xử lý và chuẩn hóa toàn diện theo ex_test.sty và bộ macro cá nhân của giáo viên

export const stripLatexComments = (text = '') => {
  if (!text) return '';
  return text
    .replace(/(^|[^\\])%(?!\s*\[).*$/gm, '$1')
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

export const replaceTwoArgMacro = (text, macroName, transformFn) => {
  let result = '';
  let i = 0;
  while (i < text.length) {
    const idx = text.indexOf(macroName, i);
    if (idx === -1) {
      result += text.slice(i);
      break;
    }

    result += text.slice(i, idx);
    let openIdx1 = text.indexOf('{', idx + macroName.length);
    const inBetween1 = text.slice(idx + macroName.length, openIdx1);

    if (openIdx1 === -1 || inBetween1.trim() !== '') {
      result += macroName;
      i = idx + macroName.length;
      continue;
    }

    let depth1 = 1;
    let closeIdx1 = -1;
    for (let k = openIdx1 + 1; k < text.length; k++) {
      if (text[k] === '{') depth1++;
      else if (text[k] === '}') {
        depth1--;
        if (depth1 === 0) {
          closeIdx1 = k;
          break;
        }
      }
    }

    if (closeIdx1 === -1) {
      result += text.slice(idx);
      break;
    }

    const arg1 = text.slice(openIdx1 + 1, closeIdx1);

    let openIdx2 = text.indexOf('{', closeIdx1 + 1);
    const inBetween2 = text.slice(closeIdx1 + 1, openIdx2);

    if (openIdx2 === -1 || inBetween2.trim() !== '') {
      result += text.slice(idx, closeIdx1 + 1);
      i = closeIdx1 + 1;
      continue;
    }

    let depth2 = 1;
    let closeIdx2 = -1;
    for (let k = openIdx2 + 1; k < text.length; k++) {
      if (text[k] === '{') depth2++;
      else if (text[k] === '}') {
        depth2--;
        if (depth2 === 0) {
          closeIdx2 = k;
          break;
        }
      }
    }

    if (closeIdx2 === -1) {
      result += text.slice(idx);
      break;
    }

    const arg2 = text.slice(openIdx2 + 1, closeIdx2);
    result += transformFn(arg1, arg2);
    i = closeIdx2 + 1;
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

  // 0. Xử lý các dạng \immini, \imminiL kèm mọi tuỳ chọn [thm], [d]... trước khi bị mất ngoặc nhọn
  let imData;
  while ((imData = parseImminiBlock(text)) !== null) {
    const { imIdx, fullEndPos, leftPart, rightPart, isLeftMode } = imData;
    const mode = isLeftMode ? 'IMMINI_LEFT' : 'IMMINI_RIGHT';
    text = text.slice(0, imIdx) + 
           `\n\n__BEGIN_${mode}__\n\n${leftPart.trim()}\n\n__MID_IMMINI__\n\n${rightPart.trim()}\n\n__END_${mode}__\n\n` + 
           text.slice(fullEndPos);
  }

  // Loại bỏ cặp ngoặc nhọn bao quanh toàn bộ hình vẽ TikZ (do người dùng hay gõ nhóm hình)
  const tikzBraceRegex = /\{\s*(?:\\(?:par|centering|noindent|raggedright|raggedleft|hfill|vspace\b\*?(?:\{[^}]*\})?|hspace\b\*?(?:\{[^}]*\})?)\s*)*((?:(?:\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}\s*|\\colorlet\{[^}]+\}\{[^}]+\}\s*)*)\\begin\{tikzpicture\}[^]*?\\end\{tikzpicture\})\s*(?:\\(?:par|centering|noindent|raggedright|raggedleft|hfill|vspace\b\*?(?:\{[^}]*\})?|hspace\b\*?(?:\{[^}]*\})?)\s*)*\}/gi;
  let prevText = text;
  while (true) {
    text = text.replace(tikzBraceRegex, '$1');
    if (text === prevText) break;
    prevText = text;
  }

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

  // Xử lý section và subsection
  const toRoman = (num) => {
    const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let roman = '';
    for (let i in lookup) {
      while (num >= lookup[i]) { roman += i; num -= lookup[i]; }
    }
    return roman;
  };
  const toAlpha = (num) => String.fromCharCode(96 + num);

  let subsectionCounter = 0;
  let subsubsectionCounter = 0;
  let paragraphCounter = 0;

  const extractHeading = (text, type, formatter) => {
    let result = '';
    let currentIndex = 0;
    const regex = new RegExp(`\\\\${type}(?:\\*|\\s)*(?:\\[[^\\]]*\\])?\\s*\\{`, 'gi');
    
    while (true) {
      regex.lastIndex = currentIndex;
      const match = regex.exec(text);
      if (!match) {
        result += text.slice(currentIndex);
        break;
      }
      
      const startIdx = match.index;
      result += text.slice(currentIndex, startIdx);
      
      const openIdx = match.index + match[0].length - 1; // '{' is the last char of the match
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
      
      if (closeIdx !== -1) {
        const title = text.slice(openIdx + 1, closeIdx);
        result += formatter(title);
        currentIndex = closeIdx + 1;
      } else {
        result += match[0];
        currentIndex = openIdx + 1;
      }
    }
    return result;
  };

  text = extractHeading(text, 'section', (title) => {
    subsectionCounter = 0;
    return `\n\n**${title}**\n\n`;
  });
  
  text = extractHeading(text, 'subsection', (title) => {
    subsectionCounter++;
    subsubsectionCounter = 0;
    return `\n\n__SUBSECTION__${toRoman(subsectionCounter)}__${title}__END_SUBSECTION__\n\n`;
  });
  
  text = extractHeading(text, 'subsubsection', (title) => {
    subsubsectionCounter++;
    paragraphCounter = 0;
    return `\n\n__SUBSUBSECTION__${subsubsectionCounter}__${title}__END_SUBSUBSECTION__\n\n`;
  });
  
  text = extractHeading(text, 'paragraph', (title) => {
    paragraphCounter++;
    return `\n\n**${toAlpha(paragraphCounter)}) ${title}**\n\n`;
  });

  // 3. Khử môi trường bao bọc, căn lề và khoảng trắng:
  text = text.replace(/\\begin\{center\}(?:\[[^\]]*\])?/gi, '\n\n__BEGIN_CENTER__\n\n');
  text = text.replace(/\\end\{center\}/gi, '\n\n__END_CENTER__\n\n');

  // Parse blocks like {\par\centering ... }
  let i = 0;
  while (i < text.length) {
    const match = text.substring(i).match(/\{\s*(?:\\par\s*)?\\centering\b/);
    if (!match) break;
    const startIdx = i + match.index;
    let depth = 1;
    let endIdx = -1;
    for (let k = startIdx + 1; k < text.length; k++) {
      if (text[k] === '{') depth++;
      else if (text[k] === '}') {
        depth--;
        if (depth === 0) {
          endIdx = k;
          break;
        }
      }
    }
    if (endIdx === -1) {
      i = startIdx + match[0].length;
      continue;
    }
    let inner = text.slice(startIdx + match[0].length, endIdx);
    inner = inner.replace(/\\par\s*$/, '');
    if (inner.trim().startsWith('{') && inner.trim().endsWith('}')) {
      let innerTrimmed = inner.trim();
      let innerDepth = 0;
      let valid = true;
      for (let j = 0; j < innerTrimmed.length - 1; j++) {
        if (innerTrimmed[j] === '{') innerDepth++;
        else if (innerTrimmed[j] === '}') innerDepth--;
        if (innerDepth === 0) { valid = false; break; }
      }
      if (valid) inner = innerTrimmed.slice(1, -1);
    }
    text = text.slice(0, startIdx) + '\n\n__BEGIN_CENTER__\n\n' + inner.trim() + '\n\n__END_CENTER__\n\n' + text.slice(endIdx + 1);
    i = startIdx + 20; // Move past __BEGIN_CENTER__
  }

  text = text.replace(/\\(?:begin|end)\{(?:flushleft|flushright|paracol|tcolorbox|window|onlysolution|document)\}(?:\[[^\]]*\])?/gi, '');
  text = text.replace(/\\(?:centering|noindent|raggedright|raggedleft|leavevmode|unskip|ignorespaces|hfill|dotfill|strut|filbreak|breakIM|vspaceIM|newpage|clearpage|break|columnbreak)\b/gi, '');
  text = text.replace(/\\(?:vspace|hspace)\*?\{[^}]*\}/gi, '');
  text = text.replace(/\\setlength\{[^}]*\}\{[^}]*\}/gi, '');

  // 4. Xử lý các môi trường khối lý thuyết / bài tập của giáo viên:
  // Khối multicols
  text = text.replace(/\\begin\{multicols\}\s*\{2\}(?:\[[^\]]*\])?/gi, '\n\n__BEGIN_MULTICOLS__\n\n');
  text = text.replace(/\\end\{multicols\}/gi, '\n\n__END_MULTICOLS__\n\n');

  // Khối định nghĩa (dn) - Kiến thức trọng tâm
  text = text.replace(/\\begin\{(?:dn|boxdn|boxdl)\}(?:\[[^\]]*\])?/gi, '\n\n__BEGIN_BOX__\n\n');
  text = text.replace(/\\end\{(?:dn|boxdn|boxdl)\}/gi, '\n\n__END_BOX__\n\n');

  // Khối chú ý (chuy)
  text = text.replace(/\\begin\{chuy\}(?:\[[^\]]*\])?/gi, '\n\n__BEGIN_CHUY__\n\n');
  text = text.replace(/\\end\{chuy\}/gi, '\n\n__END_CHUY__\n\n');

  // Khối nhận xét (nx)
  text = text.replace(/\\begin\{nx\}(?:\[[^\]]*\])?/gi, '\n\n__BEGIN_NX__\n\n');
  text = text.replace(/\\end\{nx\}/gi, '\n\n__END_NX__\n\n');

  // Khối tính chất (tc)
  text = text.replace(/\\begin\{tc\}(?:\[[^\]]*\])?/gi, '\n\n__BEGIN_TC__\n\n');
  text = text.replace(/\\end\{tc\}/gi, '\n\n__END_TC__\n\n');

  text = text.replace(/\\begin\{(?:dang|noidung|khung4|boxkn)\}(?:\[[^\]]*\])?\{([^}]+)\}/gi, '\n**📍 $1**\n');
  text = text.replace(/\\(?:begin|end)\{(?:vidu|luyentap|vandung|baitap|ghichu|luuy|hd|dl|hq|binhluan|tomtat|gachsoc|mydn|mydl|mytc|myhq|mynx)\}(?:\[[^\]]*\])?/gi, '');

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
  text = text.replace(/\\lq\s*\\lq/g, '“');
  text = text.replace(/\\rq\s*\\rq/g, '”');
  text = text.replace(/\\lq/g, '‘');
  text = text.replace(/\\rq/g, '’');

  // 7. Môi trường danh sách: itemchoice, enumEX, enumEXV, listEX, taskEX, enumerate, itemize
  let prevTextList;
  do {
    prevTextList = text;
    text = text.replace(/\\begin\{(enumerate|itemize|itemchoice|listEX|enumEX|enumEXV|taskEX)\}\s*(?:\[([^\]]*)\])?\s*(?:\([^)]*\))?\s*((?:(?!\\begin\{(?:enumerate|itemize|itemchoice|listEX|enumEX|enumEXV|taskEX)\})[\s\S])*?)\\end\{\1\}/gi, (match, envType, opt, inner) => {
      let counter = 0;
      let type = 'bullet';

      const envLower = envType.toLowerCase();

      if (envLower === 'enumerate' || envLower === 'enumex' || envLower === 'enumexv' || envLower === 'listex' || envLower === 'taskex') {
        type = 'number';
        if (opt) {
          if (opt.includes('a)') || opt.includes('a.') || opt.includes('\\alph') || opt === 'a') type = 'alpha';
          else if (opt.includes('A)') || opt.includes('A.') || opt.includes('\\Alph') || opt === 'A') type = 'upperAlpha';
          else if (opt.includes('i)') || opt.includes('i.') || opt.includes('\\roman') || opt === 'i') type = 'roman';
        }
      } else if (envLower === 'itemchoice') {
        type = 'choice';
      }

      let replacedInner = inner.replace(/\\(?:item|itemch|Eitem|Esubitemch)\b(?:\[([^\]]*)\])?\s*/gi, (itemMatch, itemOpt) => {
        if (itemOpt) {
          return `\n• **${itemOpt}** `;
        }

        let label = '';
        if (type === 'alpha') {
          label = String.fromCharCode(97 + (counter % 26)) + ')';
        } else if (type === 'upperAlpha') {
          label = String.fromCharCode(65 + (counter % 26)) + ')';
        } else if (type === 'roman') {
          const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
          label = (romans[counter] || (counter + 1)) + ')';
        } else if (type === 'number') {
          label = (counter + 1) + '.';
        } else if (type === 'choice') {
          const chars = ['a)', 'b)', 'c)', 'd)'];
          label = chars[counter % 4];
        } else {
          label = '•';
        }
        counter++;
        return `\n**${label}** `;
      });
      return `\n\n__BEGIN_LIST__\n${replacedInner}\n__END_LIST__\n\n`;
    });
  } while (text !== prevTextList);

  // Fallback dự phòng cho các thẻ lỗi hoặc chưa đóng
  text = text.replace(/\\begin\{(?:itemchoice|listEX|enumEX|enumEXV|taskEX|enumerate|itemize)\}\s*(?:\[[^\]]*\])?\s*(?:\([^)]*\))?/gi, '');
  text = text.replace(/\\end\{(?:itemchoice|listEX|enumEX|enumEXV|taskEX|enumerate|itemize)\}/gi, '');

  let itemchCounter = 0;
  text = text.replace(/\\itemch\b\s*/gi, () => {
    const chars = ['a) ', 'b) ', 'c) ', 'd) '];
    const bullet = chars[itemchCounter % 4];
    itemchCounter++;
    return `\n**${bullet}**`;
  });

  text = text.replace(/\\(?:item|Eitem|Esubitemch)\b\s*/gi, '\n• ');

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
  ['\\inden', '\\indam', '\\indamm', '\\ind'].forEach(m => {
    text = replaceMacroWithBraces(text, m, c => `**${c}**`);
  });
  text = replaceMacroWithBraces(text, '\\tron', c => `(${c})`);
  ['\\boxmini', '\\boxminit'].forEach(m => {
    text = replaceMacroWithBraces(text, m, c => `[${c}]`);
  });

  // Bỏ các lệnh không được hỗ trợ bởi KaTeX nhưng hay gặp
  text = text.replace(/\\allowdisplaybreaks\b/g, '');
  text = text.replace(/\\begin\{eqnarray\*?\}([\s\S]*?)\\end\{eqnarray\*?\}/g, (match, inner) => {
    let fixedInner = inner.replace(/&&/g, '&');
    fixedInner = fixedInner.replace(/&([^&\n\r]+)&/g, '&$1 ');
    return `\\begin{aligned}${fixedInner}\\end{aligned}`;
  });

  // Temporarily replace math blocks and tabulars with placeholders to protect internal LaTeX syntax (like \\ inside array/cases/matrix/tabular)
  const mathBlocks = [];
  text = text.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{((?:aligned|eqnarray|align|equation|cases|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array|tabular|xtabular|longtable)\*?)\}(?:\[.*?\])?[\s\S]*?\\end\{\2\}|\$[^\$]+?\$|\\\([\s\S]*?\\\))/g, (match) => {
    mathBlocks.push(match);
    return `__MATH_BLOCK_PLACEHOLDER_${mathBlocks.length - 1}__`;
  });

  // 10. Bọc các lệnh \hoac, \heva mồ côi (không nằm trong math block)
  text = replaceMacroWithBraces(text, '\\heva', c => `$\\heva{${c}}$`);
  text = replaceMacroWithBraces(text, '\\hoac', c => `$\\hoac{${c}}$`);

  text = replaceMacroWithBraces(text, '\\textbf', c => `**${c}**`);
  text = replaceMacroWithBraces(text, '\\textit', c => `*${c}*`);
  text = replaceMacroWithBraces(text, '\\underline', c => `<u>${c}</u>`);
  text = text.replace(/\{\s*\\(it|bf)(?![a-zA-Z])\s*([^}]+)\}/g, (match, type, content) => type === 'it' ? `*${content}*` : `**${content}**`);
  text = text.replace(/\\(?:bfseries|rm)\b/g, '');

  // 14. Các macro phụ trợ trong ex_test: \boxEX, \EXbox, \circled, \circEX, \squareEX, \TF
  text = text.replace(/\\TF\{([^}]+)\}/g, '$1');
  text = text.replace(/\\circled\{([^}]+)\}/g, '($1)');
  text = text.replace(/\\circEX(?:\[[^\]]*\])?\{([^}]+)\}/g, '($1)');
  text = text.replace(/\\squareEX(?:\[[^\]]*\])?\{([^}]+)\}/g, '[$1]');
  text = text.replace(/\\boxEX(?:\[[^\]]*\])?\{([^}]+)\}/g, '$1');

  // Xóa các macro định dạng không được hỗ trợ để tránh rác text
  text = replaceTwoArgMacro(text, '\\scalebox', (arg1, arg2) => arg2);
  text = replaceTwoArgMacro(text, '\\textcolor', (arg1, arg2) => arg2);
  text = text.replace(/\{\s*\\color\s*\{[^}]+\}\s*([^}]+)\}/g, '$1');
  text = replaceMacroWithBraces(text, '\\fbox', c => c);
  text = replaceMacroWithBraces(text, '\\mbox', c => c);
  
  // Loại bỏ cặp ngoặc nhọn kẹp \par\noindent...
  text = text.replace(/\{\s*\\(?:par|noindent|vspace\{[^}]*\})+\s*([\s\S]*?)\s*(?:\\par\s*)?\}/gi, (match, inner) => inner);
  text = text.replace(/\{\s*\\(?:par|noindent|vspace\{[^}]*\})*\s*([\s\S]*?)\s*\\(?:par)\s*\}/gi, (match, inner) => inner);
  text = text.replace(/\\tagEX\{([^}]+)\}/g, ' ($1)');

  // 15. Dấu xuống dòng \\ và lệnh \par trong văn bản
  text = text.replace(/\\par\b/gi, '\n\n');
  text = text.replace(/\\\\\s*/g, '\n');
  text = text.replace(/\\\s/g, ' ');

  // Restore protected math blocks
  text = text.replace(/__MATH_BLOCK_PLACEHOLDER_(\d+)__/g, (match, idx) => {
    return mathBlocks[parseInt(idx, 10)];
  });

  // Chuyển đổi tabular và tikzpicture thành dạng __BEGIN_...__ để parseNestedEnvironments dễ dàng bóc tách theo thứ bậc
  text = text.replace(/\\begin\{(tabular|xtabular|longtable)\}(?:\[[^\]]*\])?\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}([\s\S]*?)\\end\{\1\}/gi, '\n\n__BEGIN_TABULAR__\n\n$2\n\n__END_TABULAR__\n\n');
  text = text.replace(/((?:(?:\\definecolor\{[^}]+\}\{[^}]+\}\{[^}]+\}\s*|\\colorlet\{[^}]+\}\{[^}]+\}\s*)*)\\begin\{tikzpicture(?:\[[^\]]*\])?\}?(?:\[[^\]]*\])?[\s\S]*?\\end\{tikzpicture\})/gi, '\n\n__BEGIN_TIKZ__\n\n$1\n\n__END_TIKZ__\n\n');

  return text;
};
