// NovaBank ACC Bootcamp | A5 typology NVB_Marketing
// Control rules (phase: start of personalisation). VERIFY delivery object paths on your build.

// Rule NVB_CTRL_SUBJECT: block subjects containing TEST
var subject = String(delivery.mailParameters.subject || "");
if (/\btest\b/i.test(subject))
  logError("Subject contains 'TEST'. Remove it before sending: " + subject);

// Rule NVB_CTRL_SENDER: sender must be on the approved domain
var from = String(delivery.mailParameters.senderAddress || "");
if (!/@news\.novabank\.test$/i.test(from))
  logError("Sender " + from + " is not on the approved domain news.novabank.test");

// Filtering rules are queries configured in the rule, not scripts:
//   NVB_FILTER_STAFF : recipient extension field isStaff = 1
//   NVB_FILTER_AGE   : Age(@birthDate) < 21
// Pressure rule NVB_PRESSURE_7D : max 3 messages per rolling 7 days; weight of the Platinum campaign = 5
