import React, { useState, useMemo, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import CategoryNav from '../components/CategoryNav';
import PromoAside from '../components/PromoAside';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import '../assets/Home.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);

  useEffect(() => {
    fetch('/api/products/')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('products fetch error', err));

    fetch('/api/categories/')
      .then(res => res.json())
      .then(data => setCategories(['Tất cả', ...data.map(c => c.name)]))
      .catch(err => console.error('categories fetch error', err));
  }, []);

  const filtered = useMemo(() => {
    return products.map(p => {
      // chuẩn hoá category thành string để component không nhận object
      return { ...p, category_name: p.category?.name || null };
    }).filter(p => {
      const matchCategory = activeCategory === 'Tất cả' || (p.category_name === activeCategory);
      const matchQuery = p.name?.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [products, activeCategory, query]);

  return (
    <div className="marketplace-root">
      <HeroSlider
        slides={[
          { image: '/samba.avif', title: 'Mùa giảm giá lớn', subtitle: 'Ưu đãi lên đến 50%', cta: { href: '/home', label: 'Xem ngay' } },
          { image: '/samba.avif', title: 'Bộ sưu tập mới', subtitle: 'Sản phẩm hot mùa này', cta: { href: '/home', label: 'Khám phá' } }
        ]}
      />

      <CategoryNav categories={categories} active={activeCategory} onChange={setActiveCategory} />

      <main className="content">
        <PromoAside />
        <div style={{ flex: 1 }}>
          <div className="search-bar" style={{ margin: '12px 0' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <ProductGrid products={filtered} />
        </div>
      </main>

      <Footer />
    </div>
  );
}