// NovaBank ACC Bootcamp | Workflow JavaScript snippets for A3 (D9), A4 and A5.
// VERIFY items differ across Campaign builds.

/* ===================== A3 drill D9: parent -> child signal ===================== */
// Parent NVB_DRILL_PARENT, JavaScript code activity
instance.vars.segment = "SAV";
xtk.workflow.PostEvent("NVB_DRILL_CHILD", "signal", "",
  <variables segment={instance.vars.segment} parentId={instance.id}/>, false);   // final flag: check JSAPI reference

// Child NVB_DRILL_CHILD, JavaScript code activity right after the External signal named "signal"
logInfo("Child received segment=" + vars.segment + " from parent " + vars.parentId);
instance.vars.segment = vars.segment;   // then use $(instance/vars/@segment) in the Query filter
// Test activity after the Query:   vars.recCount > 0

/* ===================== A4: monthly segmentation ===================== */
// First activity after the Scheduler
instance.vars.month = formatDate(getCurrentDate(), "%4Y%2M");   // list names: NVB_SEG_PREMIER_$(instance/vars/@month)
// After the Query
instance.vars.cntQuery = vars.recCount;
// After the Exclusion
instance.vars.cntExcluded = instance.vars.cntQuery - vars.recCount;
// One small JS activity on each segment branch (after the Split), e.g. Premier
instance.vars.cntPremier = vars.recCount;
// ...and on each control branch
instance.vars.ctlPremier = vars.recCount;
// Alert content: 03-email/12_A4_segmentation_alert.html

/* ===================== A5: A/B winner after the Wait (4 h) ===================== */
// Store delivery ids after each Delivery activity:  instance.vars.dlvA = <delivery id>;  (VERIFY the event variable name)
function ctr(id) {
  var d = xtk.queryDef.create(
    <queryDef schema="nms:delivery" operation="get">
      <select><node expr="[indicators/@success]"/><node expr="[indicators/@recipientClicks]"/></select>
      <where><condition expr={"@id = " + parseInt(id, 10)}/></where>
    </queryDef>).ExecuteQuery();
  var success = parseInt(d.indicators.@success, 10) || 0;
  var clicks  = parseInt(d.indicators.@recipientClicks, 10) || 0;   // VERIFY indicator names in nms:delivery
  return success > 0 ? clicks / success : 0;
}
var a = ctr(instance.vars.dlvA), b = ctr(instance.vars.dlvB);
instance.vars.winner = (a >= b) ? "A" : "B";
logInfo("A/B CTR A=" + (a * 100).toFixed(2) + "% B=" + (b * 100).toFixed(2) + "% winner=" + instance.vars.winner);
// Test activity:  instance.vars.winner == "A"  -> Delivery A to the 80% remainder, else Delivery B.
