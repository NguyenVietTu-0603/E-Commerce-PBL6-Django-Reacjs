import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  // normalize category to a string
  const categoryName =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name ?? product.category?.title ?? '';

  const imageSrc = product.image || '/samba.avif';
  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-link product-thumb">
        <div className="product-image">
          <img src={imageSrc} alt={product.name} />
        </div>

        <div className="product-body">
          <h3 className="product-name">{product.name}</h3>
          {categoryName && <div className="product-category">{categoryName}</div>}
          <div className="product-price">{product.price ? `${product.price}₫` : 'Liên hệ'}</div>
        </div>
      </Link>
    </article>
  );
}

