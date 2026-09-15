# NovaBank ACC Bootcamp | regenerates every CSV in 01-data (seeded: same output every run). Change OUT before running.
import csv,random,os,datetime as dt
random.seed(2026)
OUT="./01-data"; os.makedirs(OUT,exist_ok=True)
FN_M="Aarav Vihaan Arjun Rohan Kabir Aditya Rahul Vikram Siddharth Ishaan Karan Nikhil Ankit Manish Pranav Harsh Yash Dev Tarun Varun".split()
FN_F="Ananya Diya Isha Kavya Meera Priya Riya Sneha Tanvi Pooja Neha Aditi Shreya Nisha Asha Lakshmi Simran Anjali Kriti Zoya".split()
LN="Sharma Verma Gupta Singh Patel Iyer Nair Reddy Joshi Kulkarni Mehta Khan Das Bose Rao Pillai Chopra Malhotra Saxena Mishra Tiwari Pandey Agarwal Menon".split()
CITIES=[("Mumbai","MH","400001","MUM"),("Delhi","DL","110001","DEL"),("Bengaluru","KA","560001","BLR"),("Lucknow","UP","226001","LKO"),("Pune","MH","411001","PUN"),("Hyderabad","TG","500001","HYD"),("Chennai","TN","600001","CHE"),("Kolkata","WB","700001","KOL")]
STREETS="MG Road|Station Road|Hazratganj|Linking Road|Park Street|Anna Salai|Banjara Hills Rd 2|FC Road|Connaught Place|Indiranagar 100ft Rd".split("|")
TODAY=dt.date(2026,10,1)
def w(name,header,rows):
    with open(f"{OUT}/{name}","w",newline="",encoding="utf-8") as f:
        x=csv.writer(f); x.writerow(header); x.writerows(rows)
    return len(rows)
inv=[]
# ---------- customers
H=["customer_id","first_name","last_name","email","mobile","gender","date_of_birth","city","state","pin_code","address_line1","branch_code","preferred_language","loyalty_tier","kyc_status","last_login_date","is_staff","account_open_date","app_installed","preferred_channel","email_optin","sms_optin","created_date"]
cust=[]
for i in range(1,201):
    g=random.choice([1,2]); fn=random.choice(FN_M if g==1 else FN_F); ln=random.choice(LN)
    c=random.choice(CITIES); age=random.randint(21,72)
    dob=dt.date(TODAY.year-age,random.randint(1,12),random.randint(1,28))
    # 40 recent openers (last 7 days) for A1
    opened=TODAY-dt.timedelta(days=random.randint(0,6) if i<=40 else random.randint(8,1800))
    login=(TODAY-dt.timedelta(days=random.choice([0,1,2,5,12,25,40,90,200]))) if random.random()>0.1 else None
    app=random.random()<0.55
    ch=random.choice(["PSH","EML","SMS"]) if app else random.choice(["EML","EML","SMS"])
    mobile="+9198"+str(random.randint(10000000,99999999)) if random.random()>0.08 else ""
    cust.append([f"NVB{i:06d}",fn,ln,f"{fn.lower()}.{ln.lower()}{i}@novabank.test",mobile,g,dob.isoformat(),c[0],c[1],c[2],f"{random.randint(1,250)}, {random.choice(STREETS)}",c[3],
      random.choice(["EN"]*3+["HI"]*2+["MR","TA"]),random.choice(["SLV"]*5+["GLD"]*3+["PLT"]),random.choice([1]*8+[0,2]),
      login.isoformat()+"T10:15:00+05:30" if login else "", "Y" if i in(7,19,33,58,91,140) else "N",opened.isoformat(),"Y" if app else "N",ch,
      "N" if random.random()<0.07 else "Y","N" if random.random()<0.1 else "Y",(opened+dt.timedelta(days=0)).isoformat()])
cust[4][2]="Kulkarni-Rao"; cust[9][1]=""  # empty first name → fallback test
cust[11][1]="Zoë"   # accented → encoding test
good=list(cust)
bad=[["","Test","NoId","noid@novabank.test","+919800000001",1,"1990-01-01","Mumbai","MH","400001","1, MG Road","MUM","EN","SLV",1,"","N","2026-09-30","N","EML","Y","Y","2026-09-30"],
     ["NVB900002","Bad","Email","bad.email.novabank.test","+919800000002",2,"1991-02-02","Pune","MH","411001","2, FC Road","PUN","EN","SLV",1,"","N","2026-09-29","N","EML","Y","Y","2026-09-29"],
     ["NVB900003","Bad","Date","bad.date@novabank.test","+919800000003",1,"31/13/1990","Delhi","DL","110001","3, CP","DEL","EN","SLV",1,"","N","2026-09-29","N","EML","Y","Y","2026-09-29"],
     ["NVB900004","Bad","Tier","bad.tier@novabank.test","+919800000004",2,"1992-04-04","Delhi","DL","110001","4, CP","DEL","EN","DIAMOND",1,"","N","2026-09-28","N","EML","Y","Y","2026-09-28"]]
dups=[list(cust[2]),list(cust[15])]; dups[0][0]="NVB900005"; dups[1][0]="NVB900006"; dups[1][15]=""  # same email, different id
w("nvb_customers.csv",H,good+bad+dups)
inv.append(("nvb_customers.csv",206,"200 valid customers + 4 invalid rows (missing id, bad email, bad date, unknown tier) + 2 duplicate emails with different IDs","A1, A6, Capstone"))
# update file for A6 reconciliation
upd=[list(r) for r in good[:20]]
for r in upd: r[13]="GLD" if r[13]=="SLV" else "PLT"; r[15]=TODAY.isoformat()+"T09:00:00+05:30"
w("nvb_customers_update.csv",H,upd); inv.append(("nvb_customers_update.csv",20,"Same 20 customer_ids with changed loyalty tier and last login: re-import must update, not duplicate","A6"))
# staff
w("nvb_staff.csv",["customer_id","email","employee_id"],[[r[0],r[3],f"EMP{100+k}"] for k,r in enumerate(good) if r[16]=="Y"])
inv.append(("nvb_staff.csv",6,"Staff list (matches is_staff=Y) for 'NVB Staff' list and exclusions","A4, A5"))
# insights subscribers
subs=random.sample(good,60)
w("nvb_insights_subscribers.csv",["customer_id","email","service","subscribed_on"],[[r[0],r[3],"nvbInsights",(TODAY-dt.timedelta(days=random.randint(61,400))).isoformat()] for r in subs])
inv.append(("nvb_insights_subscribers.csv",60,"Subscribers to service nvbInsights (all subscribed > 60 days ago)","A2"))
# products
P=[("CC-PLAT","Nova Platinum Credit Card","CARD",2500,"Y"),("CC-CLASSIC","Nova Classic Credit Card","CARD",500,"Y"),("CC-TRAVEL","Nova Voyager Travel Card","CARD",3500,"Y"),("PL-QUICK","Nova Quick Personal Loan","LOAN",0,"Y"),("HL-HOME","Nova Home Loan","LOAN",0,"Y"),("FD-SENIOR","Senior Citizen FD","DEP",0,"Y"),("RD-GROW","Grow Recurring Deposit","DEP",0,"Y"),("INS-TERM","Nova Term Shield","INS",0,"N")]
w("nvb_products.csv",["product_code","product_name","family","annual_fee","active"],P); inv.append(("nvb_products.csv",8,"Product catalogue (1 inactive)","A7, M55"))
# accounts
acc=[]; an=50010000
for r in good:
    for k in range(random.choice([1,1,1,2,2,3])):
        an+=random.randint(1,97); t=random.choice(["SAV","SAV","CUR","FD"])
        bal=round(random.choice([random.uniform(500,40000),random.uniform(50000,480000),random.uniform(500000,4000000)]),2)
        st=random.choice([1]*8+[2,3])
        acc.append([f"{an:012d}",r[0],t,st,bal,(dt.date.fromisoformat(r[17])+dt.timedelta(days=k*90)).isoformat(),r[3],r[4],"Y" if r[20]=="N" else "N"])
w("nvb_accounts.csv",["account_number","customer_id","account_type","status","balance","opened_on","email","mobile","do_not_contact"],acc)
inv.append(("nvb_accounts.csv",len(acc),"Accounts linked to customers (1-3 each), balances across LOW/MID/HIGH bands","A7, A9"))
ap=[]
for a in acc:
    for pc in random.sample([p[0] for p in P],random.choice([0,1,1,2,3])):
        ap.append([a[0],pc,(dt.date.fromisoformat(a[5])+dt.timedelta(days=random.randint(0,300))).isoformat()])
w("nvb_account_products.csv",["account_number","product_code","since"],ap); inv.append(("nvb_account_products.csv",len(ap),"N-N holdings between accounts and products","A7"))
# transactions
MC="GROCERY FUEL TRAVEL DINING UTILITIES SHOPPING SALARY RENT EMI HEALTH".split()
live=[a[0] for a in acc if a[3]!=3]
def txn(day,n,start):
    rows=[]
    for k in range(n):
        d=random.choice(["DR"]*4+["CR"]); mc="SALARY" if d=="CR" and random.random()<.5 else random.choice(MC)
        ts=dt.datetime.combine(day,dt.time(random.randint(0,23),random.randint(0,59),random.randint(0,59)))
        rows.append([f"T{day.strftime('%Y%m%d')}{start+k:06d}",random.choice(live),round(random.uniform(50,90000) if mc=="SALARY" else random.uniform(20,25000),2),"INR",d,random.choice(["UPI","UPI","CRD","NB","ATM","BR"]),mc,ts.isoformat()+"+05:30"])
    return rows
TH=["txn_id","account_number","amount","currency","direction","channel","merchant_category","txn_datetime"]
d1=txn(dt.date(2026,9,30),1000,1); w("nvb_txn_20260930.csv",TH,d1)
d2=txn(dt.date(2026,10,1),970,1)
for k in range(20):  # invalid rows
    r=txn(dt.date(2026,10,1),1,5000+k)[0]
    [lambda r:r.__setitem__(0,""),lambda r:r.__setitem__(2,"12,50.00x"),lambda r:r.__setitem__(7,"2026-13-45 99:00"),lambda r:r.__setitem__(4,"XX")][k%4](r); d2.append(r)
for k in range(10):
    r=txn(dt.date(2026,10,1),1,6000+k)[0]; r[1]=f"99999{k:07d}"; d2.append(r)
random.shuffle(d2); w("nvb_txn_20261001.csv",TH,d2)
d3=[list(r) for r in d1[:50]]
for r in d3: r[2]=round(r[2]*1.1,2)
d3+=txn(dt.date(2026,10,2),50,1); w("nvb_txn_20261002.csv",TH,d3)
w("nvb_txn_20261003.csv",TH,[])
inv+= [("nvb_txn_20260930.csv",1000,"Clean daily file: expect 1,000 inserts","A9 test 1-2, A11"),
       ("nvb_txn_20261001.csv",1000,"970 valid + 20 invalid (empty id, bad amount, bad date, bad direction) + 10 unknown accounts","A9 test 3"),
       ("nvb_txn_20261002.csv",100,"50 txn_ids from 20260930 with amounts +10% (must UPDATE) + 50 new","A9 test 4"),
       ("nvb_txn_20261003.csv",0,"Header only: triggers the zero-volume guard","A9 test 5")]
# dedup drill
dd=[]
for r in good[:30]:
    dd.append([r[3],r[1],r[2],r[4],"2026-09-01"]); 
    if random.random()<.5: dd.append([r[3].upper() if random.random()<.3 else r[3],r[1],r[2],r[4],"2026-09-20"])
w("nvb_dedup_drill.csv",["email","first_name","last_name","mobile","updated_on"],dd); inv.append(("nvb_dedup_drill.csv",len(dd),"Duplicates on email (some upper-case) with different updated_on: keep most recent","A3 D5"))
# bounce test
BT=[("nobody.{}@novabank.test","User unknown (hard)"),("full.mailbox@novabank.test","Mailbox full (soft) - simulate on your test MTA"),("x@invalid-domain-nvb.test","Invalid domain"),("disabled@novabank.test","Account disabled"),("spaces in@novabank.test","Malformed address"),("a@b","Malformed address"),("postmaster@novabank.test","Refused / role address"),("bounce.{}@novabank.test","User unknown (hard)"),("abuse@novabank.test","Role address"),("inactive.user@novabank.test","Inactive user")]
w("nvb_bounce_test.csv",["email","expected_outcome"],[[e.format(i),o] for i,(e,o) in enumerate(BT)]); inv.append(("nvb_bounce_test.csv",10,"Deliberately bad addresses for bounce/quarantine lab. Use only against your own test domain/MTA","M29"))
# direct mail sample header spec
w("nvb_direct_mail_extract_spec.csv",["position","column","source_xpath","format","example"],[[1,"CUSTOMER_ID","[nvb]@customerId","text(20)","NVB000012"],[2,"FULL_NAME","@firstName + ' ' + @lastName","text(80)","Priya Sharma"],[3,"ADDRESS_1","location/@address3","text(80)","12, MG Road"],[4,"CITY","location/@city","text(40)","Mumbai"],[5,"PIN","location/@zipCode","text(6)","400001"],[6,"OFFER_CODE","targetData.offerCode","text(12)","NVBDM2026A"]])
inv.append(("nvb_direct_mail_extract_spec.csv",6,"Column spec for the direct mail extraction file","M13"))
# events (FFDA) and scores
ev=[[f"E-{100000+k}",random.choice(good)[0],random.choice(["LOGIN","CARD_VIEW","LOAN_CALC","FD_BOOKED","APP_OPEN"]),(dt.datetime(2026,9,30,8)+dt.timedelta(minutes=k*3)).isoformat()+"+05:30"] for k in range(300)]
w("nvb_events.csv",["event_id","customer_id","event_type","event_datetime"],ev); inv.append(("nvb_events.csv",300,"Behavioural events for the FFDA Ingest lab","M52"))
sc=[]
for r in good:
    for m in ["CC_PROPENSITY","PL_PROPENSITY"]:
        s=round(random.random(),4); sc.append([r[0],m,s,min(10,int(s*10)+1),"2026-10-01"])
w("nvb_scores_20261001.csv",["customer_id","model_code","score","decile","scored_on"],sc); inv.append(("nvb_scores_20261001.csv",len(sc),"Model scores (sample of the 200k-row feed; scale with 07-scripts/generate_scores.py)","A14"))
# consents
cn=[]
for r in good:
    for pur in ["MKT","INS","SRV","PRF"]:
        st=1 if (pur=="SRV" or random.random()>.2) else 2
        cn.append([r[0],pur,st,random.choice(["WEB","APP","BR","IMP"]),r[17]+"T12:00:00+05:30","PN-2026.1"])
w("nvb_consents.csv",["customer_id","purpose","status","source_channel","event_datetime","notice_version"],cn); inv.append(("nvb_consents.csv",len(cn),"Consent per purpose (DPDP) for every customer","Capstone, M60"))
# offers
OF=[("OF-PLAT-LTF","Platinum card, lifetime free","CC-PLAT","PLT",50,"2026-10-01","2026-12-31"),("OF-PLAT-5X","Platinum 5x rewards on travel","CC-PLAT","GLD,PLT",40,"2026-10-01","2026-12-31"),("OF-CLASSIC","Classic card, first year free","CC-CLASSIC","SLV,GLD",30,"2026-10-01","2026-12-31"),("OF-PL-RATE","Personal loan at 10.49%","PL-QUICK","SLV,GLD,PLT",20,"2026-10-01","2026-11-30"),("OF-FD-SR","Senior FD +0.5%","FD-SENIOR","SLV,GLD,PLT",25,"2026-10-01","2027-03-31")]
w("nvb_offers.csv",["offer_code","label","product_code","eligible_tiers","weight","start_date","end_date"],OF); inv.append(("nvb_offers.csv",5,"Offer catalogue with eligibility by loyalty tier and weights","M55, Capstone"))
# security matrix
SM=[("NVB Builders","Campaign builder","Create/edit campaigns & deliveries in NovaBank folders; prepare, not start","delivery, prepareDelivery, createProject, editProject","NovaBank/* read+write; no delete on Recipients"),
    ("NVB Approvers","Campaign approver","Approve target/content; start deliveries","delivery, startDelivery","NovaBank/Campaigns read+write"),
    ("NVB Data Engineers","Data engineer","Workflows, imports/exports; SQL on DEV only","workflow, import, export, sql (DEV only)","NovaBank/Workflows read+write+delete"),
    ("NVB Analysts","Analyst","Read deliveries and reports; no recipient export","(none beyond read)","NovaBank/* read only; Recipients hidden"),
    ("NVB API","API technical account","Subscription and event push only","(method-level: nms:subscription, nms:rtEvent)","No folder access")]
w("nvb_security_matrix.csv",["operator_group","role","needs","named_rights (VERIFY names on your build)","folder_permissions"],SM); inv.append(("nvb_security_matrix.csv",5,"User management matrix to translate into groups and rights","A13"))
import json; json.dump(inv,open(OUT+"/_inventory.json","w"))
print(inv)
