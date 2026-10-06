# RAB Cost Control

MVP project cost control untuk kontraktor: RAB/BOQ, pemakaian material per RAB item, biaya proyek, dashboard budget-vs-actual, dan fondasi integrasi Accurate Online.

## Stack
- Next.js + TypeScript
- PostgreSQL + Prisma
- Dockerfile + Railway config

## Local
1. Copy `.env.example` ke `.env` dan isi `DATABASE_URL` PostgreSQL.
2. `npm install`
3. `npx prisma migrate deploy`
4. `npm run dev`

## Railway
1. Push folder ini ke GitHub.
2. Railway → New Project → Deploy from GitHub Repo.
3. Tambahkan PostgreSQL service. Railway menyediakan `DATABASE_URL` untuk koneksi database.
4. Di web service, buat variable `DATABASE_URL=${{Postgres.DATABASE_URL}}` (sesuaikan nama service Postgres).
5. Generate public domain. Dockerfile dan `railway.json` sudah disertakan; health check: `/api/health`.
6. Tambahkan `APP_URL`, `ACCURATE_CLIENT_ID`, `ACCURATE_CLIENT_SECRET`, `ACCURATE_REDIRECT_URI`, `ACCURATE_SCOPES` setelah aplikasi Accurate didaftarkan.

## API MVP
- `GET/POST /api/projects`
- `GET/POST /api/rab`
- `GET/POST /api/material-issues`
- `GET/POST /api/expenses`
- `GET /api/accurate/status`
- `GET /api/health`

## Accurate Online
Accurate OAuth Authorization Code memerlukan Client ID/Secret dan callback URL terdaftar. API Accurate juga membutuhkan proses pilih/open database dan `X-Session-ID` untuk API database. Implementasi transaksi Accurate sengaja dibuat sebagai integration boundary dulu; endpoint/scope material issue, project dimension, purchase invoice/payment harus dikunci berdasarkan API docs akun developer sebelum production.

## Production notes
Sebelum dipakai customer: tambah auth + tenant isolation, RBAC/approval, audit log, encrypted OAuth token storage, idempotency/outbox sync, retry queue, attachment storage, tests, dan backup policy.


## Railway v5 note
Docker packaging no longer copies an optional `public/` directory. The runtime image also carries the full installed dependency tree so `prisma migrate deploy` is available at startup.

## v6 Product UI
Menu lengkap MVP: Dashboard, Project, RAB/BOQ, Revisi RAB, Procurement (PR/PO/GR/Invoice), Material (Stock/MR/Issue/Return), Project Expense, Cost Control, Reports, Accurate Online, dan Settings.

Fitur yang sudah tersambung database: Project, RAB/BOQ, Material Issue (listing/API), Project Expense, dashboard/cost reports. Menu procurement, stock, material request/return, revision, user/approval adalah product-ready screens yang disiapkan untuk implementasi transaksi berikutnya.
