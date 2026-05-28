const departments = [
  ['General Inquiries', 'info@shelcorp.com'],
  ['Support', 'support@shelcorp.com'],
  ['Documentation Integrity', 'docs-integrity@shelcorp.com'],
  ['Operator Relations', 'operator-relations@shelcorp.com'],
  ['Systems Research', 'systems-research@shelcorp.com'],
  ['Behavioral Alignment', 'behavioral-alignment@shelcorp.com'],
  ['Environmental Conditioning', 'environmental-conditioning@shelcorp.com'],
  ['Workflow Compliance', 'workflow-compliance@shelcorp.com'],
  ['Security Operations', 'secops@shelcorp.com'],
  ['Infrastructure & Reliability', 'sre@shelcorp.com'],
  ['Release Management', 'release-management@shelcorp.com'],
  ['Quality Assurance', 'qa@shelcorp.com'],
  ['Legal', 'legal@shelcorp.com'],
  ['Press', 'press@shelcorp.com'],
  ['Careers', 'recruiting@shelcorp.com'],
  ['Billing', 'billing@shelcorp.com'],
];

export default function Directory() {
  return (
    <section>
      <h2>Directory</h2>
      <p className="status page-status">PUBLIC CONTACT ROUTING — DEPARTMENTAL</p>
      <div className="footer-status directory-card">
        <div>DEPARTMENT DIRECTORY</div>
        <br />
        {departments.map(([department, email]) => (
          <div key={email} className="directory-row">
            <span>{department}</span>
            <a href={`mailto:${email}`}>{email}</a>
          </div>
        ))}
        <br />
        <div>NOTE: Routing is automated. Responses are issued in controlled revisions.</div>
      </div>
    </section>
  );
}
