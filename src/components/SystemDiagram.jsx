export default function SystemDiagram() {
  return (
    <section aria-label="System Diagram">
      <div className="status">SYSTEM DIAGRAM — REFERENCE ONLY</div>
      <pre className="footer-status diagram">{`[  INPUT  ]───┐
              ├───[ NORMALIZATION ]───[ OUTPUT ]
[  INPUT  ]───┘

NOTE: Diagram is illustrative only.`}</pre>
    </section>
  );
}
