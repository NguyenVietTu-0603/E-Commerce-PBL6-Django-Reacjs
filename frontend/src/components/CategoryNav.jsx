import React from 'react';
import CategoryChip from './CategoryChip.jsx';

export default function CategoryNav({ categories = [], active, onChange = () => {} }) {
  const list = Array.isArray(categories) ? categories : [];

  return (
    <nav className="category-nav" aria-label="Categories">
      {list.map((cat, idx) => {
        // normalize label and key
        const label = typeof cat === 'string' ? cat : (cat?.name ?? String(cat));
        const key = typeof cat === 'string' ? cat : (cat.id ?? idx);
        const to = label === 'Tất cả' ? '/' : `/category/${encodeURIComponent(label)}`;
        return (
          <CategoryChip
            key={key}
            label={label}
            to={to}
            active={label === active}
            onClick={onChange}
          />
        );
      })}
    </nav>
  );
}

