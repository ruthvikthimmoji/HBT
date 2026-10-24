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
    
    if (action === "addPayment") {
      const sheet = ss.getSheetByName("Payments Ledger");
      sheet.appendRow([
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
      ]);
    } else if (action === "addAgreement") {
      const sheet = ss.getSheetByName("Agreements");
      sheet.appendRow([
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
      ]);
    } else if (action === "addMaterial") {
      const sheet = ss.getSheetByName("Materials Log");
      sheet.appendRow([
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
      ]);
    } else if (action === "addSiteLog") {
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
    } else if (action === "addSchedule") {
      const sheet = ss.getSheetByName("Payment Schedule");
      sheet.appendRow([
        item.dueDate,
        item.vendor,
        item.agreementRef || "",
        item.milestone,
        item.amountDue,
        item.status,
        item.daysLeft,
        item.paidOn || "",
        item.notes || ""
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", action }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
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
      Notes: a.notes,
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
