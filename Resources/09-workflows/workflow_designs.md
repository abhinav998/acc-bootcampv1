# NovaBank workflow designs

Build specifications for every workflow in the bootcamp. Each one lists its activities, their settings, and the expected counts when you use the files in `01-data`. The diagrams render on GitHub.

Naming: `NVB_<TW|CW|TPL|DRILL>_<SUBJECT>_<FREQUENCY>`. Folder: `NovaBank / Workflows` (internal name `nvbWorkflows`).

---

## A3: activity drills (D1–D10)

| Drill | Workflow | Activities and key settings | Expected result with bootcamp data |
|---|---|---|---|
| D1 | `NVB_DRILL_D1_QUERY` | Query on recipients: `city = Mumbai` and has a savings account (`accounts` exists with `type = SAV`). Additional data: `@ageBand = Iif(Age(@birthDate) < 30,'18-29',Iif(Age(@birthDate) < 45,'30-44','45+'))` | About 1 in 8 customers holding a savings account (Mumbai is 1 of 8 cities); new `ageBand` column |
| D2 | `NVB_DRILL_D2_INCR` | Scheduler (hourly) → Incremental query on recipients, created in the last 30 days | Run 1 returns N rows. Import one new customer, and run 2 returns 1 row |
| D3 | `NVB_DRILL_D3_SETS` | Query A (`loyaltyTier = GLD`), Query B (`appInstalled = 1`) → Union / Intersection / Exclusion, each on its own branch | \|A∪B\| = \|A\| + \|B\| − \|A∩B\| |
| D4 | `NVB_DRILL_D4_SPLIT` | Query → Split: subsets PLT / GLD / SLV plus complement; then a second Split with a 10% random control per subset | Subsets sum to the input; controls are about 10% |
| D5 | `NVB_DRILL_D5_DEDUP` | Data loading `nvb_dedup_drill.csv` (compute `Lower(email)`) → Deduplication on the lower-cased email, keep the most recent `updated_on` | Row count drops to 30 |
| D6 | `NVB_DRILL_D6_ENRICH` | Query → Enrichment: count of broadLogs in the last 30 days, max tracking log date | Two new columns |
| D7 | `NVB_DRILL_D7_CHDIM` | Query `nms:subscription` (service `nvbInsights`) → Change dimension to recipients, keeping one row per recipient | 60 rows |
| D8 | `NVB_DRILL_D8_LOAD` | File collector (`/in/nvb_products*.csv`) → Data loading → Reconciliation (`code`) → Update data (insert or update) into `nvb:product` | 8 inserts, then 0 inserts and 8 updates on the rerun |
| D9 | `NVB_DRILL_PARENT` / `NVB_DRILL_CHILD` | Parent JavaScript activity `PostEvent` → child External signal `signal` → Query using `$(instance/vars/@segment)` → Test on `vars.recCount > 0` | The child logs the segment; both Test branches are exercised |
| D10 | `NVB_DRILL_D10_EXPORT` | Query → Data extraction `/out/nvb_export_$(instance/vars/@runDate).csv` → File transfer (SFTP upload) → Alert with `vars.recCount` | A dated file arrives on the test SFTP |

---

## A4: `NVB_TPL_SEGMENT_MONTHLY`

```mermaid
flowchart LR
  S[Scheduler<br/>1st, 06:00 IST] --> J0[JS: month var]
  J0 --> Q[Query active customers<br/>not denylisted, has email or mobile]
  Q --> E[Enrichment<br/>balance band, product count]
  E --> D[Dedup email + mobile]
  D --> X[Exclusion<br/>- Read list NVB Staff<br/>- quarantined 30d]
  X --> SP[Split<br/>Premier / Growth / Core / Dormant]
  SP --> C1[Split 5% control] --> L1[Save audience<br/>NVB_SEG_*_$month  replace]
  L1 --> AJ[AND-join] --> AL[Alert: counts table] --> END((End))
  Q -. error .-> ERR[Alert: error] --> END2((End))
```

| Segment | Filter (after enrichment) |
|---|---|
| Premier | `loyaltyTier = 'PLT'` OR max account balance ≥ 500,000 |
| Growth | `loyaltyTier = 'GLD'` OR product count ≥ 2 |
| Core | Active in the last 90 days (`lastLoginDate >= DaysAgo(90)`) |
| Dormant | Complement |

Reconciliation rule: target + control + excluded = query count.

---

## A5: `NVB_CW_CC_XSELL_2026Q4` (campaign workflow)

```mermaid
flowchart LR
  Q[Query: holds SAV, no CARD product,<br/>age >= 21, not staff] --> DD[Dedup]
  DD --> CG[Split 10% control group]
  CG --> R[Split by channel<br/>appInstalled → Push<br/>email → Email<br/>mobile → SMS]
  R --> P[Push delivery]
  R --> ABS[Split 10% A / 10% B / 80% rest]
  ABS --> DA[Email A] & DB[Email B]
  DA & DB --> W[Wait 4h] --> JS[JS: pick winner by CTR] --> T{winner == A}
  T -- yes --> RA[Email A to rest]
  T -- no --> RB[Email B to rest]
  R --> SMS[SMS delivery]
```

Typology `NVB_Marketing`: pressure 3 per 7 days (this campaign has weight 5), filtering (staff, age < 21), control rules from `07-scripts/typology_rules_A5.js`. Hypothesis: a card application (landing page form) within 14 days, compared with the control group.

---

## A9: `NVB_TW_LOAD_TXN_DAILY`

```mermaid
flowchart TB
  S[Scheduler 02:15 IST<br/>or External signal 'start'] --> I[JS init<br/>vars, processed-file check, lock]
  I --> T{skip == 0}
  T -- no --> E0((End))
  T -- yes --> FT[File transfer<br/>SFTP download]
  FT --> DL[Data loading<br/>typed format, rejects kept]
  DL --> SP{Split valid / invalid}
  SP -- invalid --> X1[Data extraction<br/>rejects/invalid_$runDate.csv]
  SP -- valid --> DD[Dedup txnId] --> G[JS guard<br/>zero / -50% vs 7-day avg]
  G --> ST[Update data<br/>nvb:txnStaging insert]
  ST --> RC{Reconciliation<br/>account by accountNumber}
  RC -- unmatched --> X2[Data extraction<br/>rejects/unmatched_$runDate.csv]
  RC -- matched --> UP[Update data<br/>nvb:transaction insert or update on txnId]
  UP & X1 & X2 --> AJ[AND-join] --> EN[JS end<br/>audit OK, unlock, signal master]
  EN --> AL[Alert counts] --> E1((End))
  FT & DL & G & UP -. error .-> F[JS fail<br/>audit FAIL, unlock] --> AE[Alert error] --> E2((End))
```

| Test file | Valid | Invalid | Unmatched | Transaction table effect |
|---|---|---|---|---|
| `nvb_txn_20260930.csv` | 1,000 | 0 | 0 | +1,000 inserts |
| same file again | — | — | — | skipped (run log) |
| `nvb_txn_20261001.csv` | 980 | 20 | 10 | +970 inserts |
| `nvb_txn_20261002.csv` | 100 | 0 | 0 | 50 updates + 50 inserts |
| `nvb_txn_20261003.csv` | 0 | 0 | 0 | guard alert, no writes |

The malformed amount and date rows may be rejected by Data loading itself (typed columns) rather than by the Split. Either way they must end up in a reject file, and you should document which step caught them.

---

## A10: `NVB_TW_HOUSEKEEPING`

```mermaid
flowchart LR
  S[Scheduler 04:30 IST<br/>outside the cleanup window] --> F{Fork}
  F --> Q1[Query staging loadDate < 14d] --> D1[Update data: delete<br/>batch 10,000]
  F --> Q2[Query runLog logDate < 180d] --> D2[Update data: delete]
  D1 & D2 --> AJ[AND-join] --> H[JS health<br/>workflows, quarantines]
  H --> AL[Alert: health report HTML] --> E((End))
```

---

## A11: `NVB_TW_MASTER_NIGHTLY`

```mermaid
sequenceDiagram
  participant M as Master
  participant L as LOAD_TXN_DAILY
  participant S as SEGMENT_MONTHLY
  participant X as EXPORT_CDP
  M->>L: PostEvent start (runDate, masterWorkflow)
  L-->>M: PostEvent done1 (status, count)
  alt status OK
    M->>S: PostEvent start
    S-->>M: done2
    M->>X: PostEvent start
    X-->>M: done3
    M->>M: Alert summary
  else FAIL or 60 min timeout
    M->>M: Alert error, Stop (children 2-3 never start)
  end
```

`NVB_TW_EXPORT_CDP` writes the segment audience to one **fixed** file and table (`nvb_cdp_audience.csv` / `nvb:txnStaging`-style fixed schema). Never use a date-suffixed table name.

---

## Capstone: NovaBank Lifecycle Program

```mermaid
flowchart LR
  subgraph Data
    C[nvb_customers.csv] --> TW1[Ingest customers]
    T[nvb_txn_*.csv] --> TW2[A9 ingestion]
    K[nvb_consents.csv] --> TW3[Consent load]
  end
  TW1 & TW2 & TW3 --> DB[(Campaign DB<br/>recipient + nvb schemas)]
  DB --> J[Onboarding journey<br/>day 0/3/7/14/30<br/>exit on first transaction]
  DB --> XS[Cross-sell + offers<br/>A/B + control]
  DB --> WB[Win-back dormant<br/>control + hypothesis]
  DB --> PC[Preference center<br/>web app]
  EV[Core banking events] --> MC[Message Center<br/>OTP / LOWBAL]
  J & XS & WB --> CH[Email / SMS / Push]
  CH --> TR[Tracking + reports] --> CDP[Fixed audience file → CDP / Target]
```
