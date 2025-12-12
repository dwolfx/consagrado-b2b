import { useState, useEffect } from 'react';
import { api, supabase } from '../services/api';
import { Users, DollarSign, Bell, Clock, Phone, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const getDailyCode = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // 20251211
    const seed = parseInt(dateStr);
    const code = (seed * 9301 + 49297) % 10000;
    return code.toString().padStart(4, '0');
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [staff, setStaff] = useState([]);
    const dailyCode = getDailyCode();

    // --- WAITER CHECK REMOVED --- 
    // Standard Manager Dashboard View always

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

    return (
        <div>
            {/* HEADER WITH CODE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Visão Geral</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Bem-vindo de volta.</p>
                </div>
                <div style={{
                    background: 'var(--bg-secondary)', padding: '0.75rem 1.5rem', borderRadius: '12px',
                    border: '1px border var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Código do Turno</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '4px', color: 'var(--primary)' }}>{dailyCode}</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
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
                    <div className="grid-tables">
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

                {/* Staff Online Widget with Overtime Alert */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
                        Equipe Online
                    </h3>
                    {staff.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum garçom ativo.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {staff.map(s => {
                                // Overtime Check
                                let isOvertime = false;
                                let overtimeMinutes = 0;
                                if (s.shift_end) { // Format: "15:00"
                                    const now = dayjs();
                                    const [h, m] = s.shift_end.split(':');
                                    const shiftEnd = dayjs().hour(parseInt(h)).minute(parseInt(m));
                                    if (now.isAfter(shiftEnd)) {
                                        isOvertime = true;
                                        overtimeMinutes = now.diff(shiftEnd, 'minute');
                                    }
                                }
                                return (
                                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--bg-tertiary)' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem', color: isOvertime ? 'var(--danger)' : 'inherit' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: isOvertime ? 'var(--danger)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {isOvertime ? <AlertTriangle size={12} /> : <Clock size={12} />}
                                                {isOvertime ? `EXTRA: +${overtimeMinutes} min` : (s.shift_description || 'Turno Padrão')}
                                            </div>
                                        </div>

                                        {s.phone && (
                                            <a href={`tel:${s.phone}`} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                width: '36px', height: '36px',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                                color: 'var(--primary)',
                                                transition: '0.2s'
                                            }}>
                                                <Phone size={18} />
                                            </a>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
