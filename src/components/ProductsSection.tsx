import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/content';

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
            {product.href ? <Link className="product-link" to={product.href}>Open product</Link> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
