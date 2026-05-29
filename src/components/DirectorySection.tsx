import React from 'react';
import { companyDirectorySummary, companyDirectoryTeams } from '../data/generated/companyDirectory';
import StatusLine from './StatusLine';

export default function DirectorySection() {
  return (
    <section id="directory">
      <h2>Company Directory</h2>
      <StatusLine className="page-status">{companyDirectorySummary.classification}</StatusLine>
      <p>
        Public user records are grouped by accountable Shelcorp team. Each record is sourced from the
        users table and includes the routing persona used for controlled contact surfaces.
      </p>

      <div className="directory-teams">
        {companyDirectoryTeams.map((team) => (
          <article key={team.id} className="directory-team-card">
            <div className="directory-team-header">
              <div>
                <p className="status">{team.id}</p>
                <h3>{team.name}</h3>
              </div>
              <span>{team.users.length} USERS</span>
            </div>
            <div className="directory-contact-list">
              {team.users.map((user) => (
                <div key={user.id} className="directory-row">
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.role}</span>
                    <span>{user.personality}</span>
                  </div>
                  <div className="directory-prompt">{user.systemPrompt}</div>
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
