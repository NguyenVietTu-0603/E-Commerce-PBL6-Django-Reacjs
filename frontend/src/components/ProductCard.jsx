import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../utils/CartContext';
import '../assets/ProductCard.css';  // ⬅️ Thêm import này

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  // normalize category to a string
  const categoryName =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name ?? product.category?.title ?? '';

  const imageSrc = product.image || '/samba.avif';
  const defaultImage = '/samba.avif';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    addToCart(product, 1);
    
    setShowSuccess(true);
    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(false);
    }, 1500);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-thumb">
          <div className="product-image">
            <img 
              src={imageError ? defaultImage : imageSrc} 
              alt={product.name || 'Product image'}
              loading="lazy"
              onError={handleImageError}
            />
          </div>
          <div className="product-overlay">
            <button
              className={`add-to-cart-btn ${isAdding ? 'adding' : ''} ${showSuccess ? 'success' : ''}`}
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label="Thêm vào giỏ hàng"
            >
              {showSuccess ? (
                <>
                  <span className="cart-icon">✓</span>
                  <span className="cart-text">Đã thêm</span>
                </>
              ) : isAdding ? (
                <>
                  <span className="cart-icon">...</span>
                  <span className="cart-text">Đang thêm...</span>
                </>
              ) : (
                <>
                  <span className="cart-icon">+</span>
                  <span className="cart-text">Thêm vào giỏ</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="product-body">
          <h3 className="product-name">{product.name}</h3>
          {categoryName && <div className="product-category">{categoryName}</div>}
          <div className="product-price">
            {product.price ? `${Number(product.price).toLocaleString('vi-VN')}₫` : 'Liên hệ'}
          </div>
        </div>
      </Link>
    </article>
  );
}

