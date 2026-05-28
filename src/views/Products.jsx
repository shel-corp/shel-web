const products = [
  ['Branch State Manager', 'Manages branch-specific configuration, artifacts, and notes.', 'Documentation Integrity'],
  ['Pull Request Generator', 'Generates structured, review-ready pull requests and commit messages.', 'Systems Research'],
  ['Workflow Metrics', 'Surfaces performance characteristics across development workflows.', 'Workflow Compliance'],
];

export default function Products() {
  return (
    <section>
      <h2>Products</h2>
      <div className="products">
        {products.map(([name, description, department]) => (
          <div key={name}>
            <h3>{name}</h3>
            <p>{description}</p>
            <p className="status">ORIGINATING DEPARTMENT: {department}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
