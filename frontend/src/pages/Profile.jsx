import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import authService from '../utils/authService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: user?.profile?.bio || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    country: user?.profile?.country || '',
    postal_code: user?.profile?.postal_code || '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        },
      };

      const response = await authService.updateProfile(updateData);
      updateUser(response.user);
      
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container" style={{ maxWidth: '700px' }}>
        <h1 className="form-title">Edit Profile</h1>
        <p className="form-subtitle">Update your personal information</p>

        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Basic Information</h3>
            
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
                className="form-input"
                placeholder="+84912345678"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                className="form-input"
                placeholder="Tell us about yourself..."
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                disabled={loading}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Address Information</h3>
            
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-input"
                placeholder="Street address"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  className="form-input"
                  placeholder="Postal code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                className="form-input"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;