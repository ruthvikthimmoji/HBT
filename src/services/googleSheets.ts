import { Settings, Expense, Worker, DailyLog, Payment } from '../types';

export interface SyncPayload {
  settings: Settings;
  expenses: Expense[];
  workers: Worker[];
  logs: DailyLog[];
  payments: Payment[];
}

export async function pingGoogleSheets(webAppUrl: string): Promise<{ success: boolean; message: string; sheetName?: string }> {
  if (!webAppUrl || !webAppUrl.trim()) {
    throw new Error('Google Apps Script URL is empty.');
  }

  const cleanUrl = webAppUrl.trim();
  const targetUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=ping`;

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to ping spreadsheet.');
    }
    return {
      success: true,
      message: data.message || 'Connected successfully!',
      sheetName: data.sheetName,
    };
  } catch (err: any) {
    console.error('Ping failed:', err);
    throw new Error(err.message || 'Could not connect. Check the Web App URL and permissions.');
  }
}

export async function fetchFromGoogleSheets(webAppUrl: string): Promise<{
  settings?: Settings;
  expenses: Expense[];
  workers: Worker[];
  logs: DailyLog[];
  payments: Payment[];
}> {
  const cleanUrl = webAppUrl.trim();
  const targetUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=getData`;

  const res = await fetch(targetUrl);
  if (!res.ok) {
    throw new Error(`Failed to load data (HTTP ${res.status})`);
  }
  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Could not read spreadsheet data.');
  }

  return {
    settings: json.data.settings,
    expenses: json.data.expenses || [],
    workers: json.data.workers || [],
    logs: json.data.logs || [],
    payments: json.data.payments || [],
  };
}

export async function syncAllToGoogleSheets(webAppUrl: string, data: SyncPayload): Promise<boolean> {
  const cleanUrl = webAppUrl.trim();

  // Strip huge photo data URLs when syncing to Google Sheets text cells to avoid cell character limits (50k chars)
  const sanitizedExpenses = data.expenses.map((e) => ({
    ...e,
    photoReceipt: e.photoReceipt ? '[Photo attached in local app]' : '',
  }));

  const payload = {
    action: 'syncAll',
    data: {
      settings: data.settings,
      expenses: sanitizedExpenses,
      workers: data.workers,
      logs: data.logs,
      payments: data.payments,
    },
  };

  // Google Apps Script handles text/plain without CORS preflight issues
  const res = await fetch(cleanUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Sync request failed with status ${res.status}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Could not sync. Try again.');
  }

  return true;
}
