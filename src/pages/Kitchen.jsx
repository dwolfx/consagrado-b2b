import { useState, useEffect } from 'react';
import { supabase } from '../services/api';
import { Clock, ChefHat, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const Kitchen = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data } = await supabase
                .from('orders')
                .select(`
                    *,
                    tables (number),
                    products (name, category)
                `)
                .gt('price', 0)
                .in('status', ['pending', 'preparing', 'ready'])
                .order('created_at', { ascending: true }); // Oldest first

            if (data) setOrders(data);
        };

        fetchOrders();

        const channel = supabase
            .channel('kitchen-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const updateStatus = async (id, newStatus) => {
        await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);
    };

    const OrderCard = ({ order }) => {
        const timeElapsed = dayjs(order.created_at).fromNow(true);
        const isLate = dayjs().diff(dayjs(order.created_at), 'minute') > 20;

        return (
            <div className="card" style={{
                borderLeft: isLate ? '4px solid var(--danger)' : '4px solid var(--primary)',
                animation: 'fadeIn 0.3s ease-in'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Mesa {order.tables?.number}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {timeElapsed}
                    </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                        {order.quantity}x {order.name}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {order.status === 'pending' && (
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => updateStatus(order.id, 'preparing')}
                        >
                            <ChefHat size={18} style={{ marginRight: '8px' }} /> Iniciar
                        </button>
                    )}
                    {order.status === 'preparing' && (
                        <button
                            className="btn btn-success"
                            style={{ width: '100%', backgroundColor: 'var(--success)' }}
                            onClick={() => updateStatus(order.id, 'ready')}
                        >
                            <CheckCircle size={18} style={{ marginRight: '8px' }} /> Pronto
                        </button>
                    )}
                    {order.status === 'ready' && (
                        <button
                            className="btn"
                            style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                            onClick={() => updateStatus(order.id, 'delivered')}
                        >
                            Entregue
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const Columns = ({ title, status, color, icon: Icon }) => (
        <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '1rem', paddingBottom: '0.5rem',
                borderBottom: `2px solid ${color}`
            }}>
                <Icon size={20} color={color} />
                <h3 style={{ margin: 0 }}>{title} ({orders.filter(o => o.status === status).length})</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.filter(o => o.status === status).map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <h1>Cozinha (KDS) 👨‍🍳</h1>
            <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem', flex: 1 }}>
                <Columns title="A Fazer" status="pending" color="var(--warning)" icon={Clock} />
                <Columns title="Preparando" status="preparing" color="var(--primary)" icon={ChefHat} />
                <Columns title="Pronto" status="ready" color="var(--success)" icon={CheckCircle} />
            </div>
        </div>
    );
};

export default Kitchen;
