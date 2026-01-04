import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Crown, UtensilsCrossed, Wine, ClipboardList } from 'lucide-react';
import { api } from '../services/api';

const ROLES = [
    { id: 'gerente', label: 'Gerente', icon: Crown },
    { id: 'recepcao', label: 'Recepção', icon: ClipboardList },
    { id: 'cozinha', label: 'Cozinha', icon: UtensilsCrossed },
    { id: 'bar', label: 'Bar', icon: Wine }
];

const Login = () => {
    const navigate = useNavigate();

    // Manager State
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
            // 1. Real Login via Supabase Auth
            const { user } = await api.login(email, password);

            if (user) {
                const userSession = {
                    id: user.id,
                    email: user.email,
                    name: ROLES.find(r => r.id === role)?.label || 'Staff',
                    role: role
                };
                localStorage.setItem('chefia_user', JSON.stringify(userSession));
                if (role === 'cozinha' || role === 'bar') {
                    navigate('/kitchen');
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Falha ao entrar. Verifique suas credenciais.');
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
                    <p style={{ color: '#94a3b8' }}>Selecione seu cargo para entrar.</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1rem' }}>

                    {error && (
                        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* ROLE BUTTONS GRID */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Quem é você hoje?</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                            {ROLES.map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id)}
                                    style={{
                                        padding: '0.75rem 0.25rem',
                                        height: '80px',
                                        borderRadius: '8px',
                                        border: role === r.id ? '2px solid #3b82f6' : '1px solid #475569',
                                        background: role === r.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                                        color: role === r.id ? 'white' : '#94a3b8',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <r.icon size={24} />
                                    <span>{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #475569',
                                background: '#1e293b', color: 'white'
                            }}
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
                        />
                    </div>

                    <button disabled={loading} className="btn" style={{
                        marginTop: '1rem', width: '100%', padding: '0.75rem', background: loading ? '#475569' : '#3b82f6',
                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        {loading ? 'Acessando...' : 'Entrar no Sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
