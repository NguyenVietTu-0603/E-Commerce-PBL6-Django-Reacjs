import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const AddProduct = () => {
  const { user, getDefaultRoute } = useAuth();
  const navigate = useNavigate();

  usePageTitle('Thêm sản phẩm');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageFile: null,
    category: '', // id category
  });

  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catError, setCatError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      setLoadingCats(true);
      setCatError(null);
      try {
        const res = await axios.get('/api/categories/', { timeout: 10000 });
        // handle paginated or plain list responses
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.results ?? []);
        if (!cancelled) setCategories(list);
      } catch (err) {
        console.error('loadCategories error', err);
        if (!cancelled) setCatError(err.response?.data ?? err.message ?? 'Lỗi');
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    }
    loadCategories();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    setMessage({ type: '', text: '' });
    const { name, value, files } = e.target;
    if (name === 'imageFile') {
      setForm((prev) => ({ ...prev, imageFile: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.price || Number(form.price) <= 0) return 'Price must be > 0';
    if (form.stock === '' || Number(form.stock) < 0) return 'Stock must be >= 0';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    const err = validate();
    if (err) {
      setMessage({ type: 'error', text: err });
      setLoading(false);
      return;
    }

    // lấy token trước, rồi tạo FormData ngay lập tức
    const token = localStorage.getItem('access_token');
    const formData = new FormData();

    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('price', Number(form.price));
    formData.append('stock', Number(form.stock));
    if (form.category) formData.append('category', form.category);
    if (form.imageFile) formData.append('image', form.imageFile);

    try {
      const res = await axios.post('/api/products/', formData, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // DON'T set Content-Type manually for FormData
        },
      });

      setMessage({ type: 'success', text: 'Product created successfully!' });

      const dest = user ? getDefaultRoute(user.user_type) : '/dashboard';
      setTimeout(() => navigate(dest), 800);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container" style={{ maxWidth: 700 }}>
        <h1 className="form-title">Add Product</h1>
        <p className="form-subtitle">Create a new product</p>

        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Product name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
              disabled={loading || loadingCats}
            >
              <option value="">-- None --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {loadingCats && <div className="text-center" style={{ marginTop: 8 }}>Loading categories...</div>}
            {catError && <div style={{ color: 'red' }}>Error loading categories: {String(catError)}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input"
              placeholder="Short description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                className="form-input"
                placeholder="0.00"
                value={form.price}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input
                type="number"
                min="0"
                name="stock"
                className="form-input"
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image</label>
            <input
              type="file"
              name="imageFile"
              className="form-input"
              accept="image/*"
              onChange={handleChange}
              disabled={loading}
            />
            {form.imageFile && (
              <p className="text-center" style={{ marginTop: 8 }}>
                Selected: {form.imageFile.name}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;