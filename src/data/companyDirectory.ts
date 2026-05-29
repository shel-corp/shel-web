export type CompanyDirectoryContact = {
  name: string;
  email: string;
  channel: string;
};

export type CompanyDirectoryTeam = {
  id: string;
  name: string;
  code: string;
  mandate: string;
  contacts: CompanyDirectoryContact[];
};

const unsortedTeams: CompanyDirectoryTeam[] = [
  {
    id: 'SC-TEAM-WORKFLOW',
    name: 'Workflow Compliance',
    code: 'WF-COMP',
    mandate: 'Maintains measurement rules, operator cadence, and public workflow conformance signals.',
    contacts: [
      { name: 'Quality Assurance', email: 'qa@shelcorp.com', channel: 'Regression evidence and acceptance gates' },
      { name: 'Workflow Compliance', email: 'workflow-compliance@shelcorp.com', channel: 'Process drift reports and metrics review' },
    ],
  },
  {
    id: 'SC-TEAM-DOCS',
    name: 'Documentation Integrity',
    code: 'DOC-INT',
    mandate: 'Controls public revisions, reference packets, memo fragments, and publication boundaries.',
    contacts: [
      { name: 'Documentation Integrity', email: 'docs-integrity@shelcorp.com', channel: 'Controlled document corrections' },
      { name: 'Release Management', email: 'release-management@shelcorp.com', channel: 'Release notes and public changelog routing' },
    ],
  },
  {
    id: 'SC-TEAM-COMMERCIAL',
    name: 'Commercial Operations',
    code: 'COM-OPS',
    mandate: 'Handles external inquiries, billing requests, press routing, recruiting intake, and general contact triage.',
    contacts: [
      { name: 'Billing', email: 'billing@shelcorp.com', channel: 'Invoices, procurement, and vendor records' },
      { name: 'Careers', email: 'recruiting@shelcorp.com', channel: 'Hiring and candidate routing' },
      { name: 'General Inquiries', email: 'info@shelcorp.com', channel: 'Unclassified public requests' },
      { name: 'Press', email: 'press@shelcorp.com', channel: 'Media and statement requests' },
      { name: 'Support', email: 'support@shelcorp.com', channel: 'Public product support intake' },
    ],
  },
  {
    id: 'SC-TEAM-PLATFORM',
    name: 'Platform Reliability',
    code: 'PLAT-REL',
    mandate: 'Operates exposed systems, environment routing, security review, and availability boundaries.',
    contacts: [
      { name: 'Environmental Conditioning', email: 'environmental-conditioning@shelcorp.com', channel: 'Environment provisioning and calibration' },
      { name: 'Infrastructure & Reliability', email: 'sre@shelcorp.com', channel: 'Availability, routing, and incident follow-up' },
      { name: 'Security Operations', email: 'secops@shelcorp.com', channel: 'Security review and disclosure intake' },
    ],
  },
  {
    id: 'SC-TEAM-OPERATOR',
    name: 'Operator Relations',
    code: 'OP-REL',
    mandate: 'Manages operator-facing communications, behavioral alignment requests, and exception handling.',
    contacts: [
      { name: 'Behavioral Alignment', email: 'behavioral-alignment@shelcorp.com', channel: 'Operator variance and compliance concerns' },
      { name: 'Legal', email: 'legal@shelcorp.com', channel: 'Formal notices and controlled legal intake' },
      { name: 'Operator Relations', email: 'operator-relations@shelcorp.com', channel: 'Operator contact and escalation routing' },
    ],
  },
  {
    id: 'SC-TEAM-RESEARCH',
    name: 'Systems Research',
    code: 'SYS-RES',
    mandate: 'Maintains product prototypes, research channels, and structured software-system experiments.',
    contacts: [
      { name: 'Systems Research', email: 'systems-research@shelcorp.com', channel: 'Research requests and product-line questions' },
    ],
  },
];

function sortContacts(contacts: CompanyDirectoryContact[]) {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
}

export const companyDirectoryTeams = [...unsortedTeams]
  .map((team) => ({ ...team, contacts: sortContacts(team.contacts) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const companyDirectorySummary = {
  classification: 'PUBLIC CONTACT ROUTING — TEAM SORTED',
  revision: 'SC-DIR-2026.05',
  note: 'Routing is automated. Responses are issued in controlled revisions.',
};
