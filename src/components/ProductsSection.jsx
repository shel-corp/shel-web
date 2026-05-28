import { products } from '../data/content.js';

export default function ProductsSection() {
  return (
    <section id="products">
      <h2>Products</h2>
      <div className="products">
        {products.map((product) => (
          <div key={product.name}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="status">ORIGINATING DEPARTMENT: {product.department}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
