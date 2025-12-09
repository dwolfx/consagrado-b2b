import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Lock } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock Login
        if (email && password) {
            localStorage.setItem('chefia_user', JSON.stringify({ email, name: 'Gerente' }));
            navigate('/');
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
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="gerente@bar.com"
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
                    <button className="btn" style={{
                        marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#3b82f6',
                        color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
