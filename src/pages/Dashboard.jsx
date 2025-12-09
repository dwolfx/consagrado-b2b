import { useState, useEffect } from 'react';
import { api, supabase } from '../services/api';
import { Users, DollarSign, Bell, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);

    useEffect(() => {
        // Initial Load
        const load = async () => {
            const data = await api.getTables();
            setTables(data);
        };
        load();

        // Realtime Subscription
        const channel = supabase
            .channel('table-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, (payload) => {
                console.log('Realtime update:', payload);
                load(); // Reload full data on any change (Simple strategy)
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('Order update:', payload);
                load(); // Reload to update revenue/totals
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Derived stats
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const calls = tables.filter(t => t.callWaiter).length;
    // Calculate total revenue from current orders
    const currentRevenue = tables.reduce((acc, t) => {
        const tableTotal = t.orders?.reduce((sum, o) => sum + o.price, 0) || 0;
        return acc + tableTotal;
    }, 0);

    return (
        <div>
            {/* KPI Cards */}
            <div className="stats-grid">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Mesas Ocupadas</p>
                            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{occupiedTables}/{tables.length}</h2>
                        </div>
                        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '8px', height: 'max-content' }}>
                            <Users size={24} color="var(--primary)" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Faturamento (Agora)</p>
                            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
                                {currentRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </h2>
                        </div>
                        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '8px', height: 'max-content' }}>
                            <DollarSign size={24} color="var(--success)" />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ border: calls > 0 ? '1px solid var(--danger)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Chamados Ativos</p>
                            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: calls > 0 ? 'var(--danger)' : 'inherit' }}>{calls}</h2>
                        </div>
                        <div style={{ backgroundColor: calls > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-primary)', padding: '0.5rem', borderRadius: '8px', height: 'max-content' }}>
                            <Bell size={24} color={calls > 0 ? 'var(--danger)' : 'var(--warning)'} className={calls > 0 ? 'pulse' : ''} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Table Map */}
            <h2 style={{ marginBottom: '1.5rem' }}>Mapa de Mesas</h2>
            <div className="table-grid">
                {tables.map(table => (
                    <div
                        key={table.id}
                        className={`table-card ${table.status}`}
                        onClick={() => navigate(`/table/${table.id}`)}
                        style={{ position: 'relative', overflow: 'hidden' }}
                    >
                        {table.callWaiter && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0,
                                backgroundColor: 'var(--danger)', color: 'white',
                                textAlign: 'center', padding: '0.2rem', fontSize: '0.75rem', fontWeight: 'bold'
                            }}>
                                CHAMANDO
                            </div>
                        )}
                        <h3>Mesa {table.number}</h3>
                        {table.status === 'occupied' && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    {(table.orders?.reduce((acc, o) => acc + o.price, 0) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    12min
                                </div>
                            </div>
                        )}
                        {table.status === 'free' && (
                            <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.6 }}>Livre</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
