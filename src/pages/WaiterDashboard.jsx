import { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import { Bell, CheckCircle, MapPin, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const WaiterDashboard = () => {
    const [calls, setCalls] = useState([]);
    const [tables, setTables] = useState([]);

    const fetchData = async () => {
        // 1. Fetch Calls (Orders with price 0)
        const { data: callsData } = await supabase
            .from('orders')
            .select('*, tables(number), users(name)')
            .eq('price', 0) // "Call Waiter" orders
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (callsData) setCalls(callsData);

        // 2. Fetch Active Tables
        const { data: tablesData } = await supabase
            .from('tables')
            .select('*, orders(count)')
            .eq('status', 'occupied')
            .order('number');

        if (tablesData) setTables(tablesData);
    };

    useEffect(() => {
        fetchData();

        // Realtime Subscription
        const channel = supabase
            .channel('waiter-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => fetchData())
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const completeCall = async (id) => {
        await supabase
            .from('orders')
            .update({ status: 'delivered' }) // Mark as handled
            .eq('id', id);
        // Optimistic update
        setCalls(calls.filter(c => c.id !== id));
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Painel do Garçom 🤵</h1>

            {/* SECTION 1: URGENT CALLS */}
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: calls.length > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    <Bell size={24} className={calls.length > 0 ? 'pulse' : ''} />
                    Chamados ({calls.length})
                </h2>

                {calls.length === 0 ? (
                    <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Nenhum chamado pendente.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {calls.map(call => (
                            <div key={call.id} className="card" style={{
                                borderLeft: '4px solid var(--danger)',
                                display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                        Mesa {call.tables?.number}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {call.users?.name || 'Cliente'} • {dayjs(call.created_at).fromNow()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => completeCall(call.id)}
                                    className="btn"
                                    style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    <CheckCircle size={18} style={{ marginRight: '6px' }} />
                                    Atender
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECTION 2: ACTIVE TABLES */}
            <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <MapPin size={24} /> Mesas Ocupadas ({tables.length})
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {tables.map(table => (
                        <div key={table.id} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                {table.number}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Status: Ocupada
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .pulse { animation: pulse-animation 2s infinite; }
                @keyframes pulse-animation {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default WaiterDashboard;
