import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Ban, CheckCircle, Receipt, Loader2, DollarSign } from 'lucide-react';

const TableDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [table, setTable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadTable();
    }, [id]);

    const loadTable = async () => {
        const data = await api.getTable(id);
        setTable(data);
        setLoading(false);
    };

    // Filter only unpaid items for calculation, excluding Service Calls
    const pendingItems = table?.orders?.filter(o => o.status !== 'paid' && o.name !== '🔔 CHAMAR GARÇOM') || [];

    // Calculate totals
    const subtotal = pendingItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const serviceFee = subtotal * 0.10; // 10%
    const total = subtotal + serviceFee;

    const handleCloseTab = async () => {
        if (!confirm(`Confirma o recebimento de R$ ${total.toFixed(2)} e encerramento da mesa?`)) return;

        setProcessing(true);
        const success = await api.closeTable(id);

        if (success) {
            alert("Conta encerrada com sucesso!");
            navigate('/');
        } else {
            alert("Erro ao encerrar mesa. Tente novamente.");
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            </div>
        );
    }

    if (!table) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Mesa não encontrada.</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Mesa {table.number}</h1>
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
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total a Pagar</p>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--success)' }}>
                            R$ {total.toFixed(2)}
                        </h2>
                    </div>
                )}
            </header>

            {/* Empty State / Free Table */}
            {table.status === 'free' || pendingItems.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Receipt size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <h3>Nenhum Pagamento Pendente</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Esta mesa não possui pedidos em aberto.</p>
                    {table.status === 'free' && (
                        <button className="btn btn-primary" style={{ marginTop: '1rem' }} disabled>
                            Mesa Disponível
                        </button>
                    )}
                </div>
            ) : (
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '1rem' }}>
                        Resumo da Conta
                    </h3>

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
                            {pendingItems.map(item => (
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
                        <tfoot>
                            <tr>
                                <td colSpan="3" style={{ paddingTop: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>Subtotal:</td>
                                <td style={{ paddingTop: '1rem', textAlign: 'right' }}>R$ {subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>Taxa de Serviço (10%):</td>
                                <td style={{ textAlign: 'right' }}>R$ {serviceFee.toFixed(2)}</td>
                            </tr>
                            <tr style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                <td colSpan="3" style={{ paddingTop: '0.5rem', textAlign: 'right' }}>TOTAL:</td>
                                <td style={{ paddingTop: '0.5rem', textAlign: 'right' }}>R$ {total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', backgroundColor: 'transparent' }}>
                            <Ban size={18} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                            Cancelar
                        </button>
                        <button
                            onClick={handleCloseTab}
                            disabled={processing}
                            className="btn btn-primary"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} style={{ marginRight: '0.5rem' }} />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} style={{ marginRight: '0.5rem', verticalAlign: 'text-bottom' }} />
                                    Receber & Encerrar ({pendingItems.length} itens)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableDetail;
