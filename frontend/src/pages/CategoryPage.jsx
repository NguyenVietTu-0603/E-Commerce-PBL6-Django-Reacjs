import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import ImageSearchUpload from '../components/ImageSearchUpload';
import Loading from '../components/Loading';
import '../assets/CategoryPage.css';

export default function CategoryPage() {
  const params = useParams();
  const rawCategoryParam = params.slug ?? params.categoryName ?? params.category ?? '';
  const slugFromUrl = rawCategoryParam ? decodeURIComponent(rawCategoryParam) : '';
  const navigate = useNavigate();

  // Data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // UI/Filter state
  const [query, setQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [imageResults, setImageResults] = useState(null); // danh sách trả về từ search ảnh

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cRes, pRes] = await Promise.all([
          fetch('http://localhost:8000/api/categories/').then(r => r.json()),
          fetch('http://localhost:8000/api/products/').then(r => r.json())
        ]);
        if (cancelled) return;
        
        const cats = Array.isArray(cRes) ? cRes : (cRes.results ?? []);
        const prods = Array.isArray(pRes) ? pRes : (pRes.results ?? []);
        
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        if (cancelled) return;
        console.error('CategoryPage load error', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Determine active category
  const activeCategoryObj = useMemo(() => {
    if (!slugFromUrl) return null;
    return categories.find(c => {
      const slug = String(c?.slug ?? '').toLowerCase();
      const name = String(c?.name ?? '').toLowerCase();
      const id = String(c?.id ?? '').toLowerCase();
      const param = String(rawCategoryParam ?? '').toLowerCase();
      return slug === param || name === param || id === param;
    }) ?? null;
  }, [categories, rawCategoryParam, slugFromUrl]);

  // Product matching
  function productMatchesCategory(prod, identifier) {
    if (!identifier) return true;
    const idNorm = String(identifier).toLowerCase();
    const pc = prod.category;
    if (pc == null) return false;

    if (typeof pc === 'string' || typeof pc === 'number') {
      const v = String(pc).toLowerCase();
      return v === idNorm || v.includes(idNorm) || idNorm.includes(v);
    }

    const pid = String(pc.id ?? pc.pk ?? '').toLowerCase();
    const pname = String(pc.name ?? pc.title ?? '').toLowerCase();
    const pslug = String(pc.slug ?? '').toLowerCase();

    return pid === idNorm || pname === idNorm || pslug === idNorm || 
           pname.includes(idNorm) || pslug.includes(idNorm);
  }

  // Filtered products
  const filteredProducts = useMemo(() => {
    const activeIdentifier = activeCategoryObj 
      ? (activeCategoryObj.slug ?? activeCategoryObj.name ?? String(activeCategoryObj.id))
      : (slugFromUrl || '');
    const q = (query || '').trim().toLowerCase();

    const list = (products || []).filter(product => {
      if (activeIdentifier && !productMatchesCategory(product, activeIdentifier)) return false;
      
      if (q) {
        const name = String(product.name ?? '').toLowerCase();
        const desc = String(product.description ?? '').toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }
      
      const price = Number(product.price ?? 0);
      if (priceRange.min && price < Number(priceRange.min)) return false;
      if (priceRange.max && price > Number(priceRange.max)) return false;
      
      return true;
    });

    switch (sortBy) {
      case 'price-low':
        list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-high':
        list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'name':
        list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
        break;
      case 'newest':
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      default:
        break;
    }

    return list;
  }, [products, activeCategoryObj, slugFromUrl, query, priceRange, sortBy]);

  // Header count dùng effectiveFiltered thay vì filteredProducts
  const effectiveFiltered = useMemo(() => {
    if (imageResults) return imageResults;
    return filteredProducts;
  }, [imageResults, filteredProducts]);

  const ITEMS_PER_PAGE = 24;
  const totalPages = Math.max(1, Math.ceil(effectiveFiltered.length / ITEMS_PER_PAGE));
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return effectiveFiltered.slice(start, start + ITEMS_PER_PAGE);
  }, [effectiveFiltered, currentPage]);

  // Handlers
  const handleCategoryChange = (catSlugOrName) => {
    if (!catSlugOrName) {
      navigate('/products');
      return;
    }
    const found = categories.find(c => 
      String(c.slug) === String(catSlugOrName) || 
      String(c.name) === String(catSlugOrName) || 
      String(c.id) === String(catSlugOrName)
    );
    const toSlug = found ? (found.slug ?? found.name) : catSlugOrName;
    navigate(`/category/${encodeURIComponent(toSlug)}`);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setQuery('');
    setPriceRange({ min: '', max: '' });
    setSortBy('relevance');
    setCurrentPage(1);
    setImageResults(null); // thoát chế độ tìm bằng ảnh
  };

  // replace handleImageFileChange usage bằng ImageSearchUpload
  if (loading) {
    return (
      <div className="category-page">
        <Loading message="Đang tải sản phẩm..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-container">
        {/* Header */}
        <div className="category-header">
          <div className="breadcrumb">
            <a href="/">Trang chủ</a>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">
              {activeCategoryObj?.name || slugFromUrl || 'Tất cả sản phẩm'}
            </span>
          </div>
          
          <h1 className="category-title">
            {activeCategoryObj?.name || slugFromUrl || 'Tất cả sản phẩm'}
          </h1>
          
          <p className="category-subtitle">
            {effectiveFiltered.length} sản phẩm
          </p>
        </div>

        <div className="category-content">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${showFilters ? 'mobile-open' : ''}`}>
            <div className="filters-header">
              <h3>Bộ lọc</h3>
              <button 
                className="filters-close" 
                onClick={() => setShowFilters(false)}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="filter-section">
              <label className="filter-label">Tìm kiếm</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Tìm sản phẩm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="filter-section">
              <label className="filter-label">Danh mục</label>
              <div className="category-list">
                <button
                  className={`category-item ${!slugFromUrl ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('')}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-item ${
                      activeCategoryObj?.id === cat.id ? 'active' : ''
                    }`}
                    onClick={() => handleCategoryChange(cat.slug || cat.name)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <label className="filter-label">Khoảng giá</label>
              <div className="price-range-inputs">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Từ"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Đến"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            {/* Sort */}
            <div className="filter-section">
              <label className="filter-label">Sắp xếp</label>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Liên quan</option>
                <option value="price-low">Giá: Thấp đến cao</option>
                <option value="price-high">Giá: Cao đến thấp</option>
                <option value="name">Tên: A-Z</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Xóa bộ lọc
            </button>
          </aside>

          {/* Products Section */}
          <div className="products-section">
            {/* Toolbar */}
            <div className="products-toolbar">
              <button
                className="btn-toggle-filters"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>🔍</span>
                Bộ lọc
              </button>

              <ImageSearchUpload
                k={48}
                onStart={() => setLoading(true)}
                onFinish={() => setLoading(false)}
                onResults={(mapped) => {
                  setImageResults(mapped);
                  setCurrentPage(1);
                  setShowFilters(false);
                }}
                onError={(msg) => setError(msg)}
              />

              {imageResults && (
                <button className="btn" style={{ marginLeft: 8 }} onClick={() => setImageResults(null)}>
                  Hủy kết quả ảnh
                </button>
              )}

              <div className="results-info">
                Hiển thị {paginatedProducts.length} / {effectiveFiltered.length} sản phẩm
                {imageResults && <span style={{ marginLeft: 8, color: '#888' }}>(kết quả từ ảnh)</span>}
              </div>
            </div>

            {/* Products Grid */}
            {effectiveFiltered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h2>Không tìm thấy sản phẩm</h2>
                <p>Vui lòng thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
                <button className="btn btn-primary" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <ProductGrid products={paginatedProducts} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ← Trước
                    </button>
                    
                    <div className="pagination-pages">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      className="pagination-btn"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
      </div>

      {/* Mobile Overlay */}
      {showFilters && (
        <div 
          className="filters-overlay-backdrop"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
