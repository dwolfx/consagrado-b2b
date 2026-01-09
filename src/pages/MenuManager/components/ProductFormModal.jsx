import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

const ProductFormModal = ({ isOpen, onClose, product, onSubmit }) => {
    const categories = ['Lanches', 'Bebidas', 'Porções', 'Sobremesas', 'Combos'];

    const [formData, setFormData] = useState({
        name: '',
        category: 'Lanches',
        price: '',
        description: '',
        image_url: '',
        stock_quantity: 0,
        min_stock_level: 5
    });

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    description: product.description || '',
                    image_url: product.image_url || '',
                    stock_quantity: product.stock_quantity || 0,
                    min_stock_level: product.min_stock_level || 5
                });
            } else {
                setFormData({
                    name: '',
                    category: 'Lanches',
                    price: '',
                    description: '',
                    image_url: '',
                    stock_quantity: 0,
                    min_stock_level: 5
                });
            }
        }
    }, [isOpen, product]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {product ? 'Editar Produto' : 'Novo Produto'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Image Preview / URL */}
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{
                            width: '100px', height: '100px',
                            borderRadius: '12px',
                            background: 'var(--bg-tertiary)',
                            backgroundImage: `url(${formData.image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '1px solid var(--glass-border)',
                            flexShrink: 0
                        }} />
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>URL da Imagem</label>
                            <input
                                type="url"
                                placeholder="https://exemplo.com/foto.jpg"
                                value={formData.image_url}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Cole o link de uma imagem externa.</p>
                        </div>
                    </div>

                    <div className="input-grid">
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome do Produto</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Categoria</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="input-grid">
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                            />
                        </div>
                        <div>
                            {/* Spacer/Empty */}
                        </div>
                    </div>

                    {/* Stock Control */}
                    <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={14} /> Controle de Estoque
                        </h4>
                        <div className="input-grid">
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Qtd. Atual</label>
                                <input
                                    type="number"
                                    value={formData.stock_quantity}
                                    onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Mínimo (Alerta)</label>
                                <input
                                    type="number"
                                    value={formData.min_stock_level}
                                    onChange={e => setFormData({ ...formData, min_stock_level: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn"
                            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Salvar Produto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
