
import { useState } from 'react';
import { Truck, Plus, Phone, Mail, MapPin, Edit, Trash } from 'lucide-react';

const Suppliers = () => {
    // Mock Data for now
    const [suppliers, setSuppliers] = useState([
        { id: 1, name: 'Distribuidora de Bebidas Elite', category: 'Bebidas', contact: 'Carlos', phone: '(11) 99999-9999', email: 'vendas@elitebebidas.com.br' },
        { id: 2, name: 'Hortifruti Frescor', category: 'Alimentos', contact: 'Ana', phone: '(11) 98888-8888', email: 'pedidos@frescor.com.br' },
        { id: 3, name: 'Carnes Premium', category: 'Carnes', contact: 'Roberto', phone: '(11) 97777-7777', email: 'roberto@carnespremium.com' }
    ]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Fornecedores
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie seus parceiros de compras.</p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Novo Fornecedor
                </button>
            </div>

            <div className="glass-panel" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Fornecedor</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Categoria</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Contato</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right', fontSize: '0.85rem', textTransform: 'uppercase' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(sup => (
                                <tr key={sup.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Truck size={20} color="var(--primary)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{sup.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sup.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                                            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)'
                                        }}>
                                            {sup.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                                <Truck size={14} color="var(--text-tertiary)" /> {sup.contact}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <Phone size={14} /> {sup.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn" style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Suppliers;
