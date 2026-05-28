import React from 'react';
import { departments } from '../data/content';
import StatusLine from './StatusLine';

export default function DirectorySection() {
  return (
    <section id="directory">
      <h2>Directory</h2>
      <StatusLine className="page-status">PUBLIC CONTACT ROUTING — DEPARTMENTAL</StatusLine>
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
