// NovaBank ACC Bootcamp | A12 Node.js client: send Message Center events (Node 18+, native fetch)
// Usage:
//   npm i fast-xml-parser
//   set ACC_BASE=https://<execution-instance>   (no trailing slash)
//   v7:  set ACC_LOGIN=... & set ACC_PASSWORD=...        (Logon)
//   v8:  set ACC_IMS_TOKEN=<IMS access token of your technical account>   (BearerTokenLogon)
//   node push_events.mjs events_sample.json
// VERIFY on your build: SOAP method names and response shapes. Never commit credentials; never log OTP values.
import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

const BASE = process.env.ACC_BASE;
const ROUTER = `${BASE}/nl/jsp/soaprouter.jsp`;
const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

async function soap(action, body, tokens = {}) {
  const headers = { "Content-Type": "text/xml; charset=utf-8", SOAPAction: action };
  if (tokens.security) headers["X-Security-Token"] = tokens.security;
  if (tokens.session) headers.Cookie = `__sessiontoken=${tokens.session}`;
  const res = await fetch(ROUTER, { method: "POST", headers, body });
  const text = await res.text();
  const doc = parser.parse(text);
  const fault = doc?.Envelope?.Body?.Fault;
  if (!res.ok || fault) throw new Error(`${action} failed: ${fault?.faultstring ?? res.status}`);
  return doc.Envelope.Body;
}

async function login() {
  if (process.env.ACC_IMS_TOKEN) {
    const b = await soap("xtk:session#BearerTokenLogon", `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:xtk:session">
<soapenv:Body><urn:BearerTokenLogon><urn:sessiontoken/><urn:strBearerToken>${esc(process.env.ACC_IMS_TOKEN)}</urn:strBearerToken></urn:BearerTokenLogon></soapenv:Body></soapenv:Envelope>`);
    const r = b.BearerTokenLogonResponse;
    return { session: r.pstrSessionToken, security: r.pstrSecurityToken };
  }
  const b = await soap("xtk:session#Logon", `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:xtk:session">
<soapenv:Body><urn:Logon><urn:sessiontoken/><urn:strLogin>${esc(process.env.ACC_LOGIN)}</urn:strLogin>
<urn:strPassword>${esc(process.env.ACC_PASSWORD)}</urn:strPassword><urn:elemParameters/></urn:Logon></soapenv:Body></soapenv:Envelope>`);
  const r = b.LogonResponse;
  return { session: r.pstrSessionToken, security: r.pstrSecurityToken };
}

function eventXml(e) {
  const ctx = Object.entries(e.ctx ?? {}).map(([k, v]) => `<${k}>${esc(v)}</${k}>`).join("");
  return `<rtEvent type="${esc(e.type)}" email="${esc(e.email ?? "")}" mobilePhone="${esc(e.mobilePhone ?? "")}" origin="nvb-bootcamp" externalId="${esc(e.externalId ?? "")}" wishedChannel="${esc(e.wishedChannel ?? "0")}"><ctx>${ctx}</ctx></rtEvent>`;
}

async function pushEvent(tokens, e) {
  const b = await soap("nms:rtEvent#PushEvent", `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:nms:rtEvent">
<soapenv:Body><urn:PushEvent><urn:sessiontoken/><urn:domEvent>${eventXml(e)}</urn:domEvent></urn:PushEvent></soapenv:Body></soapenv:Envelope>`, tokens);
  return b.PushEventResponse?.plId;
}

const file = process.argv[2] ?? "events_sample.json";
const events = JSON.parse(await readFile(file, "utf8"));
const tokens = await login();
for (const e of events) {
  try {
    const id = await pushEvent(tokens, e);
    console.log(`OK    ${e.externalId}  type=${e.type}  eventId=${id}`);      // no ctx values in logs
  } catch (err) {
    console.log(`FAIL  ${e.externalId}  type=${e.type}  ${err.message}`);
  }
}
