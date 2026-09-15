// NovaBank ACC Bootcamp | A10 housekeeping and A11 master orchestration

/* ===================== A10: NVB_TW_HOUSEKEEPING ===================== */
// Purges: Query (nvb:txnStaging, @loadDate < DaysAgo(14)) -> Update data (delete, batch 10,000)
//         Query (nvb:runLog,     @logDate  < DaysAgo(180)) -> Update data (delete)
// After each delete:  instance.vars.purgedStaging = vars.recCount;  /  instance.vars.purgedRunLog = vars.recCount;
// "health" JS activity (before the Alert that uses 03-email/13_A10_health_report.html):
loadLibrary("nvb:utils.js");
var wf = xtk.queryDef.create(
  <queryDef schema="xtk:workflow" operation="select">
    <select><node expr="@internalName"/><node expr="@state"/><node expr="@failed"/><node expr="@keepResult"/><node expr="@lastModified"/></select>
    <where><condition expr="[folder/@name] = 'nvbWorkflows'"/></where>
  </queryDef>).ExecuteQuery();
var failed = [], paused = [], keep = [], cutoff = addDays(getCurrentDate(), -3);   // VERIFY addDays
for each (var w in wf.workflow) {
  if (w.@failed == "1") failed.push(String(w.@internalName));
  if (w.@keepResult == "1") keep.push(String(w.@internalName));
  if (w.@state == "13" && parseTimeStamp(w.@lastModified) < cutoff) paused.push(String(w.@internalName)); // VERIFY paused state value
}
instance.vars.wfFailed = failed.length;
instance.vars.wfPaused = paused.length;
instance.vars.wfKeepResult = keep.length;
instance.vars.quarantine24h = NVB.count("nms:address", "@lastErrorDate >= DaysAgo(1)");   // VERIFY field name in nms:address
instance.vars.detailHtml = NVB.htmlTable(["Issue", "Workflow"],
  failed.map(function (n) { return ["error", n]; })
    .concat(paused.map(function (n) { return ["paused > 3 days", n]; }))
    .concat(keep.map(function (n) { return ["keeps interim results", n]; })));
NVB.audit(instance.internalName, "report", "OK", failed.length + paused.length + keep.length, "", "");

/* ===================== A11: NVB_TW_MASTER_NIGHTLY ===================== */
// Children (each starts with External signal "start" and reports back with PostEvent):
//   NVB_TW_LOAD_TXN_DAILY  -> master signal "done1"
//   NVB_TW_SEGMENT_MONTHLY -> master signal "done2"
//   NVB_TW_EXPORT_CDP      -> master signal "done3"

// "kick1" (after the Scheduler)
instance.vars.runDate = instance.vars.runDate || formatDate(getCurrentDate(), "%4Y%2M%2D"); // set by hand to re-run a past date
xtk.workflow.PostEvent("NVB_TW_LOAD_TXN_DAILY", "start", "",
  <variables runDate={instance.vars.runDate} masterWorkflow={instance.internalName}/>, false);

// JS right after External signal "done1"
instance.vars.done1 = 1;
instance.vars.status1 = vars.status;
instance.vars.count1 = vars.count;
// Test activity:  instance.vars.status1 == "OK"   -> "kick2", else -> Alert -> Stop

// "kick2"
xtk.workflow.PostEvent("NVB_TW_SEGMENT_MONTHLY", "start", "",
  <variables runDate={instance.vars.runDate} masterWorkflow={instance.internalName}/>, false);
// ...same pattern for done2 / kick3 / done3.

// Timeout: Fork after each kick -> Wait 60 min -> "checkTimeout1"
if (!instance.vars.done1) {
  instance.vars.errorMsg = "NVB_TW_LOAD_TXN_DAILY did not report back within 60 minutes (runDate " + instance.vars.runDate + ")";
  throw instance.vars.errorMsg;   // Error transition -> Alert -> Stop
}
