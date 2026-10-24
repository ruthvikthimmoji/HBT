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
 * Connects Mobile Application directly to Google Sheets:
 * https://docs.google.com/spreadsheets/d/1QOEMad73BhJAYoqVusVGxkx_rBzhScpvWd3t3Qjxhfw/edit
 * ==========================================================================
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Read all 8 sheets
    const data = {
      agreements: readSheetData(ss.getSheetByName("Agreements")),
      payments: readSheetData(ss.getSheetByName("Payments Ledger")),
      materials: readSheetData(ss.getSheetByName("Materials Log")),
      siteLogs: readSheetData(ss.getSheetByName("Site Daily Log")),
      schedule: readSheetData(ss.getSheetByName("Payment Schedule")),
      vendors: readSheetData(ss.getSheetByName("Vendors")),
      budget: readSheetData(ss.getSheetByName("Budget")),
      dashboard: readSheetData(ss.getSheetByName("Dashboard")),
      lastSyncedAt: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const item = payload.data;
    
    // 1. ADD / UPDATE PAYMENT
    if (action === "addPayment" || action === "updatePayment") {
      const sheet = ss.getSheetByName("Payments Ledger");
      const rowData = [
        item.id || ("P-" + Utilities.getUuid().slice(0, 4)),
        item.date,
        item.paidTo,
        item.agreementRef || "",
        item.agreedWork || "",
        item.category,
        item.description,
        item.amount,
        item.paymentType,
        item.mode,
        item.txnRef || "",
        item.receiptReceived ? "Yes" : "No",
        item.receiptNo || "",
        item.receiptLocation || "",
        item.remarks || ""
      ];
      upsertRow(sheet, 0, item.id, rowData);
    }
    
    // 2. ADD / UPDATE AGREEMENT
    else if (action === "addAgreement" || action === "updateAgreement") {
      const sheet = ss.getSheetByName("Agreements");
      const rowData = [
        item.id,
        item.dateAgreed,
        item.vendor,
        item.workScope,
        item.category,
        item.agreedAmount,
        item.agreementType,
        item.startDate,
        item.expectedEndDate,
        item.paymentTerms,
        item.advanceAgreed,
        item.advancePaid,
        item.totalPaid,
        item.balanceToPay,
        item.percentPaid / 100,
        item.workCompletedPercent / 100,
        item.workValueDone,
        item.paidAheadOfWork,
        item.status,
        item.docUrl || "",
        item.notes || ""
      ];
      upsertRow(sheet, 0, item.id, rowData);
    }
    
    // 3. ADD / UPDATE MATERIAL
    else if (action === "addMaterial" || action === "updateMaterial") {
      const sheet = ss.getSheetByName("Materials Log");
      const rowData = [
        item.date,
        item.material,
        item.supplier,
        item.qty,
        item.unit,
        item.rate,
        item.amount,
        item.billNo || "",
        item.delivered,
        item.paymentStatus,
        item.billLink || "",
        item.remarks || ""
      ];
      upsertRow(sheet, 7, item.billNo || item.material + item.date, rowData);
    }
    
    // 4. ADD SITE LOG
    else if (action === "addSiteLog") {
      const sheet = ss.getSheetByName("Site Daily Log");
      sheet.appendRow([
        item.date,
        item.day,
        item.stage,
        item.weather,
        item.workDone,
        item.labourCount,
        item.whoWasOnSite,
        item.issuesDelays || "",
        item.decisionsGiven || "",
        item.photoRef || "",
        item.nextSteps || ""
      ]);
    }
    
    // 5. ADD / UPDATE SCHEDULE
    else if (action === "addSchedule" || action === "updateSchedule") {
      const sheet = ss.getSheetByName("Payment Schedule");
      const rowData = [
        item.dueDate,
        item.vendor,
        item.agreementRef || "",
        item.milestone,
        item.amountDue,
        item.status,
        item.daysLeft,
        item.paidOn || "",
        item.notes || ""
      ];
      upsertRow(sheet, 3, item.milestone, rowData);
    }
    
    // 6. SYNC ALL (BATCH PUSH)
    else if (action === "syncAll") {
      if (item.payments && item.payments.length > 0) {
        const sheet = ss.getSheetByName("Payments Ledger");
        item.payments.forEach(p => {
          upsertRow(sheet, 0, p.id, [
            p.id, p.date, p.paidTo, p.agreementRef || "", p.agreedWork || "",
            p.category, p.description, p.amount, p.paymentType, p.mode,
            p.txnRef || "", p.receiptReceived ? "Yes" : "No", p.receiptNo || "",
            p.receiptLocation || "", p.remarks || ""
          ]);
        });
      }
      
      if (item.agreements && item.agreements.length > 0) {
        const sheet = ss.getSheetByName("Agreements");
        item.agreements.forEach(a => {
          upsertRow(sheet, 0, a.id, [
            a.id, a.dateAgreed, a.vendor, a.workScope, a.category,
            a.agreedAmount, a.agreementType, a.startDate, a.expectedEndDate,
            a.paymentTerms, a.advanceAgreed, a.advancePaid, a.totalPaid,
            a.balanceToPay, a.percentPaid / 100, a.workCompletedPercent / 100,
            a.workValueDone, a.paidAheadOfWork, a.status, a.docUrl || "", a.notes || ""
          ]);
        });
      }
      
      if (item.materials && item.materials.length > 0) {
        const sheet = ss.getSheetByName("Materials Log");
        item.materials.forEach(m => {
          upsertRow(sheet, 7, m.billNo || m.material + m.date, [
            m.date, m.material, m.supplier, m.qty, m.unit, m.rate,
            m.amount, m.billNo || "", m.delivered, m.paymentStatus,
            m.billLink || "", m.remarks || ""
          ]);
        });
      }
      
      if (item.siteLogs && item.siteLogs.length > 0) {
        const sheet = ss.getSheetByName("Site Daily Log");
        item.siteLogs.forEach(s => {
          upsertRow(sheet, 0, s.date, [
            s.date, s.day, s.stage, s.weather, s.workDone,
            s.labourCount, s.whoWasOnSite, s.issuesDelays || "",
            s.decisionsGiven || "", s.photoRef || "", s.nextSteps || ""
          ]);
        });
      }
      
      if (item.schedule && item.schedule.length > 0) {
        const sheet = ss.getSheetByName("Payment Schedule");
        item.schedule.forEach(sc => {
          upsertRow(sheet, 3, sc.milestone, [
            sc.dueDate, sc.vendor, sc.agreementRef || "", sc.milestone,
            sc.amountDue, sc.status, sc.daysLeft, sc.paidOn || "", sc.notes || ""
          ]);
        });
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Upsert row: updates if matching ID exists, otherwise appends
function upsertRow(sheet, idColIndex, idValue, rowData) {
  if (!sheet) return;
  const values = sheet.getDataRange().getValues();
  let foundRow = -1;
  
  if (idValue && values.length > 1) {
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idColIndex]).trim().toLowerCase() === String(idValue).trim().toLowerCase()) {
        foundRow = i + 1;
        break;
      }
    }
  }
  
  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function readSheetData(sheet) {
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = values[i][j];
    }
    rows.push(rowObj);
  }
  return rows;
}
`;

// Background Poster to Google Apps Script (handles CORS simple text/plain)
export async function postToGAS(gasUrl: string, action: string, data: any): Promise<boolean> {
  if (!gasUrl) return false;
  try {
    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, data }),
    });
    return true;
  } catch (err) {
    console.error('Error posting to Google Apps Script:', err);
    return false;
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
): Promise<boolean> {
  if (!gasUrl) throw new Error('No Google Apps Script Web App URL provided');
  return postToGAS(gasUrl, 'syncAll', payload);
}

// Read from Google Apps Script
export async function syncWithGAS(gasUrl: string) {
  if (!gasUrl) throw new Error('No Google Apps Script URL configured');
  const response = await fetch(gasUrl, { method: 'GET' });
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
