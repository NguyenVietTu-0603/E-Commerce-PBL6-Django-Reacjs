import React from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div style={styles.header}>
        <h1>🏪 Seller Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome, <strong>{user?.full_name || user?.username}</strong>!
        </p>
      </div>

      <div style={styles.grid}>
        {/* Seller Stats */}
        <div className="card">
          <h2 className="card-title">📊 Your Store Stats</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>50</div>
              <div style={styles.statLabel}>Products</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>120</div>
              <div style={styles.statLabel}>Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>$5,420</div>
              <div style={styles.statLabel}>Revenue</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>4.8⭐</div>
              <div style={styles.statLabel}>Rating</div>
            </div>
          </div>
        </div>

        {/* Seller Actions */}
        <div className="card">
          <h2 className="card-title">⚡ Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <a href="#products" style={styles.actionBtn}>
              <span style={styles.actionIcon}>📦</span>
              <span>Manage Products</span>
            </a>
            <a href="#orders" style={styles.actionBtn}>
              <span style={styles.actionIcon}>📋</span>
              <span>View Orders</span>
            </a>
            <Link to="/profile" style={styles.actionBtn}>
              <span style={styles.actionIcon}>✏️</span>
              <span>Edit Profile</span>
            </Link>
            <Link to="/change-password" style={styles.actionBtn}>
              <span style={styles.actionIcon}>🔒</span>
              <span>Change Password</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h2 className="card-title">🛒 Recent Orders</h2>
          <div>
            <p style={{ color: '#6c757d', marginBottom: '10px' }}>
              • Order #1234 - <strong>$120.00</strong> - Pending
            </p>
            <p style={{ color: '#6c757d', marginBottom: '10px' }}>
              • Order #1233 - <strong>$85.50</strong> - Shipped
            </p>
            <p style={{ color: '#6c757d' }}>
              • Order #1232 - <strong>$200.00</strong> - Delivered
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    background: 'white',
    borderRadius: '8px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    color: '#6c757d',
    fontSize: '16px',
    marginTop: '10px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #06d6a0 0%, #4361ee 100%)',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    color: 'white',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.9,
  },
  actionsGrid: {
    display: 'grid',
    gap: '10px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px 20px',
    background: '#f8f9fa',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#1a1a2e',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  actionIcon: {
    fontSize: '24px',
  },
};

export default SellerDashboard;