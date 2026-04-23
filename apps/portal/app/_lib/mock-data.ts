export type MatterStatus = "clear" | "review" | "stop" | "pending";

export type Matter = {
  id: string;
  reference: string;
  property_description: string;
  locality_or_area: string;
  municipality_or_deeds_office: string;
  title_reference?: string;
  matter_reference?: string;
  status: MatterStatus;
  decision?: "clear" | "review" | "stop";
  confidence: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  assignee_id: string;
  parties: Party[];
  evidence: EvidenceItem[];
  flags: Flag[];
  audit_log: AuditEntry[];
};

export type Party = {
  id: string;
  role: "seller" | "buyer" | "conveyancer" | "other";
  entity_type: "person" | "company" | "trust";
  display_name: string;
  identifier?: string;
};

export type EvidenceItem = {
  id: string;
  type: string;
  source: string;
  reference: string;
  excerpt?: string;
  status: "confirmed" | "captured" | "conflicting";
  created_at: string;
};

export type Flag = {
  id: string;
  severity: "info" | "warning" | "critical";
  category: string;
  message: string;
  source: string;
};

export type AuditEntry = {
  id: string;
  event_type: string;
  actor_name: string;
  created_at: string;
};

const MATTERS_KEY = "titlechain_mock_matters_v2";

function getStored(): Matter[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MATTERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function store(matters: Matter[]) {
  localStorage.setItem(MATTERS_KEY, JSON.stringify(matters));
}

function genRef(): string {
  return `TC-${String(Math.floor(Math.random() * 900000) + 100000)}`;
}

function now(): string {
  return new Date().toISOString();
}

function daysAgo(d: number): string {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x.toISOString();
}

function hoursAgo(h: number): string {
  const x = new Date();
  x.setHours(x.getHours() - h);
  return x.toISOString();
}

function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (getStored().length > 0) return;

  const seed: Matter[] = [
    {
      id: "mtr_001",
      reference: "TC-142857",
      property_description: "Erf 412, Rosebank Township",
      locality_or_area: "Rosebank",
      municipality_or_deeds_office: "City of Johannesburg",
      title_reference: "T12345/2018",
      matter_reference: "M-2025-412",
      status: "clear",
      decision: "clear",
      confidence: 94,
      created_at: daysAgo(3),
      updated_at: daysAgo(3),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p1", role: "seller", entity_type: "person", display_name: "Thabo Mokoena", identifier: "7504125087081" },
        { id: "p2", role: "buyer", entity_type: "person", display_name: "Sarah van der Merwe", identifier: "8206150123085" },
        { id: "p3", role: "conveyancer", entity_type: "company", display_name: "Mokoena & Associates Inc", identifier: "CK2010/123456" },
      ],
      evidence: [
        { id: "e1", type: "Title Deed", source: "Deeds Office", reference: "T12345/2018", excerpt: "Erf 412, Rosebank Township, Registration Division I.Q., Province of Gauteng", status: "confirmed", created_at: daysAgo(3) },
        { id: "e2", type: "Rates Clearance", source: "City of JHB", reference: "RC-2025-04123", excerpt: "Rates and taxes paid to date. No arrears.", status: "confirmed", created_at: daysAgo(3) },
        { id: "e3", type: "Fraud Check", source: "FIC Database", reference: "FC-2025-8812", excerpt: "No adverse listings found for seller or buyer.", status: "confirmed", created_at: daysAgo(3) },
      ],
      flags: [
        { id: "f1", severity: "info", category: "Title", message: "Title deed registered in 2018, no encumbrances", source: "Deeds Office" },
        { id: "f2", severity: "info", category: "Municipal", message: "Rates account up to date", source: "City of Johannesburg" },
      ],
      audit_log: [
        { id: "a1", event_type: "Matter created", actor_name: "You", created_at: daysAgo(3) },
        { id: "a2", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(3) },
      ],
    },
    {
      id: "mtr_002",
      reference: "TC-314159",
      property_description: "Erf 88, Sandton Extension 12",
      locality_or_area: "Sandton",
      municipality_or_deeds_office: "City of Johannesburg",
      title_reference: "T67890/2015",
      matter_reference: "M-2025-088",
      status: "review",
      decision: "review",
      confidence: 67,
      created_at: daysAgo(5),
      updated_at: daysAgo(2),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p4", role: "seller", entity_type: "company", display_name: "Sandton Properties Pty Ltd", identifier: "CK2015/123456" },
        { id: "p5", role: "buyer", entity_type: "person", display_name: "James Nkosi", identifier: "9001015009087" },
        { id: "p6", role: "conveyancer", entity_type: "company", display_name: "Nkosi Attorneys", identifier: "CK2018/987654" },
      ],
      evidence: [
        { id: "e4", type: "Title Deed", source: "Deeds Office", reference: "T67890/2015", excerpt: "Erf 88, Sandton Ext 12, with bond B54321/2019 registered", status: "confirmed", created_at: daysAgo(5) },
        { id: "e5", type: "Bond Statement", source: "Standard Bank", reference: "BST-2025-8812", excerpt: "Outstanding balance: R2,400,000. Consent required for transfer.", status: "captured", created_at: daysAgo(5) },
        { id: "e6", type: "Company Search", source: "CIPC", reference: "CK2015/123456", excerpt: "Name change from Sandton Holdings Pty Ltd to Sandton Properties Pty Ltd, 14 Mar 2023", status: "confirmed", created_at: daysAgo(5) },
      ],
      flags: [
        { id: "f3", severity: "warning", category: "Title", message: "Second bond registered — R2.4M outstanding", source: "Deeds Office" },
        { id: "f4", severity: "info", category: "Municipal", message: "Rates account up to date", source: "City of Johannesburg" },
        { id: "f5", severity: "warning", category: "Entity", message: "Seller entity changed name in 2023", source: "CIPC" },
      ],
      audit_log: [
        { id: "a3", event_type: "Matter created", actor_name: "You", created_at: daysAgo(5) },
        { id: "a4", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(5) },
        { id: "a5", event_type: "Evidence added", actor_name: "You", created_at: daysAgo(2) },
      ],
    },
    {
      id: "mtr_003",
      reference: "TC-271828",
      property_description: "Erf 123, Centurion Central",
      locality_or_area: "Centurion",
      municipality_or_deeds_office: "City of Tshwane",
      title_reference: "T44556/2012",
      matter_reference: "M-2025-123",
      status: "stop",
      decision: "stop",
      confidence: 98,
      created_at: daysAgo(8),
      updated_at: daysAgo(8),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p7", role: "seller", entity_type: "company", display_name: "Erf 123 Properties", identifier: "CK2012/987654" },
        { id: "p8", role: "buyer", entity_type: "person", display_name: "Priya Pillay", identifier: "7803120087082" },
      ],
      evidence: [
        { id: "e7", type: "Title Deed", source: "Deeds Office", reference: "T44556/2012", excerpt: "INTERDICT registered 2024-11-03. Transfer prohibited until further notice.", status: "confirmed", created_at: daysAgo(8) },
        { id: "e8", type: "Court Record", source: "CaseWatch", reference: "2024/12345", excerpt: "Applicant: Absa Bank Ltd vs Respondent: Erf 123 Properties. Hearing date TBC.", status: "confirmed", created_at: daysAgo(8) },
        { id: "e9", type: "Rates Statement", source: "City of Tshwane", reference: "RS-2025-3321", excerpt: "Arrears: R47,320. Legal action pending.", status: "confirmed", created_at: daysAgo(8) },
      ],
      flags: [
        { id: "f6", severity: "critical", category: "Title", message: "Property under Deeds Office interdict — transfer prohibited", source: "Deeds Office" },
        { id: "f7", severity: "critical", category: "Legal", message: "Pending litigation: Case 2024/12345 in High Court PTA", source: "CaseWatch" },
        { id: "f8", severity: "warning", category: "Municipal", message: "Rates arrears: R47,320", source: "City of Tshwane" },
      ],
      audit_log: [
        { id: "a6", event_type: "Matter created", actor_name: "You", created_at: daysAgo(8) },
        { id: "a7", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(8) },
      ],
    },
    {
      id: "mtr_004",
      reference: "TC-161803",
      property_description: "Unit 402, The Apex, Cape Town CBD",
      locality_or_area: "Cape Town CBD",
      municipality_or_deeds_office: "City of Cape Town",
      title_reference: "T99887/2020",
      matter_reference: "M-2025-402",
      status: "pending",
      confidence: 0,
      created_at: hoursAgo(2),
      updated_at: hoursAgo(2),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p9", role: "seller", entity_type: "person", display_name: "David Cohen", identifier: "6502025087083" },
        { id: "p10", role: "buyer", entity_type: "person", display_name: "Nomsa Dlamini", identifier: "8807150123084" },
      ],
      evidence: [],
      flags: [],
      audit_log: [
        { id: "a8", event_type: "Matter created", actor_name: "You", created_at: hoursAgo(2) },
      ],
    },
    {
      id: "mtr_005",
      reference: "TC-577215",
      property_description: "Portion 15 of Erf 200, Bryanston",
      locality_or_area: "Bryanston",
      municipality_or_deeds_office: "City of Johannesburg",
      title_reference: "T33445/2016",
      matter_reference: "M-2025-200",
      status: "clear",
      decision: "clear",
      confidence: 91,
      created_at: daysAgo(12),
      updated_at: daysAgo(10),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p11", role: "seller", entity_type: "person", display_name: "Lerato Mabena", identifier: "8001010123086" },
        { id: "p12", role: "buyer", entity_type: "company", display_name: "Bryanston Holdings", identifier: "CK2020/445566" },
      ],
      evidence: [
        { id: "e10", type: "Title Deed", source: "Deeds Office", reference: "T33445/2016", excerpt: "Portion 15 of Erf 200, Bryanston. No encumbrances.", status: "confirmed", created_at: daysAgo(12) },
        { id: "e11", type: "Rates Clearance", source: "City of JHB", reference: "RC-2025-01500", excerpt: "Rates paid to date. Clearance issued.", status: "confirmed", created_at: daysAgo(12) },
      ],
      flags: [
        { id: "f9", severity: "info", category: "Title", message: "Title clear, no encumbrances registered", source: "Deeds Office" },
        { id: "f10", severity: "info", category: "Municipal", message: "Rates clearance certificate valid", source: "City of Johannesburg" },
      ],
      audit_log: [
        { id: "a9", event_type: "Matter created", actor_name: "You", created_at: daysAgo(12) },
        { id: "a10", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(12) },
        { id: "a11", event_type: "Rates clearance uploaded", actor_name: "You", created_at: daysAgo(10) },
      ],
    },
    {
      id: "mtr_006",
      reference: "TC-662606",
      property_description: "Erf 77, Sea Point",
      locality_or_area: "Sea Point",
      municipality_or_deeds_office: "City of Cape Town",
      title_reference: "T77889/2019",
      matter_reference: "M-2025-077",
      status: "review",
      decision: "review",
      confidence: 72,
      created_at: daysAgo(15),
      updated_at: daysAgo(6),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p13", role: "seller", entity_type: "person", display_name: "Michael Peters", identifier: "7102025087084" },
        { id: "p14", role: "buyer", entity_type: "person", display_name: "Amina Patel", identifier: "8503120087083" },
      ],
      evidence: [
        { id: "e12", type: "Title Deed", source: "Deeds Office", reference: "T77889/2019", excerpt: "Erf 77, Sea Point. Servitude registered for municipal pipeline.", status: "confirmed", created_at: daysAgo(15) },
        { id: "e13", type: "Municipal Plan", source: "City of Cape Town", reference: "MP-2025-077", excerpt: "Servitude map shows pipeline crossing north-west corner.", status: "captured", created_at: daysAgo(15) },
      ],
      flags: [
        { id: "f11", severity: "warning", category: "Title", message: "Servitude registered — municipal pipeline", source: "Deeds Office" },
        { id: "f12", severity: "info", category: "Municipal", message: "Rates account up to date", source: "City of Cape Town" },
      ],
      audit_log: [
        { id: "a12", event_type: "Matter created", actor_name: "You", created_at: daysAgo(15) },
        { id: "a13", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(15) },
        { id: "a14", event_type: "Evidence added", actor_name: "You", created_at: daysAgo(6) },
      ],
    },
    {
      id: "mtr_007",
      reference: "TC-887654",
      property_description: "Farm 1024, Kameeldrift",
      locality_or_area: "Kameeldrift",
      municipality_or_deeds_office: "City of Tshwane",
      title_reference: "T11223/2008",
      matter_reference: "M-2025-024",
      status: "clear",
      decision: "clear",
      confidence: 89,
      created_at: daysAgo(18),
      updated_at: daysAgo(16),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p15", role: "seller", entity_type: "company", display_name: "Kameeldrift Farms Ltd", identifier: "CK2005/112233" },
        { id: "p16", role: "buyer", entity_type: "person", display_name: "Pieter de Klerk", identifier: "6501015009085" },
      ],
      evidence: [
        { id: "e14", type: "Title Deed", source: "Deeds Office", reference: "T11223/2008", excerpt: "Farm 1024, Kameeldrift, Registration Division J.R.", status: "confirmed", created_at: daysAgo(18) },
        { id: "e15", type: "Agricultural Permit", source: "Dept Agriculture", reference: "AP-2025-024", excerpt: "Land use permit valid. No restrictions.", status: "confirmed", created_at: daysAgo(18) },
      ],
      flags: [
        { id: "f13", severity: "info", category: "Title", message: "Farm title clear, no encumbrances", source: "Deeds Office" },
        { id: "f14", severity: "info", category: "Environmental", message: "Agricultural permit valid", source: "Dept Agriculture" },
      ],
      audit_log: [
        { id: "a15", event_type: "Matter created", actor_name: "You", created_at: daysAgo(18) },
        { id: "a16", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(18) },
      ],
    },
    {
      id: "mtr_008",
      reference: "TC-998877",
      property_description: "Unit 15, Horizon View, Durban North",
      locality_or_area: "Durban North",
      municipality_or_deeds_office: "eThekwini",
      title_reference: "T55667/2021",
      matter_reference: "M-2025-015",
      status: "stop",
      decision: "stop",
      confidence: 95,
      created_at: daysAgo(20),
      updated_at: daysAgo(20),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p17", role: "seller", entity_type: "person", display_name: "Rajesh Naidoo", identifier: "7203120087081" },
        { id: "p18", role: "buyer", entity_type: "person", display_name: "Thuli Khumalo", identifier: "8906150123087" },
      ],
      evidence: [
        { id: "e16", type: "Title Deed", source: "Deeds Office", reference: "T55667/2021", excerpt: "Sectional title unit 15. Body corporate in liquidation.", status: "confirmed", created_at: daysAgo(20) },
        { id: "e17", type: "Liquidation Order", source: "High Court DBN", reference: "L2024/5566", excerpt: "Body corporate placed under provisional liquidation 2024-09-12.", status: "confirmed", created_at: daysAgo(20) },
      ],
      flags: [
        { id: "f15", severity: "critical", category: "Title", message: "Body corporate in liquidation — transfer blocked", source: "Deeds Office" },
        { id: "f16", severity: "critical", category: "Legal", message: "Provisional liquidation order in effect", source: "High Court DBN" },
      ],
      audit_log: [
        { id: "a17", event_type: "Matter created", actor_name: "You", created_at: daysAgo(20) },
        { id: "a18", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(20) },
      ],
    },
    {
      id: "mtr_009",
      reference: "TC-334455",
      property_description: "Erf 301, Umhlanga Rocks",
      locality_or_area: "Umhlanga",
      municipality_or_deeds_office: "eThekwini",
      title_reference: "T22334/2017",
      matter_reference: "M-2025-301",
      status: "review",
      decision: "review",
      confidence: 58,
      created_at: daysAgo(22),
      updated_at: daysAgo(9),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p19", role: "seller", entity_type: "trust", display_name: "Umhlanga Family Trust", identifier: "IT1234/2015" },
        { id: "p20", role: "buyer", entity_type: "person", display_name: "Chris Botha", identifier: "7601015009086" },
      ],
      evidence: [
        { id: "e18", type: "Title Deed", source: "Deeds Office", reference: "T22334/2017", excerpt: "Erf 301, Umhlanga Rocks. Registered in name of trust.", status: "confirmed", created_at: daysAgo(22) },
        { id: "e19", type: "Trust Deed", source: "Master of High Court", reference: "TD-2015-1234", excerpt: "Trust deed requires consent of all trustees for property disposal.", status: "captured", created_at: daysAgo(22) },
      ],
      flags: [
        { id: "f17", severity: "warning", category: "Title", message: "Property held in trust — trustee consent required", source: "Deeds Office" },
        { id: "f18", severity: "warning", category: "Entity", message: "Trust deed restricts disposal without unanimous consent", source: "Master of High Court" },
      ],
      audit_log: [
        { id: "a19", event_type: "Matter created", actor_name: "You", created_at: daysAgo(22) },
        { id: "a20", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(22) },
        { id: "a21", event_type: "Trust documents requested", actor_name: "You", created_at: daysAgo(9) },
      ],
    },
    {
      id: "mtr_010",
      reference: "TC-778899",
      property_description: "Erf 55, Parkhurst",
      locality_or_area: "Parkhurst",
      municipality_or_deeds_office: "City of Johannesburg",
      title_reference: "T99001/2014",
      matter_reference: "M-2025-055",
      status: "clear",
      decision: "clear",
      confidence: 96,
      created_at: daysAgo(25),
      updated_at: daysAgo(23),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p21", role: "seller", entity_type: "person", display_name: "Karen Vorster", identifier: "6902025087082" },
        { id: "p22", role: "buyer", entity_type: "person", display_name: "Sipho Mthembu", identifier: "8407150123085" },
      ],
      evidence: [
        { id: "e20", type: "Title Deed", source: "Deeds Office", reference: "T99001/2014", excerpt: "Erf 55, Parkhurst. No encumbrances or restrictions.", status: "confirmed", created_at: daysAgo(25) },
        { id: "e21", type: "Rates Clearance", source: "City of JHB", reference: "RC-2025-05500", excerpt: "All rates paid. Clearance valid until 2025-07-31.", status: "confirmed", created_at: daysAgo(25) },
      ],
      flags: [
        { id: "f19", severity: "info", category: "Title", message: "Title clear, no encumbrances", source: "Deeds Office" },
        { id: "f20", severity: "info", category: "Municipal", message: "Rates clearance valid", source: "City of Johannesburg" },
      ],
      audit_log: [
        { id: "a22", event_type: "Matter created", actor_name: "You", created_at: daysAgo(25) },
        { id: "a23", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(25) },
        { id: "a24", event_type: "Rates clearance uploaded", actor_name: "You", created_at: daysAgo(23) },
      ],
    },
    {
      id: "mtr_011",
      reference: "TC-556677",
      property_description: "Unit 8, The Pavilion, Fourways",
      locality_or_area: "Fourways",
      municipality_or_deeds_office: "City of Johannesburg",
      title_reference: "T44552/2020",
      matter_reference: "M-2025-008",
      status: "pending",
      confidence: 0,
      created_at: hoursAgo(5),
      updated_at: hoursAgo(5),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p23", role: "seller", entity_type: "person", display_name: "Fatima Hassam", identifier: "7403120087084" },
        { id: "p24", role: "buyer", entity_type: "person", display_name: "Mark Johnson", identifier: "8101015009088" },
      ],
      evidence: [],
      flags: [],
      audit_log: [
        { id: "a25", event_type: "Matter created", actor_name: "You", created_at: hoursAgo(5) },
      ],
    },
    {
      id: "mtr_012",
      reference: "TC-112233",
      property_description: "Erf 2001, Midrand",
      locality_or_area: "Midrand",
      municipality_or_deeds_office: "City of Johannesburg",
      title_reference: "T66778/2016",
      matter_reference: "M-2025-001",
      status: "clear",
      decision: "clear",
      confidence: 92,
      created_at: daysAgo(30),
      updated_at: daysAgo(28),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p25", role: "seller", entity_type: "company", display_name: "Midrand Developments", identifier: "CK2016/778899" },
        { id: "p26", role: "buyer", entity_type: "person", display_name: "Grace Mokoena", identifier: "7906150123086" },
      ],
      evidence: [
        { id: "e22", type: "Title Deed", source: "Deeds Office", reference: "T66778/2016", excerpt: "Erf 2001, Midrand. Development rights approved.", status: "confirmed", created_at: daysAgo(30) },
        { id: "e23", type: "Development Approval", source: "City of JHB", reference: "DA-2025-001", excerpt: "Development rights approved 2024-12-01. Valid for 3 years.", status: "confirmed", created_at: daysAgo(30) },
      ],
      flags: [
        { id: "f21", severity: "info", category: "Title", message: "Title clear, development rights approved", source: "Deeds Office" },
        { id: "f22", severity: "info", category: "Planning", message: "Development rights valid until 2027-12-01", source: "City of Johannesburg" },
      ],
      audit_log: [
        { id: "a26", event_type: "Matter created", actor_name: "You", created_at: daysAgo(30) },
        { id: "a27", event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: daysAgo(30) },
        { id: "a28", event_type: "Development docs uploaded", actor_name: "You", created_at: daysAgo(28) },
      ],
    },
  ];

  store(seed);
}

export function listMatters(): Matter[] {
  seedIfEmpty();
  return getStored().sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function getMatter(id: string): Matter | null {
  seedIfEmpty();
  return getStored().find((m) => m.id === id) ?? null;
}

export function createMatter(input: {
  property_description: string;
  locality_or_area: string;
  municipality_or_deeds_office: string;
  title_reference?: string;
  matter_reference?: string;
  created_by: string;
}): Matter {
  seedIfEmpty();
  const matters = getStored();

  const desc = input.property_description.toLowerCase();
  const loc = input.locality_or_area.toLowerCase();
  let decision: MatterStatus = "clear";
  let confidence = 94;
  let flags: Flag[] = [];
  let evidence: EvidenceItem[] = [];

  if (loc.includes("sandton") || desc.includes("sandton")) {
    decision = "review";
    confidence = 67;
    flags = [
      { id: `fw_${Date.now()}`, severity: "warning", category: "Title", message: "Second bond registered — outstanding balance", source: "Deeds Office" },
      { id: `fw_${Date.now()}_2`, severity: "info", category: "Municipal", message: "Rates account up to date", source: "City of Johannesburg" },
    ];
    evidence = [
      { id: `ew_${Date.now()}`, type: "Title Deed", source: "Deeds Office", reference: "T67890/2015", excerpt: "Bond B54321/2019 registered against title", status: "confirmed", created_at: now() },
      { id: `ew_${Date.now()}_2`, type: "Bond Statement", source: "Standard Bank", reference: "BST-2025-8812", excerpt: "Outstanding balance: R2,400,000", status: "captured", created_at: now() },
    ];
  } else if (loc.includes("centurion") || desc.includes("centurion")) {
    decision = "stop";
    confidence = 98;
    flags = [
      { id: `fs_${Date.now()}`, severity: "critical", category: "Title", message: "Property under Deeds Office interdict", source: "Deeds Office" },
      { id: `fs_${Date.now()}_2`, severity: "critical", category: "Legal", message: "Pending litigation in High Court", source: "CaseWatch" },
    ];
    evidence = [
      { id: `es_${Date.now()}`, type: "Title Deed", source: "Deeds Office", reference: "T44556/2012", excerpt: "INTERDICT registered 2024-11-03. Transfer prohibited.", status: "confirmed", created_at: now() },
      { id: `es_${Date.now()}_2`, type: "Court Record", source: "CaseWatch", reference: "2024/12345", excerpt: "Litigation pending. Hearing date TBC.", status: "confirmed", created_at: now() },
    ];
  } else {
    flags = [
      { id: `fc_${Date.now()}`, severity: "info", category: "Title", message: "Title deed verified, no encumbrances", source: "Deeds Office" },
      { id: `fc_${Date.now()}_2`, severity: "info", category: "Municipal", message: "Rates account up to date", source: "City of Johannesburg" },
    ];
    evidence = [
      { id: `ec_${Date.now()}`, type: "Title Deed", source: "Deeds Office", reference: "T12345/2018", excerpt: "No encumbrances registered against title", status: "confirmed", created_at: now() },
      { id: `ec_${Date.now()}_2`, type: "Rates Clearance", source: "City of JHB", reference: "RC-2025-04123", excerpt: "Rates and taxes paid to date", status: "confirmed", created_at: now() },
    ];
  }

  const n = now();
  const matter: Matter = {
    id: `mtr_${Date.now()}`,
    reference: genRef(),
    ...input,
    status: decision,
    decision,
    confidence,
    created_at: n,
    updated_at: n,
    assignee_id: input.created_by,
    parties: [],
    evidence,
    flags,
    audit_log: [
      { id: `a_${Date.now()}_1`, event_type: "Matter created", actor_name: "You", created_at: n },
      { id: `a_${Date.now()}_2`, event_type: "Clear-to-Lodge check completed", actor_name: "TitleChain", created_at: n },
    ],
  };

  matters.unshift(matter);
  store(matters);
  return matter;
}

export function updateMatter(matter: Matter) {
  const matters = getStored();
  const idx = matters.findIndex((m) => m.id === matter.id);
  if (idx >= 0) {
    matters[idx] = matter;
    store(matters);
  }
}
