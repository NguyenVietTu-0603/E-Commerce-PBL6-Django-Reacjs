import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isSeller, isBuyer, getDefaultRoute } = useAuth();

  const dashboardLink = user ? getDefaultRoute(user.user_type) : '/dashboard';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={dashboardLink} className="navbar-logo">
          🔐 Auth System
        </Link>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to={dashboardLink} className="navbar-link">
                {isAdmin ? '👑 Admin' : isSeller ? '🏪 Store' : '🏠 Home'}
              </Link>
              
              {isAdmin && (
                <Link to="/users" className="navbar-link">Users</Link>
              )}
              
              <Link to="/profile" className="navbar-link">Profile</Link>
              <Link to="/change-password" className="navbar-link">Password</Link>
              
              <div className="navbar-user">
                <span className="user-badge">{user.user_type}</span>
                <span className="user-name">{user.username}</span>
                <button onClick={logout} className="btn-logout">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;