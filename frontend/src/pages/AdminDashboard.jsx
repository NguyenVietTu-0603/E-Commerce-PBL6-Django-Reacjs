import React from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const AdminDashboard = () => {
  const { user } = useAuth();

  usePageTitle('Bảng điều khiển quản trị');

  return (
    <div className="container">
      <div style={styles.header}>
        <h1>👑 Admin Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome, <strong>{user?.full_name || user?.username}</strong>!
        </p>
      </div>

      <div style={styles.grid}>
        {/* Admin Stats */}
        <div className="card">
          <h2 className="card-title">📊 System Overview</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>150</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>120</div>
              <div style={styles.statLabel}>Active Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>100</div>
              <div style={styles.statLabel}>Buyers</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>45</div>
              <div style={styles.statLabel}>Sellers</div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="card">
          <h2 className="card-title">⚙️ Admin Actions</h2>
          <div style={styles.actionsGrid}>
            <Link to="/users" style={styles.actionBtn}>
              <span style={styles.actionIcon}>👥</span>
              <span>Manage Users</span>
            </Link>
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

        {/* Recent Activity */}
        <div className="card">
          <h2 className="card-title">📈 Recent Activity</h2>
          <div>
            <p style={{ color: '#6c757d', marginBottom: '10px' }}>
              • New user registered: <strong>johndoe</strong>
            </p>
            <p style={{ color: '#6c757d', marginBottom: '10px' }}>
              • User suspended: <strong>spammer123</strong>
            </p>
            <p style={{ color: '#6c757d' }}>
              • New seller approved: <strong>shopowner</strong>
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
    background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
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

export default AdminDashboard;