// NovaBank ACC Bootcamp | A9 daily transaction ingestion (NVB_TW_LOAD_TXN_DAILY)
// JavaScript activities in workflow order. Requires nvb:utils.js and schemas nvb:txnStaging, nvb:transaction, nvb:runLog.
// Diagram: 09-workflows/A9_ingestion.md

/* ---- 1. "init" (after Scheduler 02:15 IST, or External signal "start" from the A11 master) ---- */
loadLibrary("nvb:utils.js");
if (vars.runDate) instance.vars.runDate = vars.runDate;                 // passed by the master
if (vars.masterWorkflow) instance.vars.masterWorkflow = vars.masterWorkflow;
instance.vars.runDate  = instance.vars.runDate || NVB.today();
instance.vars.fileName = "nvb_txn_" + instance.vars.runDate + ".csv";
var done = NVB.count("nvb:runLog", "@workflow = '" + instance.internalName + "' AND @fileName = '" +
                     instance.vars.fileName + "' AND @status = 'OK' AND @step = 'end'");
if (done > 0) {
  instance.vars.skip = 1;
  NVB.audit(instance.internalName, "start", "SKIP", 0, instance.vars.fileName, "already processed");
} else if (!NVB.lock(instance.internalName, 6)) {
  instance.vars.skip = 1;
  NVB.audit(instance.internalName, "start", "SKIP", 0, instance.vars.fileName, "locked by a running instance");
} else {
  instance.vars.skip = 0;
  NVB.audit(instance.internalName, "start", "START", 0, instance.vars.fileName, "");
}
// Test activity next:  instance.vars.skip == 0

/* ---- 2. File transfer: download /in/$(instance/vars/@fileName) ; Data loading uses the same name ---- */
/* ---- 3. Split "valid" (XTK):
        @txnId IS NOT NULL AND @amount > 0 AND @txnDate IS NOT NULL AND @direction IN ('CR','DR')          ---- */

/* ---- 4. "guard" (valid branch, after Deduplication on txnId) ---- */
loadLibrary("nvb:utils.js");
var since = formatDate(addDays(getCurrentDate(), -7), "%4Y-%2M-%2D");   // VERIFY addDays availability
var q = xtk.queryDef.create(
  <queryDef schema="nvb:runLog" operation="select">
    <select><node expr="@count"/></select>
    <where><condition expr={"@workflow = '" + instance.internalName + "' AND @step = 'promote' AND @status = 'OK' AND @logDate >= #" + since + "#"}/></where>
  </queryDef>).ExecuteQuery();
var n = 0, tot = 0;
for each (var r in q.runLog) { n++; tot += parseInt(r.@count, 10) || 0; }
var avg = n ? tot / n : 0;
if (vars.recCount == 0 || (avg > 0 && vars.recCount < avg * 0.5)) {
  instance.vars.errorMsg = "Volume guard: " + vars.recCount + " valid rows vs 7-day average " + Math.round(avg);
  throw instance.vars.errorMsg;
}
instance.vars.validCount = vars.recCount;

/* ---- 5. Update data -> nvb:txnStaging (insert; fileName = $(instance/vars/@fileName), loadDate = GetDate())
   ---- 6. Reconciliation on account (accountNumber) -> Update data -> nvb:transaction (insert or update on @txnId)
   ---- 7. Data extraction for invalid + unreconciled rows -> /rejects/..._$(instance/vars/@runDate).csv ---- */

/* ---- 8. "end" (after the AND-join) ---- */
loadLibrary("nvb:utils.js");
NVB.audit(instance.internalName, "promote", "OK", instance.vars.validCount, instance.vars.fileName, "");
NVB.audit(instance.internalName, "end", "OK", instance.vars.validCount, instance.vars.fileName, "");
NVB.unlock(instance.internalName);
if (instance.vars.masterWorkflow)
  xtk.workflow.PostEvent(instance.vars.masterWorkflow, "done1", "",
    <variables status="OK" count={instance.vars.validCount} runDate={instance.vars.runDate}/>, false);

/* ---- 9. "fail" (every Error transition -> here -> Alert -> End) ---- */
loadLibrary("nvb:utils.js");
NVB.audit(instance.internalName, "end", "FAIL", 0, instance.vars.fileName, instance.vars.errorMsg || "error transition");
NVB.unlock(instance.internalName);
if (instance.vars.masterWorkflow)
  xtk.workflow.PostEvent(instance.vars.masterWorkflow, "done1", "",
    <variables status="FAIL" count="0" message={instance.vars.errorMsg || ""}/>, false);
