# Verification queries (NovaBank ACC Bootcamp)

Run these on a **DEV** database (or rewrite them as queryDefs on FFDA). Column names follow Campaign's generated naming (`s` string, `i` integer/boolean, `d` double, `ts` date/datetime): check the SQL script produced by *Update database structure* before running.

| # | Check | Assignment | SQL |
|---|---|---|---|
| 1 | Customers imported, no duplicate customerId | A1, A6 | `SELECT sCustomerId, COUNT(*) FROM NmsRecipient GROUP BY sCustomerId HAVING COUNT(*) > 1;` (expect 0 rows) |
| 2 | Re-import updated, not duplicated | A6 | `SELECT COUNT(*) FROM NmsRecipient WHERE sEmail LIKE '%@novabank.test';` (same count before and after `nvb_customers_update.csv`) |
| 3 | Accounts per band | A7 | `SELECT CASE WHEN dBalance >= 500000 THEN 'HIGH' WHEN dBalance >= 50000 THEN 'MID' ELSE 'LOW' END band, COUNT(*) FROM NvbAccount GROUP BY 1;` |
| 4 | Cascade delete works | A7 | Delete one test recipient in the console, then `SELECT COUNT(*) FROM NvbAccount WHERE iRecipientId = <id>;` (expect 0) |
| 5 | Transactions loaded per file | A9 | `SELECT sFileName, COUNT(*) FROM NvbTxnStaging GROUP BY sFileName;` (20260930 → 1000, 20261001 → 970 before reconciliation) |
| 6 | Upserts, not duplicates | A9 | `SELECT sTxnId, COUNT(*) FROM NvbTransaction GROUP BY sTxnId HAVING COUNT(*) > 1;` (expect 0 after loading 20261002) |
| 7 | Run log | A9–A11 | `SELECT sWorkflow, sStep, sStatus, iCount, sFileName, tsLogDate FROM NvbRunLog ORDER BY tsLogDate DESC;` |
| 8 | Purge window | A10 | `SELECT COUNT(*) FROM NvbTxnStaging WHERE tsLoadDate < CURRENT_DATE - 14;` (expect 0 after housekeeping) |
| 9 | Latest consent per purpose | Capstone | `SELECT iRecipientId, sPurpose, MAX(tsEventDate) FROM NvbConsent GROUP BY iRecipientId, sPurpose;` |
| 10 | Unmatched FDA leads | M40 | Query `nvb:crmLead` in the console with a filter on "no recipient with this email" |
