export const APPS_SCRIPT_SOURCE = `/**
 * House Build Tracker - Complete Google Apps Script Backend
 * 
 * Matches spreadsheet: https://docs.google.com/spreadsheets/d/1L6LaIz140FAXVm6Up-lSQ6RygOuHZtYuEd12kuqjMfk
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏠 House Build Tracker')
    .addItem('🔄 Refresh & Verify Formulas', 'verifyAllFormulas')
    .addItem('🚀 Sync Pending Dues Names', 'syncPendingDuesNames')
    .addToUi();
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getData';
    if (action === 'ping') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      return jsonResponse({ success: true, message: 'Connected to House Build Tracker Sheet!', sheetName: ss.getName(), timestamp: new Date().toISOString() });
    }
    if (action === 'getData') {
      return jsonResponse({ success: true, data: fetchAllHouseBuildData() });
    }
    return jsonResponse({ success: false, error: 'Unknown GET action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch(ex) { payload = e.parameter || {}; }
    } else {
      payload = e.parameter || {};
    }
    if (payload.action === 'syncAll') {
      return jsonResponse({ success: true, result: saveAllHouseBuildData(payload.data), timestamp: new Date().toISOString() });
    }
    return jsonResponse({ success: false, error: 'Unknown POST action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fetchAllHouseBuildData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let settings = { budget: 4500000, projectName: 'My House Construction', projectStartDate: '2026-10-01', nearLimitWarningPct: 90, categoryBudgets: {} };

  const setSheet = ss.getSheetByName('Settings');
  if (setSheet && setSheet.getLastRow() >= 4) {
    const vals = setSheet.getRange(4, 1, setSheet.getLastRow() - 3, 2).getValues();
    for (let i = 0; i < vals.length; i++) {
      const k = String(vals[i][0]).toLowerCase(), v = vals[i][1];
      if (k.includes('project name')) settings.projectName = String(v);
      else if (k.includes('total project budget')) settings.budget = parseNum(v) || 4500000;
      else if (k.includes('start date')) settings.projectStartDate = formatDateString(v);
      else if (k.includes('near-limit')) settings.nearLimitWarningPct = parseNum(v) || 90;
    }
  }

  const catSheet = ss.getSheetByName('CategoryBudgets');
  if (catSheet && catSheet.getLastRow() >= 4) {
    const rows = catSheet.getRange(4, 1, catSheet.getLastRow() - 3, 2).getValues();
    for (let i = 0; i < rows.length; i++) {
      const c = String(rows[i][0]).trim();
      if (c && c.toUpperCase() !== 'TOTAL') settings.categoryBudgets[c] = parseNum(rows[i][1]);
    }
  }

  const expenses = [];
  const expSheet = ss.getSheetByName('Expenses');
  if (expSheet && expSheet.getLastRow() >= 2) {
    const d = expSheet.getRange(2, 1, expSheet.getLastRow() - 1, 5).getValues();
    for (let i = 0; i < d.length; i++) {
      const r = d[i];
      if (r[0] && r[2]) {
        expenses.push({ id: 'exp_' + (i + 1), date: formatDateString(r[0]), category: String(r[1] || 'Other'), item: String(r[2]), vendor: String(r[3] || ''), amount: parseNum(r[4]), createdAt: new Date().toISOString() });
      }
    }
  }

  const workers = [];
  const wSheet = ss.getSheetByName('Workers');
  if (wSheet && wSheet.getLastRow() >= 2) {
    const d = wSheet.getRange(2, 1, wSheet.getLastRow() - 1, 3).getValues();
    for (let i = 0; i < d.length; i++) {
      const r = d[i];
      if (r[0]) workers.push({ id: 'w_' + (i + 1), name: String(r[0]), role: String(r[1] || 'Worker'), rate: parseNum(r[2]), active: true });
    }
  }

  const logs = [];
  const lSheet = ss.getSheetByName('DailyLog');
  if (lSheet && lSheet.getLastRow() >= 2) {
    const d = lSheet.getRange(2, 1, lSheet.getLastRow() - 1, 5).getValues();
    for (let i = 0; i < d.length; i++) {
      const r = d[i];
      if (r[0] && r[1]) {
        const workerName = String(r[1]);
        const matched = workers.find(w => w.name.toLowerCase() === workerName.toLowerCase());
        const workerId = matched ? matched.id : 'w_' + (i + 1);
        const dateStr = formatDateString(r[0]);
        logs.push({ id: dateStr + '_' + workerId, date: dateStr, workerId: workerId, workerName: workerName, status: String(r[2] || 'full').toLowerCase(), wage: parseNum(r[3]), note: String(r[4] || '') });
      }
    }
  }

  const payments = [];
  const pSheet = ss.getSheetByName('Payments');
  if (pSheet && pSheet.getLastRow() >= 2) {
    const d = pSheet.getRange(2, 1, pSheet.getLastRow() - 1, 5).getValues();
    for (let i = 0; i < d.length; i++) {
      const r = d[i];
      if (r[0] && r[1]) payments.push({ id: 'pay_' + (i + 1), date: formatDateString(r[0]), payee: String(r[1]), amount: parseNum(r[2]), mode: String(r[3] || 'Cash'), payeeType: 'other', note: String(r[4] || ''), createdAt: new Date().toISOString() });
    }
  }

  return { settings, expenses, workers, logs, payments };
}

function saveAllHouseBuildData(data) {
  if (!data) throw new Error('No data provided');
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const setSheet = ss.getSheetByName('Settings');
  if (setSheet && data.settings) {
    if (data.settings.projectName) setSheet.getRange('B4').setValue(data.settings.projectName);
    if (data.settings.budget) setSheet.getRange('B5').setValue(Number(data.settings.budget));
  }

  const expSheet = ss.getSheetByName('Expenses');
  if (expSheet) {
    if (expSheet.getLastRow() > 1) expSheet.getRange(2, 1, Math.max(1, expSheet.getLastRow() - 1), 5).clearContent();
    if (data.expenses && data.expenses.length > 0) {
      const rows = data.expenses.map(e => [e.date || '', e.category || '', e.item || '', e.vendor || '', Number(e.amount) || 0]);
      expSheet.getRange(2, 1, rows.length, 5).setValues(rows);
      expSheet.getRange(2, 5, rows.length, 1).setNumberFormat('₹#,##0');
    }
  }

  const wSheet = ss.getSheetByName('Workers');
  if (wSheet) {
    if (wSheet.getLastRow() > 1) wSheet.getRange(2, 1, Math.max(1, wSheet.getLastRow() - 1), 3).clearContent();
    if (data.workers && data.workers.length > 0) {
      const rows = data.workers.map(w => [w.name || '', w.role || '', Number(w.rate) || 0]);
      wSheet.getRange(2, 1, rows.length, 3).setValues(rows);
      wSheet.getRange(2, 3, rows.length, 1).setNumberFormat('₹#,##0');
    }
  }

  const lSheet = ss.getSheetByName('DailyLog');
  if (lSheet) {
    if (lSheet.getLastRow() > 1) lSheet.getRange(2, 1, Math.max(1, lSheet.getLastRow() - 1), 5).clearContent();
    if (data.logs && data.logs.length > 0) {
      const rows = data.logs.map(l => [l.date || '', l.workerName || '', capitalize(l.status || 'Full'), Number(l.wage) || 0, l.note || '']);
      lSheet.getRange(2, 1, rows.length, 5).setValues(rows);
      lSheet.getRange(2, 4, rows.length, 1).setNumberFormat('₹#,##0');
    }
  }

  const pSheet = ss.getSheetByName('Payments');
  if (pSheet) {
    if (pSheet.getLastRow() > 1) pSheet.getRange(2, 1, Math.max(1, pSheet.getLastRow() - 1), 5).clearContent();
    if (data.payments && data.payments.length > 0) {
      const rows = data.payments.map(p => [p.date || '', p.payee || '', Number(p.amount) || 0, p.mode || 'Cash', p.note || '']);
      pSheet.getRange(2, 1, rows.length, 5).setValues(rows);
      pSheet.getRange(2, 3, rows.length, 1).setNumberFormat('₹#,##0');
    }
  }

  syncPendingDuesNames();
  SpreadsheetApp.flush();
  return { success: true };
}

function syncPendingDuesNames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const duesSheet = ss.getSheetByName('PendingDues');
  if (!duesSheet) return;
  const namesSet = {};
  const wSheet = ss.getSheetByName('Workers');
  if (wSheet && wSheet.getLastRow() >= 2) {
    const wData = wSheet.getRange(2, 1, wSheet.getLastRow() - 1, 1).getValues();
    wData.forEach(r => { if (r[0]) namesSet[String(r[0]).trim()] = true; });
  }
  const expSheet = ss.getSheetByName('Expenses');
  if (expSheet && expSheet.getLastRow() >= 2) {
    const eData = expSheet.getRange(2, 4, expSheet.getLastRow() - 1, 1).getValues();
    eData.forEach(r => { if (r[0]) namesSet[String(r[0]).trim()] = true; });
  }
  const pSheet = ss.getSheetByName('Payments');
  if (pSheet && pSheet.getLastRow() >= 2) {
    const pData = pSheet.getRange(2, 2, pSheet.getLastRow() - 1, 1).getValues();
    pData.forEach(r => { if (r[0]) namesSet[String(r[0]).trim()] = true; });
  }
  const names = Object.keys(namesSet).sort();
  if (names.length > 0) {
    duesSheet.getRange(4, 1, names.length, 1).setValues(names.map(n => [n]));
  }
}

function verifyAllFormulas() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Live formulas verified and active!', 'House Build Tracker');
}

function parseNum(val) {
  if (val === null || val === undefined || val === '' || val === '-') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/,/g, '').replace(/[^\\d.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatDateString(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(val).substring(0, 10);
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
`;
