# Drydock Dashboard — Backend API

Backend RESTful API untuk aplikasi **Drydock Dashboard**, dibangun menggunakan **Node.js**, **Express.js**, **Knex.js**, dan database **MySQL**.

---

## 1. Persyaratan Sistem

- **Node.js** (v18 atau lebih baru)
- **MySQL Server** (v8.0 atau MariaDB)
- **Database**: `drydock-express` (default)

---

## 2. Instalasi & Konfigurasi

### A. Clone & Install Dependencies
```bash
cd backend
npm install
```

### B. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env` lalu sesuaikan kredensial database Anda:
```env
PORT=3001
DB_CLIENT=mysql2
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=drydock-express
```

Pastikan database `drydock-express` sudah dibuat di MySQL:
```sql
CREATE DATABASE IF NOT EXISTS `drydock-express`;
```

---

## 3. Database Migration & Seeding

### A. Menjalankan Migrasi
Untuk membuat seluruh tabel database:
```bash
npx knex migrate:latest
```

### B. Menjalankan Seed Data
Untuk mengisi data awal (master vessels, shipyards, specification groups, work orders, checklists, dll.):
```bash
npx knex seed:run
```

---

## 4. Menjalankan Server

### Mode Development (Hot-Reload dengan Nodemon):
```bash
npm run dev
```

### Mode Production:
```bash
npm start
```
Server akan aktif di: `http://localhost:3001` (atau port yang ditentukan di `.env`).

---

## 5. Daftar Endpoint API

### Healthcheck
- `GET /` — Status API

### Master Data
- `GET /api/vessels` — Daftar kapal
- `GET /api/shipyards` — Daftar galangan kapal

### Specification Groups
- `GET /api/specification-groups` — List grup spesifikasi
- `GET /api/specification-groups/:id` — Detail grup
- `POST /api/specification-groups` — Tambah grup baru
- `PUT /api/specification-groups/:id` — Update grup
- `DELETE /api/specification-groups/:id` — Hapus grup

### Work Orders
- `GET /api/work-orders` — List work orders
- `GET /api/work-orders/:id` — Detail work order
- `POST /api/work-orders` — Tambah work order
- `PUT /api/work-orders/:id` — Update work order
- `DELETE /api/work-orders/:id` — Hapus work order

### Sub-Resources Work Orders
- `POST /api/work-orders/:id/sub-jobs` — Tambah sub-job
- `PUT /api/work-orders/:id/sub-jobs/:subId` — Update sub-job
- `DELETE /api/work-orders/:id/sub-jobs/:subId` — Hapus sub-job
- `POST /api/work-orders/:id/spares` — Tambah spare part
- `DELETE /api/work-orders/:id/spares/:rowId` — Hapus spare part
- `POST /api/work-orders/:id/attachments` — Tambah lampiran
- `PUT /api/work-orders/:id/attachments/:rowId` — Update lampiran
- `DELETE /api/work-orders/:id/attachments/:rowId` — Hapus lampiran
- `GET /api/work-orders/:id/tasks` — List task work order
- `POST /api/work-orders/:id/tasks` — Tambah task
- `PUT /api/work-orders/:id/tasks/:taskId` — Update task
- `DELETE /api/work-orders/:id/tasks/:taskId` — Hapus task
- `POST /api/work-orders/:id/purchase-orders` — Tambah purchase order
