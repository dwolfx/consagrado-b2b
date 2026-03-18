import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
    Package, Plus, Search, AlertTriangle, TrendingDown, CheckCircle, 
    MoreVertical, MessageCircle, ArrowUpRight, Loader2, X, Save
} from 'lucide-react';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Get establishment from local storage or default to 1
    const user = JSON.parse(localStorage.getItem('chefia_user') || '{}');
    const establishmentId = user.establishment_id || 1;

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        stock: 0,
        min_stock: 10,
        unit: 'un',
        price: 0,
        supplier_id: ''
    });

    useEffect(() => {
        loadInventory();
        loadSuppliers();
    }, []);

    const loadInventory = async () => {
        setLoading(true);
        try {
            const data = await api.getInventory(establishmentId);
            setItems(data || []);
        } catch (e) {
            console.error('Error loading inventory:', e);
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const data = await api.getSuppliers(establishmentId);
            setSuppliers(data || []);
        } catch (e) {
            console.error('Error loading suppliers:', e);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setIsEditing(true);
            setEditId(item.id);
            setFormData({
                name: item.name,
                stock: item.stock,
                min_stock: item.min_stock,
                unit: item.unit || 'un',
                price: item.price || 0,
                supplier_id: item.supplier_id || ''
            });
        } else {
            setIsEditing(false);
            setEditId(null);
            setFormData({
                name: '',
                stock: 0,
                min_stock: 10,
                unit: 'un',
                price: 0,
                supplier_id: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData, establishment_id: parseInt(establishmentId) };
            payload.stock = parseFloat(payload.stock);
            payload.min_stock = parseFloat(payload.min_stock);
            payload.price = parseFloat(payload.price);
            if (payload.supplier_id) {
                payload.supplier_id = parseInt(payload.supplier_id);
            } else {
                delete payload.supplier_id;
            }

            if (isEditing) {
                await api.updateInventoryItem(editId, payload);
            } else {
                await api.createInventoryItem(payload);
            }
            setShowModal(false);
            loadInventory();
        } catch (e) {
            alert('Erro ao salvar item: ' + e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Excluir este item permanentemente?')) {
            try {
                await api.deleteInventoryItem(id);
                loadInventory();
            } catch (e) {
                alert('Erro ao excluir: ' + e.message);
            }
        }
    };

    const getStatus = (item) => {
        const min = item.min_stock || 10;
        if (item.stock <= min) return { label: 'CRÍTICO', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertTriangle };
        if (item.stock <= min * 1.5) return { label: 'BAIXO', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: TrendingDown };
        return { label: 'OK', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle };
    };

    const handleOrder = (item) => {
        const min = item.min_stock || 10;
        const qtyNeeded = Math.ceil((min * 2) - item.stock);
        const estName = 'nosso estabelecimento';
        const supplier = item.suppliers;
        const msg = `Olá! 👋 Aqui é do ${estName}.\nGostaria de solicitar a reposição de *${item.name}*.\n\n📊 *Status Atual:* ${item.stock} ${item.unit || 'un'}\n📦 *Pedido Estimado:* ~${qtyNeeded} ${item.unit || 'un'}\n\nConsegue nos atender para hoje?`;
        
        const phone = supplier?.phone || '';
        if (!phone) {
            alert('Este fornecedor não possui telefone cadastrado.');
            return;
        }
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const filteredItems = items.filter(item => {
        const nameMatch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const supplierMatch = (item.suppliers?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = nameMatch || supplierMatch;

        const status = getStatus(item);
        if (filter === 'low') return matchesSearch && status.label === 'BAIXO';
        if (filter === 'critical') return matchesSearch && status.label === 'CRÍTICO';
        return matchesSearch;
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Estoque de Insumos
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie o estoque para produção e operação.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Novo Insumo
                </button>
            </div>

            {/* Quick Stats & Search */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="glass-panel" style={{ flex: 1, minWidth: '200px', padding: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Itens Críticos</p>
                    <h2 style={{ fontSize: '1.75rem', color: '#ef4444' }}>{items.filter(i => i.stock <= i.min_stock).length}</h2>
                </div>
                <div className="glass-panel" style={{ flex: 4, minWidth: '300px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input 
                            type="text" 
                            placeholder="Buscar insumo..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'white' }} 
                        />
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Insumo</th>
                            <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Qtd. Atual</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Fornecedor</th>
                            <th style={{ padding: '1rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
                        ) : filteredItems.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum item encontrado.</td></tr>
                        ) : filteredItems.map(item => {
                            const status = getStatus(item);
                            const StatusIcon = status.icon;
                            return (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Package size={18} color="var(--text-tertiary)" />
                                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: status.bg, color: status.color, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                            <StatusIcon size={12} /> {status.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.stock}</span>
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginLeft: '4px' }}>{item.unit}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.suppliers?.name || 'Não vinculado'}</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', position: 'relative' }}>
                                            <button onClick={() => handleOrder(item)} className="btn" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                                                <MessageCircle size={14} style={{ marginRight: '6px' }} /> Repor
                                            </button>
                                            <button 
                                                onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            
                                            {activeMenuId === item.id && (
                                                <div style={{ position: 'absolute', right: 0, top: '100%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', zIndex: 10, padding: '0.4rem', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', minWidth: '120px' }}>
                                                    <button onClick={() => { handleOpenModal(item); setActiveMenuId(null); }} style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                                                    <button onClick={() => { handleDelete(item.id); setActiveMenuId(null); }} style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>Excluir</button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{isEditing ? 'Editar Insumo' : 'Novo Insumo'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome do Insumo</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white' }} placeholder="Ex: Farinha de Trigo" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Quantidade Atual</label>
                                    <input required type="number" step="0.01" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mínimo Segurança</label>
                                    <input required type="number" step="0.01" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Unidade</label>
                                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white' }}>
                                        <option value="un">Unidade (un)</option>
                                        <option value="kg">Quilo (kg)</option>
                                        <option value="l">Litro (l)</option>
                                        <option value="cx">Caixa (cx)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fornecedor</label>
                                    <select value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'white' }}>
                                        <option value="">Sem vínculo</option>
                                        {suppliers.map(sup => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ background: 'transparent' }}>Cancelar</button>
                                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
