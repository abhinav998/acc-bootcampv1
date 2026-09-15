// NovaBank ACC Bootcamp | JavaScript code nvb:utils.js (Administration > Configuration > JavaScript codes)
// Load with: loadLibrary("nvb:utils.js");   Used by A9, A10, A11, Capstone.
var NVB = NVB || {};

NVB.today = function () { return formatDate(getCurrentDate(), "%4Y%2M%2D"); };

/** Insert one audit row into nvb:runLog. status: START | OK | SKIP | FAIL */
NVB.audit = function (workflow, step, status, count, fileName, msg) {
  xtk.session.Write(<runLog xtkschema="nvb:runLog" _operation="insert"
    workflow={workflow} step={step} status={status} count={count || 0}
    fileName={fileName || ""} message={String(msg || "").substring(0, 255)}
    logDate={formatDate(getCurrentDate(), "%4Y-%2M-%2D %02H:%02N:%02S")}/>);
};

/** Option-based lock with stale-lock protection (hours). Returns true if acquired. */
NVB.lock = function (name, staleHours) {
  var key = "NVB_LOCK_" + name, v = getOption(key) || "";
  if (v) {
    var ageH = (getCurrentDate() - parseTimeStamp(v)) / 3600000;   // VERIFY parseTimeStamp input format on your build
    if (ageH < (staleHours || 6)) return false;
    logWarning("Stale lock " + key + " (" + Math.round(ageH) + "h) overridden");
  }
  setOption(key, formatDate(getCurrentDate(), "%4Y-%2M-%2D %02H:%02N:%02S"));
  return true;
};
NVB.unlock = function (name) { setOption("NVB_LOCK_" + name, ""); };

/** Count rows of a schema matching an XTK condition (works on local and FFDA schemas). */
NVB.count = function (schema, where) {
  var q = xtk.queryDef.create(<queryDef schema={schema} operation="count"><where><condition expr={where}/></where></queryDef>);
  return parseInt(q.ExecuteQuery().@count, 10) || 0;
};

/** Mask an account number to its last 4 digits. */
NVB.mask = function (acc) { acc = String(acc || ""); return "XXXX" + acc.slice(-4); };

/** Simple HTML table for Alert activities. rows = [[a,b],[c,d]] */
NVB.htmlTable = function (header, rows) {
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  var h = "<table cellpadding='5' style='border-collapse:collapse;font:13px Arial'><tr>";
  header.forEach(function (c) { h += "<th align='left' style='background:#eef2f1'>" + esc(c) + "</th>"; });
  h += "</tr>";
  rows.forEach(function (r) { h += "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; });
  return h + "</table>";
};
