import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { currentTimestamp } from '../lib/status.js';

export default function Home() {
  const lastSync = useMemo(() => currentTimestamp(), []);

  return (
    <>
      <section className="hero">
        <div className="status">STATUS: OPERATIONAL · LAST SYNC: <span>{lastSync}</span></div>
        <h1>Software, properly controlled.</h1>
        <p>Tools for developers who value precision, repeatability, and efficiency.</p>
        <div className="cta">
          <Link to="/products">View Tools</Link>
          <Link to="/docs">Read Documentation</Link>
        </div>
      </section>

      <section aria-label="System Diagram">
        <div className="status">SYSTEM DIAGRAM — REFERENCE ONLY</div>
        <pre className="footer-status diagram">{`[  INPUT  ]───┐
              ├───[ NORMALIZATION ]───[ OUTPUT ]
[  INPUT  ]───┘

NOTE: Diagram is illustrative only.`}</pre>
      </section>

      <section>
        <h2>System Overview</h2>
        <p>
          Shelcorp builds software systems that reduce variability in operator-driven workflows.
          By constraining degrees of freedom, teams achieve predictable outcomes and measurable improvement.
        </p>
      </section>
    </>
  );
}
