import { Link } from 'react-router-dom';
import StatusLine from './StatusLine.jsx';

export default function EnvironmentsSection() {
  return (
    <section id="environments">
      <h2>Environments</h2>
      <StatusLine className="page-status">EXTERNAL INTERFACES — CONTROLLED ACCESS</StatusLine>
      <p>
        Provisioned environments are issued per policy. Public index is intentionally incomplete.
        If you have an authorization token, initiate routing.
      </p>
      <div className="cta"><Link to="/environments">Initiate Routing</Link></div>
    </section>
  );
}
