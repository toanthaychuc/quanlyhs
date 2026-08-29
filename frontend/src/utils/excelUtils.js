import * as XLSX from 'xlsx';

/**
 * Utility hỗ trợ phân tích và xuất dữ liệu Excel (.xlsx, .xls, .csv) kèm điểm số
 */

const DEFAULT_SCORE_COLUMNS = [
  { id: 'regular1', name: 'TX 1', weight: 1 },
  { id: 'regular2', name: 'TX 2', weight: 1 },
  { id: 'midterm', name: 'Giữa Kỳ', weight: 2 },
  { id: 'final', name: 'Cuối Kỳ', weight: 3 }
];

// Xuất file Excel (.xlsx) danh sách học sinh kèm bảng điểm (Đã bỏ cột Địa chỉ, Mã HS đồng bộ SĐT)
export const exportStudentsToExcel = (students, className, scoreColumns = []) => {
  const activeColumns = scoreColumns && scoreColumns.length > 0 ? scoreColumns : DEFAULT_SCORE_COLUMNS;

  const data = students.map((s, index) => {
    const row = {
      'STT': index + 1,
      'Mã Học Sinh': s.id || s.phone || '',
      'Họ Và Tên': s.name || '',
      'Giới Tính': s.gender || 'Nam'
    };

    activeColumns.forEach(col => {
      // Nếu tên cột có thể hiện trọng số thì giữ nguyên, ngược lại có thể thêm vào tên nếu muốn. 
      // Ở đây ta cứ dùng đúng tên cột đã lưu.
      row[col.name] = s.scores?.[col.id] ?? '';
    });

    row['ĐTB'] = s.scores?.avg ?? '';
    row['Ngày Sinh'] = s.dob || '';
    row['Số Điện Thoại'] = s.phone || s.id || '';
    row['Email'] = s.email || '';
    row['Ghi Chú'] = s.note || '';

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachLop');

  // Auto column widths
  const cols = [
    { wch: 6 },  // STT
    { wch: 15 }, // Mã HS
    { wch: 24 }, // Họ Tên
    { wch: 10 }, // Giới Tính
  ];
  activeColumns.forEach(() => cols.push({ wch: 10 })); // Score cols
  cols.push(
    { wch: 8 },  // ĐTB
    { wch: 13 }, // Ngày Sinh
    { wch: 15 }, // SĐT
    { wch: 22 }, // Email
    { wch: 18 }  // Ghi Chú
  );
  worksheet['!cols'] = cols;

  const fileName = `BangDiem_${className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Tải file mẫu Excel (.xlsx) chuẩn không có cột Địa chỉ, Mã HS trùng Số điện thoại
export const downloadTemplateExcel = (className = 'Lop_Hoc', scoreColumns = []) => {
  const activeColumns = scoreColumns && scoreColumns.length > 0 ? scoreColumns : DEFAULT_SCORE_COLUMNS;
  
  const sample1 = {
    'STT': 1,
    'Mã Học Sinh': '0984746761',
    'Họ Và Tên': 'Trần Ngọc Trâm Anh',
    'Giới Tính': 'Nữ',
  };
  const sample2 = {
    'STT': 2,
    'Mã Học Sinh': '0912345678',
    'Họ Và Tên': 'Diệp Nguyên Đạt',
    'Giới Tính': 'Nam',
  };

  activeColumns.forEach(col => {
    sample1[col.name] = 8.5;
    sample2[col.name] = 9.0;
  });

  Object.assign(sample1, {
    'ĐTB': 8.5, 'Ngày Sinh': '2010-03-15', 'Số Điện Thoại': '0984746761', 'Email': 'tramanh@gmail.com', 'Ghi Chú': 'Lớp trưởng'
  });
  Object.assign(sample2, {
    'ĐTB': 9.0, 'Ngày Sinh': '2010-05-22', 'Số Điện Thoại': '0912345678', 'Email': 'dat.dn@gmail.com', 'Ghi Chú': 'Lớp phó'
  });

  const sampleData = [sample1, sample2];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Nhap_Hoc_Sinh');

  const cols = [
    { wch: 6 }, { wch: 15 }, { wch: 24 }, { wch: 10 }
  ];
  activeColumns.forEach(() => cols.push({ wch: 10 }));
  cols.push({ wch: 8 }, { wch: 13 }, { wch: 15 }, { wch: 22 }, { wch: 18 });
  worksheet['!cols'] = cols;

  const fileName = `Mau_Nhap_Hoc_Sinh_${className.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Phân tích file Excel (.xlsx, .xls, .csv) an toàn và chuẩn xác (Mã HS tự động lấy theo SĐT)
export const parseStudentExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Chuyển sang mảng mảng
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rows || rows.length <= 1) {
          resolve({ parsedStudents: [], newScoreColumns: [] });
          return;
        }

        // Tìm dòng tiêu đề (header row)
        let headerRowIndex = 0;
        let basicCols = { name: -1, id: -1, gender: -1, dob: -1, phone: -1, email: -1, note: -1, avg: -1 };
        let scoreCols = []; // { index, name, id, weight }

        for (let r = 0; r < Math.min(rows.length, 5); r++) {
          const rowStr = rows[r].map(c => String(c).toLowerCase());
          const nameIdx = rowStr.findIndex(c => c.includes('tên') || c.includes('họ và tên') || c.includes('name'));
          if (nameIdx !== -1) {
            headerRowIndex = r;
            basicCols.name = nameIdx;
            basicCols.id = rowStr.findIndex(c => c.includes('mã') || c.includes('id') || c.includes('code'));
            basicCols.gender = rowStr.findIndex(c => c.includes('giới') || c.includes('tính') || c.includes('gender') || c.includes('phái'));
            basicCols.dob = rowStr.findIndex(c => c.includes('sinh') || c.includes('dob') || c.includes('birth'));
            basicCols.phone = rowStr.findIndex(c => c.includes('thoại') || c.includes('phone') || c.includes('sđt'));
            basicCols.email = rowStr.findIndex(c => c.includes('email') || c.includes('mail'));
            basicCols.note = rowStr.findIndex(c => c.includes('chú') || c.includes('note'));
            basicCols.avg = rowStr.findIndex(c => c === 'đtb' || c.includes('trung bình') || c.includes('avg'));

            // Nhận diện cột điểm
            const ignoreKeywords = ['stt', 'số thứ tự', 'mã', 'id', 'tên', 'name', 'giới', 'gender', 'sinh', 'dob', 'thoại', 'phone', 'sđt', 'email', 'mail', 'chú', 'note', 'đtb', 'trung bình', 'avg', 'lớp', 'class'];
            
            rows[r].forEach((colName, idx) => {
              const lowerColName = String(colName).toLowerCase().trim();
              if (lowerColName && !ignoreKeywords.some(kw => lowerColName === kw || lowerColName.includes(kw))) {
                 let weight = null;
                 // Parse trọng số, VD: Giữa Kỳ (x2)
                 const weightMatch = colName.match(/\(x(\d+(?:\.\d+)?)\)/i);
                 if (weightMatch) {
                    weight = parseFloat(weightMatch[1]);
                 }
                 
                 let colId = lowerColName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
                 if (!colId) colId = `col_${idx}`;
                 
                 // Backward compat cho các tên cột kinh điển
                 if (colId.includes('tx1')) colId = 'regular1';
                 else if (colId.includes('tx2')) colId = 'regular2';
                 else if (colId.includes('giuaky') || colId.includes('midterm')) colId = 'midterm';
                 else if (colId.includes('cuoiky') || colId.includes('final')) colId = 'final';

                 scoreCols.push({ index: idx, name: String(colName).trim(), id: colId, weight });
              }
            });
            break;
          }
        }

        const parsedStudents = [];

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          let name = basicCols.name !== -1 ? String(row[basicCols.name] || '').trim() : String(row[2] || row[1] || row[0] || '').trim();

          if (name && name !== 'undefined') {
            let id = basicCols.id !== -1 ? String(row[basicCols.id] || '').trim() : '';
            let gender = basicCols.gender !== -1 ? String(row[basicCols.gender] || '').trim() : 'Nam';
            let dob = basicCols.dob !== -1 ? String(row[basicCols.dob] || '').trim() : '';
            let phone = basicCols.phone !== -1 ? String(row[basicCols.phone] || '').trim() : '';
            let email = basicCols.email !== -1 ? String(row[basicCols.email] || '').trim() : '';
            let note = basicCols.note !== -1 ? String(row[basicCols.note] || '').trim() : '';
            
            const isFemale = /nữ|nu|female|gái/i.test(gender);
            const studentPhone = phone || '';
            const studentId = id || studentPhone || `HS${String(i).padStart(2, '0')}`;
            
            const scores = {};
            let totalWeightedScore = 0;
            let totalWeight = 0;

            scoreCols.forEach(sc => {
               const val = row[sc.index];
               if (val !== undefined && val !== '') {
                  const numVal = parseFloat(val);
                  if (!isNaN(numVal)) {
                     scores[sc.id] = numVal;
                     totalWeightedScore += numVal * sc.weight;
                     totalWeight += sc.weight;
                  } else {
                     scores[sc.id] = '';
                  }
               } else {
                  scores[sc.id] = '';
               }
            });

            // Ưu tiên ĐTB có sẵn trong Excel, nếu không thì tự tính
            let avgVal = '';
            if (basicCols.avg !== -1 && row[basicCols.avg] !== '' && row[basicCols.avg] !== undefined) {
               const parsedAvg = parseFloat(row[basicCols.avg]);
               if (!isNaN(parsedAvg)) avgVal = parsedAvg;
            } else if (totalWeight > 0) {
               avgVal = parseFloat((totalWeightedScore / totalWeight).toFixed(1));
            }

            scores.avg = avgVal !== '' && !isNaN(avgVal) ? avgVal : '';

            parsedStudents.push({
              id: studentId,
              name,
              gender: isFemale ? 'Nữ' : 'Nam',
              dob,
              phone: studentPhone || studentId,
              email,
              address: '',
              status: 'active',
              note,
              scores
            });
          }
        }

        // Tự động nhận diện cấu hình score columns mới từ file
        const newScoreColumns = scoreCols.map(c => ({
           id: c.id,
           name: c.name,
           weight: c.weight
        }));

        resolve({ parsedStudents, newScoreColumns });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
