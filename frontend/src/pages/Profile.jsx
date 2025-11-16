import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getCities, 
  getDistrictsByCity, 
  getWardsByDistrict,
  getCityName,
  getDistrictName,
  getWardName
} from '../utils/locationsData';
import { formatPrice } from '../utils/formatPrice';

import '../assets/UserProfile.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    bio: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    postal_code: '',
    country: 'Vietnam',
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        district: user.profile?.district || '',
        ward: user.profile?.ward || '',
        postal_code: user.profile?.postal_code || '',
        country: user.profile?.country || 'Vietnam',
      });
    }

    // Load cities from mock data
    setCities(getCities());
  }, [user]);

  useEffect(() => {
    if (formData.city) {
      const districtsList = getDistrictsByCity(formData.city);
      setDistricts(districtsList);
      
      // Reset district and ward if city changes
      if (!districtsList.find(d => d.id === formData.district)) {
        setFormData(prev => ({ ...prev, district: '', ward: '' }));
      }
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.city]);

  useEffect(() => {
    if (formData.district) {
      const wardsList = getWardsByDistrict(formData.district);
      setWards(wardsList);
      
      // Reset ward if district changes
      if (!wardsList.find(w => w.id === formData.ward)) {
        setFormData(prev => ({ ...prev, ward: '' }));
      }
    } else {
      setWards([]);
    }
  }, [formData.district]);

  useEffect(() => {
    if (activeTab === 'orders') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setOrders([]);
        setOrdersError('Bạn chưa đăng nhập.');
        return;
      }
      setOrdersLoading(true);
      setOrdersError('');
      fetch(`${API_BASE}/api/orders/mine/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async res => {
          const ct = res.headers.get('content-type') || '';
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          if (!ct.includes('application/json')) throw new Error('Phản hồi không phải JSON');
          return res.json();
        })
        .then(data => {
          setOrders(Array.isArray(data.results) ? data.results : []);
        })
        .catch(err => setOrdersError(err.message))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
        profile: {
          bio: formData.bio,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postal_code: formData.postal_code,
        }
      };

      console.log('📤 Sending update data:', updateData);

      const response = await fetch('http://localhost:8000/api/users/profile/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('📥 Response status:', response.status);

      const result = await response.json();
      console.log('📥 Response data:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Cập nhật thất bại');
      }

      // Cập nhật user context với thông tin mới
      updateUser(result.user);
      
      setMessage({ 
        type: 'success', 
        text: 'Cập nhật thông tin thành công!' 
      });
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Cập nhật thất bại. Vui lòng thử lại!' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        district: user.profile?.district || '',
        ward: user.profile?.ward || '',
        postal_code: user.profile?.postal_code || '',
        country: user.profile?.country || 'Vietnam',
      });
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const statusMap = {
    pending: 'Chờ xử lý',
    paid: 'Đã thanh toán',
    shipping: 'Đang giao',
    completed: 'Hoàn tất',
    canceled: 'Đã hủy'
  };

  const renderProfileTab = () => (
    <div className="profile-form">
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        <h3>Thông tin cá nhân</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Họ và tên</label>
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
              />
            ) : (
              <p>{formData.full_name || 'Chưa cập nhật'}</p>
            )}
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
              />
            ) : (
              <p>{formData.phone || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <p>{formData.email}</p>
        </div>

        <div className="form-group">
          <label>Giới thiệu</label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Viết vài dòng về bản thân..."
              rows="4"
            />
          ) : (
            <p>{formData.bio || 'Chưa có giới thiệu'}</p>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>Địa chỉ</h3>
        
        {isEditing ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Tỉnh/Thành phố</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quận/Huyện</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.city}
                >
                  <option value="">Chọn quận/huyện</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phường/Xã</label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  disabled={!formData.district}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mã bưu điện</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="Nhập mã bưu điện"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ chi tiết</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường..."
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Địa chỉ đầy đủ</label>
              <p>
                {formData.address && formData.address}
                {formData.ward && `, ${getWardName(formData.ward)}`}
                {formData.district && `, ${getDistrictName(formData.district)}`}
                {formData.city && `, ${getCityName(formData.city)}`}
                {!formData.address && 'Chưa cập nhật'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderOrdersTab = () => {
    if (ordersLoading) return <div className="loading-box">Đang tải đơn hàng...</div>;
    if (ordersError) return <div className="alert alert-error">{ordersError}</div>;
    if (!orders.length) {
      return (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bạn chưa có đơn hàng. Hãy mua sắm ngay!</p>
            <a href="/" className="browse-products-btn">Khám phá sản phẩm</a>
        </div>
      );
    }
    return (
      <div className="orders-list">
        {orders.map(o => (
          <div key={o.order_id} className="order-card">
            <div className="order-head">
              <div>
                <strong>Mã đơn:</strong> {o.order_id}
              </div>
              <span className={`order-status status-${o.status}`}>{statusMap[o.status] || o.status}</span>
            </div>
            <div className="order-meta">
              <span>Ngày: {new Date(o.created_at).toLocaleString('vi-VN')}</span>
              <span>Tổng: {formatPrice(o.total_amount)}</span>
              <span>Thanh toán: {o.payment_method === 'cod' ? 'COD' : o.payment_method}</span>
            </div>
            <div className="order-items">
              {o.items?.map((it, idx) => (
                <div key={idx} className="order-item-row">
                  <span className="item-name">{it.product}</span>
                  <span className="item-qty">SL: {it.quantity}</span>
                  <span className="item-price">{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-actions">
              <button
                onClick={() => navigate(`/orders/${o.order_id}`)}
                className="order-detail-btn"
              >
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWishlistTab = () => (
    <div className="empty-wishlist">
      <div className="empty-icon">❤️</div>
      <h3>Danh sách yêu thích trống</h3>
      <p>Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.</p>
      <a href="/" className="browse-products-btn">
        Khám phá sản phẩm
      </a>
    </div>
  );

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="user-info">
            <div className="avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.full_name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <h3>{user?.full_name || user?.username}</h3>
            <p>{user?.email}</p>
            <p className="member-since">
              Thành viên từ {new Date(user?.date_joined).toLocaleDateString('vi-VN')}
            </p>
          </div>

          <nav className="profile-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Thông tin cá nhân
            </button>
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Đơn hàng của tôi
            </button>
            <button
              className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              Danh sách yêu thích
            </button>
            <button
              className="nav-item"
              onClick={() => navigate('/change-password')}
            >
              Đổi mật khẩu
            </button>
          </nav>
        </aside>

        <main className="profile-content">
          <div className="tab-header">
            <h2>
              {activeTab === 'profile' && 'Thông tin cá nhân'}
              {activeTab === 'orders' && 'Đơn hàng của tôi'}
              {activeTab === 'wishlist' && 'Danh sách yêu thích'}
            </h2>
            
            {activeTab === 'profile' && (
              <div className="edit-actions">
                {isEditing ? (
                  <>
                    <button 
                      className="save-btn"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button 
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
            )}
          </div>

          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'wishlist' && renderWishlistTab()}
        </main>
      </div>
    </div>
  );
};

export default Profile;