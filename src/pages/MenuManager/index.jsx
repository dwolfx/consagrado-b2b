import React, { useState, useEffect } from 'react';
import { api, supabase } from '../../services/api';
import { Plus, List, FileSpreadsheet } from 'lucide-react';

import ProductList from './components/ProductList';
import ProductFormModal from './components/ProductFormModal';
import CategoryOrderManager from './components/CategoryOrderManager';
import MenuImporter from './components/MenuImporter';

const MenuManager = () => {
    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('list');

    // Order State
    const [categoryOrder, setCategoryOrder] = useState([]);
    const [hiddenCategories, setHiddenCategories] = useState([]);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // --- EFFECTS ---
    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        if (activeTab === 'order') {
            loadCategoryOrder();
        }
    }, [activeTab]);

    // --- LOAD DATA ---
    const loadProducts = async () => {
        const data = await api.getProducts();
        setProducts(data);
        return data;
    };

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
            let currentProducts = products;
            if (currentProducts.length === 0) {
                currentProducts = await loadProducts();
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

    // --- AGGREGATE HANDLERS ---

    // Products CRUD
    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleProductSave = async (formData) => {
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
            alert('Erro ao salvar produto.');
        }
    };

    const handleDeleteProduct = async (id) => {
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

    // Category Order & Visibility
    const toggleHideCategory = (cat) => {
        if (hiddenCategories.includes(cat)) {
            // Unhide
            setHiddenCategories(hiddenCategories.filter(c => c !== cat));
            setCategoryOrder([...categoryOrder, cat]);
        } else {
            // Hide
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

    const saveCategoryOrder = async () => {
        setSavingOrder(true);
        try {
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

    const handleRenameCategory = async (oldName, newName) => {
        // Validation moved here or in component - component does basic check, we do deep check
        if (categoryOrder.includes(newName) || hiddenCategories.includes(newName)) {
            alert('Já existe uma categoria com este nome.');
            throw new Error('Duplicate name');
        }

        try {
            setLoadingOrder(true);

            // 1. Update DB (Products)
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

            // 4. Update Settings
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
            throw error;
        } finally {
            setLoadingOrder(false);
        }
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

            {/* Tabs Navigation */}
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

            {/* Tab Content */}
            <div className="animate-fade-in">
                {activeTab === 'list' && (
                    <ProductList
                        products={products}
                        onEdit={handleOpenModal}
                        onDelete={handleDeleteProduct}
                    />
                )}

                {activeTab === 'import' && (
                    <MenuImporter
                        onDownloadTemplate={() => {
                            const csvContent = "data:text/csv;charset=utf-8,Nome,Categoria,Preço,Descrição\nEx: Hamburguer,Lanches,25.00,Pão e carne";
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "modelo_importacao_cardapio.csv");
                            document.body.appendChild(link);
                            link.click();
                        }}
                    />
                )}

                {activeTab === 'order' && (
                    <CategoryOrderManager
                        categoryOrder={categoryOrder}
                        hiddenCategories={hiddenCategories}
                        loadingOrder={loadingOrder}
                        savingOrder={savingOrder}
                        onMoveCategory={moveCategory}
                        onToggleHide={toggleHideCategory}
                        onSaveOrder={saveCategoryOrder}
                        onRenameCategory={handleRenameCategory}
                    />
                )}
            </div>

            {/* Product Modal */}
            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSubmit={handleProductSave}
            />
        </div>
    );
};

export default MenuManager;
