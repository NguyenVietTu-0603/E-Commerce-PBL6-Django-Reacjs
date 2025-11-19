import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/SellerOrders.css';

const SellerOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    shipping: 0,
    completed: 0,
    canceled: 0,
    today: 0,
    total_revenue: 0,
  });

  // Selected order for modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && user.user_type !== 'seller') {
      navigate('/dashboard');
    } else if (user) {
      fetchOrders();
      fetchStats();
    }
  }, [user, navigate]);

  const filterAndSortOrders = useCallback(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer_phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'amount-high':
          return b.seller_total - a.seller_total;
        case 'amount-low':
          return a.seller_total - b.seller_total;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/api/orders/seller/orders/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.results || []);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:8000/api/orders/seller/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
      
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/orders/seller/orders/${orderId}/status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Refresh
      await fetchOrders();
      await fetchStats();
      
      alert('Cập nhật trạng thái thành công!');
      setShowModal(false);
      
    } catch (err) {
      alert('Lỗi khi cập nhật: ' + err.message);
    }
  };

  const viewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'warning', icon: '⏳', text: 'Chờ xác nhận' },
      paid: { class: 'info', icon: '💳', text: 'Đã thanh toán' },
      shipping: { class: 'primary', icon: '🚚', text: 'Đang giao' },
      completed: { class: 'success', icon: '✅', text: 'Hoàn thành' },
      canceled: { class: 'danger', icon: '❌', text: 'Đã hủy' },
    };
    return badges[status] || badges.pending;
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <>
        <Header />
        <div className="seller-orders-loading">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      
      <div className="seller-orders-page">
        <div className="seller-orders-container">
          
          {/* Page Header */}
          <div className="page-header">
            <div className="header-left">
              <Link to="/seller/dashboard" className="back-btn">
                ← Dashboard
              </Link>
              <div>
                <h1>📋 Quản lý đơn hàng</h1>
                <p>Theo dõi và xử lý đơn hàng của bạn</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-row">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Tổng đơn</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pending}</h3>
                <p>Chờ xác nhận</p>
              </div>
            </div>
            <div className="stat-card paid">
              <div className="stat-icon">💳</div>
              <div className="stat-info">
                <h3>{stats.paid}</h3>
                <p>Đã thanh toán</p>
              </div>
            </div>
            <div className="stat-card shipping">
              <div className="stat-icon">🚚</div>
              <div className="stat-info">
                <h3>{stats.shipping}</h3>
                <p>Đang giao</p>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>Hoàn thành</p>
              </div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>${stats.total_revenue.toFixed(2)}</h3>
                <p>Doanh thu</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filters-row">
              {/* Search */}
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, tên, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="paid">Đã thanh toán</option>
                <option value="shipping">Đang giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="canceled">Đã hủy</option>
              </select>

              {/* Sort */}
              <select 
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="amount-high">Giá trị cao</option>
                <option value="amount-low">Giá trị thấp</option>
              </select>
            </div>

            {/* Results Info */}
            <div className="results-info">
              <p>
                Hiển thị <strong>{indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)}</strong> 
                {' '}trong <strong>{filteredOrders.length}</strong> đơn hàng
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              ❌ Lỗi: {error}
              <button onClick={fetchOrders}>Thử lại</button>
            </div>
          )}

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h2>Không tìm thấy đơn hàng</h2>
              <p>
                {searchTerm || statusFilter !== 'all' 
                  ? 'Thử thay đổi bộ lọc' 
                  : 'Bạn chưa có đơn hàng nào'}
              </p>
            </div>
          ) : (
            <>
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Địa chỉ</th>
                      <th>Sản phẩm</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày đặt</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => {
                      const statusInfo = getStatusBadge(order.status);
                      return (
                        <tr key={order.order_id}>
                          <td>
                            <strong>{order.order_id}</strong>
                          </td>
                          <td>
                            <div className="customer-info">
                              <div className="customer-name">{order.full_name}</div>
                              <div className="customer-contact">
                                📧 {order.buyer_email}
                              </div>
                              <div className="customer-contact">
                                📱 {order.buyer_phone}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="address-info">
                              {order.address}, {order.ward}
                              <br />
                              {order.district}, {order.city}
                            </div>
                          </td>
                          <td>
                            <span className="items-count">
                              {order.items_count} sản phẩm
                            </span>
                          </td>
                          <td>
                            <strong className="order-total">
                              ${order.seller_total.toFixed(2)}
                            </strong>
                          </td>
                          <td>
                            <span className={`status-badge ${statusInfo.class}`}>
                              {statusInfo.icon} {statusInfo.text}
                            </span>
                          </td>
                          <td>
                            {new Date(order.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <button
                              className="btn-action btn-view"
                              onClick={() => viewOrderDetail(order)}
                              title="Xem chi tiết"
                            >
                              👁️ Chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Trước
                  </button>
                  
                  <div className="page-numbers">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                            onClick={() => paginate(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="page-dots">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button 
                    className="page-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onUpdateStatus={handleUpdateStatus}
          getStatusBadge={getStatusBadge}
        />
      )}

      <Footer />
    </>
  );
};

// Order Detail Modal Component - ĐẶT TRƯỚC export default
const OrderDetailModal = ({ order, onClose, onUpdateStatus, getStatusBadge }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  
  const statusInfo = getStatusBadge(order.status);

  const handleSubmit = () => {
    if (newStatus !== order.status) {
      if (window.confirm('Bạn có chắc muốn cập nhật trạng thái đơn hàng?')) {
        onUpdateStatus(order.order_id, newStatus);
      }
    } else {
      alert('Vui lòng chọn trạng thái mới!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết đơn hàng {order.order_id}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Status */}
          <div className="detail-section">
            <h3>Trạng thái hiện tại</h3>
            <span className={`status-badge ${statusInfo.class}`}>
              {statusInfo.icon} {statusInfo.text}
            </span>
          </div>

          {/* Customer Info */}
          <div className="detail-section">
            <h3>Thông tin khách hàng</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tên:</label>
                <span>{order.full_name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{order.buyer_email}</span>
              </div>
              <div className="info-item">
                <label>SĐT:</label>
                <span>{order.buyer_phone}</span>
              </div>
              <div className="info-item full-width">
                <label>Địa chỉ:</label>
                <span>
                  {order.address}, {order.ward}, {order.district}, {order.city}
                </span>
              </div>
              <div className="info-item">
                <label>Thanh toán:</label>
                <span>{order.payment_method === 'cod' ? 'COD' : order.payment_method.toUpperCase()}</span>
              </div>
              {order.notes && (
                <div className="info-item full-width">
                  <label>Ghi chú:</label>
                  <span>{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="detail-section">
            <h3>Sản phẩm của bạn ({order.items_count})</h3>
            <div className="order-items-list">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <img 
                    src={item.product_image || '/placeholder.png'} 
                    alt={item.product_name}
                    className="item-image"
                  />
                  <div className="item-info">
                    <div className="item-name">{item.product_name}</div>
                    <div className="item-meta">
                      {item.color && <span>Màu: {item.color}</span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                    <div className="item-meta">
                      ${item.price} × {item.quantity}
                    </div>
                  </div>
                  <div className="item-total">
                    ${item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total-row">
              <strong>Tổng cộng (sản phẩm của bạn):</strong>
              <strong className="total-amount">${order.seller_total.toFixed(2)}</strong>
            </div>
          </div>

          {/* Update Status */}
          <div className="detail-section">
            <h3>Cập nhật trạng thái</h3>
            <div className="form-group">
              <label>Trạng thái mới:</label>
              <select 
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-select"
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="paid">Đã thanh toán</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="completed">Hoàn thành</option>
                <option value="canceled">Hủy đơn</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={newStatus === order.status}
          >
            💾 Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;