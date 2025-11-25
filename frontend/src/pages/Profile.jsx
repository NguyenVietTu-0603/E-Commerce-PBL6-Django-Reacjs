import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  loadLocations,
  getCities, 
  getDistrictsByCity, 
  getWardsByDistrict,
  getCityName,
  getDistrictName,
  getWardName
} from '../utils/locationsData';
import { formatPrice } from '../utils/formatPrice';
import resolveAvatarUrl from '../utils/avatar';
import Icon from '../components/Icon';
import usePageTitle from '../hooks/usePageTitle';

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
    country: 'Vietnam',
  });

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const avatarSrc = resolveAvatarUrl(user, '/default-avatar.png');

  usePageTitle('Hồ sơ của tôi');

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
        country: user.profile?.country || 'Vietnam',
      });
    }

    // Load cities from remote API (locationsData provides loadLocations promise)
    loadLocations().then(() => setCities(getCities())).catch(() => setCities(getCities()));
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
  }, [formData.city, formData.district]);

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
  }, [formData.district, formData.ward]);

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
          district: formData.district,
          ward: formData.ward,
          country: formData.country,
        }
      };

      console.log('Sending update data:', updateData);

      const response = await fetch(`${API_BASE}/api/users/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('Response status:', response.status);

      const contentType = response.headers.get('content-type') || '';
      let result = {};
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        if (text?.trim()) {
          try {
            result = JSON.parse(text);
          } catch (err) {
            throw new Error(text);
          }
        }
      }
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || result.detail || 'Cập nhật thất bại');
      }

      if (result.user) {
        updateUser(result.user);
      } else if (user) {
        const updatedProfile =
          typeof result === 'object' && result !== null
            ? (result.profile && typeof result.profile === 'object'
                ? result.profile
                : result)
            : {};

        updateUser({
          ...user,
          full_name: updateData.full_name,
          phone: updateData.phone,
          profile: {
            ...user.profile,
            ...updateData.profile,
            ...updatedProfile,
          },
        });
      }
      
      setMessage({ 
        type: 'success', 
        text: result.message || 'Cập nhật thông tin thành công!' 
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
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
          <div className="empty-icon">
            <Icon name="box-open" size={48} />
          </div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bạn chưa có đơn hàng. Hãy mua sắm ngay!</p>
            <a href="/" className="browse-products-btn">Khám phá sản phẩm</a>
        </div>
      );
    }
    return (
      <div className="orders-list">
        {orders.map(o => {
          const createdDate = o.created_at ? new Date(o.created_at) : null;
          const itemsPreview = o.items?.slice(0, 3) || [];
          const remainingItems = Math.max((o.items?.length || 0) - itemsPreview.length, 0);

          return (
            <div key={o.order_id} className="order-card">
              <div className="order-card-top">
                <div className="order-left">
                  <div className="order-code">
                    <span>Mã đơn</span>
                    <p>#{o.order_id}</p>
                  </div>
                  <div className="order-date">
                    {createdDate ? (
                      <>
                        <div className="date">{createdDate.toLocaleDateString('vi-VN')}</div>
                        <div className="time">{createdDate.toLocaleTimeString('vi-VN')}</div>
                      </>
                    ) : (
                      <div className="date">Không rõ</div>
                    )}
                  </div>
                </div>

                <div className="order-right">
                  <div className={`order-status-pill status-${o.status}`}>{statusMap[o.status] || o.status}</div>
                  <div className="order-total">{formatPrice(o.total_amount)}</div>
                  <div className="order-payment">
                    {o.payment_method === 'cod'
                      ? 'Thanh toán COD'
                      : (o.payment_method || 'Khác')}
                  </div>
                </div>
              </div>

              <div className="order-items-grid">
                {itemsPreview.map((it, idx) => {
                  const product = it.product && typeof it.product === 'object' ? it.product : null;
                  const productName = product?.name || (typeof it.product === 'string' ? it.product : `Sản phẩm ${idx + 1}`);
                  const thumbnail = product?.image || product?.thumbnail || it.thumbnail || null;
                  const linePrice = (Number(it.price) || 0) * (Number(it.quantity) || 0);

                  return (
                    <div key={idx} className="order-item-grid">
                      <div className="order-thumb">
                        {thumbnail ? (
                          <img src={thumbnail} alt={productName} />
                        ) : (
                          <div className="thumb-fallback">{(productName || '?').charAt(0)}</div>
                        )}
                      </div>
                      <div className="order-item-info">
                        <div className="name">{productName}</div>
                        <div className="meta">SL {it.quantity} · {formatPrice(linePrice)}</div>
                      </div>
                    </div>
                  );
                })}

                {remainingItems > 0 && (
                  <div className="order-items-more">+{remainingItems} sản phẩm khác</div>
                )}
              </div>

              <div className="order-card-footer">
                <div className="order-destination">
                  <span>Giao đến</span>
                  <p>{o.shipping_address || o.delivery_address || 'Đang cập nhật'}</p>
                </div>
                <div className="order-actions">
                  <button onClick={() => navigate(`/orders/${o.order_id}`)} className="order-detail-btn">Xem chi tiết</button>
                  <button onClick={() => navigate(`/orders/${o.order_id}/track`)} className="order-track-btn">Theo dõi</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <div className="user-profile-page new-layout">
      <div className="profile-card">
        <div className="profile-header">
          <div className="header-banner" />
          <div className="profile-avatar">
            {avatarSrc ? (
              <img src={avatarSrc} alt={user?.full_name || user?.username || 'avatar'} />
            ) : (
              <div className="avatar-placeholder">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
              </div>
            )}
          </div>

          <div className="profile-basic">
            <h3>{user?.full_name || user?.username}</h3>
            <p className="email">{user?.email}</p>
            <p className="member-since">Thành viên từ {new Date(user?.date_joined).toLocaleDateString('vi-VN')}</p>
          </div>

          <div className="profile-actions">
            {activeTab === 'profile' && (
              isEditing ? (
                <>
                  <button className="save-btn" onClick={handleSubmit} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
                  <button className="cancel-btn" onClick={handleCancel} disabled={loading}>Hủy</button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>Chỉnh sửa</button>
              )
            )}
            <button className="change-pass" onClick={() => navigate('/change-password')}>Đổi mật khẩu</button>
          </div>
        </div>

        <div className="profile-body">
          <div className="tab-controls">
            <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Thông tin</button>
            <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Đơn hàng</button>
          </div>

          <div className="tab-panel">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'orders' && renderOrdersTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;