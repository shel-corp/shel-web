import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <h2>Route Not Found</h2>
      <p>The requested view is not available in the public interface.</p>
      <div className="cta"><Link to="/">Return Home</Link></div>
    </section>
  );
}
