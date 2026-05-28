import React from 'react';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { currentTimestamp } from '../lib/status';
import StatusLine from './StatusLine';

export default function Hero() {
  const lastSync = useMemo(() => currentTimestamp(), []);

  return (
    <section className="hero">
      <StatusLine>STATUS: OPERATIONAL · LAST SYNC: <span>{lastSync}</span></StatusLine>
      <h1>Software, properly controlled.</h1>
      <p>Tools for developers who value precision, repeatability, and efficiency.</p>
      <div className="cta">
        <Link to="/products">View Tools</Link>
        <Link to="/docs">Read Documentation</Link>
      </div>
    </section>
  );
}
