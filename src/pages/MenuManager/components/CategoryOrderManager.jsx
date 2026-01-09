import React, { useState } from 'react';
import { List, Edit, ArrowLeft, ArrowRight, Eye, EyeOff, Save, Loader2 } from 'lucide-react';

const CategoryOrderManager = ({
    categoryOrder,
    hiddenCategories,
    loadingOrder,
    savingOrder,
    onMoveCategory,
    onToggleHide,
    onSaveOrder,
    onRenameCategory
}) => {
    // Local Inline Editing State
    const [editingCategory, setEditingCategory] = useState(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = (cat) => {
        setEditingCategory(cat);
        setEditValue(cat);
    };

    const cancelEditing = () => {
        setEditingCategory(null);
        setEditValue('');
    };

    const handleRenameSubmit = async (oldName) => {
        const newName = editValue.trim();
        if (!newName || newName === oldName) {
            cancelEditing();
            return;
        }
        // Call parent handler
        try {
            await onRenameCategory(oldName, newName);
            setEditingCategory(null);
        } catch (error) {
            // Error handling usually done in parent (alert), keep state if failed?
            // If parent throws, we stay in edit mode or not? 
            // Let's assume onRename handles alerts and throws if failure.
            console.error("Rename failed", error);
        }
    };

    return (
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
                    {/* VISIBLE CATEGORIES */}
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
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '50px',
                                    padding: '0.5rem 1rem',
                                }}>
                                    {/* Edit Name / Input */}
                                    {editingCategory === cat ? (
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleRenameSubmit(cat)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRenameSubmit(cat);
                                                if (e.key === 'Escape') cancelEditing();
                                            }}
                                            autoFocus
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                width: `${Math.max(editValue.length, 5)}ch`,
                                                padding: '0 0.5rem',
                                                textAlign: 'center'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            onClick={() => startEditing(cat)}
                                            style={{
                                                fontWeight: 500, color: 'var(--text-secondary)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                                userSelect: 'none',
                                                padding: '0 0.5rem'
                                            }}
                                            title="Clique para renomear"
                                        >
                                            {cat}
                                            <Edit size={12} style={{ opacity: 0.3 }} />
                                        </div>
                                    )}

                                    {/* Controls Container */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingLeft: '0.75rem' }}>
                                        {/* Move Left */}
                                        <button
                                            onClick={() => onMoveCategory(index, 'left')}
                                            disabled={index === 0}
                                            style={{
                                                padding: '4px', borderRadius: '50%',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: index === 0 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                                                opacity: index === 0 ? 0.3 : 1
                                            }}
                                            title="Mover para esquerda"
                                        >
                                            <ArrowLeft size={16} />
                                        </button>

                                        {/* Hide */}
                                        <button
                                            onClick={() => onToggleHide(cat)}
                                            style={{
                                                padding: '4px', borderRadius: '50%',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--text-secondary)'
                                            }}
                                            title="Ocultar"
                                        >
                                            <EyeOff size={16} />
                                        </button>

                                        {/* Move Right */}
                                        <button
                                            onClick={() => onMoveCategory(index, 'right')}
                                            disabled={index === categoryOrder.length - 1}
                                            style={{
                                                padding: '4px', borderRadius: '50%',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: index === categoryOrder.length - 1 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
                                                opacity: index === categoryOrder.length - 1 ? 0.3 : 1
                                            }}
                                            title="Mover para direita"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
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
                                        onClick={() => onToggleHide(cat)}
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
                        onClick={onSaveOrder}
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
    );
};

export default CategoryOrderManager;
