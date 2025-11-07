import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    full_name: '',
    phone: '',
    user_type: 'buyer',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: '',
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }

    if (formData.phone && !/^\+?1?\d{9,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (!result.success) {
      if (typeof result.error === 'object') {
        setErrors(result.error);
      } else {
        setErrors({ general: result.error });
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="form-container" style={{ maxWidth: '600px' }}>
        <h1 className="form-title">Create Account</h1>
        <p className="form-subtitle">Join us today!</p>

        {errors.general && (
          <div className="alert alert-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              type="text"
              name="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              name="password_confirm"
              className={`form-input ${errors.password_confirm ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={formData.password_confirm}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password_confirm && (
              <span className="error-message">{errors.password_confirm}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="+84912345678"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select
              name="user_type"
              className="form-select"
              value={formData.user_type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-20">
          Already have an account? <Link to="/login" className="link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;