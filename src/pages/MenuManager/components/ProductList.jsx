import React from 'react';
import { Upload, AlertCircle, Edit, Trash } from 'lucide-react';

const ProductList = ({ products, onEdit, onDelete }) => {
    return (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Produto</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Categoria</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Preço</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Estoque</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right', fontSize: '0.85rem', textTransform: 'uppercase' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Nenhum produto cadastrado.
                                </td>
                            </tr>
                        ) : (
                            products.map(product => {
                                const isLowStock = (product.stock_quantity || 0) <= (product.min_stock_level || 5);
                                return (
                                    <tr key={product.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Upload size={20} color="var(--text-tertiary)" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px',
                                                borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                                                color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)'
                                            }}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                                            {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{
                                                    color: isLowStock ? 'var(--danger)' : 'var(--success)',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {product.stock_quantity || 0}
                                                </span>
                                                {isLowStock && <AlertCircle size={16} color="var(--danger)" />}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => onEdit(product)}
                                                    className="btn"
                                                    style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(product.id)}
                                                    className="btn"
                                                    style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;
