-- NovaBank ACC Bootcamp | M40: external table for the FDA lab (run on a SEPARATE test database, e.g. PostgreSQL).
-- Then create external account "nvbCrm" (type External database) and import 02-schemas/nvb_crmLead.xml.
CREATE TABLE CRM_LEADS (
  LEAD_ID          VARCHAR(20) PRIMARY KEY,
  EMAIL            VARCHAR(80) NOT NULL,
  PRODUCT_INTEREST VARCHAR(20),
  CREATED_ON       TIMESTAMP   NOT NULL
);
CREATE INDEX IDX_CRM_LEADS_EMAIL ON CRM_LEADS (EMAIL);

INSERT INTO CRM_LEADS VALUES
 ('L-0001','karan.chopra1@novabank.test','CC-PLAT',  '2026-09-20 10:00:00'),
 ('L-0002','harsh.pandey2@novabank.test','PL-QUICK',   '2026-09-21 11:30:00'),
 ('L-0003','ananya.agarwal3@novabank.test','HL-HOME',    '2026-09-22 09:15:00'),
 ('L-0004','simran.chopra4@novabank.test','CC-TRAVEL', '2026-09-23 16:45:00'),
 ('L-0005','unknown.lead@novabank.test','FD-SENIOR', '2026-09-24 12:00:00');
-- L-0005 has no matching recipient: use it to show what an unreconciled FDA row looks like.
