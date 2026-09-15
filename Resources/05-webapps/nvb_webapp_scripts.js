// NovaBank ACC Bootcamp | Script activities for web app nvbPreferences (M47, Capstone)
// Paste each function body into the matching Script activity. ctx is the web app context (E4X).
// VERIFY on your build: preloading options, ctx paths, service internal names, NmsSubscription method signatures.

// ---- Script activity "preload" (after the Preloading activity identified the recipient by encrypted id)
(function preload() {
  var rcpId = parseInt(ctx.recipient.@id, 10);
  if (!rcpId) { ctx.vars.error = "unknown"; return; }
  function subscribed(service) {
    var q = xtk.queryDef.create(
      <queryDef schema="nms:subscription" operation="count">
        <where>
          <condition expr={"[service/@name] = '" + service + "'"}/>
          <condition expr={"@recipient-id = " + rcpId}/>
        </where>
      </queryDef>);
    return parseInt(q.ExecuteQuery().@count, 10) > 0 ? "1" : "0";
  }
  ctx.vars.subInsights = subscribed("nvbInsights");
  ctx.vars.subOffers   = subscribed("nvbOffers");
  // latest consent per purpose
  ["MKT", "PRF"].forEach(function (p) {
    var c = xtk.queryDef.create(
      <queryDef schema="nvb:consent" operation="select" lineCount="1">
        <select><node expr="@status"/></select>
        <where><condition expr={"@purpose = '" + p + "' AND @recipient-id = " + rcpId}/></where>
        <orderBy><node expr="@eventDate" sortDesc="true"/></orderBy>
      </queryDef>).ExecuteQuery();
    var st = c.consent.length() ? String(c.consent[0].@status) : "0";
    ctx.vars["c" + p] = (st == "1") ? "1" : "0";
  });
})();

// ---- Script activity "store" (after the Preferences page)
(function store() {
  var email = String(ctx.recipient.@email);
  var rcp = <recipient _key="@email" email={email}/>;
  var all = String(ctx.vars.action) == "unsubAll";
  function apply(service, on) {
    if (on && !all) nms.subscription.Subscribe(service, rcp, false);
    else nms.subscription.Unsubscribe(service, rcp);
  }
  apply("nvbInsights", String(ctx.vars.svc_nvbInsights) == "on");
  apply("nvbOffers",   String(ctx.vars.svc_nvbOffers) == "on");

  var now = formatDate(getCurrentDate(), "%4Y-%2M-%2D %02H:%02N:%02S");
  var coll = <consent-collection xtkschema="nvb:consent"/>;
  [["MKT", "consent_MKT"], ["PRF", "consent_PRF"]].forEach(function (pair) {
    var on = !all && String(ctx.vars[pair[1]]) == "on";
    coll.appendChild(<consent _operation="insert" purpose={pair[0]} status={on ? 1 : 2}
                       sourceChannel="WEB" eventDate={now} noticeVersion="PN-2026.1"
                       recipient-id={ctx.recipient.@id}/>);
  });
  xtk.session.WriteCollection(coll);

  // profile preferences (extension fields)
  var upd = <recipient xtkschema="nms:recipient" _key="@id" _operation="update" id={ctx.recipient.@id}
                       preferredChannel={ctx.vars.preferredChannel} preferredLanguage={ctx.vars.preferredLanguage}/>;
  // Only ever SET the denylist flag here. Never clear it from a web form: it may have been set for another reason.
  if (all) upd.@blackListEmail = 1;
  xtk.session.Write(upd);
  logInfo("nvbPreferences saved for recipient " + ctx.recipient.@id + " action=" + ctx.vars.action);
})();
