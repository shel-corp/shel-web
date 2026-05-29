import React from 'react';
import { companyDirectorySummary, companyDirectoryTeams } from '../data/companyDirectory';
import StatusLine from './StatusLine';

export default function DirectorySection() {
  return (
    <section id="directory">
      <h2>Company Directory</h2>
      <StatusLine className="page-status">{companyDirectorySummary.classification}</StatusLine>
      <p>
        Public contact routes are grouped by accountable Shelcorp team. Use the most specific
        route available; unclassified requests enter Commercial Operations for triage.
      </p>

      <div className="directory-teams">
        {companyDirectoryTeams.map((team) => (
          <article key={team.id} className="directory-team-card">
            <div className="directory-team-header">
              <div>
                <p className="status">{team.id} · {team.code}</p>
                <h3>{team.name}</h3>
              </div>
              <span>{team.contacts.length} ROUTES</span>
            </div>
            <p>{team.mandate}</p>
            <div className="directory-contact-list">
              {team.contacts.map((contact) => (
                <div key={contact.email} className="directory-row">
                  <div>
                    <strong>{contact.name}</strong>
                    <span>{contact.channel}</span>
                  </div>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="footer-status directory-card">
        <div>{companyDirectorySummary.revision}</div>
        <div>{companyDirectorySummary.note}</div>
      </div>
    </section>
  );
}
