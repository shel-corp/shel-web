import { Link } from 'react-router-dom';

export default function CareersSection() {
  return (
    <section id="careers">
      <h2>Careers</h2>
      <p>Shelcorp hires engineers who value structure, discipline, and clear expectations.</p>
      <div className="cta"><Link to="/careers">View Open Roles</Link></div>
    </section>
  );
}
