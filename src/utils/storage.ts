import { Settings, Expense, DailyLog, Worker, Payment } from '../types';
import { getTodayDateString } from './format';

const STORAGE_KEYS = {
  SETTINGS: 'hbt_settings',
  EXPENSES: 'hbt_expenses',
  LOGS: 'hbt_logs',
  WORKERS: 'hbt_workers',
  PAYMENTS: 'hbt_payments',
  THEME: 'hbt_theme',
};

const DEFAULT_SETTINGS: Settings = {
  projectName: 'Dream Villa Construction',
  budget: 4500000, // ₹45,00,000
  gasWebAppUrl: '',
  categoryBudgets: {
    'Foundation': 500000,
    'Cement & Steel': 1200000,
    'Bricks & Sand': 450000,
    'Plumbing': 250000,
    'Electrical': 300000,
    'Labour (daily wages)': 800000,
  },
};

const SEED_WORKERS: Worker[] = [
  { id: 'w_1', name: 'Ramesh Kumar', role: 'Head Mason', rate: 1100, active: true, phone: '9876543210' },
  { id: 'w_2', name: 'Suresh Gowda', role: 'Mason', rate: 950, active: true },
  { id: 'w_3', name: 'Ganesh Das', role: 'Helper', rate: 650, active: true },
  { id: 'w_4', name: 'Manjunath B', role: 'Helper', rate: 650, active: true },
  { id: 'w_5', name: 'Pradeep Sharma', role: 'Carpenter', rate: 1200, active: true },
];

export function getInitialData(): {
  settings: Settings;
  expenses: Expense[];
  logs: DailyLog[];
  workers: Worker[];
  payments: Payment[];
} {
  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const rawExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const rawLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    const rawWorkers = localStorage.getItem(STORAGE_KEYS.WORKERS);
    const rawPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);

    if (rawSettings && rawExpenses && rawWorkers) {
      return {
        settings: JSON.parse(rawSettings),
        expenses: JSON.parse(rawExpenses),
        logs: rawLogs ? JSON.parse(rawLogs) : [],
        workers: JSON.parse(rawWorkers),
        payments: rawPayments ? JSON.parse(rawPayments) : [],
      };
    }
  } catch (err) {
    console.error('Error reading localStorage, using defaults', err);
  }

  // Generate sensible seed demo data for a lively first run
  const today = getTodayDateString();
  const d = new Date();
  const dMinus1 = new Date(d);
  dMinus1.setDate(d.getDate() - 1);
  const yesterday = dMinus1.toISOString().split('T')[0];

  const seedExpenses: Expense[] = [
    {
      id: 'exp_1',
      date: yesterday,
      category: 'Cement & Steel',
      item: '50 Bags Ultratech Cement (PPC)',
      vendor: 'Sri Lakshmi Hardware & Steels',
      amount: 19500,
      createdAt: new Date().toISOString(),
      note: 'Bill #4128, delivered at site',
    },
    {
      id: 'exp_2',
      date: yesterday,
      category: 'Bricks & Sand',
      item: '1 Truckload Red Bricks (3000 pcs)',
      vendor: 'Bhuvaneshwari Brick Kiln',
      amount: 27000,
      createdAt: new Date().toISOString(),
      note: 'Direct unload by quarry truck',
    },
    {
      id: 'exp_3',
      date: today,
      category: 'Plumbing',
      item: 'PVC Pipes 4-inch & fittings',
      vendor: 'Sri Lakshmi Hardware & Steels',
      amount: 8400,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp_4',
      date: today,
      category: 'Transport',
      item: 'Tractor transport for excavated soil',
      vendor: 'Shiva Transports',
      amount: 4500,
      createdAt: new Date().toISOString(),
    },
  ];

  const seedLogs: DailyLog[] = [
    {
      id: `${yesterday}_w_1`,
      date: yesterday,
      workerId: 'w_1',
      workerName: 'Ramesh Kumar',
      status: 'full',
      wage: 1100,
      note: 'Lintel shuttering alignment',
    },
    {
      id: `${yesterday}_w_2`,
      date: yesterday,
      workerId: 'w_2',
      workerName: 'Suresh Gowda',
      status: 'full',
      wage: 950,
    },
    {
      id: `${yesterday}_w_3`,
      date: yesterday,
      workerId: 'w_3',
      workerName: 'Ganesh Das',
      status: 'full',
      wage: 650,
    },
    {
      id: `${yesterday}_w_4`,
      date: yesterday,
      workerId: 'w_4',
      workerName: 'Manjunath B',
      status: 'half',
      wage: 325,
      note: 'Left at 1:30 PM for clinic',
    },
    {
      id: `${today}_w_1`,
      date: today,
      workerId: 'w_1',
      workerName: 'Ramesh Kumar',
      status: 'full',
      wage: 1100,
    },
    {
      id: `${today}_w_2`,
      date: today,
      workerId: 'w_2',
      workerName: 'Suresh Gowda',
      status: 'full',
      wage: 950,
    },
    {
      id: `${today}_w_3`,
      date: today,
      workerId: 'w_3',
      workerName: 'Ganesh Das',
      status: 'full',
      wage: 650,
    },
  ];

  const seedPayments: Payment[] = [
    {
      id: 'pay_1',
      date: yesterday,
      payee: 'Sri Lakshmi Hardware & Steels',
      payeeType: 'vendor',
      amount: 15000,
      mode: 'UPI',
      note: 'Advance for cement via PhonePe',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_2',
      date: yesterday,
      payee: 'Ramesh Kumar',
      payeeType: 'worker',
      payeeId: 'w_1',
      amount: 1000,
      mode: 'Cash',
      note: 'Weekly advance cash handover',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pay_3',
      date: today,
      payee: 'Shiva Transports',
      payeeType: 'vendor',
      amount: 4500,
      mode: 'Cash',
      note: 'Full settlement for soil dumping',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    settings: DEFAULT_SETTINGS,
    expenses: seedExpenses,
    logs: seedLogs,
    workers: SEED_WORKERS,
    payments: seedPayments,
  };
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function saveExpenses(expenses: Expense[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
}

export function saveLogs(logs: DailyLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs', e);
  }
}

export function saveWorkers(workers: Worker[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  } catch (e) {
    console.error('Failed to save workers', e);
  }
}

export function savePayments(payments: Payment[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error('Failed to save payments', e);
  }
}
