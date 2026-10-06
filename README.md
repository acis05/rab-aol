# RAB Cost Control v7
RAB hierarchy inspired by the supplied Accurate Desktop reference. Project, Customer, Vendor, and Item are read-only local mirrors of Accurate Online; master maintenance belongs in Accurate Online.

## Deploy
Same Railway Docker/PostgreSQL flow as v6. Run Prisma migration after replacing source. Accurate sync UI is scaffolded; real OAuth/API credentials and endpoint mapping are still required before Sync buttons can pull production data.

## v9 workflow baseline
RAB CRUD, Purchase Request, Purchase Order, Goods Receipt, Vendor Invoice, Material Request, Material Issue, Material Return, Project Expense, cost-control reports, and Accurate-owned read-only masters are wired to PostgreSQL. Accurate OAuth/sync remains the external integration boundary and requires real Accurate Developer credentials.

## v10 — Hybrid Project
Project sekarang dapat dibuat/edit secara lokal tanpa Accurate Online. `accurateId` bersifat opsional. Setelah integrasi Accurate aktif, project lokal dapat dimapping/sync tanpa menghalangi workflow RAB.
