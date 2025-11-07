import { Link } from 'react-router-dom'

export default function FiltersSidebar({ 
  categories = [], 
  selectedCategory, 
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
  onClearFilters,
  showCategoryLinks = false
}) {
  return (
    <div className="filters-sidebar">
      <div className="filters-header">
        <h3>Bộ lọc</h3>
        <button 
          className="clear-filters-btn"
          onClick={onClearFilters}
        >
          Xóa bộ lọc
        </button>
      </div>

      {showCategoryLinks && (
        <div className="filter-section">
          <h4>Danh mục</h4>
          <div className="filter-options">
            {categories.map(category => (
              <Link
                key={category}
                to={category === 'Tất cả' ? '/' : `/category/${encodeURIComponent(category)}`}
                className={`filter-option ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}

      {!showCategoryLinks && (
        <div className="filter-section">
          <h4>Danh mục</h4>
          <div className="filter-options">
            {categories.map(category => (
              <label key={category} className="filter-option">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="filter-section">
        <h4>Khoảng giá</h4>
        <div className="price-range">
          <input
            type="number"
            placeholder="Từ"
            value={priceRange.min}
            onChange={(e) => onPriceRangeChange(prev => ({ ...prev, min: e.target.value }))}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Đến"
            value={priceRange.max}
            onChange={(e) => onPriceRangeChange(prev => ({ ...prev, max: e.target.value }))}
          />
        </div>
      </div>

      <div className="filter-section">
        <h4>Sắp xếp theo</h4>
        <select 
          value={sortBy} 
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select"
        >
          <option value="relevance">Liên quan nhất</option>
          <option value="price-low">Giá thấp đến cao</option>
          <option value="price-high">Giá cao đến thấp</option>
          <option value="name">Tên A-Z</option>
          <option value="newest">Mới nhất</option>
        </select>
      </div>
    </div>
  )
}
