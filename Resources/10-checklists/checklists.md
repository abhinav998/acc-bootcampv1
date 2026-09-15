# NovaBank bootcamp checklists

These are the printable versions. The same lists are in `ACC_Bootcamp_Master.xlsx`, where you can tick them off and record evidence.

## 1. Lab setup (before Level 1)

- [ ] You have a non-production instance and an operator account in a sandbox folder
- [ ] The `nvb` namespace is reserved (Administration › Platform › Namespaces)
- [ ] Folders exist: `NovaBank / Recipients`, `Workflows` (`nvbWorkflows`), `Deliveries`, `Lists`, `Campaigns`
- [ ] You have a test email domain with inboxes you control (all data uses `@novabank.test`; map it to your own test domain)
- [ ] A test SFTP account has `/in`, `/out`, `/rejects` and `/archive` folders
- [ ] A test mobile device is registered for push (Level 1, M12)
- [ ] An SMS test route exists, or a simulator for SMS labs
- [ ] A package definition `NVB_Bootcamp` has been created on day one
- [ ] The `01-data` files have been reviewed. They are synthetic; never load real customer data

## 2. Campaign QC (M33, used from A1 onward)

| Stage | Check | Evidence |
|---|---|---|
| Brief | Audience, exclusions, channel, schedule, offer code, legal copy, and DLT template ID for SMS | Brief doc |
| Build | Built from a template; naming convention followed; typology set; tracking formula; seed list; control group | Screenshot of the properties |
| Target | Count within ±5% of the brief; exclusions applied; no duplicates; denylist respected; 20 sample rows reviewed | Analysis log |
| Content | Personalisation fallbacks work; every link is tracked and live; subject and preheader set; unsubscribe and mirror page present; renders on mobile | Proof screenshots |
| Approval | Proof sign-off recorded; target approval given in Campaign | Approval log |
| Send | Schedule, waves and validity period set; first-hour bounce rate below 3% | Delivery dashboard |
| Post-send | Target, processed and delivered counts reconciled; report shared; issues logged | Report |

## 3. Technical workflow design review (M50, A9–A11)

- [ ] Naming and description follow the convention
- [ ] An owner and a supervisor group are set
- [ ] A fixed staging table is used, with no dynamic or date-suffixed table names
- [ ] A rerun is safe: upsert on a business key, and processed files are skipped
- [ ] A lock is in place, with stale-lock handling
- [ ] Guards stop the workflow on zero volume or a sharp drop in volume
- [ ] Every data activity has an error transition that leads to an alert
- [ ] Run log rows are written at start, end and failure
- [ ] "Keep interim results" and SQL logging are both off
- [ ] The schedule has been checked against the heatmap and the cleanup window
- [ ] A runbook exists (use the template below)

## 4. Runbook template

```
Workflow:            NVB_TW_...
Purpose:
Owner / backup:
Schedule (IST):
Inputs:              files / tables / signals (with variables)
Outputs:             tables / files / signals
Dependencies:        upstream / downstream workflows
Alerts go to:        operator group
Normal run time:     ~ min      Normal volume: ~ rows
Rerun steps:         1) check run log  2) clear lock option NVB_LOCK_<name> if stale  3) restart
Known failures:      SFTP down → ... ; volume guard → ... ; unmatched accounts → ...
Data retention:      staging 14 days, run log 180 days
```

## 5. Items to check on your own instance

These vary between Campaign builds. Check each one on a development instance before you rely on it.

| Item | Where it appears |
|---|---|
| Meaning of the final flag in `xtk.workflow.PostEvent` | M21, A3 D9, A9, A11 |
| `xtk:workflow` `@state` value for a paused workflow | A10 |
| `keyfield` syntax for keys built on links | `nvb_accountProduct.xml` |
| Where `dataSource` goes in FFDA schemas | `nvb_event.xml`, `nvb_score.xml` |
| Whether `addDays` and `parseTimeStamp` are available and what format they expect | A9, A10, `nvb_utils.js` |
| Option `NmsTracking_ClickFormula` | M15 |
| Delivery indicator field names | A5 |
| `rtEvent` `wishedChannel` values | A12 |
| Personalisation block internal names (`MirrorPageUrl`) and link attributes (`_type`) | `03-email` |
| Field names in `nms:address` (quarantine) | A10 |
| Named-right names | A13 |
