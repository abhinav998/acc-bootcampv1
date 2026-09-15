// NovaBank ACC Bootcamp | M52 / A14: v8 FFDA batch load into the staged schema nvb:event
// Only on Campaign v8 Enterprise (FFDA). Schema must declare autoStg="true".
// VERIFY the payload element name and shape against Adobe's "New Campaign v8 APIs" page for your build.
var rows = [
  { extId: "E-100001", type: "LOGIN",     occurred: "2026-09-30 08:00:00", customerId: "NVB000001" },
  { extId: "E-100002", type: "CARD_VIEW", occurred: "2026-09-30 08:03:00", customerId: "NVB000002" }
];
rows.forEach(function (r) {
  // Insert with Ingest. For update/delete use xtk.session.IngestExt.
  xtk.session.Ingest(
    <nvbEvent xtkschema="nvb:event" _key="@extId" extId={r.extId} type={r.type} occurred={r.occurred}>
      <recipient _key="@customerId" customerId={r.customerId}/>
    </nvbEvent>);
});
logInfo("Queued " + rows.length + " events to staging; they reach the cloud database at the next hourly sync.");
// Real volumes: use Data loading + Update data activities, not per-row calls.
