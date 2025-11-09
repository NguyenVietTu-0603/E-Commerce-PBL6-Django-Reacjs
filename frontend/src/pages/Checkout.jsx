import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../utils/CartContext';
import { useAuth } from '../utils/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { 
  getCities, 
  getDistrictsByCity, 
  getWardsByDistrict 
} from '../utils/locationsData';
import '../assets/Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'cod',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Load user info and address data
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Load user info if logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || '',
        phone: user.phone || '',
        email: user.email || ''
      }));

      // Load user's saved address if exists
      fetch('/api/user/address/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            setFormData(prev => ({
              ...prev,
              address: data.address || '',
              city: data.city || '',
              district: data.district || '',
              ward: data.ward || ''
            }));
          }
        })
        .catch(err => console.error('Error loading address:', err));
    }

    // Load cities from mock data instead of API
    setCities(getCities());
  }, [cartItems, user, navigate]);

  // Load districts when city changes
  useEffect(() => {
    if (formData.city) {
      setDistricts(getDistrictsByCity(formData.city));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.city]);

  // Load wards when district changes
  useEffect(() => {
    if (formData.district) {
      setWards(getWardsByDistrict(formData.district));
    } else {
      setWards([]);
    }
  }, [formData.district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!formData.city) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    if (!formData.district) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!formData.ward) newErrors.ward = 'Vui lòng chọn phường/xã';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Mock order submission - sử dụng khi backend chưa sẵn sàng
      const useMockAPI = true; // Đổi thành false khi backend ready
      
      if (useMockAPI) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockOrderId = `ORD${Date.now().toString().slice(-8)}`;
        
        console.log('📦 Mock Order Created:', {
          order_id: mockOrderId,
          customer_info: {
            full_name: formData.fullName,
            phone: formData.phone,
            email: formData.email
          },
          shipping_address: {
            address: formData.address,
            ward: formData.ward,
            district: formData.district,
            city: formData.city
          },
          payment_method: formData.paymentMethod,
          notes: formData.notes,
          items: cartItems,
          total_amount: getCartTotal()
        });

        // Clear cart
        clearCart();

        // Navigate to success page
        navigate('/order-success', { 
          state: { orderId: mockOrderId } 
        });
        
        return;
      }

      // Real API call
      const orderData = {
        customer_info: {
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email
        },
        shipping_address: {
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city
        },
        payment_method: formData.paymentMethod,
        notes: formData.notes,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          color: item.color || '',
          size: item.size || '',
          price: item.price
        })),
        total_amount: getCartTotal()
      };

      console.log('📤 Sending order data:', orderData);

      const response = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` })
        },
        body: JSON.stringify(orderData)
      });

      console.log('📥 Response status:', response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server trả về dữ liệu không hợp lệ. Vui lòng kiểm tra backend.');
      }

      const result = await response.json();
      console.log('📥 Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || result.detail || 'Đặt hàng thất bại');
      }

      if (!result.success) {
        throw new Error(result.message || 'Đặt hàng thất bại');
      }

      // Clear cart after successful order
      clearCart();

      // Navigate to success page with order ID
      navigate('/order-success', { 
        state: { orderId: result.order.order_id } 
      });
      
    } catch (error) {
      console.error('❌ Error submitting order:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend đang chạy.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Lỗi xử lý dữ liệu từ server. Vui lòng kiểm tra backend API.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Thanh toán</h1>
          <div className="checkout-steps">
            <div className="step active">1. Thông tin giao hàng</div>
            <div className="step">2. Xác nhận đơn hàng</div>
            <div className="step">3. Hoàn tất</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-content">
            <div className="shipping-info">
              <h2>Thông tin giao hàng</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'error' : ''}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="Nhập email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Tỉnh/Thành phố *</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="district">Quận/Huyện *</label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={errors.district ? 'error' : ''}
                    disabled={!formData.city}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map(district => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {errors.district && <span className="error-message">{errors.district}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ward">Phường/Xã *</label>
                <select
                  id="ward"
                  name="ward"
                  value={formData.ward}
                  onChange={handleInputChange}
                  className={errors.ward ? 'error' : ''}
                  disabled={!formData.district}
                >
                  <option value="">Chọn phường/xã</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {errors.ward && <span className="error-message">{errors.ward}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Địa chỉ chi tiết *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Số nhà, tên đường..."
                  rows="3"
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Ghi chú</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ghi chú thêm cho đơn hàng..."
                  rows="3"
                />
              </div>
            </div>

            <div className="order-summary">
              <h2>Đơn hàng của bạn</h2>
              
              <div className="order-items">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.color}-${item.size}-${index}`} className="order-item">
                    <img src={item.image || '/default-product.png'} alt={item.name} />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <div className="item-variants">
                        {item.color && <span>Màu: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                      <div className="item-quantity">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="payment-method">
                <h3>Phương thức thanh toán</h3>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={handleInputChange}
                    />
                    <span>Chuyển khoản ngân hàng</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={formData.paymentMethod === 'momo'}
                      onChange={handleInputChange}
                    />
                    <span>Ví MoMo</span>
                  </label>
                </div>
              </div>

              <div className="order-total">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span className="free-shipping">Miễn phí</span>
                </div>
                <div className="total-row final">
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}