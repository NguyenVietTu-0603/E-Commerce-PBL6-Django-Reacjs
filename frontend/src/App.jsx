import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { CartProvider } from './utils/CartContext';
import { WishlistProvider } from './utils/WishlistContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import UserList from './pages/UserList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct'; // keep edit
import AddCategory from './pages/AddCategory';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Chat from './pages/Chat';
import ShopChat from './pages/ShopChat';
import SearchResults from './pages/SearchResults'; // thêm
import Wishlist from './pages/Wishlist';
import ChatWidget from './components/ChatWidget';
import './assets/Components.css';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import ShopsList from './pages/ShopsList'; // keep shops
import ShopProfile from './pages/ShopProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="App">
              <Header />
              <Routes>
                {/* ==================== PUBLIC ROUTES ==================== */}
                <Route index element={<Home />} />
                <Route path="/" element={<Home />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Category page */}
                <Route path="/category/:slug" element={<CategoryPage />} />

                {/* Product Detail */}
                <Route path="/product/:id" element={<ProductDetail />} />

                {/* Cart */}
                <Route path="/cart" element={<Cart />} />

                {/* Wishlist (buyer only) */}
                <Route
                  path="/wishlist"
                  element={
                    <PrivateRoute allowedRoles={["buyer"]}>
                      <Wishlist />
                    </PrivateRoute>
                  }
                />

                {/* Checkout and Order Success */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />

                {/* Shop public */}
                <Route path="/shops" element={<ShopsList />} />
                <Route path="/shop/:sellerId" element={<ShopProfile />} />

                {/* Chat */}
                <Route path="/chat/:shopId" element={<Chat />} />
                <Route path="/shop-chat/:shopId/:buyerId" element={<ShopChat />} />

                {/* Buyer routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["buyer"]}>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                {/* ==================== SELLER ROUTES ==================== */}
                <Route
                  path="/seller/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["seller"]}>
                      <SellerDashboard />
                    </PrivateRoute>
                  }
                />

                {/* Seller product management */}
                <Route
                  path="/seller/products"
                  element={
                    <PrivateRoute allowedRoles={["seller"]}>
                      <SellerProducts />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/seller/products/new"
                  element={
                    <PrivateRoute allowedRoles={["seller"]}>
                      <AddProduct />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/seller/products/add"
                  element={
                    <PrivateRoute allowedRoles={["seller"]}>
                      <AddProduct />
                    </PrivateRoute>
                  }
                />

                {/* Edit product */}
                <Route
                  path="/seller/products/edit/:id"
                  element={
                    <PrivateRoute allowedRoles={["seller"]}>
                      <EditProduct />
                    </PrivateRoute>
                  }
                />

                {/* Seller orders */}
                <Route
                  path="/seller/orders"
                  element={
                    <PrivateRoute allowedRoles={["seller"]}>
                      <SellerOrders />
                    </PrivateRoute>
                  }
                />

                {/* ==================== ADMIN ROUTES ==================== */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/categories/new"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <AddCategory />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <PrivateRoute allowedRoles={["admin"]}>
                      <UserList />
                    </PrivateRoute>
                  }
                />

                {/* ==================== COMMON PROTECTED ROUTES ==================== */}
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <PrivateRoute>
                      <ChangePassword />
                    </PrivateRoute>
                  }
                />

                {/* Search Results */}
                <Route path="/search" element={<SearchResults />} />

                {/* Default */}
                <Route path="*" element={<RoleBasedRedirect />} />
              </Routes>
              <ChatWidget />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

const RoleBasedRedirect = () => {
  const { user, getDefaultRoute } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={getDefaultRoute(user.user_type)} />;
};

export default App;