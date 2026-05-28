const notes = [
  ['Normalizing Developer Input', '2025-03-12'],
  ['On Determinism in Tooling', '2025-02-28'],
  ['Why Variability Fails at Scale', '2025-02-11'],
  ['Company Lineage (Public Abstract)', '2025-01-04'],
];

export default function Notes() {
  return (
    <section className="notes">
      <div>
        <h2>Notes</h2>
        <p>Observations on building reliable developer systems.</p>
      </div>
      <ul>
        {notes.map(([title, date]) => (
          <li key={title}><a href="#pending">{title}</a> — {date}</li>
        ))}
      </ul>
    </section>
  );
}
