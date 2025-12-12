import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Keypad } from 'lucide-react';
import { api } from '../services/api';

const ROLES = [
    { id: 'gerente', label: '👑 Gerente' },
    { id: 'recepcao', label: '💃 Recepção / Hostess' },
    { id: 'cozinha', label: '🍳 Cozinha' },
    { id: 'bar', label: '🍸 Bar' }
];

const Login = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('manager'); // 'manager' | 'staff'

    // Manager State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('gerente');

    // Stuff (PIN) State
    const [pin, setPin] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // --- DEMO BYPASS: PIN MODE ---
            if (mode === 'staff') {
                if (pin === '0000') {
                    // GARÇOM DEMO
                    const userSession = {
                        id: '11111111-1111-1111-1111-111111111111',
                        email: 'garcom@demo.com',
                        name: 'Garçom Zé',
                        role: 'recepcao'
                    };
                    localStorage.setItem('chefia_user', JSON.stringify(userSession));
                    navigate('/'); // Goes to Waiter Dashboard
                    return;
                } else {
                    throw new Error('PIN inválido');
                }
            }

            // --- DEMO BYPASS: MANAGER MODE ---
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

            // 1. Real Login via Supabase Auth
            const { user } = await api.login(email, password);

            if (user) {
                const userSession = {
                    id: user.id,
                    email: user.email,
                    name: role === 'gerente' ? 'Gerente' : 'Staff',
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
            setError(mode === 'staff' ? 'PIN Incorreto.' : 'Falha ao entrar.');
        } finally {
            setLoading(false);
        }
    };

    const handlePinClick = (num) => {
        if (pin.length < 4) setPin(prev => prev + num);
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

                {/* TABS */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setMode('manager')}
                        style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                            background: mode === 'manager' ? '#3b82f6' : 'transparent',
                            color: mode === 'manager' ? 'white' : '#94a3b8', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}>
                        <User size={16} /> Admin
                    </button>
                    <button
                        onClick={() => setMode('staff')}
                        style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                            background: mode === 'staff' ? '#3b82f6' : 'transparent',
                            color: mode === 'staff' ? 'white' : '#94a3b8', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}>
                        <Keypad size={16} /> Salão
                    </button>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1rem' }}>

                    {error && (
                        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {mode === 'manager' ? (
                        <>
                            {/* MANAGER FORM */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Perfil de Acesso</label>
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
                                    placeholder="admin@bar.com"
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
                        </>
                    ) : (
                        <>
                            {/* PIN PAD */}
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <div style={{
                                    fontSize: '2rem', letterSpacing: '8px', fontWeight: 'bold',
                                    background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem'
                                }}>
                                    {pin.padEnd(4, '•').replace(/./g, (char, i) => i < pin.length ? '●' : '○')}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <button
                                            key={num} type="button" onClick={() => handlePinClick(num.toString())}
                                            style={{
                                                padding: '1rem', fontSize: '1.25rem', background: '#334155', border: 'none',
                                                borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold'
                                            }}
                                        >{num}</button>
                                    ))}
                                    <button type="button" onClick={() => setPin('')} style={{ background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>C</button>
                                    <button type="button" onClick={() => handlePinClick('0')} style={{ background: '#334155', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}>0</button>
                                    <button type="submit" disabled={pin.length < 4} style={{ background: pin.length === 4 ? '#22c55e' : '#475569', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>OK</button>
                                </div>
                            </div>
                        </>
                    )}

                    {mode === 'manager' && (
                        <button disabled={loading} className="btn" style={{
                            marginTop: '1rem', width: '100%', padding: '0.75rem', background: loading ? '#475569' : '#3b82f6',
                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
