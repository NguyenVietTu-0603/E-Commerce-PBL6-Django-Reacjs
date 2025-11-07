import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import UserList from './pages/UserList';
import AddProduct from './pages/AddProduct';
import AddCategory from './pages/AddCategory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Buyer */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['buyer']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Seller */}
            <Route
              path="/seller/dashboard"
              element={
                <PrivateRoute allowedRoles={['seller']}>
                  <SellerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/products/new"
              element={
                <PrivateRoute allowedRoles={['seller']}>
                  <AddProduct />
                </PrivateRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/categories/new"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AddCategory />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <UserList />
                </PrivateRoute>
              }
            />

            {/* Common protected */}
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

            {/* Default */}
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </div>
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