import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { api } from '../services/api';

const ROLES = [
    { id: 'gerente', label: '👑 Gerente' },
    { id: 'recepcao', label: '💃 Recepção / Hostess' },
    { id: 'cozinha', label: '🍳 Cozinha' },
    { id: 'bar', label: '🍸 Bar' }
];

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('gerente');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // --- DEMO BYPASS ---
            if (email === 'demo@demo' && password === 'demo') {
                const userSession = {
                    id: '00000000-0000-0000-0000-000000000000',
                    email: 'demo@demo',
                    name: 'Demo Manager',
                    role: role || 'gerente'
                };
                localStorage.setItem('chefia_user', JSON.stringify(userSession));
                navigate(role === 'cozinha' ? '/kitchen' : '/');
                return;
            }
            if (email === 'garcom@demo.com' && password === '0000') {
                const userSession = {
                    id: '11111111-1111-1111-1111-111111111111',
                    email: 'garcom@demo.com',
                    name: 'Garçom Zé',
                    role: 'recepcao'
                };
                localStorage.setItem('chefia_user', JSON.stringify(userSession));
                navigate('/');
                return;
            }
            // -------------------

            // 1. Real Login via Supabase Auth
            const { user } = await api.login(email, password);

            if (user) {
                // 2. Hydrate Session (Mocking Role for now, ideally fetch from public.users)
                const userSession = {
                    id: user.id,
                    email: user.email,
                    name: role === 'gerente' ? 'Gerente' : 'Staff', // Fallback name
                    role: role // We trust the dropdown for this Demo/MVP phase
                };

                localStorage.setItem('chefia_user', JSON.stringify(userSession));

                // 3. Redirect based on role
                if (role === 'cozinha' || role === 'bar') {
                    navigate('/kitchen');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Falha ao entrar. Verifique email e senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white'
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        background: '#3b82f6', width: '50px', height: '50px', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                        <LayoutDashboard size={28} color="white" />
                    </div>
                    <h2>Chefia B2B</h2>
                    <p style={{ color: '#94a3b8' }}>Acesse o painel do estabelecimento.</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1rem' }}>

                    {error && (
                        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Perfil de Acesso (Simulado)</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569',
                                background: '#1e293b', color: 'white', cursor: 'pointer'
                            }}
                        >
                            {ROLES.map(r => (
                                <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="staff@bar.com"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569',
                                background: '#1e293b', color: 'white'
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569',
                                background: '#1e293b', color: 'white'
                            }}
                            required
                        />
                    </div>
                    <button disabled={loading} className="btn" style={{
                        marginTop: '1rem', width: '100%', padding: '0.75rem', background: loading ? '#475569' : '#3b82f6',
                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>
                        Dica: Use a mesma conta criada no App de Cliente
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
