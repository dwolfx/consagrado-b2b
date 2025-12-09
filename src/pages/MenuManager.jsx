import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit, Trash } from 'lucide-react';

const MenuManager = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const load = async () => {
            const data = await api.getProducts();
            setProducts(data);
        };
        load();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Gerenciar Cardápio</h1>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} /> Novo Produto
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Produto</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Categoria</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Preço</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
                                <td style={{ padding: '1rem' }}>{product.name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                        {product.category}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
                                        <Edit size={16} />
                                    </button>
                                    <button className="btn" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-primary)', color: 'var(--danger)' }}>
                                        <Trash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MenuManager;
