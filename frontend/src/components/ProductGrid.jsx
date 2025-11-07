import React from 'react';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products = [] }) {
  // ensure products is an array
  const list = Array.isArray(products) ? products : [];

  return (
    <section className="product-grid">
      {list.length === 0 ? (
        <div className="empty">Chưa có sản phẩm</div>
      ) : (
        list.map((p) => (
          // use numeric id as key; fallback to name+index
          <ProductCard key={p.id ?? `${p.name}-${Math.random()}`} product={p} />
        ))
      )}
    </section>
  );
}

