# RAB Cost Control v10.2

Baseline RAB / project cost control dengan Project lokal-hybrid dan integrasi Accurate Online OAuth Authorization Code.

## Railway variables minimum

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
APP_URL=https://DOMAIN-APLIKASI.up.railway.app
ACCURATE_CLIENT_ID=...
ACCURATE_CLIENT_SECRET=...
ACCURATE_REDIRECT_URI=https://DOMAIN-APLIKASI.up.railway.app/api/accurate/callback
ACCURATE_SCOPES=item_view customer_view vendor_view
```

`ACCURATE_REDIRECT_URI` harus sama persis dengan URL OAuth Callback pada Accurate Developer.

## Flow Accurate v10.2

1. Buka **Integrasi > Accurate Online**.
2. Klik **Hubungkan Accurate**.
3. Login Accurate dan Beri Akses.
4. Callback menukar authorization code menjadi access token dan refresh token.
5. Klik **Pilih Database**. Aplikasi memanggil `db-list.do` lalu `open-db.do` dan menyimpan host/session.
6. Klik **Sync Sekarang** untuk menarik Customer, Vendor, dan Item ke master lokal.
7. Project tetap dapat dibuat lokal kapan pun, sehingga RAB tidak tergantung Accurate.

Token OAuth dan session disimpan terenkripsi. Jika `ACCURATE_TOKEN_ENCRYPTION_KEY` tidak diisi, key diturunkan dari `ACCURATE_CLIENT_SECRET`. Jangan mengubah Client Secret setelah koneksi dibuat tanpa melakukan koneksi ulang Accurate.

## Project local -> Accurate

Endpoint Project/Proyek tidak di-hardcode karena nama endpoint dan scope harus mengikuti **Daftar API** yang tersedia pada aplikasi Accurate Developer Anda. Setelah memastikan endpoint yang benar, isi:

```env
ACCURATE_PROJECT_LIST_PATH=/accurate/api/.../list.do
ACCURATE_PROJECT_SAVE_PATH=/accurate/api/.../save.do
```

Jika `ACCURATE_PROJECT_LIST_PATH` terisi, **Sync Accurate** mencoba pull Project dan otomatis memetakan project lokal yang kodenya sama. Jika `ACCURATE_PROJECT_SAVE_PATH` terisi, Project lokal menampilkan tombol **Kirim ke Accurate**.

## Endpoint master override

Jika nama endpoint pada API Docs akun Anda berbeda, override:

```env
ACCURATE_CUSTOMER_LIST_PATH=/accurate/api/customer/list.do
ACCURATE_VENDOR_LIST_PATH=/accurate/api/vendor/list.do
ACCURATE_ITEM_LIST_PATH=/accurate/api/item/list.do
```

## Build

```bash
npm install
npx prisma validate
npx prisma generate
npm run build
```

Railway menjalankan migrasi melalui Docker start command sebelum server aktif.


## OAuth callback compatibility
Both `/api/integrations/accurate/callback` and `/api/accurate/callback` are accepted. Recommended: `/api/integrations/accurate/callback`.
