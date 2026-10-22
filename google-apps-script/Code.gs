/**
 * House Build Tracker - Google Apps Script Backend
 * 
 * Instructions to connect your Google Sheet:
 * 1. Open Google Sheets (https://sheets.new) and create a new blank spreadsheet.
 * 2. Name your sheet (e.g. "My House Construction Tracker").
 * 3. In the menu, click "Extensions" > "Apps Script".
 * 4. Clear any existing code in Code.gs, paste this entire file, and click Save (Cmd+S or Floppy icon).
 * 5. Click the blue "Deploy" button at top-right > "New deployment".
 * 6. Select type: "Web app" (click the gear icon if needed).
 * 7. Configuration:
 *    - Description: "House Build API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (allows the app to sync with your private sheet)
 * 8. Click "Deploy", authorize access with your Google account.
 * 9. Copy the generated "Web app URL" (ends in /exec) and paste it into the House Build Tracker App Settings!
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
 * Ensures a sheet with sheetName exists and has standard styling
 */
function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#B4531F'); // Terracotta brand color
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Reads all data from the spreadsheet tabs
 */
function fetchAllHouseBuildData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Settings
  const settingsSheet = ss.getSheetByName('Settings');
  let settings = {
    budget: 0,
    projectName: ss.getName(),
    categoryBudgets: {}
  };
  if (settingsSheet && settingsSheet.getLastRow() >= 2) {
    const rows = settingsSheet.getRange(2, 1, settingsSheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < rows.length; i++) {
      const key = String(rows[i][0]).trim();
      const val = rows[i][1];
      if (key === 'Budget') settings.budget = Number(val) || 0;
      if (key === 'ProjectName') settings.projectName = String(val);
    }
  }

  // Category Budgets
  const catSheet = ss.getSheetByName('CategoryBudgets');
  if (catSheet && catSheet.getLastRow() >= 2) {
    const catRows = catSheet.getRange(2, 1, catSheet.getLastRow() - 1, 2).getValues();
    for (let i = 0; i < catRows.length; i++) {
      const cat = String(catRows[i][0]).trim();
      const b = Number(catRows[i][1]) || 0;
      if (cat) settings.categoryBudgets[cat] = b;
    }
  }

  // 2. Expenses
  const expensesSheet = ss.getSheetByName('Expenses');
  const expenses = [];
  if (expensesSheet && expensesSheet.getLastRow() >= 2) {
    const data = expensesSheet.getRange(2, 1, expensesSheet.getLastRow() - 1, 7).getValues();
    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      if (r[0]) {
        expenses.push({
          id: String(r[0]),
          date: formatDateString(r[1]),
          category: String(r[2]),
          item: String(r[3]),
          vendor: String(r[4] || ''),
          amount: Number(r[5]) || 0,
          note: String(r[6] || ''),
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  // 3. Workers
  const workersSheet = ss.getSheetByName('Workers');
  const workers = [];
  if (workersSheet && workersSheet.getLastRow() >= 2) {
    const data = workersSheet.getRange(2, 1, workersSheet.getLastRow() - 1, 6).getValues();
    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      if (r[0]) {
        workers.push({
          id: String(r[0]),
          name: String(r[1]),
          role: String(r[2]),
          rate: Number(r[3]) || 0,
          active: r[4] !== false && r[4] !== 'FALSE',
          phone: String(r[5] || '')
        });
      }
    }
  }

  // 4. Daily Logs
  const logsSheet = ss.getSheetByName('DailyLog');
  const logs = [];
  if (logsSheet && logsSheet.getLastRow() >= 2) {
    const data = logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 7).getValues();
    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      if (r[0]) {
        logs.push({
          id: String(r[0]),
          date: formatDateString(r[1]),
          workerId: String(r[2]),
          workerName: String(r[3]),
          status: String(r[4]).toLowerCase(),
          wage: Number(r[5]) || 0,
          note: String(r[6] || '')
        });
      }
    }
  }

  // 5. Payments
  const paymentsSheet = ss.getSheetByName('Payments');
  const payments = [];
  if (paymentsSheet && paymentsSheet.getLastRow() >= 2) {
    const data = paymentsSheet.getRange(2, 1, paymentsSheet.getLastRow() - 1, 7).getValues();
    for (let i = 0; i < data.length; i++) {
      const r = data[i];
      if (r[0]) {
        payments.push({
          id: String(r[0]),
          date: formatDateString(r[1]),
          payee: String(r[2]),
          amount: Number(r[3]) || 0,
          mode: String(r[4] || 'Cash'),
          payeeType: String(r[5] || 'other'),
          note: String(r[6] || ''),
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  return {
    settings,
    expenses,
    workers,
    logs,
    payments
  };
}

/**
 * Saves all records received from the client app into Google Sheets
 */
function saveAllHouseBuildData(data) {
  if (!data) throw new Error('No data provided in payload');
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Settings Sheet
  const settingsSheet = getOrCreateSheet(ss, 'Settings', ['Key', 'Value']);
  settingsSheet.getRange('A2:B10').clearContent();
  settingsSheet.getRange('A2:B3').setValues([
    ['Budget', data.settings ? data.settings.budget : 0],
    ['ProjectName', data.settings ? data.settings.projectName : '']
  ]);

  // Category Budgets Sheet
  const catSheet = getOrCreateSheet(ss, 'CategoryBudgets', ['Category', 'Budget (INR)']);
  if (catSheet.getLastRow() > 1) {
    catSheet.getRange(2, 1, catSheet.getLastRow() - 1, 2).clearContent();
  }
  if (data.settings && data.settings.categoryBudgets) {
    const entries = Object.entries(data.settings.categoryBudgets);
    if (entries.length > 0) {
      catSheet.getRange(2, 1, entries.length, 2).setValues(entries);
    }
  }

  // 2. Expenses Sheet
  const expensesHeaders = ['ID', 'Date', 'Category', 'Item', 'Vendor', 'Amount', 'Note'];
  const expSheet = getOrCreateSheet(ss, 'Expenses', expensesHeaders);
  if (expSheet.getLastRow() > 1) {
    expSheet.getRange(2, 1, expSheet.getLastRow() - 1, expensesHeaders.length).clearContent();
  }
  if (data.expenses && data.expenses.length > 0) {
    const rows = data.expenses.map(function(e) {
      return [
        e.id || '',
        e.date || '',
        e.category || '',
        e.item || '',
        e.vendor || '',
        Number(e.amount) || 0,
        e.note || ''
      ];
    });
    expSheet.getRange(2, 1, rows.length, expensesHeaders.length).setValues(rows);
  }

  // 3. Workers Sheet
  const workersHeaders = ['Worker ID', 'Name', 'Role', 'Daily Rate', 'Active', 'Phone'];
  const wSheet = getOrCreateSheet(ss, 'Workers', workersHeaders);
  if (wSheet.getLastRow() > 1) {
    wSheet.getRange(2, 1, wSheet.getLastRow() - 1, workersHeaders.length).clearContent();
  }
  if (data.workers && data.workers.length > 0) {
    const rows = data.workers.map(function(w) {
      return [
        w.id || '',
        w.name || '',
        w.role || '',
        Number(w.rate) || 0,
        w.active !== false,
        w.phone || ''
      ];
    });
    wSheet.getRange(2, 1, rows.length, workersHeaders.length).setValues(rows);
  }

  // 4. DailyLog Sheet
  const logHeaders = ['Log ID', 'Date', 'Worker ID', 'Worker Name', 'Status', 'Wage', 'Note'];
  const lSheet = getOrCreateSheet(ss, 'DailyLog', logHeaders);
  if (lSheet.getLastRow() > 1) {
    lSheet.getRange(2, 1, lSheet.getLastRow() - 1, logHeaders.length).clearContent();
  }
  if (data.logs && data.logs.length > 0) {
    const rows = data.logs.map(function(l) {
      return [
        l.id || '',
        l.date || '',
        l.workerId || '',
        l.workerName || '',
        l.status || '',
        Number(l.wage) || 0,
        l.note || ''
      ];
    });
    lSheet.getRange(2, 1, rows.length, logHeaders.length).setValues(rows);
  }

  // 5. Payments Sheet
  const payHeaders = ['Payment ID', 'Date', 'Paid To', 'Amount', 'Mode', 'Type', 'Note'];
  const pSheet = getOrCreateSheet(ss, 'Payments', payHeaders);
  if (pSheet.getLastRow() > 1) {
    pSheet.getRange(2, 1, pSheet.getLastRow() - 1, payHeaders.length).clearContent();
  }
  if (data.payments && data.payments.length > 0) {
    const rows = data.payments.map(function(p) {
      return [
        p.id || '',
        p.date || '',
        p.payee || '',
        Number(p.amount) || 0,
        p.mode || 'Cash',
        p.payeeType || 'other',
        p.note || ''
      ];
    });
    pSheet.getRange(2, 1, rows.length, payHeaders.length).setValues(rows);
  }

  return { success: true, count: {
    expenses: (data.expenses || []).length,
    workers: (data.workers || []).length,
    logs: (data.logs || []).length,
    payments: (data.payments || []).length
  }};
}

function formatDateString(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(val).substring(0, 10);
}
