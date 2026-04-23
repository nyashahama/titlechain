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

const MATTERS_KEY = "titlechain_mock_matters";

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

function makeEvidence(base: string): EvidenceItem[] {
  const sources = ["Deeds Office", "City of JHB", "Standard Bank", "CIPC", "CaseWatch", "City of Tshwane"];
  const types = ["Title Deed", "Rates Clearance", "Bond Statement", "Company Search", "Court Record", "Rates Statement"];
  const refs = ["T12345/2018", "RC-2025-04123", "BST-2025-8812", "CK2015/123456", "2024/12345", "RS-2025-3321"];
  const excerpts = [
    "Erf 412, Rosebank Township, Registration Division I.Q., Province of Gauteng",
    "Rates and taxes paid to date. No arrears.",
    "Outstanding balance: R2,400,000. Consent required for transfer.",
    "Name change from Sandton Holdings Pty Ltd to Sandton Properties Pty Ltd, 14 Mar 2023",
    "Applicant: Absa Bank Ltd vs Respondent: Erf 123 Properties. Hearing date TBC.",
    "Arrears: R47,320. Legal action pending.",
  ];
  return [
    { id: `${base}_e1`, type: types[0], source: sources[0], reference: refs[0], excerpt: excerpts[0], status: "confirmed", created_at: daysAgo(3) },
    { id: `${base}_e2`, type: types[1], source: sources[1], reference: refs[1], excerpt: excerpts[1], status: "confirmed", created_at: daysAgo(3) },
  ];
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
      evidence: makeEvidence("m001"),
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
      ],
      evidence: [
        { id: "e3", type: "Title Deed", source: "Deeds Office", reference: "T67890/2015", excerpt: "Erf 88, Sandton Ext 12, with bond B54321/2019 registered", status: "confirmed", created_at: daysAgo(5) },
        { id: "e4", type: "Bond Statement", source: "Standard Bank", reference: "BST-2025-8812", excerpt: "Outstanding balance: R2,400,000. Consent required for transfer.", status: "captured", created_at: daysAgo(5) },
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
        { id: "p6", role: "seller", entity_type: "company", display_name: "Erf 123 Properties", identifier: "CK2012/987654" },
        { id: "p7", role: "buyer", entity_type: "person", display_name: "Priya Pillay", identifier: "7803120087082" },
      ],
      evidence: [
        { id: "e5", type: "Title Deed", source: "Deeds Office", reference: "T44556/2012", excerpt: "INTERDICT registered 2024-11-03. Transfer prohibited until further notice.", status: "confirmed", created_at: daysAgo(8) },
        { id: "e6", type: "Court Record", source: "CaseWatch", reference: "2024/12345", excerpt: "Applicant: Absa Bank Ltd vs Respondent: Erf 123 Properties. Hearing date TBC.", status: "confirmed", created_at: daysAgo(8) },
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
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
      created_by: "usr_demo",
      assignee_id: "usr_demo",
      parties: [
        { id: "p8", role: "seller", entity_type: "person", display_name: "David Cohen", identifier: "6502025087083" },
        { id: "p9", role: "buyer", entity_type: "person", display_name: "Nomsa Dlamini", identifier: "8807150123084" },
      ],
      evidence: [],
      flags: [],
      audit_log: [
        { id: "a8", event_type: "Matter created", actor_name: "You", created_at: daysAgo(1) },
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
      { id: "fw1", severity: "warning", category: "Title", message: "Second bond registered — outstanding balance", source: "Deeds Office" },
      { id: "fw2", severity: "info", category: "Municipal", message: "Rates account up to date", source: "City of Johannesburg" },
    ];
    evidence = [
      { id: "ew1", type: "Title Deed", source: "Deeds Office", reference: "T67890/2015", excerpt: "Bond B54321/2019 registered against title", status: "confirmed", created_at: now() },
      { id: "ew2", type: "Bond Statement", source: "Standard Bank", reference: "BST-2025-8812", excerpt: "Outstanding balance: R2,400,000", status: "captured", created_at: now() },
    ];
  } else if (loc.includes("centurion") || desc.includes("centurion")) {
    decision = "stop";
    confidence = 98;
    flags = [
      { id: "fs1", severity: "critical", category: "Title", message: "Property under Deeds Office interdict", source: "Deeds Office" },
      { id: "fs2", severity: "critical", category: "Legal", message: "Pending litigation in High Court", source: "CaseWatch" },
    ];
    evidence = [
      { id: "es1", type: "Title Deed", source: "Deeds Office", reference: "T44556/2012", excerpt: "INTERDICT registered 2024-11-03. Transfer prohibited.", status: "confirmed", created_at: now() },
      { id: "es2", type: "Court Record", source: "CaseWatch", reference: "2024/12345", excerpt: "Litigation pending. Hearing date TBC.", status: "confirmed", created_at: now() },
    ];
  } else {
    flags = [
      { id: "fc1", severity: "info", category: "Title", message: "Title deed verified, no encumbrances", source: "Deeds Office" },
      { id: "fc2", severity: "info", category: "Municipal", message: "Rates account up to date", source: "City of Johannesburg" },
    ];
    evidence = [
      { id: "ec1", type: "Title Deed", source: "Deeds Office", reference: "T12345/2018", excerpt: "No encumbrances registered against title", status: "confirmed", created_at: now() },
      { id: "ec2", type: "Rates Clearance", source: "City of JHB", reference: "RC-2025-04123", excerpt: "Rates and taxes paid to date", status: "confirmed", created_at: now() },
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
