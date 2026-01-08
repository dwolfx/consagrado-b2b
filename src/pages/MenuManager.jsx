import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit, Trash, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Save, ArrowLeft, ArrowRight, List, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/api'; // Add supabase import

const MenuManager = () => {
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('list');
    const [categoryOrder, setCategoryOrder] = useState([]);
    const [hiddenCategories, setHiddenCategories] = useState([]);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);

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

    useEffect(() => {
        if (activeTab === 'order') {
            loadCategoryOrder();
        }
    }, [activeTab]);

    const loadCategoryOrder = async () => {
        setLoadingOrder(true);
        try {
            // Get current order from settings
            const { data: estab } = await supabase
                .from('establishments')
                .select('settings')
                .eq('id', 1)
                .single();

            const savedOrder = (estab?.settings && estab.settings.category_order) || [];
            const savedHidden = (estab?.settings && estab.settings.hidden_categories) || [];

            // Get all unique categories from products
            // Ensure we have products loaded
            let currentProducts = products;
            if (currentProducts.length === 0) {
                const p = await api.getProducts();
                currentProducts = p;
                setProducts(p);
            }

            const uniqueCats = [...new Set(currentProducts.map(p => p.category))].filter(Boolean);

            // Split into Visible and Hidden based on settings
            const visibleCatsFromSettings = uniqueCats.filter(cat => !savedHidden.includes(cat));
            const hiddenCatsFromSettings = uniqueCats.filter(cat => savedHidden.includes(cat));

            // Construct Order Logic for Visible
            const combinedOrder = [];
            // 1. Add saved order items IF they are still visible and exist
            savedOrder.forEach(cat => {
                if (visibleCatsFromSettings.includes(cat)) {
                    combinedOrder.push(cat);
                }
            });
            // 2. Append new visible categories that weren't in saved order
            visibleCatsFromSettings.forEach(cat => {
                if (!combinedOrder.includes(cat)) {
                    combinedOrder.push(cat);
                }
            });

            setCategoryOrder(combinedOrder);
            setHiddenCategories(hiddenCatsFromSettings);
        } catch (error) {
            console.error("Error loading order", error);
        } finally {
            setLoadingOrder(false);
        }
    };

    const toggleHideCategory = (cat) => {
        if (hiddenCategories.includes(cat)) {
            // Unhide: Remove from hidden, add to end of visible
            setHiddenCategories(hiddenCategories.filter(c => c !== cat));
            setCategoryOrder([...categoryOrder, cat]);
        } else {
            // Hide: Remove from visible, add to hidden
            setCategoryOrder(categoryOrder.filter(c => c !== cat));
            setHiddenCategories([...hiddenCategories, cat]);
        }
    };

    const moveCategory = (index, direction) => {
        const newOrder = [...categoryOrder];
        if (direction === 'left' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'right' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setCategoryOrder(newOrder);
    };

    const handleRenameCategory = async (oldName) => {
        const newName = prompt(`Renomear categoria "${oldName}" para:`, oldName);
        if (!newName || newName === oldName) return;

        if (categoryOrder.includes(newName)) {
            alert('Já existe uma categoria com este nome.');
            return;
        }

        try {
            setLoadingOrder(true);
            // 1. Update in Database (Products)
            const { error } = await supabase
                .from('products')
                .update({ category: newName })
                .eq('category', oldName);

            if (error) throw error;

            // 2. Update Local State (Order)
            const newOrder = categoryOrder.map(c => c === oldName ? newName : c);
            setCategoryOrder(newOrder);

            // 3. Update Local State (Products)
            setProducts(products.map(p => p.category === oldName ? { ...p, category: newName } : p));

            // 4. Save the new order immediately to Settings to persist the name change in the list
            // We need to do this because the "Save Order" button only saves current state, 
            // but renaming is a structural change we want to persist.
            // Actually, let's just let the user click "Save Order" for the order re-sync, 
            // but since we renamed in DB, we should probably update the settings list too 
            // otherwise a refresh would show the old name (which has no products) and hide the new one?
            // Yes, let's update settings.
            const { data: estab } = await supabase
                .from('establishments')
                .select('settings')
                .eq('id', 1)
                .single();
            const currentSettings = estab?.settings || {};

            await supabase
                .from('establishments')
                .update({
                    settings: {
                        ...currentSettings,
                        category_order: newOrder
                    }
                })
                .eq('id', 1);

            alert('Categoria renomeada com sucesso!');

        } catch (error) {
            console.error(error);
            alert('Erro ao renomear categoria.');
        } finally {
            setLoadingOrder(false);
        }
    };

    const saveCategoryOrder = async () => {
        setSavingOrder(true);
        try {
            // Fetch current settings first to preserve other keys
            const { data: estab } = await supabase
                .from('establishments')
                .select('settings')
                .eq('id', 1)
                .single();

            const currentSettings = estab?.settings || {};

            const { error } = await supabase
                .from('establishments')
                .update({
                    settings: {
                        ...currentSettings,
                        category_order: categoryOrder,
                        hidden_categories: hiddenCategories
                    }
                })
                .eq('id', 1);

            if (error) throw error;
            alert('Ordem salva com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar ordem.');
        } finally {
            setSavingOrder(false);
        }
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
                <button
                    onClick={() => setActiveTab('order')}
                    style={{
                        padding: '1rem', background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'order' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: activeTab === 'order' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s'
                    }}
                >
                    <List size={18} /> Reordenar Abas
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

                {activeTab === 'order' && (
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <List size={22} className="text-primary" /> Ordenação do Menu
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Ajuste a ordem das abas conforme elas aparecem no aplicativo do cliente.
                            Use as setas para mover para esquerda ou direita.
                        </p>

                        {loadingOrder ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
                        ) : (
                            <div>
                                <div style={{
                                    display: 'flex', flexWrap: 'wrap', gap: '1rem',
                                    padding: '2rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    marginBottom: '2rem'
                                }}>
                                    {categoryOrder.length === 0 ? (
                                        <p style={{ color: 'var(--text-tertiary)' }}>Nenhuma categoria encontrada.</p>
                                    ) : (
                                        categoryOrder.map((cat, index) => (
                                            <div key={cat} style={{
                                                display: 'flex', alignItems: 'center',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '50px',
                                                padding: '0.25rem 0.5rem',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                transition: 'all 0.2s'
                                            }}>
                                                <button
                                                    onClick={() => moveCategory(index, 'left')}
                                                    disabled={index === 0}
                                                    className="btn-ghost"
                                                    style={{
                                                        padding: '6px', borderRadius: '50%',
                                                        color: index === 0 ? 'var(--text-tertiary)' : 'var(--primary)',
                                                        cursor: index === 0 ? 'default' : 'pointer'
                                                    }}
                                                    title="Mover para esquerda"
                                                >
                                                    <ArrowLeft size={16} />
                                                </button>

                                                <div
                                                    onClick={() => handleRenameCategory(cat)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        fontWeight: 600,
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                        userSelect: 'none'
                                                    }}
                                                    title="Clique para renomear"
                                                >
                                                    {cat}
                                                    <Edit size={12} style={{ opacity: 0.5 }} />
                                                </div>

                                                <button
                                                    onClick={() => moveCategory(index, 'right')}
                                                    disabled={index === categoryOrder.length - 1}
                                                    className="btn-ghost"
                                                    style={{
                                                        padding: '6px', borderRadius: '50%',
                                                        color: index === categoryOrder.length - 1 ? 'var(--text-tertiary)' : 'var(--primary)',
                                                        cursor: index === categoryOrder.length - 1 ? 'default' : 'pointer'
                                                    }}
                                                    title="Mover para direita"
                                                >
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* HIDDEN CATEGORIES SECTION */}
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <EyeOff size={18} /> Categorias Ocultas / Sazonais
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                                    Estas categorias não aparecerão no cardápio do cliente.
                                </p>

                                <div style={{
                                    display: 'flex', flexWrap: 'wrap', gap: '1rem',
                                    padding: '2rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '12px',
                                    marginBottom: '2rem',
                                    border: '1px dashed var(--glass-border)'
                                }}>
                                    {hiddenCategories.length === 0 ? (
                                        <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Nenhuma categoria oculta.</p>
                                    ) : (
                                        hiddenCategories.map((cat) => (
                                            <div key={cat} style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                background: 'var(--bg-tertiary)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '50px',
                                                padding: '0.5rem 1rem',
                                                opacity: 0.7
                                            }}>
                                                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{cat}</span>
                                                <button
                                                    onClick={() => toggleHideCategory(cat)}
                                                    style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}
                                                    title="Tornar Visível"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <hr style={{ borderColor: 'var(--glass-border)', margin: '2rem 0' }} />

                                <button
                                    onClick={saveCategoryOrder}
                                    className="btn btn-primary"
                                    disabled={savingOrder}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 2rem' }}
                                >
                                    {savingOrder ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {savingOrder ? 'Salvando...' : 'Salvar Ordem'}
                                </button>
                            </div>
                        )}
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
