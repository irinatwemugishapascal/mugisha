# SIMS — Stock Inventory Management System

[How this maps to the generic EPMS marking rubric (and what differs) → `EXAM_CHECKLIST_MARKING.md`](EXAM_CHECKLIST_MARKING.md)

## ERD (Entity Relationship Diagram) — for your paper

Draw this on **plain paper** with standard symbols: **entities (rectangles)**, **relationships (diamonds or simple lines)**, **primary keys (PK)**, **foreign keys (FK)**, and **cardinalities (1, N)**.

### 1) Entity: `User` (login / session)

| Field          | Type    | Key |
|----------------|---------|-----|
| `userId`       | (PK)    | PK  |
| `username`     | String  |     |
| `passwordHash` | String  |     |

- **No foreign keys.** Use this only for authentication (session). You can draw it **separate** from the stock model (no line to Spare part / stock tables), unless your assessor wants a line—usually **not required**.

---

### 2) Entity: `Spare_Part` (catalog + current stock)

| Field        | Type    | Key |
|-------------|---------|-----|
| `sparePartId` / `_id` | (id) | **PK** |
| `name`      | String  |     |
| `category`  | String  |     |
| `quantity`  | Number  |     |
| `unitPrice` | Number  |     |
| `totalPrice`| Number  |     |

- One row = one part type (e.g. oil filter) with **current** quantity in stock and price fields as in the exam.

---

### 3) Entity: `Stock_In` (parts received into store)

| Field            | Type   | Key |
|------------------|--------|-----|
| `stockInId` / `_id` | (id) | **PK** |
| `sparePartId`    | ref    | **FK → `Spare_Part.sparePartId`** |
| `stockInQuantity`| Number |     |
| `stockInDate`    | Date   |     |

---

### 4) Entity: `Stock_Out` (parts taken from store)

| Field                 | Type   | Key |
|------------------------|--------|-----|
| `stockOutId` / `_id`  | (id)   | **PK** |
| `sparePartId`         | ref    | **FK → `Spare_Part.sparePartId`** |
| `stockOutQuantity`    | Number |     |
| `stockOutUnitPrice`  | Number |     |
| `stockOutTotalPrice` | Number |     |
| `stockOutDate`        | Date   |     |

---

### Relationships and cardinality

| Relationship | From | To | Cardinality (typical) |
|--------------|------|-----|------------------------|
| **Supplies to stock in** | `Spare_Part` | `Stock_In` | **1 : N** (one part type, many stock-in rows over time) |
| **Supplies to stock out** | `Spare_Part` | `Stock_Out` | **1 : N** (one part type, many stock-out rows over time) |
| | `Stock_In` | `Spare_Part` | each row **N : 1** (many stock-in rows point to one part) |
| | `Stock_Out` | `Spare_Part` | each row **N : 1** (many stock-out rows point to one part) |

- **There is no direct relationship** between `Stock_In` and `Stock_Out` (no FK between them); they both only link to **`Spare_Part`**.

### Small diagram (ASCII — for copy on paper)

```
  ┌──────────┐       1          N  ┌───────────┐
  │  User    │  (no FK to stock)  │ Spare     │
  │  PK: id  │                    │  _Part     │
  └──────────┘                    │  PK: id  │
                                  └─────┬─────┘
                    ┌──────────────────┼──────────────────┐
                1   │  N            1  │  N
          ┌─────────▼──────┐   ┌───────▼──────────┐
          │  Stock_In      │   │  Stock_Out     │
          │  PK, FK→Spare  │   │  PK, FK→Spare  │
          └────────────────┘   └────────────────┘
```

**Summary sentence:** *One spare part can have many stock-in records and many stock-out records; each stock-in and stock-out row references exactly one spare part.*

---

Practical exam project  : full-stack app with **MongoDB**, **Express**, **React**, **Tailwind**, **session login**, **Axios**.

## Exam rules implemented

| Requirement | How |
|-------------|-----|
| ERD: Spare_Part, Stock_In, Stock_Out (PK/FK) | On paper; backend uses `SparePart` with refs from `StockIn` / `StockOut` |
| DB name **SIMS** | `MONGO_URI` → database `sims` |
| Insert on Spare Part, Stock In, Stock Out | `POST` only (no update/delete) on spare parts and stock in |
| Update / delete / list only on **Stock Out** | `GET`, `PUT`, `DELETE` on `/api/stock-out/:id` |
| Menu: Spare Part, Stock In, Stock Out, **Reports**, **Logout** | `AppLayout.jsx` |
| Session login, **strong encrypted password** | Bcrypt; register requires 8+ chars, upper, lower, number |
| Tailwind, responsive, Axios | Vite + `@tailwindcss/vite` |
| Reports: **daily stock status** + **daily stock out** | `GET /api/reports/daily-stock-status?date=`, `GET /api/reports/daily-stockout?date=` |

## Ports (avoids clash with EPMS on same machine)

- Backend: **5001** (configurable in `.env`)
- Frontend: **5174** (Vite)
- `FRONTEND_URL` in backend `.env` should match the Vite URL

## Run

```bash
cd sims/backend
cp .env.example .env
npm install
npm run dev
```

```bash
cd sims/frontend
npm install
npm run dev
```

- API: [http://localhost:5001/api/health](http://localhost:5001/api/health)  
- App: [http://localhost:5174](http://localhost:5174)

## Project layout

```
sims/
  backend/    Node + Express + Mongoose
  frontend/   React + Vite + Tailwind
  README.md
```

