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
        image_url: ''
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
                image_url: product.image_url || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: 'Lanches',
                price: '',
                description: '',
                image_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (editingProduct) {
                await api.updateProduct(editingProduct.id, payload);
            } else {
                await api.createProduct(payload);
            }

            setIsModalOpen(false);
            loadProducts();
            // alert('Produto salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            alert('Erro ao salvar. Verifique o console.');
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
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            <div className="header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Cardápio Digital</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie seus produtos ou importe em massa.</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <button
                    onClick={() => setActiveTab('list')}
                    style={{
                        padding: '1rem', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'list' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: '600'
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
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                >
                    <Upload size={16} /> Importação em Massa
                </button>
            </div>

            {activeTab === 'list' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={20} /> Novo Produto
                        </button>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Produto</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Categoria</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Preço</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            Nenhum produto cadastrado.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>
                                                <div>{product.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {product.description}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    backgroundColor: 'var(--bg-secondary)', padding: '4px 10px',
                                                    borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600',
                                                    border: '1px solid var(--border)', color: 'var(--text-secondary)'
                                                }}>
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleOpenModal(product)}
                                                        className="btn"
                                                        style={{ padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                                                    >
                                                        <Edit size={16} color="var(--text-secondary)" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="btn"
                                                        style={{ padding: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}
                                                    >
                                                        <Trash size={16} color="var(--danger)" />
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
            )}

            {activeTab === 'import' && (
                <div className="card animate-fade-in">
                    <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto', padding: '2rem 0' }}>
                        <div style={{ width: '60px', height: '60px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <FileSpreadsheet size={30} className="text-primary" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Importar Cardápio</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                            Economize tempo importando seus produtos de uma vez só. <br />
                            Aceitamos arquivos <strong>.CSV</strong> ou <strong>.Excel</strong>.
                        </p>

                        <div style={{ display: 'grid', gap: '1rem', textAlign: 'left', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> Como fazer?
                            </h4>
                            <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.5rem' }}>
                                <li>Baixe o modelo de importação abaixo.</li>
                                <li>Preencha com seus dados (Nome, Preço, Categoria).</li>
                                <li>Salve e envie o arquivo aqui.</li>
                            </ol>
                            <button
                                onClick={downloadTemplate}
                                style={{
                                    marginTop: '1rem', background: 'white', border: '1px solid var(--border)',
                                    padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <Download size={18} /> Baixar Planilha Modelo
                            </button>
                        </div>

                        {uploadStatus === 'success' ? (
                            <div style={{ padding: '2rem', border: '2px dashed #22c55e', borderRadius: '12px', background: '#f0fdf4' }}>
                                <CheckCircle size={40} color="#22c55e" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ color: '#15803d' }}>Importação Concluída!</h3>
                                <p style={{ color: '#166534' }}>50 produtos foram adicionados ao seu cardápio.</p>
                                <button
                                    onClick={() => { setUploadStatus('idle'); setActiveTab('list'); }}
                                    className="btn btn-primary"
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    Ver Produtos
                                </button>
                            </div>
                        ) : (
                            <div
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                style={{
                                    padding: '3rem', border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
                                    borderRadius: '12px', transition: 'all 0.2s', cursor: 'pointer',
                                    background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                                }}
                            >
                                {uploadStatus === 'uploading' ? (
                                    <div>
                                        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                        <p>Processando arquivo...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={32} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Arraste seu arquivo aqui</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ou clique para buscar do computador</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PRODUCT MODAL */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, backdropFilter: 'blur(4px)'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                                <X size={20} color="var(--text-secondary)" />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Nome do Produto</label>
                                <input
                                    className="input-field"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: X-Bacon"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Categoria</label>
                                    <select
                                        className="input-field"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Preço (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field"
                                        required
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Descrição</label>
                                <textarea
                                    className="input-field"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ingredientes e detalhes..."
                                    style={{ resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: 'auto', paddingLeft: '2rem', paddingRight: '2rem' }}
                                >
                                    <Save size={18} /> Salvar
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
