import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <div className="logo" aria-label="Shelcorp">
      <Link to="/" aria-label="Shelcorp Home" className="logo-link">
        <svg width="110" height="50" viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Shelcorp Standard Mark">
          <path d="M 48 12 H 172 A 38 38 0 0 1 210 50 A 38 38 0 0 1 172 88 H 48 A 38 38 0 0 1 10 50 A 38 38 0 0 1 48 12 Z" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinejoin="round" />
          <path d="M 78 36 H 128 C 146 36, 146 64, 128 64 H 92 C 74 64, 74 36, 92 36" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
