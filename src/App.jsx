import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import QRGenerator from './pages/QRGenerator';
import TableDetail from './pages/TableDetail';
import Login from './pages/Login';

const RequireAuth = ({ children }) => {
  const user = localStorage.getItem('chefia_user');
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('chefia_user');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: '3rem', paddingLeft: '0.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
            Chefia <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>B2B</span>
          </h2>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <UtensilsCrossed size={20} />
            Cardápio
          </NavLink>
          <NavLink to="/qr" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <QrCode size={20} />
            QR Codes
          </NavLink>
        </nav>

        <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
          <LogOut size={20} />
          Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// Hook helper since Layout is inside Router but needs navigate
const LayoutWrapper = ({ children }) => {
  return <Layout>{children}</Layout>;
};

import { useNavigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RequireAuth><LayoutWrapper><Dashboard /></LayoutWrapper></RequireAuth>} />
        <Route path="/table/:id" element={<RequireAuth><LayoutWrapper><TableDetail /></LayoutWrapper></RequireAuth>} />
        <Route path="/menu" element={<RequireAuth><LayoutWrapper><MenuManager /></LayoutWrapper></RequireAuth>} />
        <Route path="/qr" element={<RequireAuth><LayoutWrapper><QRGenerator /></LayoutWrapper></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;
