# Resources: NovaBank ACC Bootcamp

This folder holds everything the labs need that the bootcamp page only described: data files, schema XML, email and web page HTML, scripts, Message Center payloads, workflow designs and checklists. It also has two workbooks:

- **[`NovaBank_Data_Mapping.xlsx`](NovaBank_Data_Mapping.xlsx)**: every table, field, link, enumeration, index and file-to-schema mapping. The schema XML files were generated from it.
- **[`ACC_Bootcamp_Master.xlsx`](ACC_Bootcamp_Master.xlsx)**: the programme in one workbook. It covers the curriculum, assignments, rubrics, a resource inventory, schedule, learner progress tracker, the 75-question bank, checklists, a security matrix and a glossary.

All data is synthetic. NovaBank is fictional, and every address is `@novabank.test`. Use a **non-production** instance.

---

## Gap analysis: what the bootcamp page had, and what was missing

The bootcamp page (`../index.html`) contains 7 levels, 60 modules, 14 assignments, a capstone and a 75-question mock exam. Its code samples were inline snippets. Labs referred to files, schemas and pages that learners had no copy of. The table below lists each gap and the file that now closes it.

| Area | Page referenced | Gap | Resolved by |
|---|---|---|---|
| Customer data | A1 "import `nvb_customers.csv` (200 rows)"; A6 re-import | No file, no reject cases, no update file | `01-data/nvb_customers.csv` (200 valid + 4 invalid + 2 duplicates), `nvb_customers_update.csv` |
| Lists and exclusions | A4/A5 "NVB Staff" list; A2 subscribers | No files | `nvb_staff.csv`, `nvb_insights_subscribers.csv` |
| Data model | A6, A7 schemas (partial XML inline) | No complete, importable XML; no forms or navigation hierarchy; staging, run-log, consent and FFDA schemas only mentioned | `02-schemas/` (11 schemas, 3 forms, 1 navtree, the A8 review file) plus the mapping workbook |
| Account / product / transaction data | A7, A9 | No data; A9 test plan needed 5 specific files | `nvb_accounts.csv`, `nvb_products.csv`, `nvb_account_products.csv`, `nvb_txn_20260930…20261003.csv` (clean / invalid + unmatched / corrections / empty) |
| Email HTML | M09 base template; A1, A2, A5 (A/B), A7, capstone journey, A12 transactional | None supplied | `03-email/` (18 HTML files + `subject_lines.csv`) |
| SMS | M11 encoding lab; A2, A5, A12 | No templates, no character counts | `04-sms/sms_templates.csv` (encoding, length and parts calculated) |
| Web pages | M47 preference center; A5 landing page; capstone consent | No HTML, no scripts | `05-webapps/` (preference center, thanks page, landing page, preload/storage scripts) |
| JSSP | M48 points to the project JSSP course | Sources lived only in a project doc | `06-jssp/` (pulseDebug, pulseApi, pulse, mcBridge) |
| Workflow code | A3 D9, A4, A5, A9–A11, M52 | Fragments spread across modules | `07-scripts/` (library + per-assignment scripts + data generators) |
| Message Center | A12 event types, Node client, 20 test events | No payloads, no client | `08-message-center/` |
| Workflow designs | A3–A5, A9–A11, capstone | No diagrams or expected counts | `09-workflows/workflow_designs.md` |
| Governance | QC (M33), design review (M50), runbook, verify list | Only inside the page | `10-checklists/checklists.md`, master workbook |
| FDA, verification | M40 external table; expected results | No SQL | `11-sql/` |
| Other lab data | M13 direct mail, M29 bounces, M52 events, M55 offers, A13 security, A14 scores, capstone consent | None | `nvb_direct_mail_extract_spec.csv`, `nvb_bounce_test.csv`, `nvb_events.csv`, `nvb_offers.csv`, `nvb_security_matrix.csv`, `nvb_scores_20261001.csv` + generator, `nvb_consents.csv` |

---

## Folder map

| Folder | What's inside | Main users |
|---|---|---|
| `01-data` | 19 CSV files | All levels |
| `02-schemas` | Source schemas `nvb_*.xml`, forms, navtree, A8 review file | L4, L5, L6 |
| `03-email` | Email HTML with Campaign personalisation, alert bodies, subject lines | L1, L3, L4, L6, capstone |
| `04-sms` | SMS templates with GSM-7 / UCS-2 analysis | L1, L3, L6 |
| `05-webapps` | Preference center, landing page, web app scripts | L5, capstone |
| `06-jssp` | JSSP reference pages | L5, L6 |
| `07-scripts` | `nvb_utils.js`, workflow and typology scripts, generators | L2–L6 |
| `08-message-center` | Event types, payloads, Node.js client | A12 |
| `09-workflows` | Workflow build specs and diagrams | L2, L3, L5, capstone |
| `10-checklists` | Lab setup, QC, design review, runbook, verify list | All |
| `11-sql` | FDA table, verification queries | L4, L5 |

## Recommended build order

1. Read `NovaBank_Data_Mapping.xlsx` (the Schema_Catalog and Attribute_Mapping sheets).
2. Import the schemas in this order, running **Update database structure** after each group:
   1. `nvb_recipient`
   2. `nvb_product`, `nvb_account`, `nvb_accountProduct`, `nvb_transaction`
   3. `nvb_txnStaging`, `nvb_runLog`, `nvb_consent`
   4. v8 FFDA only: `nvb_event`, `nvb_score`
   5. FDA lab only: `nvb_crmLead`
3. Create the user enumerations `nvbPreferredLanguage` and `nvbBranchCity` (values are in the Enumerations sheet).
4. Load the data: customers → products → accounts → account products → consents → transactions (through the A9 workflow).
5. Create the JavaScript code `nvb:utils.js`, then build the workflows from `09-workflows`.
6. Create the delivery template `NVB_Email_Base` from `03-email/00_NVB_Email_Base.html`, then the web apps from `05-webapps`.

## Things to check on your instance

Anything marked **VERIFY** in these files differs between Campaign builds. The full list is in `10-checklists/checklists.md` §5 and in the master workbook (Verify_List sheet). Check each item on a development instance first.
