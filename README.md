# 🏠 House Build Tracker

> **Every rupee and every workday of your house build, in one place.**

House Build Tracker is a fast, responsive mobile-and-web Progressive Web Application designed specifically for owner-builders managing a home construction project in India. It replaces the traditional paper notebook with instant entry (<15 seconds), live calculation of pending dues, daily worker attendance logs, bill receipt photo capture, and seamless two-way Google Sheets sync.

---

## ✨ Features Implemented

### 1. 📊 Summary Dashboard
- **Stat Cards**: Total Budget, Total Cost, Total Paid, Pending Dues, Budget Remaining.
- **Rule-based Indicators**:
  - Budget remaining turns red when negative (`< 0`).
  - Pending dues turn red when above zero (`> 0`).
  - Total Paid and settled dues styled in positive green (`#237A3B`).
- **Category Proportion Bars**:
  - 8px high progress bars with Clay tint track (`#FBEEE5` / `#33241A`) and Terracotta fill (`#B4531F` / `#E8814A`).
  - Daily wages appear automatically as their own category (`Labour (daily wages)`).
  - Category budget tracking with "Over Budget" warning badges.
- **Pending Dues by Person / Vendor**:
  - Live calculation: `Pending = (Expenses for vendor) + (Wages for worker) - (Payments to payee)`.
  - Shows Owed, Paid, and Net Balance with `Due`, `Advance`, or `Settled` badges.
  - One-click **"Record payment"** shortcut that pre-fills the payee and balance in the payments form.

### 2. 💰 Expenses Management
- **Quick Entry Form (<15 seconds)**:
  - Date (defaults to today, device date picker).
  - Category chips: *Foundation, Cement & Steel, Bricks & Sand, Plumbing, Electrical, Painting, Tiles & Flooring, Carpentry & Doors, Transport, Permits & Fees, Other*, plus auto-suggested custom categories.
  - Vendor autocompletion linked across existing records.
  - Indian Rupee amount with numeric keypad support.
  - **Bill / Receipt Photo Capture (v2)**: Snap camera photo or select file, client-side compression (<150KB), thumbnail preview, and full-screen lightbox preview.
- **Search & Filtering (v2)**:
  - Search by item, vendor, or notes.
  - Filter by category with live entry count.
- **Two-Tap Safe Delete**:
  - Tap "Delete" ➔ changes to "Tap again" with a 3-second auto-reset safety window.
- **Full Edit Modal**: Edit past expense entries seamlessly.

### 3. 👷 Daily Log & Attendance
- **Daily Attendance Marking**:
  - Date picker with quick Previous / Next Day navigation buttons.
  - Daily summary stat banner (Full, Half, Absent counts and total day's wage).
  - Segmented 3-button control: `Full (100% wage)`, `Half (50% wage)`, `Absent (0)`. Selected option is filled Terracotta.
  - Re-marking the same worker and date updates the wage calculation in real-time.
  - **Overtime & Custom Wage (v2)**: Support for exact wage inputs or overtime bonuses.
- **Worker Management**:
  - Add workers with Name, Trade/Role (Mason, Helper, Carpenter, etc.), and Daily Wage Rate.
  - Days worked and total earned summary per worker.

### 4. 💳 Payments & Disbursements
- **Quick Disbursement Entry**:
  - Date, Paid To (autocomplete dropdown of all workers and expense vendors).
  - Payment mode selector: `Cash`, `UPI`, `Bank`, `Cheque`.
  - UPI / payment screenshot attachment with compression and lightbox preview.
  - Confetti celebration upon recording disbursements!
- **Payment Log**:
  - Sorted newest first with bold green amounts, payment mode tags, notes, and 2-tap delete.

### 5. 📑 5-Sheet Excel Export
- Generates a formatted `.xlsx` workbook on demand with 5 distinct sheets:
  1. `Summary` (Project budget, totals, category breakdown, pending dues ledger)
  2. `Expenses` (Date, Category, Item, Vendor, Amount, Note)
  3. `Daily log` (Date, Worker, Attendance Status, Wage, Note)
  4. `Workers` (Worker ID, Name, Role, Rate, Days Worked, Total Earned)
  5. `Payments` (Date, Payee, Amount, Mode, Type, Note)

### 6. ☁️ Google Sheets Sync (Google Apps Script)
- **Local-First Architecture**:
  - Works 100% offline with zero setup required.
  - Top status pill clearly displays *"Saved on this device only"* or *"Synced with Google Sheet"*.
- **Ready-to-Deploy Backend (`google-apps-script/Code.gs`)**:
  - Open a Google Sheet ➔ Extensions ➔ Apps Script ➔ Paste `Code.gs` ➔ Deploy as Web App.
  - Paste Web App URL in App Settings ➔ 1-click test connection & sync.

---

## 🎨 Brand & Design Compliance

| Element | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| **Background (Plaster)** | `#F6F3EE` | `#17150F` | Page background |
| **Surface (White)** | `#FFFFFF` | `#221F17` | Cards & surface |
| **Text (Charcoal)** | `#1F2328` | `#F1EDE4` | Headings & body |
| **Muted Text (Stone)** | `#6B7280` | `#A39D8F` | Labels & secondary info |
| **Border (Sand)** | `#E5E0D6` | `#383327` | Card & input borders |
| **Primary (Terracotta)** | `#B4531F` | `#E8814A` | Main actions, active tabs |
| **Primary Tint (Clay)** | `#FBEEE5` | `#33241A` | Progress track, soft badges |
| **Positive (Green)** | `#237A3B` | `#5EC27A` | Paid & settled balances |
| **Negative (Red)** | `#B42318` | `#F27A6D` | Pending dues & over budget |

- **Typography & Numbers**: System font (instant load outdoors), Indian numbering system (`₹1,25,000`).
- **Cards**: 12px rounded corners, 1px Sand border, 14px padding.
- **Buttons & Inputs**: 8px rounded corners, 40px+ tap targets.
- **Responsiveness**: Max 900px centered on desktop; fully responsive down to 360px phones with notch/safe-area support.

---

## 🚀 Getting Started

### Local Development
```bash
# Navigate to project directory
cd /Users/ruthvikp/.gemini/antigravity/scratch/house-build-tracker

# Install dependencies
pnpm install

# Run Vite dev server
pnpm dev
```
Open [http://localhost:5174](http://localhost:5174) on your desktop or [http://192.168.1.4:5174](http://192.168.1.4:5174) on your mobile phone on the same Wi-Fi.

### Production Build
```bash
pnpm build
```
Generates production-optimized static assets in `dist/`.
