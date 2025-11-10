import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../utils/CartContext';
import { formatPrice } from '../utils/formatPrice';
import '../assets/productDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [color, setColor] = useState('');
    const [size, setSize] = useState('');
    const [qty, setQty] = useState(1);

    useEffect(() => {
        fetch(`http://localhost:8000/api/products/${id}/`)
            .then(res => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setMainImage(data.image || '/default-product.png');
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading product:', err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="product-detail">
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p>Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail">
                <div className="pd-card" style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center' }}>
                    <h2>Không tìm thấy sản phẩm</h2>
                    <p><Link to="/" style={{ color: 'var(--accent)' }}>Quay về trang chủ</Link></p>
                </div>
            </div>
        );
    }

    const vouchers = product.vouchers || [];
    const colors = product.variants?.colors || [];
    const sizes = product.variants?.sizes || [];
    const specs = product.specs || [];
    const description = product.description || 'Chưa có mô tả cho sản phẩm này.';

    // Shop info
    const shop = {
        id: product.seller_id,
        name: product.seller_name || 'Cửa hàng V-Market',
        avatar: '/default-avatar.png', // nếu có ảnh shop riêng thì thay ở đây
        rating: product.rating || 4.8,
        followers: product.followers || '150k'
    };

    function dec() {
        setQty(prev => Math.max(1, prev - 1));
    }

    function inc() {
        setQty(prev => Math.min(prev + 1, product.stock || 999));
    }

    function handleAddToCart() {
        if (colors.length > 0 && !color) {
            alert('Vui lòng chọn màu sắc');
            return;
        }
        if (sizes.length > 0 && !size) {
            alert('Vui lòng chọn kích thước');
            return;
        }
        addToCart(product, qty, { color, size });
        alert(`Đã thêm ${qty} sản phẩm vào giỏ hàng`);
    }

    function handleBuyNow() {
        if (colors.length > 0 && !color) {
            alert('Vui lòng chọn màu sắc');
            return;
        }
        if (sizes.length > 0 && !size) {
            alert('Vui lòng chọn kích thước');
            return;
        }
        addToCart(product, qty, { color, size });
        navigate('/cart');
    }

    function handleChatWithShop() {
        navigate(`/chat/${shop.id}?product=${id}`);
    }

    function handleViewShop() {
        navigate(`/shop/${shop.id}`);
    }

    return (
        <div className="product-detail">
            <div className="product-detail-inner">
                {/* Left: Media */}
                <div className="product-detail-media">
                    <div className="pd-main-media">
                        <img src={mainImage} alt={product.name} />
                    </div>

                    {product.images && product.images.length > 0 && (
                        <div className="pd-thumbs">
                            {product.images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`pd-thumb ${mainImage === img ? 'active' : ''}`}
                                    onClick={() => setMainImage(img)}
                                >
                                    <img src={img} alt={`${product.name} ${i + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div className="product-detail-info">
                    <h1>{product.name}</h1>
                    <div className="product-detail-price">
                        {formatPrice(product.price)}
                    </div>

                    <div className="pd-card">
                        {/* Voucher */}
                        {vouchers.length > 0 && (
                            <div className="pd-row">
                                <div className="pd-label">Voucher</div>
                                <div>
                                    {vouchers.map(v => (
                                        <span key={v} className="pd-chip">{v}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vận chuyển */}
                        {product.shipping && (
                            <div className="pd-row">
                                <div className="pd-label">Vận chuyển</div>
                                <div>
                                    <div>Giao đến: <strong>{product.shipping.area || 'Toàn quốc'}</strong></div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Phí ship: {product.shipping.feeText || 'Freeship đơn từ 0đ'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Color selection */}
                        {colors.length > 0 && (
                            <div className="pd-row">
                                <div className="pd-label">Màu sắc</div>
                                <div>
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            className={`pd-chip ${color === c ? 'active' : ''}`}
                                            onClick={() => setColor(c)}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size selection */}
                        {sizes.length > 0 && (
                            <div className="pd-row">
                                <div className="pd-label">Kích thước</div>
                                <div>
                                    {sizes.map(s => (
                                        <button
                                            key={s}
                                            className={`pd-chip ${size === s ? 'active' : ''}`}
                                            onClick={() => setSize(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="pd-row">
                            <div className="pd-label">Số lượng</div>
                            <div>
                                <div className="pd-qty">
                                    <button onClick={dec}>−</button>
                                    <input type="number" value={qty} readOnly />
                                    <button onClick={inc}>+</button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pd-actions">
                            <button className="add-cart" onClick={handleAddToCart}>
                                Thêm vào giỏ
                            </button>
                            <button className="buy-now" onClick={handleBuyNow}>
                                Mua ngay
                            </button>
                        </div>
                    </div>

                    {/* Shop card */}
                    <div className="pd-card shop-card">
                        <div
                            className="shop-avatar"
                            style={{
                                backgroundImage: `url(${shop.avatar})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        />
                        <div className="shop-info">
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>
                                {shop.name}
                            </h4>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                                Đánh giá: <strong>{shop.rating}</strong> • Người theo dõi: <strong>{shop.followers}</strong>
                            </p>
                        </div>
                        <div className="shop-actions">
                            <button onClick={handleChatWithShop}>Chat ngay</button>
                            <button onClick={handleViewShop}>Xem shop</button>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="pd-meta">
                        <div>📦 Danh mục: {product.category?.name || 'Chưa phân loại'}</div>
                        <div>📊 Còn lại: {product.stock || 0} sản phẩm</div>
                    </div>
                </div>
            </div>

            {/* Sections below */}
            <div className="detail-sections">
                {/* Specifications */}
                {specs.length > 0 && (
                    <section className="detail-section">
                        <h3>Chi tiết sản phẩm</h3>
                        <div className="specs">
                            {specs.map((spec, i) => (
                                <React.Fragment key={i}>
                                    <div className="pd-label">{spec.label || spec[0]}:</div>
                                    <div>{spec.value || spec[1]}</div>
                                </React.Fragment>
                            ))}
                        </div>
                    </section>
                )}

                {/* Description */}
                <section className="detail-section">
                    <h3>Mô tả sản phẩm</h3>
                    <div className="pd-description">
                        <pre>{description}</pre>
                    </div>
                </section>
            </div>
        </div>
    );
}