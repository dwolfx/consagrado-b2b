

import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, Users, Settings as SettingsIcon, Menu, X, Banknote } from 'lucide-react';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import QRGenerator from './pages/QRGenerator';
import TableDetail from './pages/TableDetail';
import Team from './pages/Team';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Kitchen from './pages/Kitchen';
import Sales from './pages/Sales';
import Suppliers from './pages/Suppliers';


const RequireAuth = ({ children }) => {
  const user = localStorage.getItem('chefia_user');
  if (!user) return <Navigate to="/login" />;
  return children;
};

const LayoutWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('chefia_user') || '{}');
  } catch (e) {
    console.error('Error parsing user', e);
  }

  const handleLogout = () => {
    localStorage.removeItem('chefia_user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Visão Geral', path: '/', icon: LayoutDashboard },
    { label: 'Vendas (Caixa)', path: '/sales', icon: Banknote },
    { label: 'Cozinha (KDS)', path: '/kitchen', icon: UtensilsCrossed },
    { label: 'Cardápio', path: '/menu', icon: UtensilsCrossed },
    { label: 'Fornecedores', path: '/suppliers', icon: Users },
    { label: 'Equipe', path: '/team', icon: Users },
    { label: 'QR Code', path: '/qr', icon: QrCode },
    { label: 'Configuração', path: '/settings', icon: SettingsIcon },
  ];

  const userRole = user.role || 'gerente';

  const PERMISSIONS = {
    'gerente': '*',
    'recepcao': ['/', '/table'], // Dashboard has the map (Entry/Exit control)
    'cozinha': ['/kitchen'],
    'bar': ['/kitchen']
  };

  const allowedPaths = PERMISSIONS[userRole] || [];

  const filteredNavItems = navItems.filter(item => {
    if (userRole === 'gerente') return true;
    // Special logic: 'recepcao' needs access to '/' (Dashboard) but technically '/table' is dynamic, 
    // so we filter sidebar items strictly by path
    return allowedPaths.includes(item.path);
  });

  /* Sidebar Logic */
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="dashboard-layout">
      {/* Mobile Header (Only visible < 768px via CSS) */}
      <div className="mobile-header" style={{
        padding: '1rem',
        borderBottom: '1px solid var(--bg-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--bg-secondary)',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 998
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <Menu size={24} />
          </button>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>Chefia</h1>
        </div>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user.name?.charAt(0) || 'A'}
        </div>
      </div>

      {/* Sidebar Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--bg-tertiary)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Chefia
            {/* Close Button Mobile */}
            <button className="mobile-only-btn" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {userRole === 'gerente' ? 'Gestão Completa' :
              userRole === 'recepcao' ? 'Recepção' :
                userRole === 'cozinha' ? 'Cozinha' : 'Bar'}
          </p>
        </div>

        <nav style={{ flex: 1, padding: '1rem' }}>
          {filteredNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)} // Auto close on click mobile
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: '0.5rem',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s'
              })}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>{user.name || 'Admin'}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gerente</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.5rem', border: 'none', borderRadius: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside >

      {/* Main Content */}
      < main className="main-content" >
        {children}
      </main >
    </div >
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
        <Route path="/sales" element={<RequireAuth><LayoutWrapper><Sales /></LayoutWrapper></RequireAuth>} />
        <Route path="/suppliers" element={<RequireAuth><LayoutWrapper><Suppliers /></LayoutWrapper></RequireAuth>} />
        <Route path="/menu" element={<RequireAuth><LayoutWrapper><MenuManager /></LayoutWrapper></RequireAuth>} />
        <Route path="/team" element={<RequireAuth><LayoutWrapper><Team /></LayoutWrapper></RequireAuth>} />
        <Route path="/qr" element={<RequireAuth><LayoutWrapper><QRGenerator /></LayoutWrapper></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><LayoutWrapper><Settings /></LayoutWrapper></RequireAuth>} />

        {/* Catch all - Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
