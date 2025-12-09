import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import QRGenerator from './pages/QRGenerator';
import TableDetail from './pages/TableDetail';

function App() {
  return (
    <Router>
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

          <button className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
            <LogOut size={20} />
            Sair
          </button>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/table/:id" element={<TableDetail />} />
            <Route path="/menu" element={<MenuManager />} />
            <Route path="/qr" element={<QRGenerator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
