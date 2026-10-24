import * as XLSX from 'xlsx';
import {
  Agreement,
  Vendor,
  PaymentRecord,
  ScheduledPayment,
  MaterialEntry,
  SiteDailyLog,
  BudgetCategory,
  AppSettingsV2,
} from '../types/v2';

export const GAS_V2_SCRIPT_TEMPLATE = `/**
 * ==========================================================================
 * HOUSE BUILD TRACKER v2 - GOOGLE APPS SCRIPT BACKEND
 * Specially designed for Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1QOEMad73BhJAYoqVusVGxkx_rBzhScpvWd3t3Qjxhfw/edit
 *
 * HOW IT WORKS:
 * 1. Headers are in Row 4, Data is in Rows 5..504.
 * 2. Writes new records to the FIRST EMPTY ROW (e.g. Row 6, 7, 8...).
 * 3. Never appends below row 504 - keeps all Dashboard formulas working live!
 * 4. Preserves built-in formulas in Agreements and Payments Ledger.
 * ==========================================================================
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = e && e.parameter ? e.parameter.action : "";
    
    if (action === "readData") {
      const data = {
        agreements: readSheetData(ss.getSheetByName("Agreements")),
        payments: readSheetData(ss.getSheetByName("Payments Ledger")),
        materials: readSheetData(ss.getSheetByName("Materials Log")),
        siteLogs: readSheetData(ss.getSheetByName("Site Daily Log")),
        schedule: readSheetData(ss.getSheetByName("Payment Schedule")),
        vendors: readSheetData(ss.getSheetByName("Vendors")),
        budget: readSheetData(ss.getSheetByName("Budget")),
        lastSyncedAt: new Date().toISOString()
      };
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Connected to House Build Tracker (" + ss.getName() + ")",
      spreadsheetId: ss.getId(),
      sheets: ss.getSheets().map(function(s) { return s.getName(); })
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let payload;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.payload) {
      payload = JSON.parse(e.parameter.payload);
    } else {
      throw new Error("No payload found in request");
    }
    
    const action = payload.action;
    const item = payload.data;
    let res = null;
    
    // 1. PAYMENTS
    if (action === "addPayment" || action === "updatePayment") {
      res = upsertPayment(ss.getSheetByName("Payments Ledger"), item);
    }
    // 2. AGREEMENTS
    else if (action === "addAgreement" || action === "updateAgreement") {
      res = upsertAgreement(ss.getSheetByName("Agreements"), item);
    }
    // 3. MATERIALS
    else if (action === "addMaterial" || action === "updateMaterial") {
      res = upsertMaterial(ss.getSheetByName("Materials Log"), item);
    }
    // 4. SITE DAILY LOG
    else if (action === "addSiteLog") {
      res = upsertSiteLog(ss.getSheetByName("Site Daily Log"), item);
    }
    // 5. PAYMENT SCHEDULE
    else if (action === "addSchedule" || action === "updateSchedule") {
      res = upsertSchedule(ss.getSheetByName("Payment Schedule"), item);
    }
    // 6. BATCH PUSH ALL
    else if (action === "syncAll") {
      const summary = {};
      if (item.payments && item.payments.length > 0) {
        const sheet = ss.getSheetByName("Payments Ledger");
        item.payments.forEach(function(p) { upsertPayment(sheet, p); });
        summary.payments = item.payments.length;
      }
      if (item.agreements && item.agreements.length > 0) {
        const sheet = ss.getSheetByName("Agreements");
        item.agreements.forEach(function(a) { upsertAgreement(sheet, a); });
        summary.agreements = item.agreements.length;
      }
      if (item.materials && item.materials.length > 0) {
        const sheet = ss.getSheetByName("Materials Log");
        item.materials.forEach(function(m) { upsertMaterial(sheet, m); });
        summary.materials = item.materials.length;
      }
      if (item.siteLogs && item.siteLogs.length > 0) {
        const sheet = ss.getSheetByName("Site Daily Log");
        item.siteLogs.forEach(function(s) { upsertSiteLog(sheet, s); });
        summary.siteLogs = item.siteLogs.length;
      }
      if (item.schedule && item.schedule.length > 0) {
        const sheet = ss.getSheetByName("Payment Schedule");
        item.schedule.forEach(function(sc) { upsertSchedule(sheet, sc); });
        summary.schedule = item.schedule.length;
      }
      res = summary;
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", action: action, result: res }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------------------------------------------------------
// SMART UPSERT FUNCTIONS (Row 4 = Headers, Rows 5..504 = Data)
// -------------------------------------------------------------------------

function upsertPayment(sheet, item) {
  if (!sheet) return;
  const numRows = Math.min(500, Math.max(1, sheet.getLastRow() - 4));
  const dataRange = sheet.getRange(5, 1, 500, 15).getValues();
  let targetRow = -1;
  let firstEmptyRow = -1;
  
  const searchId = item.id ? String(item.id).trim().toLowerCase() : "";
  
  for (let i = 0; i < dataRange.length; i++) {
    const rowId = String(dataRange[i][0]).trim().toLowerCase();
    const dateVal = dataRange[i][1];
    const vendorVal = dataRange[i][2];
    
    if (searchId && rowId === searchId) {
      targetRow = 5 + i;
      break;
    }
    
    if (firstEmptyRow === -1 && (dateVal === "" || dateVal === null) && (vendorVal === "" || vendorVal === null)) {
      firstEmptyRow = 5 + i;
    }
  }
  
  const writeRow = targetRow !== -1 ? targetRow : (firstEmptyRow !== -1 ? firstEmptyRow : sheet.getLastRow() + 1);
  const payId = item.id || ("P-" + Utilities.formatString("%03d", writeRow - 4));
  
  // Col A to D: Pay ID, Date, Paid To, Agreement Ref
  sheet.getRange(writeRow, 1, 1, 4).setValues([[
    payId,
    item.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    item.paidTo || "",
    item.agreementRef || ""
  ]]);
  
  // Col E has formula IF(D..., Agreements!...) - preserve formula if present
  const colECell = sheet.getRange(writeRow, 5);
  if (!colECell.getFormula() && item.agreedWork) {
    colECell.setValue(item.agreedWork);
  }
  
  // Col F to O: Category, Work Description, Amount, Payment Type, Mode, Txn Ref, Receipt Received?, Receipt No., Receipt Link, Remarks
  sheet.getRange(writeRow, 6, 1, 10).setValues([[
    item.category || "",
    item.description || "",
    Number(item.amount) || 0,
    item.paymentType || "Part Payment",
    item.mode || "UPI",
    item.txnRef || "",
    item.receiptReceived ? "Yes" : "No",
    item.receiptNo || "",
    item.receiptLocation || "",
    item.remarks || ""
  ]]);
  
  return { row: writeRow, id: payId };
}

function upsertAgreement(sheet, item) {
  if (!sheet) return;
  const dataRange = sheet.getRange(5, 1, 100, 21).getValues();
  let targetRow = -1;
  let firstEmptyRow = -1;
  
  const searchId = item.id ? String(item.id).trim().toLowerCase() : "";
  
  for (let i = 0; i < dataRange.length; i++) {
    const rowId = String(dataRange[i][0]).trim().toLowerCase();
    const vendorVal = dataRange[i][2];
    const scopeVal = dataRange[i][3];
    
    if (searchId && rowId === searchId) {
      targetRow = 5 + i;
      break;
    }
    
    if (firstEmptyRow === -1 && (vendorVal === "" || vendorVal === null) && (scopeVal === "" || scopeVal === null)) {
      firstEmptyRow = 5 + i;
    }
  }
  
  const writeRow = targetRow !== -1 ? targetRow : (firstEmptyRow !== -1 ? firstEmptyRow : sheet.getLastRow() + 1);
  const agrId = item.id || ("A-" + Utilities.formatString("%03d", writeRow - 4));
  
  // Col A to K: Agreement ID, Date Agreed, Vendor, Scope, Category, Agreed Amount, Agreement Type, Start Date, Expected End Date, Payment Terms, Advance Agreed
  sheet.getRange(writeRow, 1, 1, 11).setValues([[
    agrId,
    item.dateAgreed || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    item.vendor || "",
    item.workScope || "",
    item.category || "",
    Number(item.agreedAmount) || 0,
    item.agreementType || "Verbal / Phone",
    item.startDate || "",
    item.expectedEndDate || "",
    item.paymentTerms || "",
    Number(item.advanceAgreed) || 0
  ]]);
  
  // Note: Col L, M, N, O are automatic formulas from Payments Ledger - DO NOT OVERWRITE
  
  // Col P (Col 16): Work Completed %
  const workCompletedRatio = (Number(item.workCompletedPercent) || 0) / 100;
  sheet.getRange(writeRow, 16).setValue(workCompletedRatio);
  
  // Note: Col Q, R are automatic formulas - DO NOT OVERWRITE
  
  // Col S to U (Cols 19-21): Status, Agreement Doc / Link, Notes
  sheet.getRange(writeRow, 19, 1, 3).setValues([[
    item.status || "In Progress",
    item.docUrl || "",
    item.notes || ""
  ]]);
  
  return { row: writeRow, id: agrId };
}

function upsertMaterial(sheet, item) {
  if (!sheet) return;
  const dataRange = sheet.getRange(5, 1, 500, 12).getValues();
  let targetRow = -1;
  let firstEmptyRow = -1;
  
  const searchBill = item.billNo ? String(item.billNo).trim().toLowerCase() : "";
  const searchMat = item.material ? String(item.material).trim().toLowerCase() : "";
  
  for (let i = 0; i < dataRange.length; i++) {
    const dateVal = dataRange[i][0];
    const matVal = String(dataRange[i][1]).trim().toLowerCase();
    const billVal = String(dataRange[i][7]).trim().toLowerCase();
    
    if (searchBill && billVal === searchBill) {
      targetRow = 5 + i;
      break;
    }
    
    if (firstEmptyRow === -1 && (dateVal === "" || dateVal === null) && (matVal === "" || matVal === null)) {
      firstEmptyRow = 5 + i;
    }
  }
  
  const writeRow = targetRow !== -1 ? targetRow : (firstEmptyRow !== -1 ? firstEmptyRow : sheet.getLastRow() + 1);
  const qty = Number(item.qty) || 0;
  const rate = Number(item.rate) || 0;
  
  sheet.getRange(writeRow, 1, 1, 6).setValues([[
    item.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    item.material || "",
    item.supplier || "",
    qty,
    item.unit || "Bags",
    rate
  ]]);
  
  const colGCell = sheet.getRange(writeRow, 7);
  if (!colGCell.getFormula()) {
    colGCell.setValue(Number(item.amount) || (qty * rate));
  }
  
  sheet.getRange(writeRow, 8, 1, 5).setValues([[
    item.billNo || "",
    item.delivered || "Yes",
    item.paymentStatus || "Paid",
    item.billLink || "",
    item.remarks || ""
  ]]);
  
  return { row: writeRow };
}

function upsertSiteLog(sheet, item) {
  if (!sheet) return;
  const dataRange = sheet.getRange(5, 1, 500, 11).getValues();
  let targetRow = -1;
  let firstEmptyRow = -1;
  
  const searchDate = item.date ? String(item.date).trim().toLowerCase() : "";
  
  for (let i = 0; i < dataRange.length; i++) {
    const dateVal = String(dataRange[i][0]).trim().toLowerCase();
    
    if (searchDate && (dateVal === searchDate || dateVal.startsWith(searchDate))) {
      targetRow = 5 + i;
      break;
    }
    
    if (firstEmptyRow === -1 && (dataRange[i][0] === "" || dataRange[i][0] === null)) {
      firstEmptyRow = 5 + i;
    }
  }
  
  const writeRow = targetRow !== -1 ? targetRow : (firstEmptyRow !== -1 ? firstEmptyRow : sheet.getLastRow() + 1);
  
  sheet.getRange(writeRow, 1).setValue(item.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"));
  
  const colBCell = sheet.getRange(writeRow, 2);
  if (!colBCell.getFormula() && item.day) {
    colBCell.setValue(item.day);
  }
  
  sheet.getRange(writeRow, 3, 1, 9).setValues([[
    item.stage || "",
    item.weather || "Sunny",
    item.workDone || "",
    Number(item.labourCount) || 0,
    item.whoWasOnSite || "",
    item.issuesDelays || "",
    item.decisionsGiven || "",
    item.photoRef || "",
    item.nextSteps || ""
  ]]);
  
  return { row: writeRow };
}

function upsertSchedule(sheet, item) {
  if (!sheet) return;
  const dataRange = sheet.getRange(5, 1, 100, 9).getValues();
  let targetRow = -1;
  let firstEmptyRow = -1;
  
  const searchMilestone = item.milestone ? String(item.milestone).trim().toLowerCase() : "";
  
  for (let i = 0; i < dataRange.length; i++) {
    const dueVal = dataRange[i][0];
    const msVal = String(dataRange[i][3]).trim().toLowerCase();
    
    if (searchMilestone && msVal === searchMilestone) {
      targetRow = 5 + i;
      break;
    }
    
    if (firstEmptyRow === -1 && (dueVal === "" || dueVal === null) && (msVal === "" || msVal === null)) {
      firstEmptyRow = 5 + i;
    }
  }
  
  const writeRow = targetRow !== -1 ? targetRow : (firstEmptyRow !== -1 ? firstEmptyRow : sheet.getLastRow() + 1);
  
  sheet.getRange(writeRow, 1, 1, 6).setValues([[
    item.dueDate || "",
    item.vendor || "",
    item.agreementRef || "",
    item.milestone || "",
    Number(item.amountDue) || 0,
    item.status || "Upcoming"
  ]]);
  
  const colGCell = sheet.getRange(writeRow, 7);
  if (!colGCell.getFormula() && item.daysLeft !== undefined) {
    colGCell.setValue(Number(item.daysLeft) || 0);
  }
  
  sheet.getRange(writeRow, 8, 1, 2).setValues([[
    item.paidOn || "",
    item.notes || ""
  ]]);
  
  return { row: writeRow };
}

function readSheetData(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 5) return [];
  
  // Headers are on Row 4
  const headers = sheet.getRange(4, 1, 1, lastCol).getValues()[0];
  const dataRange = sheet.getRange(5, 1, lastRow - 4, lastCol).getValues();
  const rows = [];
  
  for (let i = 0; i < dataRange.length; i++) {
    const rowValues = dataRange[i];
    const hasData = rowValues.some(function(val) { return val !== "" && val !== null && val !== undefined; });
    if (!hasData) continue;
    
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) {
        rowObj[headers[j]] = rowValues[j];
      }
    }
    rows.push(rowObj);
  }
  return rows;
}
`;

// Test connectivity to Google Apps Script Web App
export async function testGASConnection(gasUrl: string): Promise<{ success: boolean; message: string }> {
  if (!gasUrl) {
    return { success: false, message: 'Please paste a Google Apps Script Web App URL first.' };
  }
  const cleanUrl = gasUrl.trim();
  if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
    return { success: false, message: 'Invalid URL. Must start with https://script.google.com/macros/s/.../exec' };
  }
  if (cleanUrl.endsWith('/dev')) {
    return { success: false, message: 'URL ends with /dev. Please create a deployment ending in /exec.' };
  }
  try {
    const response = await fetch(cleanUrl, { method: 'GET' });
    const json = await response.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'Connected to Google Sheet successfully!' };
    }
    return { success: false, message: json.message || 'Script error' };
  } catch (err: any) {
    return {
      success: false,
      message: 'Could not connect. Ensure deployment is set to "Execute as: Me" and "Who has access: Anyone".',
    };
  }
}

// Background Poster to Google Apps Script (handles CORS simple text/plain)
export async function postToGAS(gasUrl: string, action: string, data: any): Promise<{ success: boolean; error?: string }> {
  if (!gasUrl) return { success: false, error: 'No Google Apps Script URL configured' };
  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, data }),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Error posting to Google Apps Script:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

// Push All Local Data to Google Sheets
export async function pushAllDataToGAS(
  gasUrl: string,
  payload: {
    agreements: Agreement[];
    payments: PaymentRecord[];
    materials: MaterialEntry[];
    siteLogs: SiteDailyLog[];
    schedule: ScheduledPayment[];
    budget: BudgetCategory[];
  }
): Promise<{ success: boolean; error?: string }> {
  if (!gasUrl) throw new Error('No Google Apps Script Web App URL provided');
  return postToGAS(gasUrl, 'syncAll', payload);
}

// Read from Google Apps Script
export async function syncWithGAS(gasUrl: string) {
  if (!gasUrl) throw new Error('No Google Apps Script URL configured');
  const response = await fetch(`${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=readData`, { method: 'GET' });
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'Sync failed');
  }
  return result.data;
}

export function exportToExcelV2(
  agreements: Agreement[],
  payments: PaymentRecord[],
  materials: MaterialEntry[],
  siteLogs: SiteDailyLog[],
  schedule: ScheduledPayment[],
  vendors: Vendor[],
  budget: BudgetCategory[],
  projectName: string
) {
  const wb = XLSX.utils.book_new();

  // 1. Agreements
  const wsAgreements = XLSX.utils.json_to_sheet(
    agreements.map((a) => ({
      'Agreement ID': a.id,
      'Date Agreed': a.dateAgreed,
      'Vendor / Contractor': a.vendor,
      'Scope Agreed': a.workScope,
      Category: a.category,
      'Agreed Amount (₹)': a.agreedAmount,
      Type: a.agreementType,
      'Start Date': a.startDate,
      'Expected End Date': a.expectedEndDate,
      'Payment Terms': a.paymentTerms,
      'Advance Agreed (₹)': a.advanceAgreed,
      'Advance Paid (₹)': a.advancePaid,
      'Total Paid (₹)': a.totalPaid,
      'Balance To Pay (₹)': a.balanceToPay,
      '% Paid': a.percentPaid,
      'Work Completed %': a.workCompletedPercent,
      'Work Value Done (₹)': a.workValueDone,
      'Paid Ahead of Work (₹)': a.paidAheadOfWork,
      Status: a.status,
      Notes: a.notes || '',
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsAgreements, 'Agreements');

  // 2. Payments Ledger
  const wsPayments = XLSX.utils.json_to_sheet(
    payments.map((p) => ({
      'Pay ID': p.id,
      Date: p.date,
      'Paid To (Vendor)': p.paidTo,
      'Agreement Ref': p.agreementRef || '',
      Category: p.category,
      Description: p.description,
      'Amount (₹)': p.amount,
      'Payment Type': p.paymentType,
      Mode: p.mode,
      'Txn Ref': p.txnRef || '',
      'Receipt Received?': p.receiptReceived ? 'Yes' : 'No',
      'Receipt No.': p.receiptNo || '',
      'Receipt Location': p.receiptLocation || '',
      Remarks: p.remarks || '',
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Payments Ledger');

  // 3. Materials Log
  const wsMaterials = XLSX.utils.json_to_sheet(
    materials.map((m) => ({
      Date: m.date,
      Material: m.material,
      Supplier: m.supplier,
      Qty: m.qty,
      Unit: m.unit,
      'Rate (₹)': m.rate,
      'Amount (₹)': m.amount,
      'Bill No': m.billNo || '',
      Delivered: m.delivered,
      'Payment Status': m.paymentStatus,
      'Bill Link': m.billLink || '',
      Remarks: m.remarks || '',
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsMaterials, 'Materials Log');

  // 4. Site Daily Log
  const wsSiteLogs = XLSX.utils.json_to_sheet(
    siteLogs.map((s) => ({
      Date: s.date,
      Day: s.day,
      Stage: s.stage,
      Weather: s.weather,
      'Work Done Today': s.workDone,
      'Labour Count': s.labourCount,
      'Who Was On Site': s.whoWasOnSite,
      'Issues / Delays': s.issuesDelays || '',
      'Decisions Given': s.decisionsGiven || '',
      'Next Steps': s.nextSteps || '',
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsSiteLogs, 'Site Daily Log');

  // 5. Payment Schedule
  const wsSchedule = XLSX.utils.json_to_sheet(
    schedule.map((s) => ({
      'Due Date': s.dueDate,
      Vendor: s.vendor,
      'Agreement Ref': s.agreementRef || '',
      Milestone: s.milestone,
      'Amount Due (₹)': s.amountDue,
      Status: s.status,
      'Days Left': s.daysLeft,
      'Paid On': s.paidOn || '',
      Notes: s.notes || '',
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsSchedule, 'Payment Schedule');

  // 6. Vendors
  const wsVendors = XLSX.utils.json_to_sheet(
    vendors.map((v) => ({
      'Vendor Name': v.name,
      Role: v.role,
      Phone: v.phone,
      'Total Agreed (₹)': v.totalAgreed,
      'Advance Given (₹)': v.advanceGiven,
      'Total Paid (₹)': v.totalPaid,
      'Balance Due (₹)': v.balanceDue,
      '% Paid': v.percentPaid,
      'Work Value Done (₹)': v.workValueDone,
      'Paid Ahead of Work (₹)': v.paidAheadOfWork,
      Notes: v.notes || '',
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsVendors, 'Vendors');

  // 7. Budget vs Actual
  const wsBudget = XLSX.utils.json_to_sheet(
    budget.map((b) => ({
      Category: b.category,
      'Budget (₹)': b.budget,
      'Spent (₹)': b.spent,
      'Remaining (₹)': b.remaining,
      '% Used': b.percentUsed.toFixed(1) + '%',
      Status: b.status,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget vs Actual');

  const fileName = `${(projectName || 'House_Build_Tracker').replace(/\s+/g, '_')}_v2_Export.xlsx`;
  XLSX.writeFile(wb, fileName);
}
