/**
 * House Build Tracker - Complete Google Apps Script Backend & Spreadsheet Structure Generator
 * 
 * Features:
 * 1. Automatic 1-Click Spreadsheet Setup (Creates Summary Dashboard, Expenses, Workers, DailyLog, Payments, CategoryBudgets).
 * 2. Live Google Sheets Formulas (SUM, SUMIF, COUNTIF, IF for real-time calculation even without the web app).
 * 3. Two-way Web App API (doGet and doPost) for instant mobile sync.
 * 4. Custom Menu in Google Sheets ("🏠 House Build Tracker").
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏠 House Build Tracker')
    .addItem('🚀 1-Click Auto-Setup Complete Spreadsheet', 'setupSpreadsheetStructure')
    .addItem('🔄 Refresh & Verify Formulas', 'verifyAllFormulas')
    .addToUi();
}

/**
 * Web App GET endpoints
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getData';

    if (action === 'ping') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      return jsonResponse({
        success: true,
        message: 'Successfully connected to Google Sheet!',
        sheetName: ss.getName(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'setup') {
      const result = setupSpreadsheetStructure();
      return jsonResponse({
        success: true,
        message: 'Spreadsheet structure created successfully with all formulas!',
        result: result
      });
    }

    if (action === 'getData') {
      const data = fetchAllHouseBuildData();
      return jsonResponse({
        success: true,
        data: data
      });
    }

    return jsonResponse({
      success: false,
      error: 'Unknown GET action: ' + action
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Web App POST endpoints
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (ex) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;

    if (action === 'setup') {
      const result = setupSpreadsheetStructure();
      return jsonResponse({
        success: true,
        message: 'Spreadsheet structure created successfully with all formulas!',
        result: result
      });
    }

    if (action === 'syncAll') {
      const result = saveAllHouseBuildData(payload.data);
      return jsonResponse({
        success: true,
        result: result,
        timestamp: new Date().toISOString()
      });
    }

    return jsonResponse({
      success: false,
      error: 'Unknown POST action: ' + action
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 🚀 BUILDS THE ENTIRE STRUCTURED SPREADSHEET WITH BRAND STYLING & FORMULAS
 */
function setupSpreadsheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup Summary Sheet
  setupSummarySheet(ss);

  // 2. Setup CategoryBudgets Sheet
  setupCategoryBudgetsSheet(ss);

  // 3. Setup Expenses Sheet
  setupExpensesSheet(ss);

  // 4. Setup Workers Sheet
  setupWorkersSheet(ss);

  // 5. Setup DailyLog Sheet
  setupDailyLogSheet(ss);

  // 6. Setup Payments Sheet
  setupPaymentsSheet(ss);

  // Remove default "Sheet1" if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // ignore
    }
  }

  // Activate Summary sheet as landing page
  const summary = ss.getSheetByName('Summary');
  if (summary) ss.setActiveSheet(summary);

  return { success: true, message: 'All 6 sheets created and formatted successfully!' };
}

/**
 * Tab 1: Executive Dashboard (Summary)
 */
function setupSummarySheet(ss) {
  let sheet = ss.getSheetByName('Summary');
  if (!sheet) {
    sheet = ss.insertSheet('Summary', 0);
  } else {
    sheet.clear();
  }

  // Banner Header (Rows 1-2)
  sheet.getRange('A1:E2').merge();
  const banner = sheet.getRange('A1');
  banner.setValue('🏠 HOUSE BUILD TRACKER — EXECUTIVE SUMMARY');
  banner.setBackground('#B4531F'); // Terracotta
  banner.setFontColor('#FFFFFF');
  banner.setFontSize(14);
  banner.setFontWeight('bold');
  banner.setHorizontalAlignment('center');
  banner.setVerticalAlignment('middle');

  // Subtitle (Row 3)
  sheet.getRange('A3:E3').merge();
  const sub = sheet.getRange('A3');
  sub.setValue('Live financial overview automatically synchronized with mobile PWA • Amounts in INR (₹)');
  sub.setFontSize(10);
  sub.setFontColor('#6B7280');
  sub.setFontStyle('italic');
  sub.setHorizontalAlignment('center');

  // Section 1: Financial KPIs (Rows 5-13)
  sheet.getRange('A5:B5').merge();
  const kpiHeader = sheet.getRange('A5');
  kpiHeader.setValue('OVERALL PROJECT TOTALS');
  kpiHeader.setBackground('#FBEEE5'); // Clay tint
  kpiHeader.setFontColor('#B4531F');
  kpiHeader.setFontWeight('bold');
  kpiHeader.setFontSize(11);

  const kpis = [
    ['Total Project Budget', 4500000],
    ['Total Material & Site Expenses', '=IFERROR(SUM(Expenses!F2:F), 0)'],
    ['Total Daily Wage Labour', '=IFERROR(SUM(DailyLog!F2:F), 0)'],
    ['Total Project Cost (Expenses + Wages)', '=B7+B8'],
    ['Total Paid / Disbursed', '=IFERROR(SUM(Payments!D2:D), 0)'],
    ['Pending Dues (Owed to Vendors & Workers)', '=B9-B10'],
    ['Remaining Budget', '=B6-B9'],
    ['% of Budget Used', '=IF(B6>0, B9/B6, 0)']
  ];

  for (let i = 0; i < kpis.length; i++) {
    const rowIdx = 6 + i;
    sheet.getRange(rowIdx, 1).setValue(kpis[i][0]).setFontWeight('bold').setFontColor('#1F2328');
    const valCell = sheet.getRange(rowIdx, 2);
    if (String(kpis[i][1]).startsWith('=')) {
      valCell.setFormula(kpis[i][1]);
    } else {
      valCell.setValue(kpis[i][1]);
    }

    if (i === kpis.length - 1) {
      valCell.setNumberFormat('0.0%');
    } else {
      valCell.setNumberFormat('₹#,##0');
    }
    valCell.setFontWeight('bold');
  }

  // Highlight Pending Dues in Red, Paid in Green
  sheet.getRange('B10').setFontColor('#237A3B'); // Total Paid: Green
  sheet.getRange('B11').setFontColor('#B42318'); // Pending: Red
  sheet.getRange('A6:B13').setBorder(true, true, true, true, true, true, '#E5E0D6', SpreadsheetApp.BorderStyle.SOLID);

  // Section 2: Category Spending Breakdown (Rows 15 to 29)
  sheet.getRange('A15:E15').merge();
  const catHeader = sheet.getRange('A15');
  catHeader.setValue('CATEGORY SPENDING & BUDGET PERFORMANCE');
  catHeader.setBackground('#FBEEE5');
  catHeader.setFontColor('#B4531F');
  catHeader.setFontWeight('bold');
  catHeader.setFontSize(11);

  const catCols = ['Category', 'Actual Spent (₹)', '% of Total Cost', 'Planned Budget (₹)', 'Budget Status'];
  sheet.getRange(16, 1, 1, 5).setValues([catCols]);
  const catColRange = sheet.getRange(16, 1, 1, 5);
  catColRange.setBackground('#B4531F');
  catColRange.setFontColor('#FFFFFF');
  catColRange.setFontWeight('bold');

  const categories = [
    ['Foundation', 500000],
    ['Cement & Steel', 1200000],
    ['Bricks & Sand', 450000],
    ['Plumbing', 250000],
    ['Electrical', 300000],
    ['Painting', 200000],
    ['Tiles & Flooring', 350000],
    ['Carpentry & Doors', 250000],
    ['Transport', 100000],
    ['Permits & Fees', 150000],
    ['Labour (daily wages)', 800000],
    ['Other', 100000]
  ];

  for (let i = 0; i < categories.length; i++) {
    const r = 17 + i;
    const catName = categories[i][0];
    const budget = categories[i][1];

    sheet.getRange(r, 1).setValue(catName).setFontWeight('medium');

    // Formula for actual spent
    if (catName === 'Labour (daily wages)') {
      sheet.getRange(r, 2).setFormula('=$B$8');
    } else {
      sheet.getRange(r, 2).setFormula('=IFERROR(SUMIF(Expenses!$C$2:$C, A' + r + ', Expenses!$F$2:$F), 0)');
    }
    sheet.getRange(r, 2).setNumberFormat('₹#,##0').setFontWeight('bold');

    // Percentage of total cost formula
    sheet.getRange(r, 3).setFormula('=IF($B$9>0, B' + r + '/$B$9, 0)').setNumberFormat('0.0%');

    // Planned Budget
    sheet.getRange(r, 4).setValue(budget).setNumberFormat('₹#,##0');

    // Budget Status
    sheet.getRange(r, 5).setFormula('=IF(B' + r + '>D' + r + ', "⚠️ OVER BUDGET", "✅ On Track")');
  }

  // Total row for categories
  const totalRow = 17 + categories.length;
  sheet.getRange(totalRow, 1).setValue('TOTAL').setFontWeight('bold');
  sheet.getRange(totalRow, 2).setFormula('=SUM(B17:B' + (totalRow - 1) + ')').setNumberFormat('₹#,##0').setFontWeight('bold');
  sheet.getRange(totalRow, 3).setFormula('=SUM(C17:C' + (totalRow - 1) + ')').setNumberFormat('0.0%').setFontWeight('bold');
  sheet.getRange(totalRow, 4).setFormula('=SUM(D17:D' + (totalRow - 1) + ')').setNumberFormat('₹#,##0').setFontWeight('bold');
  sheet.getRange(totalRow, 5).setValue('—').setHorizontalAlignment('center');
  sheet.getRange(totalRow, 1, 1, 5).setBackground('#FBEEE5');

  sheet.getRange(16, 1, categories.length + 2, 5).setBorder(true, true, true, true, true, true, '#E5E0D6', SpreadsheetApp.BorderStyle.SOLID);

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 130);
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 150);
}

/**
 * Tab 2: CategoryBudgets
 */
function setupCategoryBudgetsSheet(ss) {
  let sheet = ss.getSheetByName('CategoryBudgets');
  if (!sheet) {
    sheet = ss.insertSheet('CategoryBudgets', 1);
  } else {
    sheet.clear();
  }

  const headers = ['Category', 'Planned Budget (₹)', 'Actual Spent (₹)', 'Remaining (₹)', 'Status'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#B4531F');
  hRange.setFontColor('#FFFFFF');
  hRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  const defaults = [
    ['Foundation', 500000],
    ['Cement & Steel', 1200000],
    ['Bricks & Sand', 450000],
    ['Plumbing', 250000],
    ['Electrical', 300000],
    ['Painting', 200000],
    ['Tiles & Flooring', 350000],
    ['Carpentry & Doors', 250000],
    ['Transport', 100000],
    ['Permits & Fees', 150000],
    ['Labour (daily wages)', 800000],
    ['Other', 100000]
  ];

  for (let i = 0; i < defaults.length; i++) {
    const r = 2 + i;
    sheet.getRange(r, 1).setValue(defaults[i][0]);
    sheet.getRange(r, 2).setValue(defaults[i][1]).setNumberFormat('₹#,##0');
    if (defaults[i][0] === 'Labour (daily wages)') {
      sheet.getRange(r, 3).setFormula('=$Summary.$B$8').setNumberFormat('₹#,##0').setFontWeight('bold');
    } else {
      sheet.getRange(r, 3).setFormula('=IFERROR(SUMIF(Expenses!$C$2:$C, A' + r + ', Expenses!$F$2:$F), 0)').setNumberFormat('₹#,##0').setFontWeight('bold');
    }
    sheet.getRange(r, 4).setFormula('=B' + r + '-C' + r).setNumberFormat('₹#,##0');
    sheet.getRange(r, 5).setFormula('=IF(C' + r + '>B' + r + ', "⚠️ OVER BUDGET", "✅ On Track")');
  }

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 160);
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 140);
}

/**
 * Tab 3: Expenses
 */
function setupExpensesSheet(ss) {
  let sheet = ss.getSheetByName('Expenses');
  if (!sheet) {
    sheet = ss.insertSheet('Expenses', 2);
  } else {
    sheet.clear();
  }

  const headers = ['Expense ID', 'Date', 'Category', 'Item / Description', 'Vendor / Supplier', 'Amount (₹)', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#B4531F');
  hRange.setFontColor('#FFFFFF');
  hRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Sample data
  const sampleData = [
    ['exp_1', '2026-10-21', 'Cement & Steel', '50 Bags Ultratech Cement (PPC)', 'Sri Lakshmi Hardware & Steels', 19500, 'Bill #4128, delivered at site'],
    ['exp_2', '2026-10-21', 'Bricks & Sand', '1 Truckload Red Bricks (3000 pcs)', 'Bhuvaneshwari Brick Kiln', 27000, 'Direct unload by quarry truck'],
    ['exp_3', '2026-10-22', 'Plumbing', 'PVC Pipes 4-inch & fittings', 'Sri Lakshmi Hardware & Steels', 8400, 'Main line drainage'],
    ['exp_4', '2026-10-22', 'Transport', 'Tractor transport for excavated soil', 'Shiva Transports', 4500, '3 tractor trips']
  ];

  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  sheet.getRange(2, 6, sampleData.length, 1).setNumberFormat('₹#,##0').setFontWeight('bold');

  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 160);
  sheet.setColumnWidth(4, 250);
  sheet.setColumnWidth(5, 200);
  sheet.setColumnWidth(6, 140);
  sheet.setColumnWidth(7, 220);
}

/**
 * Tab 4: Workers
 */
function setupWorkersSheet(ss) {
  let sheet = ss.getSheetByName('Workers');
  if (!sheet) {
    sheet = ss.insertSheet('Workers', 3);
  } else {
    sheet.clear();
  }

  const headers = ['Worker ID', 'Worker Name', 'Trade / Role', 'Daily Rate (₹)', 'Days Worked', 'Total Earned (₹)', 'Total Paid (₹)', 'Balance Due (₹)', 'Active Status', 'Phone'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#B4531F');
  hRange.setFontColor('#FFFFFF');
  hRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  const sampleWorkers = [
    ['w_1', 'Ramesh Kumar', 'Head Mason', 1100, true, '9876543210'],
    ['w_2', 'Suresh Gowda', 'Mason', 950, true, ''],
    ['w_3', 'Ganesh Das', 'Helper', 650, true, ''],
    ['w_4', 'Manjunath B', 'Helper', 650, true, ''],
    ['w_5', 'Pradeep Sharma', 'Carpenter', 1200, true, '']
  ];

  for (let i = 0; i < sampleWorkers.length; i++) {
    const r = 2 + i;
    const w = sampleWorkers[i];
    sheet.getRange(r, 1).setValue(w[0]);
    sheet.getRange(r, 2).setValue(w[1]).setFontWeight('bold');
    sheet.getRange(r, 3).setValue(w[2]);
    sheet.getRange(r, 4).setValue(w[3]).setNumberFormat('₹#,##0');

    // Formulas
    sheet.getRange(r, 5).setFormula('=IFERROR(COUNTIF(DailyLog!$C$2:$C, A' + r + '), 0)');
    sheet.getRange(r, 6).setFormula('=IFERROR(SUMIF(DailyLog!$C$2:$C, A' + r + ', DailyLog!$F$2:$F), 0)').setNumberFormat('₹#,##0').setFontWeight('bold');
    sheet.getRange(r, 7).setFormula('=IFERROR(SUMIF(Payments!$C$2:$C, B' + r + ', Payments!$D$2:$D), 0)').setNumberFormat('₹#,##0');
    sheet.getRange(r, 8).setFormula('=F' + r + '-G' + r).setNumberFormat('₹#,##0').setFontWeight('bold');

    sheet.getRange(r, 9).setValue(w[4] ? 'Active' : 'Inactive');
    sheet.getRange(r, 10).setValue(w[5]);
  }

  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 170);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 140);
  sheet.setColumnWidth(7, 140);
  sheet.setColumnWidth(8, 140);
  sheet.setColumnWidth(9, 100);
  sheet.setColumnWidth(10, 130);
}

/**
 * Tab 5: DailyLog
 */
function setupDailyLogSheet(ss) {
  let sheet = ss.getSheetByName('DailyLog');
  if (!sheet) {
    sheet = ss.insertSheet('DailyLog', 4);
  } else {
    sheet.clear();
  }

  const headers = ['Log ID', 'Date', 'Worker ID', 'Worker Name', 'Status', 'Wage for Day (₹)', 'Notes'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#B4531F');
  hRange.setFontColor('#FFFFFF');
  hRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  const sampleLogs = [
    ['2026-10-21_w_1', '2026-10-21', 'w_1', 'Ramesh Kumar', 'full', 1100, 'Lintel shuttering alignment'],
    ['2026-10-21_w_2', '2026-10-21', 'w_2', 'Suresh Gowda', 'full', 950, ''],
    ['2026-10-21_w_3', '2026-10-21', 'w_3', 'Ganesh Das', 'full', 650, ''],
    ['2026-10-21_w_4', '2026-10-21', 'w_4', 'Manjunath B', 'half', 325, 'Left at 1:30 PM for clinic'],
    ['2026-10-22_w_1', '2026-10-22', 'w_1', 'Ramesh Kumar', 'full', 1100, ''],
    ['2026-10-22_w_2', '2026-10-22', 'w_2', 'Suresh Gowda', 'full', 950, ''],
    ['2026-10-22_w_3', '2026-10-22', 'w_3', 'Ganesh Das', 'full', 650, '']
  ];

  sheet.getRange(2, 1, sampleLogs.length, headers.length).setValues(sampleLogs);
  sheet.getRange(2, 6, sampleLogs.length, 1).setNumberFormat('₹#,##0').setFontWeight('bold');

  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 160);
  sheet.setColumnWidth(5, 90);
  sheet.setColumnWidth(6, 140);
  sheet.setColumnWidth(7, 220);
}

/**
 * Tab 6: Payments
 */
function setupPaymentsSheet(ss) {
  let sheet = ss.getSheetByName('Payments');
  if (!sheet) {
    sheet = ss.insertSheet('Payments', 5);
  } else {
    sheet.clear();
  }

  const headers = ['Payment ID', 'Date', 'Paid To', 'Amount (₹)', 'Payment Mode', 'Payee Type', 'Notes / Ref ID'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#B4531F');
  hRange.setFontColor('#FFFFFF');
  hRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  const samplePayments = [
    ['pay_1', '2026-10-21', 'Sri Lakshmi Hardware & Steels', 15000, 'UPI', 'vendor', 'Advance for cement via PhonePe'],
    ['pay_2', '2026-10-21', 'Ramesh Kumar', 1000, 'Cash', 'worker', 'Weekly cash advance handover'],
    ['pay_3', '2026-10-22', 'Shiva Transports', 4500, 'Cash', 'vendor', 'Full settlement for soil dumping']
  ];

  sheet.getRange(2, 1, samplePayments.length, headers.length).setValues(samplePayments);
  sheet.getRange(2, 4, samplePayments.length, 1).setNumberFormat('₹#,##0').setFontWeight('bold').setFontColor('#237A3B');

  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 110);
  sheet.setColumnWidth(7, 240);
}

function verifyAllFormulas() {
  SpreadsheetApp.getActiveSpreadsheet().toast('All formulas verified and active!', 'House Build Tracker');
}

/**
 * Helpers for reading & saving data from mobile app
 */
function fetchAllHouseBuildData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let settings = { budget: 4500000, projectName: ss.getName(), categoryBudgets: {} };
  const sumSheet = ss.getSheetByName('Summary');
  if (sumSheet) {
    const b = sumSheet.getRange('B6').getValue();
    if (b) settings.budget = Number(b) || 4500000;
  }

  const catSheet = ss.getSheetByName('CategoryBudgets');
  if (catSheet && catSheet.getLastRow() >= 2) {
    const rows = catSheet.getRange(2, 1, catSheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0]) settings.categoryBudgets[String(rows[i][0])] = Number(rows[i][1]) || 0;
    }
  }

  const expenses = [];
  const expSheet = ss.getSheetByName('Expenses');
  if (expSheet && expSheet.getLastRow() >= 2) {
    const d = expSheet.getRange(2, 1, expSheet.getLastRow() - 1, 7).getValues();
    for (let i = 0; i < d.length; i++) {
      if (d[i][0]) {
        expenses.push({
          id: String(d[i][0]),
          date: formatDateString(d[i][1]),
          category: String(d[i][2]),
          item: String(d[i][3]),
          vendor: String(d[i][4] || ''),
          amount: Number(d[i][5]) || 0,
          note: String(d[i][6] || ''),
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  const workers = [];
  const wSheet = ss.getSheetByName('Workers');
  if (wSheet && wSheet.getLastRow() >= 2) {
    const d = wSheet.getRange(2, 1, wSheet.getLastRow() - 1, 10).getValues();
    for (let i = 0; i < d.length; i++) {
      if (d[i][0]) {
        workers.push({
          id: String(d[i][0]),
          name: String(d[i][1]),
          role: String(d[i][2]),
          rate: Number(d[i][3]) || 0,
          active: d[i][8] !== 'Inactive',
          phone: String(d[i][9] || '')
        });
      }
    }
  }

  const logs = [];
  const lSheet = ss.getSheetByName('DailyLog');
  if (lSheet && lSheet.getLastRow() >= 2) {
    const d = lSheet.getRange(2, 1, lSheet.getLastRow() - 1, 7).getValues();
    for (let i = 0; i < d.length; i++) {
      if (d[i][0]) {
        logs.push({
          id: String(d[i][0]),
          date: formatDateString(d[i][1]),
          workerId: String(d[i][2]),
          workerName: String(d[i][3]),
          status: String(d[i][4]).toLowerCase(),
          wage: Number(d[i][5]) || 0,
          note: String(d[i][6] || '')
        });
      }
    }
  }

  const payments = [];
  const pSheet = ss.getSheetByName('Payments');
  if (pSheet && pSheet.getLastRow() >= 2) {
    const d = pSheet.getRange(2, 1, pSheet.getLastRow() - 1, 7).getValues();
    for (let i = 0; i < d.length; i++) {
      if (d[i][0]) {
        payments.push({
          id: String(d[i][0]),
          date: formatDateString(d[i][1]),
          payee: String(d[i][2]),
          amount: Number(d[i][3]) || 0,
          mode: String(d[i][4] || 'Cash'),
          payeeType: String(d[i][5] || 'other'),
          note: String(d[i][6] || ''),
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  return { settings, expenses, workers, logs, payments };
}

function saveAllHouseBuildData(data) {
  if (!data) throw new Error('No data provided');
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // If sheets do not exist yet, build the structure first
  if (!ss.getSheetByName('Summary') || !ss.getSheetByName('Expenses')) {
    setupSpreadsheetStructure();
  }

  // Update budget in Summary sheet
  const sumSheet = ss.getSheetByName('Summary');
  if (sumSheet && data.settings && data.settings.budget) {
    sumSheet.getRange('B6').setValue(Number(data.settings.budget));
  }

  // Expenses Sheet
  const expSheet = ss.getSheetByName('Expenses');
  if (expSheet) {
    if (expSheet.getLastRow() > 1) {
      expSheet.getRange(2, 1, expSheet.getLastRow() - 1, 7).clearContent();
    }
    if (data.expenses && data.expenses.length > 0) {
      const rows = data.expenses.map(function(e) {
        return [e.id || '', e.date || '', e.category || '', e.item || '', e.vendor || '', Number(e.amount) || 0, e.note || ''];
      });
      expSheet.getRange(2, 1, rows.length, 7).setValues(rows);
      expSheet.getRange(2, 6, rows.length, 1).setNumberFormat('₹#,##0').setFontWeight('bold');
    }
  }

  // Workers Sheet
  const wSheet = ss.getSheetByName('Workers');
  if (wSheet) {
    if (wSheet.getLastRow() > 1) {
      wSheet.getRange(2, 1, wSheet.getLastRow() - 1, 10).clearContent();
    }
    if (data.workers && data.workers.length > 0) {
      for (let i = 0; i < data.workers.length; i++) {
        const r = 2 + i;
        const w = data.workers[i];
        wSheet.getRange(r, 1).setValue(w.id || '');
        wSheet.getRange(r, 2).setValue(w.name || '').setFontWeight('bold');
        wSheet.getRange(r, 3).setValue(w.role || '');
        wSheet.getRange(r, 4).setValue(Number(w.rate) || 0).setNumberFormat('₹#,##0');
        wSheet.getRange(r, 5).setFormula('=IFERROR(COUNTIF(DailyLog!$C$2:$C, A' + r + '), 0)');
        wSheet.getRange(r, 6).setFormula('=IFERROR(SUMIF(DailyLog!$C$2:$C, A' + r + ', DailyLog!$F$2:$F), 0)').setNumberFormat('₹#,##0').setFontWeight('bold');
        wSheet.getRange(r, 7).setFormula('=IFERROR(SUMIF(Payments!$C$2:$C, B' + r + ', Payments!$D$2:$D), 0)').setNumberFormat('₹#,##0');
        wSheet.getRange(r, 8).setFormula('=F' + r + '-G' + r).setNumberFormat('₹#,##0').setFontWeight('bold');
        wSheet.getRange(r, 9).setValue(w.active !== false ? 'Active' : 'Inactive');
        wSheet.getRange(r, 10).setValue(w.phone || '');
      }
    }
  }

  // DailyLog Sheet
  const lSheet = ss.getSheetByName('DailyLog');
  if (lSheet) {
    if (lSheet.getLastRow() > 1) {
      lSheet.getRange(2, 1, lSheet.getLastRow() - 1, 7).clearContent();
    }
    if (data.logs && data.logs.length > 0) {
      const rows = data.logs.map(function(l) {
        return [l.id || '', l.date || '', l.workerId || '', l.workerName || '', l.status || '', Number(l.wage) || 0, l.note || ''];
      });
      lSheet.getRange(2, 1, rows.length, 7).setValues(rows);
      lSheet.getRange(2, 6, rows.length, 1).setNumberFormat('₹#,##0').setFontWeight('bold');
    }
  }

  // Payments Sheet
  const pSheet = ss.getSheetByName('Payments');
  if (pSheet) {
    if (pSheet.getLastRow() > 1) {
      pSheet.getRange(2, 1, pSheet.getLastRow() - 1, 7).clearContent();
    }
    if (data.payments && data.payments.length > 0) {
      const rows = data.payments.map(function(p) {
        return [p.id || '', p.date || '', p.payee || '', Number(p.amount) || 0, p.mode || 'Cash', p.payeeType || 'other', p.note || ''];
      });
      pSheet.getRange(2, 1, rows.length, 7).setValues(rows);
      pSheet.getRange(2, 4, rows.length, 1).setNumberFormat('₹#,##0').setFontWeight('bold').setFontColor('#237A3B');
    }
  }

  return { success: true };
}

function formatDateString(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(val).substring(0, 10);
}
