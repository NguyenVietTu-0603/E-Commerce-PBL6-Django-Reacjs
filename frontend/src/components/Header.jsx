import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useCart } from '../utils/CartContext';
import AuthModal from './AuthModal.jsx';
import ImageSearchUpload from './ImageSearchUpload.jsx';
import resolveAvatarUrl from '../utils/avatar';
import logoImg from '../assets/img/logo1.png';

export default function Header({
  query = '',
  onQueryChange,
  onOpenLogin,
  onOpenRegister,
  onLogout: onLogoutProp,
  currentUser: currentUserProp,
  onImageSearchResults,
}) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { getCartCount } = useCart();
  const currentUser = currentUserProp ?? auth?.user;
  const logoutFn = onLogoutProp ?? auth?.logout ?? (() => { });
  const [localQuery, setLocalQuery] = useState(query || '');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [imgSearchLoading, setImgSearchLoading] = useState(false);
  const [imgSearchError, setImgSearchError] = useState(null);

  const firstRender = useRef(true);
  const debounceRef = useRef(null);

  function onSearch(e) {
    e?.preventDefault();
    const q = (localQuery || '').trim();
    if (onQueryChange) onQueryChange(q);
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = (localQuery || '').trim();
      if (onQueryChange) onQueryChange(q);
      if (q) {
        navigate(`/search?q=${encodeURIComponent(q)}`);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [localQuery, navigate, onQueryChange]);

  function openLogin() {
    setAuthMode('login');
    setIsAuthOpen(true);
    if (onOpenLogin) onOpenLogin();
  }
  function openRegister() {
    setAuthMode('register');
    setIsAuthOpen(true);
    if (onOpenRegister) onOpenRegister();
  }

  function handleLogout() {
    try { logoutFn(); } catch { }
    if (auth?.refresh) auth.refresh();
    else window.location.href = '/';
  }

  function handleImageResults(results) {
    try {
      if (onImageSearchResults) {
        onImageSearchResults(results);
      } else {
        // Lưu tạm để trang /search đọc và hiển thị
        sessionStorage.setItem('imageSearchResults', JSON.stringify(results));
        navigate('/search?mode=image');
      }
    } catch (e) {
      console.error(e);
    }
  }

  const avatarSrc = useMemo(() => resolveAvatarUrl(currentUser), [currentUser]);

  return (
    <>
      <header className="topbar">
        <Link to="/" className="" aria-label="Về trang chủ">
          <img src={logoImg} alt="Sellify" className="brand-logo" />
          <span className="sr-only">Về trang chủ Sellify</span>
        </Link>

        <form className="search-area" onSubmit={onSearch}>
          <input
            type="text"
            placeholder="Tìm sản phẩm, thương hiệu..."
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              if (!onQueryChange) return;
              try { onQueryChange(e.target.value); } catch { }
            }}
            className="search-input"
          />
          <button type="submit" className="search-btn">Tìm</button>
        </form>

        <div className="actions">
          {imgSearchError && (
            <span style={{ color: '#cc0000', fontSize: 12, marginRight: 12 }}>
              {imgSearchError}
            </span>
          )}
          {currentUser ? (
            <>
              <ImageSearchUpload
                className={`navbar-link ${imgSearchLoading ? 'is-loading' : ''}`}
                label={imgSearchLoading ? 'Đang tìm...' : '📷 Tìm bằng ảnh'}
                k={48}
                onStart={() => { setImgSearchLoading(true); setImgSearchError(null); }}
                onFinish={() => setImgSearchLoading(false)}
                onResults={handleImageResults}
                onError={(msg) => { setImgSearchError(msg); }}
              />
              {currentUser.user_type === 'seller' && (
                <Link to="/seller/dashboard" className="navbar-link">Trang bán hàng</Link>
              )}
              <Link to="/profile" className="navbar-link">Trang cá nhân</Link>
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
              <img
                src={avatarSrc}
                alt={currentUser.full_name || currentUser.username}
                className="user-avatar-img"
              />
            </>
          ) : (
            <>
              <button type="button" className="action-btn" onClick={openLogin}>Đăng nhập</button>
              <button type="button" className="action-btn" onClick={openRegister}>Đăng ký</button>
            </>
          )}
          <Link to="/cart" className="cart-btn" aria-label="Giỏ hàng">
            🛒
            {getCartCount() > 0 && (
              <span className="cart-dot">
                {getCartCount()}
              </span>
            )}
          </Link>
        </div>
      </header>

      <AuthModal
        open={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          try {
            if (auth?.setUser) auth.setUser(user);
            // ⬇️ THÊM: Reload trang sau khi đăng nhập thành công
            setTimeout(() => {
              window.location.reload();
            }, 100);
          } catch { }
        }}
        onRegisterSuccess={(user) => {
          try {
            if (auth?.setUser) auth.setUser(user);
            // ⬇️ THÊM: Reload trang sau khi đăng ký thành công
            setTimeout(() => {
              window.location.reload();
            }, 100);
          } catch { }
        }}
      />
    </>
  );
}
