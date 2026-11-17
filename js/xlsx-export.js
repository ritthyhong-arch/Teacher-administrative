/**
 * Excel (.xlsx / .xml) Export Engine
 * Generates styled spreadsheets with official Khmer headers, teacher records,
 * and summary statistics. Works with SheetJS when available, with a robust native
 * XML spreadsheet fallback that opens cleanly in all versions of Excel!
 */

const PSIS_XlsxExport = (() => {
  /**
   * Export Daily Monitoring Checklist to Excel
   */
  function exportDailyToExcel(dateStr, records, schoolInfo) {
    const khmerDate = KhmerCalendar.formatKhmerShortDate(dateStr);
    const officialDate = KhmerCalendar.getFullOfficialKhmerDate(dateStr);
    const filename = `របាយការណ៍រដ្ឋបាលគ្រូ_${dateStr}.xlsx`;

    // Try SheetJS if available
    if (window.XLSX) {
      exportWithSheetJS(dateStr, records, schoolInfo, filename);
    } else {
      exportWithNativeXml(dateStr, records, schoolInfo, `របាយការណ៍រដ្ឋបាលគ្រូ_${dateStr}.xls`);
    }
  }

  function exportWithSheetJS(dateStr, records, schoolInfo, filename) {
    const wb = XLSX.utils.book_new();

    const rows = [
      ['ព្រះរាជាណាចក្រកម្ពុជា'],
      ['ជាតិ សាសនា ព្រះមហាក្សត្រ'],
      [''],
      [schoolInfo.nameKh || 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ', '', '', '', 'របាយការណ៍ត្រួតពិនិត្យរដ្ឋបាលគ្រូប្រចាំថ្ងៃ'],
      ['បាវចនា: ' + (schoolInfo.mottoKh || 'វិន័យ គុណធម៌ សុភមង្គល'), '', '', '', 'កាលបរិច្ឆេទ: ' + KhmerCalendar.formatKhmerShortDate(dateStr)],
      ['សាខា: ' + (schoolInfo.branch || 'សាខាកណ្តាល'), '', '', '', KhmerCalendar.getFullOfficialKhmerDate(dateStr)],
      [''],
      [
        'ល.រ',
        'ឈ្មោះគ្រូ',
        'ថ្នាក់',
        'ម៉ោងស្កេនចូល',
        'ស្រង់វត្តមានសិស្ស',
        'វាយតម្លៃពិន្ទុសិស្ស',
        'ការប្រើប្រាស់ Telegram',
        'សម្រង់អត្ថបទ',
        'ម៉ោងស្កេនចេញ',
        'ផ្សេងៗ/ស្ថានភាព',
        'កំណត់សម្គាល់បន្ថែម'
      ]
    ];

    records.forEach((r, idx) => {
      rows.push([
        idx + 1,
        r.teacherName,
        r.classGrade,
        r.remarks === 'ច្បាប់' ? '-' : (r.scanInTime || '-'),
        r.remarks === 'ច្បាប់' ? '-' : r.attendanceRecorded,
        r.remarks === 'ច្បាប់' ? '-' : r.scoreEvaluated,
        r.remarks === 'ច្បាប់' ? '-' : r.telegramUsed,
        r.remarks === 'ច្បាប់' ? '-' : r.lessonSummaryWritten,
        r.remarks === 'ច្បាប់' ? '-' : (r.scanOutTime || '-'),
        r.remarks,
        r.note || ''
      ]);
    });

    // Add Signatures
    rows.push(['']);
    rows.push(['']);
    rows.push([
      'បានឃើញ និង ឯកភាព', '', '', '', '', '', '',
      KhmerCalendar.getKhmerLunarDateString(dateStr)
    ]);
    rows.push([
      'នាយិកាសាខា', '', '', '', '', '', '',
      KhmerCalendar.getKhmerGregorianDateString(dateStr)
    ]);
    rows.push([
      '', '', '', '', '', '', '',
      'អ្នកត្រួតពិនិត្យ'
    ]);
    rows.push(['']);
    rows.push(['']);
    rows.push([
      schoolInfo.principalName || 'លោកស្រី គង់ វណ្ណារី', '', '', '', '', '', '',
      schoolInfo.inspectorName || 'លោក ស៊ុន សុខជា'
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 22 }, // Teacher Name
      { wch: 14 }, // Class
      { wch: 15 }, // Scan In
      { wch: 20 }, // Attendance
      { wch: 20 }, // Score
      { wch: 22 }, // Telegram
      { wch: 18 }, // Summary
      { wch: 15 }, // Scan Out
      { wch: 16 }, // Remarks
      { wch: 30 }  // Note
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'របាយការណ៍ប្រចាំថ្ងៃ');
    XLSX.writeFile(wb, filename);
  }

  /**
   * Native XML-based Excel Export (No dependencies, 100% styled)
   */
  function exportWithNativeXml(dateStr, records, schoolInfo, filename) {
    const officialDate = KhmerCalendar.getFullOfficialKhmerDate(dateStr);
    const khmerDate = KhmerCalendar.formatKhmerShortDate(dateStr);

    let rowsXml = `
      <Row ss:Height="24">
        <Cell ss:MergeAcross="10" ss:StyleID="titleStyle"><Data ss:Type="String">ព្រះរាជាណាចក្រកម្ពុជា</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="10" ss:StyleID="subTitleStyle"><Data ss:Type="String">ជាតិ សាសនា ព្រះមហាក្សត្រ</Data></Cell>
      </Row>
      <Row ss:Height="12"></Row>
      <Row ss:Height="24">
        <Cell ss:MergeAcross="4" ss:StyleID="schoolHeaderStyle"><Data ss:Type="String">${escapeXml(schoolInfo.nameKh || 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ')}</Data></Cell>
        <Cell ss:MergeAcross="5" ss:StyleID="docTitleStyle"><Data ss:Type="String">របាយការណ៍ត្រួតពិនិត្យរដ្ឋបាលគ្រូប្រចាំថ្ងៃ</Data></Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="4" ss:StyleID="schoolMottoStyle"><Data ss:Type="String">${escapeXml(schoolInfo.mottoKh || 'វិន័យ គុណធម៌ សុភមង្គល')}</Data></Cell>
        <Cell ss:MergeAcross="5" ss:StyleID="docDateStyle"><Data ss:Type="String">កាលបរិច្ឆេទ: ${escapeXml(khmerDate)}</Data></Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="4" ss:StyleID="schoolMottoStyle"><Data ss:Type="String">សាខា: ${escapeXml(schoolInfo.branch || 'សាខាកណ្តាល')}</Data></Cell>
        <Cell ss:MergeAcross="5" ss:StyleID="docDateStyle"><Data ss:Type="String">${escapeXml(officialDate)}</Data></Cell>
      </Row>
      <Row ss:Height="12"></Row>
      <Row ss:Height="26">
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ល.រ</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ឈ្មោះគ្រូ</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ថ្នាក់</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ម៉ោងស្កេនចូល</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ស្រង់វត្តមានសិស្ស</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">វាយតម្លៃពិន្ទុសិស្ស</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ការប្រើប្រាស់ Telegram</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">សម្រង់អត្ថបទ</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ម៉ោងស្កេនចេញ</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ផ្សេងៗ</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">កំណត់សម្គាល់</Data></Cell>
      </Row>
    `;

    records.forEach((r, idx) => {
      const isLeave = r.remarks === 'ច្បាប់';
      const rowStyle = isLeave ? 'tdLeaveStyle' : (idx % 2 === 0 ? 'tdEvenStyle' : 'tdOddStyle');
      const scanIn = isLeave ? '-' : (r.scanInTime || '-');
      const att = isLeave ? '-' : r.attendanceRecorded;
      const score = isLeave ? '-' : r.scoreEvaluated;
      const tg = isLeave ? '-' : r.telegramUsed;
      const summ = isLeave ? '-' : r.lessonSummaryWritten;
      const scanOut = isLeave ? '-' : (r.scanOutTime || '-');

      rowsXml += `
        <Row ss:Height="20">
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="Number">${idx + 1}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Bold"><Data ss:Type="String">${escapeXml(r.teacherName)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(r.classGrade)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(scanIn)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(att)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(score)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(tg)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(summ)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(scanOut)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(r.remarks)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Left"><Data ss:Type="String">${escapeXml(r.note || '')}</Data></Cell>
        </Row>
      `;
    });

    // Signatures
    rowsXml += `
      <Row ss:Height="20"></Row>
      <Row ss:Height="22">
        <Cell ss:MergeAcross="3" ss:StyleID="sigHeaderStyle"><Data ss:Type="String">បានឃើញ និង ឯកភាព</Data></Cell>
        <Cell ss:MergeAcross="2"></Cell>
        <Cell ss:MergeAcross="4" ss:StyleID="sigHeaderStyle"><Data ss:Type="String">${escapeXml(KhmerCalendar.getKhmerLunarDateString(dateStr))}</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="3" ss:StyleID="sigRoleStyle"><Data ss:Type="String">នាយិកាសាខា</Data></Cell>
        <Cell ss:MergeAcross="2"></Cell>
        <Cell ss:MergeAcross="4" ss:StyleID="sigRoleStyle"><Data ss:Type="String">${escapeXml(KhmerCalendar.getKhmerGregorianDateString(dateStr))}</Data></Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="5"></Cell>
        <Cell ss:MergeAcross="4" ss:StyleID="sigRoleStyle"><Data ss:Type="String">អ្នកត្រួតពិនិត្យ</Data></Cell>
      </Row>
      <Row ss:Height="40"></Row>
      <Row ss:Height="22">
        <Cell ss:MergeAcross="3" ss:StyleID="sigNameStyle"><Data ss:Type="String">${escapeXml(schoolInfo.principalName || 'លោកស្រី គង់ វណ្ណារី')}</Data></Cell>
        <Cell ss:MergeAcross="2"></Cell>
        <Cell ss:MergeAcross="4" ss:StyleID="sigNameStyle"><Data ss:Type="String">${escapeXml(schoolInfo.inspectorName || 'លោក ស៊ុន សុខជា')}</Data></Cell>
      </Row>
    `;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:html="http://www.w3.org/TR/REC-html40">
      <Styles>
        <Style ss:ID="Default" ss:Name="Normal">
          <Alignment ss:Vertical="Center"/>
          <Borders/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="11" ss:Color="#000000"/>
          <Interior/>
          <NumberFormat/>
          <Protection/>
        </Style>
        <Style ss:ID="titleStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Moul" ss:Size="13" ss:Color="#1B365D" ss:Bold="1"/>
        </Style>
        <Style ss:ID="subTitleStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Moul" ss:Size="11" ss:Color="#8B0000" ss:Bold="1"/>
        </Style>
        <Style ss:ID="schoolHeaderStyle">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Font ss:FontName="Moul" ss:Size="12" ss:Color="#1B365D" ss:Bold="1"/>
        </Style>
        <Style ss:ID="schoolMottoStyle">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Color="#555555" ss:Italic="1"/>
        </Style>
        <Style ss:ID="docTitleStyle">
          <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
          <Font ss:FontName="Moul" ss:Size="12" ss:Color="#1B365D" ss:Bold="1"/>
        </Style>
        <Style ss:ID="docDateStyle">
          <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Color="#333333"/>
        </Style>
        <Style ss:ID="thStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0A2540"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0A2540"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0A2540"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0A2540"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
          <Interior ss:Color="#1B365D" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdEvenStyleCenter">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10"/>
          <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdEvenStyleBold">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Bold="1" ss:Color="#1B365D"/>
          <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdEvenStyleLeft">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="9"/>
          <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdOddStyleCenter">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10"/>
          <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdOddStyleBold">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Bold="1" ss:Color="#1B365D"/>
          <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdOddStyleLeft">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="9"/>
          <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdLeaveStyleCenter">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Color="#777777"/>
          <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdLeaveStyleBold">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Bold="1" ss:Color="#555555"/>
          <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdLeaveStyleLeft">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CCCCCC"/>
          </Borders>
          <Font ss:FontName="Kantumruy Pro" ss:Size="9" ss:Color="#777777"/>
          <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="sigHeaderStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="11" ss:Bold="1"/>
        </Style>
        <Style ss:ID="sigRoleStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10"/>
        </Style>
        <Style ss:ID="sigNameStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="11" ss:Bold="1" ss:Color="#1B365D"/>
        </Style>
      </Styles>
      <Worksheet ss:Name="របាយការណ៍ប្រចាំថ្ងៃ">
        <Table ss:ExpandedColumnCount="11" x:FullColumns="1" x:FullRows="1">
          <Column ss:Width="35"/>
          <Column ss:Width="130"/>
          <Column ss:Width="80"/>
          <Column ss:Width="80"/>
          <Column ss:Width="105"/>
          <Column ss:Width="105"/>
          <Column ss:Width="115"/>
          <Column ss:Width="95"/>
          <Column ss:Width="80"/>
          <Column ss:Width="80"/>
          <Column ss:Width="160"/>
          ${rowsXml}
        </Table>
      </Worksheet>
    </Workbook>`;

    downloadBlob(xml, filename, 'application/vnd.ms-excel;charset=utf-8');
  }

  /**
   * Export Monthly Aggregated Summary to Excel
   */
  function exportMonthlyToExcel(monthStats, schoolInfo) {
    const filename = `របាយការណ៍សង្ខេបប្រចាំខែ_${monthStats.monthStr}.xls`;
    let rowsXml = `
      <Row ss:Height="24">
        <Cell ss:MergeAcross="9" ss:StyleID="titleStyle"><Data ss:Type="String">ព្រះរាជាណាចក្រកម្ពុជា</Data></Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="9" ss:StyleID="subTitleStyle"><Data ss:Type="String">ជាតិ សាសនា ព្រះមហាក្សត្រ</Data></Cell>
      </Row>
      <Row ss:Height="12"></Row>
      <Row ss:Height="24">
        <Cell ss:MergeAcross="4" ss:StyleID="schoolHeaderStyle"><Data ss:Type="String">${escapeXml(schoolInfo.nameKh || 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ')}</Data></Cell>
        <Cell ss:MergeAcross="4" ss:StyleID="docTitleStyle"><Data ss:Type="String">របាយការណ៍សង្ខេបវាយតម្លៃរដ្ឋបាលគ្រូប្រចាំខែ</Data></Cell>
      </Row>
      <Row ss:Height="18">
        <Cell ss:MergeAcross="4" ss:StyleID="schoolMottoStyle"><Data ss:Type="String">សាខា: ${escapeXml(schoolInfo.branch || 'សាខាកណ្តាល')}</Data></Cell>
        <Cell ss:MergeAcross="4" ss:StyleID="docDateStyle"><Data ss:Type="String">ប្រចាំខែ: ${escapeXml(monthStats.monthStr)} (សរុប ${monthStats.totalDatesTracked} ថ្ងៃ)</Data></Cell>
      </Row>
      <Row ss:Height="12"></Row>
      <Row ss:Height="26">
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ល.រ</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ឈ្មោះគ្រូ</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">កម្រិត/មុខវិជ្ជា</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ថ្ងៃបង្រៀនសរុប</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">វត្តមាន</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">សុំច្បាប់</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">មកយឺត</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">បំពេញគ្រប់</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">អត្រាអនុវត្ត (%)</Data></Cell>
        <Cell ss:StyleID="thStyle"><Data ss:Type="String">ចំណាត់ថ្នាក់</Data></Cell>
      </Row>
    `;

    monthStats.teacherStats.forEach((t, idx) => {
      const rowStyle = idx % 2 === 0 ? 'tdEvenStyle' : 'tdOddStyle';
      rowsXml += `
        <Row ss:Height="20">
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="Number">${idx + 1}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Bold"><Data ss:Type="String">${escapeXml(t.teacherName)}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Left"><Data ss:Type="String">${escapeXml(t.level + (t.subject ? ' - ' + t.subject : ''))}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="Number">${t.daysScheduled}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="Number">${t.daysPresent}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="Number">${t.daysLeave}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="Number">${t.daysLate}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="Number">${t.fullyCompletedDays}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="Number">${t.complianceRate}</Data></Cell>
          <Cell ss:StyleID="${rowStyle}Center"><Data ss:Type="String">${escapeXml(t.gradeLabel)}</Data></Cell>
        </Row>
      `;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <?mso-application progid="Excel.Sheet"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:html="http://www.w3.org/TR/REC-html40">
      <Styles>
        <Style ss:ID="Default" ss:Name="Normal">
          <Alignment ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="11"/>
        </Style>
        <Style ss:ID="titleStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Moul" ss:Size="13" ss:Color="#1B365D" ss:Bold="1"/>
        </Style>
        <Style ss:ID="subTitleStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Moul" ss:Size="11" ss:Color="#8B0000" ss:Bold="1"/>
        </Style>
        <Style ss:ID="schoolHeaderStyle">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Font ss:FontName="Moul" ss:Size="12" ss:Color="#1B365D" ss:Bold="1"/>
        </Style>
        <Style ss:ID="schoolMottoStyle">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Color="#555555" ss:Italic="1"/>
        </Style>
        <Style ss:ID="docTitleStyle">
          <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
          <Font ss:FontName="Moul" ss:Size="12" ss:Color="#1B365D" ss:Bold="1"/>
        </Style>
        <Style ss:ID="docDateStyle">
          <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Color="#333333"/>
        </Style>
        <Style ss:ID="thStyle">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Color="#FFFFFF" ss:Bold="1"/>
          <Interior ss:Color="#1B365D" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdEvenStyleCenter">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10"/>
        </Style>
        <Style ss:ID="tdEvenStyleBold">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Bold="1" ss:Color="#1B365D"/>
        </Style>
        <Style ss:ID="tdEvenStyleLeft">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10"/>
        </Style>
        <Style ss:ID="tdOddStyleCenter">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10"/>
          <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdOddStyleBold">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10" ss:Bold="1" ss:Color="#1B365D"/>
          <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="tdOddStyleLeft">
          <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
          <Font ss:FontName="Kantumruy Pro" ss:Size="10"/>
          <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
        </Style>
      </Styles>
      <Worksheet ss:Name="របាយការណ៍សង្ខេបប្រចាំខែ">
        <Table ss:ExpandedColumnCount="10" x:FullColumns="1" x:FullRows="1">
          <Column ss:Width="35"/>
          <Column ss:Width="140"/>
          <Column ss:Width="160"/>
          <Column ss:Width="90"/>
          <Column ss:Width="70"/>
          <Column ss:Width="70"/>
          <Column ss:Width="70"/>
          <Column ss:Width="90"/>
          <Column ss:Width="100"/>
          <Column ss:Width="95"/>
          ${rowsXml}
        </Table>
      </Worksheet>
    </Workbook>`;

    downloadBlob(xml, filename, 'application/vnd.ms-excel;charset=utf-8');
  }

  function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 150);
  }

  return {
    exportDailyToExcel,
    exportMonthlyToExcel
  };
})();

// Export for module/global usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PSIS_XlsxExport;
}
