import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const Register = () => {
    const navigate = useNavigate();

    const [establishmentName, setEstablishmentName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!establishmentName || !email || !password) {
            setError('Preencha todos os campos!');
            return;
        }

        setLoading(true);
        try {
            const { user } = await api.register(email, password, establishmentName);
            if (user) {
                setSuccess(true);
                // Auto-login setting storage
                const userSession = {
                    id: user.id,
                    email: user.email,
                    name: 'Gerente', // Default
                    role: user.role || 'gerente',
                    establishment_id: user.establishment_id
                };
                localStorage.setItem('chefia_user', JSON.stringify(userSession));
                
                // Demo timeout for feeling nice and safe jump to Dashboard
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Falha ao registrar conta. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white'
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.05)', padding: '2.5rem', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '450px',
                backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', width: '60px', height: '60px', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)'
                    }}>
                        <Store size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Criar Nova Conta</h2>
                    <p style={{ color: '#94a3b8' }}>Comece a gerenciar seu negócio agora.</p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <ShieldCheck size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Tudo Pronto!</h3>
                        <p style={{ color: '#94a3b8' }}>Limpando as mesas e te levando para o painel...</p>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1.25rem' }}>
                        {error && (
                            <div style={{ padding: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>Nome do Estabelecimento</label>
                            <input
                                type="text"
                                value={establishmentName}
                                onChange={(e) => setEstablishmentName(e.target.value)}
                                placeholder="Ex: Pizzaria Consagrado"
                                style={{
                                    width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #475569',
                                    background: 'rgba(15, 23, 42, 0.6)', color: 'white', outline: 'none', transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>Email do Gerente</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                style={{
                                    width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #475569',
                                    background: 'rgba(15, 23, 42, 0.6)', color: 'white', outline: 'none', transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '500' }}>Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="******"
                                style={{
                                    width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #475569',
                                    background: 'rgba(15, 23, 42, 0.6)', color: 'white', outline: 'none', transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                onBlur={(e) => e.target.style.borderColor = '#475569'}
                            />
                        </div>

                        <button disabled={loading} style={{
                            marginTop: '0.5rem', width: '100%', padding: '0.85rem', background: loading ? '#475569' : '#3b82f6',
                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
                            cursor: loading ? 'wait' : 'pointer', transition: 'all 0.2s',
                            boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                        }}>
                            {loading ? 'Criando sua estrutura...' : 'Finalizar Cadastro'}
                        </button>
                    </form>
                )}

                {!success && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
                        Já tem um estabelecimento? <br />
                        <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '500', display: 'inline-block', marginTop: '0.5rem' }}>Faça login aqui ▸</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
