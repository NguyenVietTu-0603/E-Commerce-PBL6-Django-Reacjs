import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/SellerDashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthRevenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders

  // Check if user is seller
  useEffect(() => {
    if (user && user.user_type !== 'seller') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch seller data
  useEffect(() => {
    if (user && user.user_type === 'seller') {
      fetchSellerData();
    }
  }, [user]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:8000/api/seller/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch products
      const productsRes = await fetch('http://localhost:8000/api/seller/products/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.slice(0, 5)); // Top 5 products
      }

      // Fetch orders
      const ordersRes = await fetch('http://localhost:8000/api/seller/orders/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.slice(0, 5)); // Recent 5 orders
      }

    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductStatusToggle = async (productId, currentStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/products/${productId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        fetchSellerData(); // Refresh data
        alert('Đã cập nhật trạng thái sản phẩm');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Lỗi khi cập nhật sản phẩm');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${orderId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchSellerData();
        alert('Đã cập nhật trạng thái đơn hàng');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Lỗi khi cập nhật đơn hàng');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="seller-dashboard-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="seller-dashboard">
        <div className="dashboard-container">
          
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <h1>🏪 Seller Dashboard</h1>
              <p className="welcome-text">
                Chào mừng trở lại, <strong>{user?.full_name || user?.username}</strong>!
              </p>
            </div>
            <div className="header-actions">
              <Link to="/seller/products/new" className="btn btn-primary">
                ➕ Thêm sản phẩm mới
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card stat-products">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stats.totalProducts}</h3>
                <p>Tổng sản phẩm</p>
                <span className="stat-detail">{stats.activeProducts} đang hoạt động</span>
              </div>
            </div>

            <div className="stat-card stat-orders">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>{stats.totalOrders}</h3>
                <p>Tổng đơn hàng</p>
                <span className="stat-detail">{stats.pendingOrders} đang chờ xử lý</span>
              </div>
            </div>

            <div className="stat-card stat-revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>${stats.totalRevenue.toLocaleString()}</h3>
                <p>Tổng doanh thu</p>
                <span className="stat-detail">+${stats.monthRevenue.toLocaleString()} tháng này</span>
              </div>
            </div>

            <div className="stat-card stat-rating">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>4.8</h3>
                <p>Đánh giá trung bình</p>
                <span className="stat-detail">124 đánh giá</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="dashboard-tabs">
            <button 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Tổng quan
            </button>
            <button 
              className={`tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Sản phẩm
            </button>
            <button 
              className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              🛒 Đơn hàng
            </button>
          </div>

          {/* Tab Content */}
          <div className="dashboard-content">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="content-grid">
                  
                  {/* Quick Actions */}
                  <div className="dashboard-card quick-actions-card">
                    <h2 className="card-title">⚡ Thao tác nhanh</h2>
                    <div className="quick-actions">
                      <Link to="/seller/products/new" className="action-item">
                        <span className="action-icon">➕</span>
                        <div className="action-text">
                          <strong>Thêm sản phẩm</strong>
                          <small>Đăng sản phẩm mới</small>
                        </div>
                      </Link>
                      
                      <Link to="/seller/products" className="action-item">
                        <span className="action-icon">📦</span>
                        <div className="action-text">
                          <strong>Quản lý sản phẩm</strong>
                          <small>Xem và chỉnh sửa</small>
                        </div>
                      </Link>
                      
                      <Link to="/seller/orders" className="action-item">
                        <span className="action-icon">📋</span>
                        <div className="action-text">
                          <strong>Xem đơn hàng</strong>
                          <small>Quản lý đơn đặt</small>
                        </div>
                      </Link>
                      
                      <Link to="/seller/analytics" className="action-item">
                        <span className="action-icon">📈</span>
                        <div className="action-text">
                          <strong>Thống kê</strong>
                          <small>Xem báo cáo</small>
                        </div>
                      </Link>
                      
                      <Link to="/profile" className="action-item">
                        <span className="action-icon">⚙️</span>
                        <div className="action-text">
                          <strong>Cài đặt</strong>
                          <small>Chỉnh sửa hồ sơ</small>
                        </div>
                      </Link>
                      
                      <Link to="/seller/promotions" className="action-item">
                        <span className="action-icon">🎁</span>
                        <div className="action-text">
                          <strong>Khuyến mãi</strong>
                          <small>Tạo ưu đãi</small>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Recent Products */}
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h2 className="card-title">📦 Sản phẩm gần đây</h2>
                      <Link to="/seller/products" className="view-all-link">
                        Xem tất cả →
                      </Link>
                    </div>
                    <div className="products-list">
                      {products.length > 0 ? (
                        products.map(product => (
                          <div key={product.product_id} className="product-item">
                            <img 
                              src={product.image || '/placeholder.png'} 
                              alt={product.name}
                              className="product-thumb"
                            />
                            <div className="product-info">
                              <h4>{product.name}</h4>
                              <p className="product-price">${product.price}</p>
                              <span className={`product-status ${product.is_active ? 'active' : 'inactive'}`}>
                                {product.is_active ? '🟢 Đang bán' : '🔴 Đã ẩn'}
                              </span>
                            </div>
                            <div className="product-actions">
                              <button 
                                className="btn-icon"
                                onClick={() => navigate(`/seller/products/edit/${product.product_id}`)}
                                title="Chỉnh sửa"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn-icon"
                                onClick={() => handleProductStatusToggle(product.product_id, product.is_active)}
                                title={product.is_active ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm'}
                              >
                                {product.is_active ? '👁️' : '🚫'}
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <p>📦 Chưa có sản phẩm nào</p>
                          <Link to="/seller/products/new" className="btn btn-primary">
                            Thêm sản phẩm đầu tiên
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h2 className="card-title">🛒 Đơn hàng gần đây</h2>
                      <Link to="/seller/orders" className="view-all-link">
                        Xem tất cả →
                      </Link>
                    </div>
                    <div className="orders-list">
                      {orders.length > 0 ? (
                        orders.map(order => (
                          <div key={order.order_id} className="order-item">
                            <div className="order-header">
                              <span className="order-id">#{order.order_id}</span>
                              <span className={`order-status status-${order.status}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            <div className="order-details">
                              <p className="order-customer">👤 {order.buyer_name}</p>
                              <p className="order-total">💰 ${order.total_amount}</p>
                              <p className="order-date">📅 {formatDate(order.created_at)}</p>
                            </div>
                            {order.status === 'pending' && (
                              <div className="order-actions">
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleOrderStatusUpdate(order.order_id, 'processing')}
                                >
                                  ✅ Xác nhận
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleOrderStatusUpdate(order.order_id, 'cancelled')}
                                >
                                  ❌ Hủy
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <p>🛒 Chưa có đơn hàng nào</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div className="products-tab">
                <div className="tab-header">
                  <h2>📦 Quản lý sản phẩm</h2>
                  <Link to="/seller/products/new" className="btn btn-primary">
                    ➕ Thêm sản phẩm mới
                  </Link>
                </div>
                
                <div className="products-grid">
                  {products.map(product => (
                    <div key={product.product_id} className="product-card">
                      <img 
                        src={product.image || '/placeholder.png'} 
                        alt={product.name}
                        className="product-image"
                      />
                      <div className="product-body">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description?.substring(0, 100)}...</p>
                        <div className="product-meta">
                          <span className="price">${product.price}</span>
                          <span className="stock">Kho: {product.stock}</span>
                        </div>
                        <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {product.is_active ? 'Đang bán' : 'Đã ẩn'}
                        </span>
                      </div>
                      <div className="product-footer">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => navigate(`/seller/products/edit/${product.product_id}`)}
                        >
                          ✏️ Sửa
                        </button>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => handleProductStatusToggle(product.product_id, product.is_active)}
                        >
                          {product.is_active ? '👁️ Ẩn' : '🚫 Hiện'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="empty-state-large">
                    <div className="empty-icon">📦</div>
                    <h3>Chưa có sản phẩm nào</h3>
                    <p>Bắt đầu bán hàng bằng cách thêm sản phẩm đầu tiên của bạn</p>
                    <Link to="/seller/products/new" className="btn btn-primary">
                      ➕ Thêm sản phẩm đầu tiên
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="orders-tab">
                <div className="tab-header">
                  <h2>🛒 Quản lý đơn hàng</h2>
                  <div className="filter-buttons">
                    <button className="btn btn-sm btn-outline active">Tất cả</button>
                    <button className="btn btn-sm btn-outline">Chờ xử lý</button>
                    <button className="btn btn-sm btn-outline">Đang xử lý</button>
                    <button className="btn btn-sm btn-outline">Đã giao</button>
                  </div>
                </div>

                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Sản phẩm</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày đặt</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.order_id}>
                          <td>#{order.order_id}</td>
                          <td>{order.buyer_name}</td>
                          <td>{order.items_count} sản phẩm</td>
                          <td className="price">${order.total_amount}</td>
                          <td>
                            <span className={`badge status-${order.status}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td>{formatDate(order.created_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-icon" 
                                title="Xem chi tiết"
                                onClick={() => navigate(`/seller/orders/${order.order_id}`)}
                              >
                                👁️
                              </button>
                              {order.status === 'pending' && (
                                <>
                                  <button 
                                    className="btn-icon" 
                                    title="Xác nhận"
                                    onClick={() => handleOrderStatusUpdate(order.order_id, 'processing')}
                                  >
                                    ✅
                                  </button>
                                  <button 
                                    className="btn-icon" 
                                    title="Hủy"
                                    onClick={() => handleOrderStatusUpdate(order.order_id, 'cancelled')}
                                  >
                                    ❌
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {orders.length === 0 && (
                    <div className="empty-state-large">
                      <div className="empty-icon">🛒</div>
                      <h3>Chưa có đơn hàng nào</h3>
                      <p>Đơn hàng sẽ hiển thị ở đây khi có khách đặt mua</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

// Helper functions
const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ Chờ xử lý',
    processing: '📦 Đang xử lý',
    shipped: '🚚 Đang giao',
    delivered: '✅ Đã giao',
    cancelled: '❌ Đã hủy',
  };
  return labels[status] || status;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default SellerDashboard;