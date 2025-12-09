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

// ... (Layout and LayoutWrapper remain unchanged)

import { useNavigate } from 'react-router-dom';

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
