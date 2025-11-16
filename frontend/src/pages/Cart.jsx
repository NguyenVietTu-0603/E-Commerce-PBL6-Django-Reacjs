import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../utils/CartContext';
import { useWishlist } from '../utils/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import '../assets/Cart.css';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount, addToCart } = useCart();
  const { savedItems, saveForLater, removeSavedItem, updateSavedQuantity } = useWishlist();

  const handleSaveForLater = async (item) => {
    try {
      await saveForLater({
        productId: item.id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      });
      removeFromCart(item.id, { color: item.color, size: item.size });
    } catch (err) {
      alert(err.message || 'Không thể lưu sản phẩm, vui lòng thử lại.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/" className="continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
          <span className="item-count">{getCartCount()} sản phẩm</span>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${item.color}-${item.size}-${index}`} className="cart-item">
                <div className="item-image">
                  <img src={item.image || '/default-product.png'} alt={item.name} />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-variants">
                    {item.color && <span className="variant">Màu: {item.color}</span>}
                    {item.size && <span className="variant">Size: {item.size}</span>}
                  </div>
                  <div className="item-price">{formatPrice(item.price)}</div>
                </div>

                <div className="item-quantity">
                  <button 
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1, { color: item.color, size: item.size })}
                  >
                    -
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1, { color: item.color, size: item.size })}
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button
                  className="save-later-btn"
                  onClick={() => handleSaveForLater(item)}
                >
                  Lưu để mua sau
                </button>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id, { color: item.color, size: item.size })}
                  title="Xóa sản phẩm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Tóm tắt đơn hàng</h3>
              
              <div className="summary-row">
                <span className="label">Tạm tính:</span>
                <span className="value">{formatPrice(getCartTotal())}</span>
              </div>
              
              <div className="summary-row">
                <span className="label">Phí vận chuyển:</span>
                <span className="shipping-fee">Miễn phí</span>
              </div>
              
              <div className="summary-row total">
                <span className="label">Tổng cộng:</span>
                <span className="value">{formatPrice(getCartTotal())}</span>
              </div>

              <Link to="/checkout" className="checkout-btn">
                Tiến hành thanh toán
              </Link>
              
              <Link to="/" className="continue-shopping">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>

        {savedItems.length > 0 && (
          <div className="saved-items-panel">
            <h2>Sản phẩm lưu để mua sau</h2>
            {savedItems.map((item) => (
              <div key={item.id} className="saved-item">
                <div className="saved-main">
                  <img src={item.product?.image || '/default-product.png'} alt={item.product?.name} />
                  <div>
                    <h3>{item.product?.name}</h3>
                    {item.color && <p>Màu: {item.color}</p>}
                    {item.size && <p>Size: {item.size}</p>}
                    <p>{formatPrice(item.product?.price || 0)}</p>
                  </div>
                </div>
                <div className="saved-actions">
                  <label>
                    Số lượng:
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) => updateSavedQuantity(item.id, Number(e.target.value) || 1)}
                    />
                  </label>
                  <button
                    className="restore-btn"
                    onClick={async () => {
                      addToCart(item.product, item.quantity || 1, { color: item.color, size: item.size });
                      await removeSavedItem(item.id);
                    }}
                  >
                    Đưa lại vào giỏ
                  </button>
                  <button className="remove" onClick={() => removeSavedItem(item.id)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}