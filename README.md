# Adobe Campaign Classic Bootcamp

A zero-to-expert, hands-on bootcamp for Adobe Campaign Classic (v7 and v8). All labs use **NovaBank**, a fictional retail bank, so no real client data is involved.

**Open `index.html` in a browser** (or enable GitHub Pages on this repo) to use the interactive version:

- level tabs, collapsible modules and a full-text search (press `/`)
- a progress dashboard: modules done, the next module, assignments submitted with your own scores, and your best mock exam result
- a self-scoring mock exam with instant feedback, domain filters, a review mode for wrong answers and a 90-minute timer
- an SMS length and encoding calculator in M11, copy buttons on code samples, a filter on the Resources tab, links to individual modules and a light/dark theme toggle

## At a glance

| | |
|---|---|
| Levels | 7 (+ capstone) |
| Modules | 60 |
| Graded assignments | 14 |
| Lab resources | 82 files: data, schemas, email/web HTML, scripts, 2 Excel workbooks |
| Mock exam | 75 questions, mapped to the AD0-E331 developer exam areas and practitioner topics |
| Effort | ~8–10 weeks part-time |

## Curriculum

| Level | Focus | Modules | Assignments |
|---|---|---|---|
| L0 Orientation | Adobe stack, v7 vs v8, architecture, console, vocabulary | M01–M05 | Quiz |
| L1 Foundation | Data model, queries, email/SMS/push/direct mail, subscriptions, tracking, reports | M06–M16 | A1 Welcome email · A2 Multi-channel reminder |
| L2 Workflows | Work table, full activity palette, variables, signals, error handling, approvals | M17–M24 | A3 Ten activity drills · A4 Monthly segmentation |
| L3 Campaign ops | Programs, typology rules, A/B, bounces, response manager, QC framework | M25–M33 | A5 Credit card cross-sell |
| L4 Schemas | Schema anatomy, keys, links & integrity, extensions, enumerations, FDA, target mappings, forms, FFDA rules | M34–M43 | A6 Extend recipient · A7 NovaBank data model · A8 Schema defect review |
| L5 Dev + technical workflows | JSAPI, libraries, personalisation, web apps, JSSP, content management, technical workflow design | M44–M50 | A9 Daily ingestion · A10 Housekeeping · A11 Orchestration |
| L6 Integration + admin | SOAP, v8 staging APIs, external accounts, Message Center, Interaction, Experience Cloud, security, packages, deliverability, privacy, v7→v8 | M51–M60 | A12 Transactional OTP · A13 Security + packages · A14 FFDA redesign |
| Capstone | NovaBank Lifecycle Program | — | 100 pts |

## Resources

The [`Resources`](Resources) folder is the lab kit. It holds the synthetic NovaBank data, importable schema XML, email and web page HTML, SMS templates, JSSP pages, workflow scripts, Message Center payloads, workflow designs, checklists and SQL. Start with:

- [`Resources/NovaBank_Data_Mapping.xlsx`](Resources/NovaBank_Data_Mapping.xlsx): database mapping and definitions for every schema
- [`Resources/ACC_Bootcamp_Master.xlsx`](Resources/ACC_Bootcamp_Master.xlsx): curriculum, assignments, rubrics, inventory, schedule, learner tracker and question bank
- [`Resources/README.md`](Resources/README.md): gap analysis, folder map and build order

The page also has a **Resources** tab that links every file, and each assignment lists the files it needs.

## Using it

- Work on a **non-production** instance, in your own namespace (`nvb` in the examples).
- Code marked **"verify on your instance"** (e.g. `PostEvent` flags, workflow state values, FFDA `dataSource` placement) differs across builds. Check it before production use.
- Progress and exam answers are stored only in your own browser.

## Sources

Built from Adobe Experience League (Campaign Classic v7 and Campaign v8 documentation), the [AdobeDocs/campaign-classic.en](https://github.com/AdobeDocs/campaign-classic.en) repository, and certification objectives. The full source list is in the **Glossary + sources** tab.

*Not affiliated with or endorsed by Adobe. Adobe Campaign is a trademark of Adobe Inc.*
