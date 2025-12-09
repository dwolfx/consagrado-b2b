import { useParams, useNavigate } from 'react-router-dom';
import { tables } from '../data/mockData';
import { ArrowLeft, Ban, CheckCircle, Receipt } from 'lucide-react';

const TableDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const table = tables.find(t => t.id === Number(id));

    if (!table) {
        return <div style={{ padding: '2rem' }}>Mesa não encontrada.</div>;
    }

    const handleCloseTab = () => {
        if (confirm(`Deseja encerrar a conta da Mesa ${table.number}? Total: R$ ${table.total}`)) {
            alert("Conta encerrada e mesa liberada!");
            navigate('/');
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Mesa {table.number} {table.status === 'calling' && '🔔'}</h1>
                    <span style={{
                        backgroundColor: table.status === 'free' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        color: table.status === 'free' ? 'var(--success)' : 'var(--primary)',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem'
                    }}>
                        {table.status === 'free' ? 'Livre' : 'Ocupada'}
                    </span>
                </div>
                {table.status !== 'free' && (
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aberto às {table.openSince}</p>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--success)' }}>
                            R$ {table.total?.toFixed(2)}
                        </h2>
                    </div>
                )}
            </header>

            {table.status === 'free' ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Receipt size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <h3>Mesa Livre</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhuma comanda aberta para esta mesa.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Abrir Mesa</button>
                </div>
            ) : (
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '1rem' }}>Consumo</h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <th style={{ paddingBottom: '1rem' }}>Qtd</th>
                                <th style={{ paddingBottom: '1rem' }}>Item</th>
                                <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Unitário</th>
                                <th style={{ paddingBottom: '1rem', textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table.items && table.items.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                                    <td style={{ padding: '1rem 0' }}>{item.quantity}x</td>
                                    <td style={{ padding: '1rem 0' }}>{item.name}</td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                        R$ {item.price.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold' }}>
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', backgroundColor: 'transparent' }}>
                            <Ban size={18} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                            Cancelar Mesa
                        </button>
                        <button onClick={handleCloseTab} className="btn btn-primary">
                            <CheckCircle size={18} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                            Receber & Encerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableDetail;
