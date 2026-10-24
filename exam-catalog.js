export const stateExams={
  "Andhra Pradesh": [
    "APPSC Group 1",
    "APPSC Group 2",
    "AP Police",
    "AP TET",
    "AP DSC"
  ],
  "Arunachal Pradesh": [
    "APPSC CCE",
    "APSSB",
    "Arunachal Police",
    "Teacher Recruitment"
  ],
  "Assam": [
    "APSC CCE",
    "Assam Police",
    "ADRE Grade III",
    "ADRE Grade IV",
    "Assam TET"
  ],
  "Bihar": [
    "BPSC CCE",
    "BPSC TRE",
    "Bihar Police",
    "Bihar SI",
    "BSSC",
    "BTSC"
  ],
  "Chhattisgarh": [
    "CGPSC",
    "CG Vyapam",
    "CG Police",
    "CG TET",
    "CG Teacher"
  ],
  "Goa": [
    "Goa PSC",
    "Goa Police",
    "Goa Staff Selection",
    "Teacher Recruitment"
  ],
  "Gujarat": [
    "GPSC",
    "GSSSB",
    "Gujarat Police",
    "Gujarat TET",
    "Talati"
  ],
  "Haryana": [
    "HPSC HCS",
    "HSSC CET",
    "Haryana Police",
    "HTET",
    "Haryana Teacher"
  ],
  "Himachal Pradesh": [
    "HPPSC HPAS",
    "HP Rajya Chayan Aayog",
    "HP Police",
    "HP TET"
  ],
  "Jharkhand": [
    "JPSC CSE",
    "JSSC CGL",
    "Jharkhand Police",
    "JTET",
    "JSSC Teacher"
  ],
  "Karnataka": [
    "KPSC KAS",
    "Karnataka Police",
    "KEA Recruitment",
    "Karnataka TET",
    "Karnataka Teacher"
  ],
  "Kerala": [
    "Kerala PSC",
    "Kerala Police",
    "Kerala SET",
    "KTET",
    "LDC"
  ],
  "Madhya Pradesh": [
    "MPPSC PCS",
    "MPESB Group 2",
    "MP Police",
    "MP TET",
    "MP Patwari"
  ],
  "Maharashtra": [
    "MPSC Rajyaseva",
    "MPSC Group B",
    "Maharashtra Police",
    "MAHA TET",
    "Talathi"
  ],
  "Manipur": [
    "Manipur PSC",
    "Manipur Police",
    "Manipur SSC",
    "Teacher Recruitment"
  ],
  "Meghalaya": [
    "Meghalaya PSC",
    "Meghalaya Police",
    "Meghalaya Teacher",
    "DSC Recruitment"
  ],
  "Mizoram": [
    "Mizoram PSC",
    "Mizoram Police",
    "Mizoram Teacher",
    "MSSSB"
  ],
  "Nagaland": [
    "NPSC NCS",
    "NSSB",
    "Nagaland Police",
    "Teacher Recruitment"
  ],
  "Odisha": [
    "OPSC OCS",
    "OSSC CGL",
    "OSSSC",
    "Odisha Police",
    "OTET"
  ],
  "Punjab": [
    "PPSC PCS",
    "PSSSB",
    "Punjab Police",
    "PSTET",
    "Punjab Teacher"
  ],
  "Rajasthan": [
    "RPSC RAS",
    "Rajasthan CET",
    "REET",
    "Rajasthan Police",
    "RSMSSB"
  ],
  "Sikkim": [
    "Sikkim PSC",
    "Sikkim Police",
    "Teacher Recruitment"
  ],
  "Tamil Nadu": [
    "TNPSC Group 1",
    "TNPSC Group 2",
    "TNPSC Group 4",
    "TNUSRB",
    "TNTET",
    "TRB"
  ],
  "Telangana": [
    "TGPSC Group 1",
    "TGPSC Group 2",
    "Telangana Police",
    "TG TET",
    "DSC"
  ],
  "Tripura": [
    "TPSC TCS",
    "TRBT",
    "Tripura Police",
    "Tripura Teacher"
  ],
  "Uttar Pradesh": [
    "UPPSC PCS",
    "UPSSSC PET",
    "UP TGT",
    "UP PGT",
    "UP Police Constable",
    "UP Police SI",
    "UP Lekhpal",
    "UP Junior Teacher",
    "UPTET"
  ],
  "Uttarakhand": [
    "UKPSC PCS",
    "UKSSSC",
    "Uttarakhand Police",
    "UTET",
    "UK Teacher"
  ],
  "West Bengal": [
    "WBPSC WBCS",
    "WBSSC",
    "West Bengal Police",
    "WB TET",
    "WB Primary Teacher"
  ],
  "Andaman and Nicobar Islands": [
    "Administration Recruitment",
    "Police Recruitment",
    "Teacher Recruitment"
  ],
  "Chandigarh": [
    "Chandigarh Police",
    "Chandigarh Administration",
    "Chandigarh Teacher"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "UT Administration Recruitment",
    "Police Recruitment",
    "Teacher Recruitment"
  ],
  "Delhi": [
    "DSSSB",
    "Delhi Police",
    "Delhi Judicial Services",
    "Delhi Teacher"
  ],
  "Jammu and Kashmir": [
    "JKPSC CCE",
    "JKSSB",
    "JK Police",
    "JK Teacher"
  ],
  "Ladakh": [
    "Ladakh SSC",
    "Ladakh Police",
    "Teacher Recruitment"
  ],
  "Lakshadweep": [
    "Lakshadweep Administration",
    "Police Recruitment",
    "Teacher Recruitment"
  ],
  "Puducherry": [
    "Puducherry PSC",
    "Puducherry Police",
    "Teacher Recruitment"
  ]
};
// Additional commonly used recruitment streams are navigation categories, not claims of live vacancies.
const stateStreams=['State Civil Services / PCS','State Police Constable','State Police Sub Inspector','State Teacher Eligibility Test','Primary Teacher Recruitment','Secondary Teacher Recruitment','State Staff Selection / Group C','State Group D / Support Staff','State Health / Nursing Recruitment','State Forest / Environment Recruitment','State Engineering / JE / AE','State Revenue / Patwari / Lekhpal','State Judicial Services','State University / Higher Education Recruitment'];
for(const [state,exams] of Object.entries(stateExams)){
  stateExams[state]=[...new Set([...exams,...stateStreams])];
}
export const centralExams=["UPSC Civil Services", "UPSC CAPF", "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD", "SSC CPO", "Railway NTPC", "Railway Group D", "RRB ALP", "RRB JE", "CTET", "UGC NET", "NDA", "CDS", "AFCAT", "Indian Army Agniveer", "Indian Navy", "Indian Coast Guard", "SSC JE", "SSC Stenographer", "SSC Selection Post", "UPSC Engineering Services", "UPSC Combined Medical Services", "UPSC Indian Forest Service", "RRB Technician", "RRB Paramedical", "KVS Recruitment", "NVS Recruitment", "CSIR UGC NET", "EPFO Recruitment", "ESIC Recruitment"];
export const bankingExams=["IBPS PO", "IBPS Clerk / CSA", "IBPS SO", "IBPS RRB PO", "IBPS RRB Office Assistant", "SBI PO", "SBI Clerk", "SBI SO", "RBI Grade B", "RBI Assistant", "NABARD Grade A", "NABARD Development Assistant", "LIC AAO", "LIC ADO", "RBI Office Attendant", "SEBI Grade A", "SIDBI Grade A", "IBPS RRB Officer Scale II / III", "NIACL AO", "UIIC AO", "GIC Assistant Manager", "Bank of Baroda Recruitment", "Punjab National Bank Recruitment"];
