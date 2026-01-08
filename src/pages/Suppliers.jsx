import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Truck, Plus, Phone, Mail, MapPin, Edit, Trash, X, Loader2, Save } from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: 'Alimentos',
        contact: '',
        phone: '',
        email: '',
        establishment_id: 1 // Hardcoded for Demo 'Pizzaria Imperio'
    });

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const data = await api.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error('Error loading suppliers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.addSupplier(formData);
            await loadSuppliers(); // Refresh list
            setIsModalOpen(false);
            setFormData({
                name: '',
                category: 'Alimentos',
                contact: '',
                phone: '',
                email: '',
                establishment_id: 1
            });
        } catch (error) {
            alert('Erro ao salvar fornecedor');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover este fornecedor?')) return;
        try {
            await api.deleteSupplier(id);
            setSuppliers(suppliers.filter(s => s.id !== id));
        } catch (error) {
            alert('Erro ao remover fornecedor');
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Fornecedores
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie seus parceiros de compras.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={20} /> Novo Fornecedor
                </button>
            </div>

            <div className="glass-panel" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', minHeight: '300px' }}>
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
                            {loading ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
                            ) : suppliers.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum fornecedor cadastrado.</td></tr>
                            ) : (
                                suppliers.map(sup => (
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
                                                {/* Edit not implemented yet */}
                                                {/* <button className="btn" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                                    <Edit size={16} />
                                                </button> */}
                                                <button
                                                    onClick={() => handleDelete(sup.id)}
                                                    className="btn"
                                                    style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div style={{
                            padding: '1.5rem', borderBottom: '1px solid var(--glass-border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Novo Fornecedor</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome da Empresa</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '8px',
                                        background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                                        color: 'white', outline: 'none'
                                    }}
                                    placeholder="Ex: Laticínios da Serra"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '8px',
                                            background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                                            color: 'white', outline: 'none'
                                        }}
                                    >
                                        <option>Alimentos</option>
                                        <option>Bebidas</option>
                                        <option>Limpeza</option>
                                        <option>Equipamentos</option>
                                        <option>Outros</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contato (Pessoa)</label>
                                    <input
                                        type="text"
                                        value={formData.contact}
                                        onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '8px',
                                            background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                                            color: 'white', outline: 'none'
                                        }}
                                        placeholder="Ex: Sr. João"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Telefone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '8px',
                                            background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                                            color: 'white', outline: 'none'
                                        }}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '8px',
                                            background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                                            color: 'white', outline: 'none'
                                        }}
                                        placeholder="contato@empresa.com"
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn"
                                    style={{ background: 'transparent', color: 'var(--text-secondary)' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
