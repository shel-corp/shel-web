import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { checksum, currentTimestamp } from '../lib/status.js';

export default function Footer() {
  const status = useMemo(() => {
    const iso = currentTimestamp();
    return {
      update: iso.split('T')[1].replace('Z', ''),
      checksum: checksum(iso),
    };
  }, []);

  return (
    <footer>
      <nav aria-label="Footer navigation">
        <Link to="/docs">Docs</Link>
        <Link to="/notes">Notes</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/legal">Legal</Link>
      </nav>

      <div className="footer-status">
{`SYSTEM STATUS: OPERATIONAL
LAST UPDATE: ${status.update} UTC
CHECKSUM: ${status.checksum}`}
      </div>
    </footer>
  );
}
