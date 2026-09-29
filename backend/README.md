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

## 4. Catatan Troubleshooting & Solusi Teknis

### Error: `Unknown column 'active' in 'field list'` pada `10_checklists.js`

#### Penyebab:
Di dalam file seeder `seeds/10_checklists.js`, terdapat pemeriksaan kondisional untuk mendeteksi apakah tabel `checklists` memiliki kolom `active` atau tidak:
```javascript
// SEBELUM (SALAH - sintaks alias SQL):
const hasActive = await knex('checklists', 'active');
```
- Di Knex, `knex('tableName', 'alias')` adalah sintaks untuk memberikan table alias (`SELECT * FROM checklists AS active`).
- Hasil query mengembalikan **Array** baris (`[]`).
- Di JavaScript, **Array kosong `[]` bernilai TRUTHY** (`Boolean([]) === true`).
- Akibatnya, `hasActive` selalu bernilai `true`, sehingga Knex memaksakan insert properti `active: true/false`.
- Karena pada migrasi tabel `checklists` **tidak ada kolom `active`**, MySQL melempar error `Unknown column 'active' in 'field list'`.

#### Solusi yang Diterapkan:
Pemeriksaan diganti menggunakan Knex Schema Builder yang resmi:
```javascript
// SESUDAH (BENAR - schema column check):
const hasActive = await knex.schema.hasColumn('checklists', 'active');
```
Fungsi `knex.schema.hasColumn` mengembalikan `Promise<boolean>`:
- Jika kolom `active` tidak ada di database, fungsi mengembalikan `false`.
- Seeder otomatis hanya meng-insert kolom `{ name, description }` tanpa kolom `active`.
- `npx knex seed:run` berjalan 100% sukses tanpa error.

---

### Panduan Modul Checklist: Pembaruan Method `exports.show` (`work-orders.controller.js`)

#### Posisi Penempatan Kode:
Kode pembacaan checklist diletakkan di dalam method `exports.show`:
1. **SETELAH** blok `const [subJobs, ...] = await Promise.all([ ... ]);` (pengambilan data anak).
2. **SEBELUM** pemanggilan `ok(res, { ... });`.
3. Di dalam objek `ok(res, { ... })`, ganti `checklists: []` menjadi `checklists`.

```javascript
// File: src/controllers/work-orders.controller.js

exports.show = asyncHandler(async (req, res) => {
    const wo = await knex('work_orders as wo')
        .leftJoin('specification_groups as sg', 'wo.spec_group_id', 'sg.id')
        .leftJoin('vessels as v', 'wo.vessel_id', 'v.id')
        .where('wo.id', req.params.id)
        .select('wo.*', 'sg.name as spec_group_name', 'v.name as vessel_name')
        .first();
    if (!wo) throw new ApiError(404, 'Work order tidak ditemukan');

    // 1. Ambil data anak work order secara paralel
    const [subJobs, spares, attachments, tasks, purchaseOrders] = await Promise.all([
        knex('sub_jobs').where('work_order_id', wo.id).orderBy('id'),
        knex('work_order_spares as ws')
            .join('spares as s', 'ws.spare_id', 's.id')
            .where('ws.work_order_id', wo.id)
            .select('ws.id', 's.name', 'ws.expected_qty', 'ws.cost'),
        knex('attachments').where('work_order_id', wo.id),
        knex('tasks').where('work_order_id', wo.id).orderBy('id'),
        knex('purchase_orders').where('work_order_id', wo.id).orderBy('id'),
    ]);

    // =========================================================================
    // 2. KODE TAMBAHAN TUTORIAL (Pembacaan Checklist + Items + Answers):
    // =========================================================================
    const checklists = await knex('work_order_checklists as wc')
        .join('checklists as c', 'wc.checklist_id', 'c.id')
        .where('wc.work_order_id', wo.id)
        .select('wc.*', 'c.name', 'c.description');

    // Sertakan item + jawaban untuk setiap checklist yang diterapkan
    for (const wc of checklists) {
        const items = await knex('checklist_items').where('checklist_id', wc.checklist_id).orderBy('sort_order');
        const answers = await knex('checklist_answers').where('work_order_checklist_id', wc.id);
        const answerMap = Object.fromEntries(answers.map((a) => [a.checklist_item_id, a.value]));
        wc.items = items.map((i) => ({
            ...i,
            options: i.options ? JSON.parse(i.options) : [],
            value: answerMap[i.id] ?? ''
        }));
    }

    // =========================================================================
    // 3. Sertakan variabel checklists ke dalam response:
    // =========================================================================
    ok(res, {
        ...wo,
        sub_jobs: subJobs,
        spares,
        attachments,
        tasks,
        purchase_orders: purchaseOrders,
        checklists, // <-- Menggantikan checklists: []
    });
});
```

*(Catatan: Menaruh query `work_order_checklists` langsung sebagai elemen ke-6 di dalam array `Promise.all` juga valid dan lebih efisien karena query database berjalan paralel).*

---

## 5. Menjalankan Server

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

## 6. Daftar Endpoint API

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
