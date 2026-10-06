# RAB Cost Control v7
RAB hierarchy inspired by the supplied Accurate Desktop reference. Project, Customer, Vendor, and Item are read-only local mirrors of Accurate Online; master maintenance belongs in Accurate Online.

## Deploy
Same Railway Docker/PostgreSQL flow as v6. Run Prisma migration after replacing source. Accurate sync UI is scaffolded; real OAuth/API credentials and endpoint mapping are still required before Sync buttons can pull production data.
