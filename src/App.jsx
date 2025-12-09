import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import QRGenerator from './pages/QRGenerator';
import TableDetail from './pages/TableDetail';
import Login from './pages/Login';

import Kitchen from './pages/Kitchen';

const RequireAuth = ({ children }) => {
  const user = localStorage.getItem('chefia_user');
  if (!user) return <Navigate to="/login" />;
  return children;
};

const LayoutWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('chefia_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('chefia_user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Visão Geral', path: '/', icon: LayoutDashboard },
    { label: 'Cozinha (KDS)', path: '/kitchen', icon: UtensilsCrossed },
    { label: 'Cardápio', path: '/menu', icon: UtensilsCrossed },
    { label: 'QR Code', path: '/qr', icon: QrCode },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5' }}>Chefia</h1>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Gestão de Bar</p>
        </div>

        <nav style={{ flex: 1, padding: '1rem' }}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '0.5rem',
                textDecoration: 'none',
                color: isActive ? '#4f46e5' : '#374151',
                backgroundColor: isActive ? '#eef2ff' : 'transparent',
                fontWeight: isActive ? '600' : '400'
              })}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.name || 'Admin'}</p>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Gerente</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem',
              backgroundColor: 'white', color: '#ef4444', cursor: 'pointer'
            }}
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RequireAuth><LayoutWrapper><Dashboard /></LayoutWrapper></RequireAuth>} />
        <Route path="/kitchen" element={<RequireAuth><LayoutWrapper><Kitchen /></LayoutWrapper></RequireAuth>} />
        <Route path="/table/:id" element={<RequireAuth><LayoutWrapper><TableDetail /></LayoutWrapper></RequireAuth>} />
        <Route path="/menu" element={<RequireAuth><LayoutWrapper><MenuManager /></LayoutWrapper></RequireAuth>} />
        <Route path="/qr" element={<RequireAuth><LayoutWrapper><QRGenerator /></LayoutWrapper></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;
