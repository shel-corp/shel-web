import React from 'react';
import { notes } from '../data/content.js';

export default function NotesSection() {
  return (
    <section id="notes" className="notes">
      <div>
        <h2>Notes</h2>
        <p>Observations on building reliable developer systems.</p>
      </div>
      <ul>
        {notes.map((note) => (
          <li key={note.href}><a href={note.href}>{note.title}</a> — {note.date}</li>
        ))}
      </ul>
    </section>
  );
}
