
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';

const Sales = () => {
    // In a real app, we would fetch from 'orders' where status = 'paid'
    // For now, we'll mock some data or use the existing API if available
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mocking sales data for the "Saída de Caixa" view
        // Ideally we would add api.getSales()
        const mockSales = [
            { id: 1, table: 'Mesa 01', total: 125.50, payment_method: 'PIX', date: '2024-03-20 19:30', items: ['Heineken (2)', 'Batata Frita'] },
            { id: 2, table: 'Mesa 05', total: 64.00, payment_method: 'Cartão', date: '2024-03-20 20:15', items: ['Gin Tônica (2)'] },
            { id: 3, table: 'Balcão', total: 18.00, payment_method: 'Dinheiro', date: '2024-03-20 21:00', items: ['Heineken'] },
            { id: 4, table: 'Mesa 03', total: 250.00, payment_method: 'PIX', date: '2024-03-20 21:45', items: ['Combo Vodka', 'Energético (4)'] },
        ];

        setTimeout(() => {
            setSales(mockSales);
            setLoading(false);
        }, 1000);
    }, []);

    const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Saída de Caixa
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Histórico de vendas e faturamento.</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                            <DollarSign size={24} color="#10b981" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Faturamento Hoje</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </h3>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>
                        <ArrowUpRight size={16} /> <span>+12% vs. ontem</span>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                            <Printer size={24} color="#6366f1" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tickets Emitidos</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{sales.length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Hora</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Mesa/Origem</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Itens</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pagamento</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Carregando vendas...</td></tr>
                            ) : (
                                sales.map(sale => (
                                    <tr key={sale.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {sale.date.split(' ')[1]}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{sale.table}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {sale.items.join(', ')}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                                                background: sale.payment_method === 'PIX' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                color: sale.payment_method === 'PIX' ? '#10b981' : '#3b82f6'
                                            }}>
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                            {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Sales;
