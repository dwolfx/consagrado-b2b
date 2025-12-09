import { useState, useEffect } from 'react';
import { api, supabase } from '../services/api';
import { Users, DollarSign, Bell, Clock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        // Initial Load
        const load = async () => {
            const data = await api.getTables();
            setTables(data);

            const { data: staffData } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'waiter')
                .eq('is_working_now', true);
            setStaff(staffData || []);
        };
        load();

        // Realtime Subscription
        const channel = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => load())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => load())
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    // Derived stats
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const calls = tables.filter(t => t.callWaiter).length;
    const currentRevenue = tables.reduce((acc, t) => {
        const tableTotal = t.orders?.reduce((sum, o) => sum + o.price, 0) || 0;
        return acc + tableTotal;
    }, 0);

    return (
        <div>
            {/* KPI Cards */}
            <div className="stats-grid" style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: 'fit-content' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
                {/* Live Table Map */}
                <div>
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

                {/* Staff Online Widget */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                        Equipe Online
                    </h3>
                    {staff.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum garçom ativo.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {staff.map(s => (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--bg-tertiary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {s.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.shift_description}</div>
                                        </div>
                                    </div>
                                    {s.phone && (
                                        <a href={`tel:${s.phone}`} style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
                                            <Phone size={16} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
