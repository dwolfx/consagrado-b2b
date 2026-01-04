import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit, Trash, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Save } from 'lucide-react';

const MenuManager = () => {
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('list');

    // Import State
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle');

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Lanches',
        price: '',
        description: '',
        image_url: '',
        stock_quantity: 0,
        min_stock_level: 5
    });

    const categories = ['Lanches', 'Bebidas', 'Porções', 'Sobremesas', 'Combos'];

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await api.getProducts();
        setProducts(data);
    };

    // --- CRUD HANDLERS ---
    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
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
            setEditingProduct(null);
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
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                min_stock_level: parseInt(formData.min_stock_level)
            };

            if (editingProduct) {
                await api.updateProduct(editingProduct.id, payload);
            } else {
                await api.createProduct(payload);
            }

            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            alert('Erro ao salvar. Verifique se o banco de dados foi atualizado com as novas colunas.');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await api.deleteProduct(id);
                loadProducts();
            } catch (error) {
                console.error('Erro ao excluir:', error);
                alert('Erro ao excluir produto.');
            }
        }
    };

    // --- IMPORT HANDLERS ---
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file) => {
        setUploadStatus('uploading');
        setTimeout(() => {
            setUploadStatus('success');
        }, 1500);
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Nome,Categoria,Preço,Descrição\nEx: Hamburguer,Lanches,25.00,Pão e carne";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modelo_importacao_cardapio.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cardápio Digital</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie seus produtos, imagens e estoque.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={20} /> Novo Produto
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <button
                    onClick={() => setActiveTab('list')}
                    style={{
                        padding: '1rem', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'list' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: '600', transition: 'all 0.3s'
                    }}
                >
                    Gerenciar Pratos
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    style={{
                        padding: '1rem', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'import' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'import' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s'
                    }}
                >
                    <FileSpreadsheet size={18} /> Importar CSV
                </button>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'list' && (
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
                                                                onClick={() => handleOpenModal(product)}
                                                                className="btn"
                                                                style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
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
                )}

                {activeTab === 'import' && (
                    <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <div style={{ width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                <FileSpreadsheet size={30} className="text-primary" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Importação em Massa</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                Arraste seu arquivo CSV ou clique para selecionar.
                            </p>

                            {/* Drag and Drop Area */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                style={{
                                    border: '2px dashed var(--glass-border)',
                                    borderRadius: '12px',
                                    padding: '3rem',
                                    backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                    transition: 'all 0.2s',
                                    marginBottom: '2rem'
                                }}
                            >
                                <Upload size={40} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                                <p>Solte o arquivo aqui</p>
                            </div>

                            <button onClick={downloadTemplate} className="btn" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                <Download size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Baixar Modelo CSV
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* NEW PREMIUM MODAL */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
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

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Descrição</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', resize: 'vertical' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn"
                                    style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Save size={18} /> Salvar Produto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManager;
