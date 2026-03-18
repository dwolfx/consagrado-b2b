import { useState, useEffect } from 'react';
import { supabase, api } from '../services/api';
import { Save, Store, Palette, Loader2, Plus, Trash2, Hash, Key } from 'lucide-react';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [estab, setEstab] = useState({ name: '', theme_color: '#6366f1', theme_secondary_color: '#f59e0b', theme_background_color: '#09090b', settings: {} });

    // Table Management State
    const [tables, setTables] = useState([]);
    const [newTableNum, setNewTableNum] = useState('');
    const [newTableCode, setNewTableCode] = useState('');
    const [addingTable, setAddingTable] = useState(false);

    useEffect(() => {
        loadEstab();
    }, []);

    const loadEstab = async () => {
        let userEstabId = 1;
        try {
            const user = JSON.parse(localStorage.getItem('chefia_user') || '{}');
            if (user.establishment_id) userEstabId = user.establishment_id;
        } catch (e) { console.error('Error reading session data'); }

        const { data } = await supabase
            .from('establishments')
            .select('*')
            .eq('id', userEstabId)
            .single();

        if (data) {
            setEstab(data);
        }
        
        // Fetch Tables safely
        try {
            const tbData = await api.getTables(userEstabId);
            setTables(tbData || []);
        } catch (e) { console.error('Error loading tables', e); }

        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('establishments')
                .update({
                    name: estab.name,
                    theme_color: estab.theme_color,
                    theme_secondary_color: estab.theme_secondary_color,
                    theme_background_color: estab.theme_background_color,
                    settings: {
                        ...estab.settings
                    }
                })
                .eq('id', estab.id);

            if (error) throw error;
            alert('Configurações salvas com sucesso!');
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar. Verifique suas permissões.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddTable = async () => {
        if (!newTableNum || !newTableCode) return alert('Preencha os dados da mesa.');
        setAddingTable(true);
        try {
            await api.addTable(parseInt(newTableNum), newTableCode, estab.id);
            const tbData = await api.getTables(estab.id);
            setTables(tbData || []);
            setNewTableNum('');
            setNewTableCode('');
        } catch (e) {
            console.error(e);
            alert('Erro ao criar mesa. Pode haver duplicidade no código.');
        } finally {
            setAddingTable(false);
        }
    };

    const handleDeleteTable = async (id) => {
        if(!window.confirm('Tem certeza que deseja excluir esta mesa?')) return;
        try {
            await api.deleteTable(id);
            setTables(tables.filter(t => t.id !== id));
        } catch (e) {
            alert('Erro ao deletar a mesa.');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Carregando...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div className="header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Configurações & Mesas
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Personalize as cores da sua marca e crie novas mesas para autoatendimento.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>1. Visual e Identidade do App</h2>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="input-grid">
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Nome do Local</label>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                background: 'var(--bg-primary)', padding: '0.875rem 1rem',
                                border: '1px solid var(--glass-border)', borderRadius: '12px'
                            }}>
                                <Store size={20} color="var(--primary)" />
                                <input
                                    type="text"
                                    value={estab.name}
                                    onChange={e => setEstab({ ...estab, name: e.target.value })}
                                    required
                                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: '1rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Cor da Marca (Tema)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                flex: 1, display: 'flex', alignItems: 'center', gap: '1rem',
                                background: 'var(--bg-primary)', padding: '0.875rem 1rem',
                                border: '1px solid var(--glass-border)', borderRadius: '12px'
                            }}>
                                <Palette size={20} color={estab.theme_color} />
                                <input
                                    type="text"
                                    value={estab.theme_color}
                                    onChange={e => setEstab({ ...estab, theme_color: e.target.value })}
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                    placeholder="#000000"
                                    required
                                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '12px', background: estab.theme_color,
                                border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                            }}>
                                <input type="color" value={estab.theme_color} onChange={e => setEstab({ ...estab, theme_color: e.target.value })} style={{ width: '150%', height: '150%', border: 'none', cursor: 'pointer', opacity: 0 }} />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>Essa cor será usada no App do Cliente e nos botões principais.</p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Cor Secundária (Destaque)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                flex: 1, display: 'flex', alignItems: 'center', gap: '1rem',
                                background: 'var(--bg-primary)', padding: '0.875rem 1rem',
                                border: '1px solid var(--glass-border)', borderRadius: '12px'
                            }}>
                                <Palette size={20} color={estab.theme_secondary_color} />
                                <input
                                    type="text"
                                    value={estab.theme_secondary_color}
                                    onChange={e => setEstab({ ...estab, theme_secondary_color: e.target.value })}
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                    placeholder="#000000"
                                    required
                                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '12px', background: estab.theme_secondary_color,
                                border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                            }}>
                                <input type="color" value={estab.theme_secondary_color} onChange={e => setEstab({ ...estab, theme_secondary_color: e.target.value })} style={{ width: '150%', height: '150%', border: 'none', cursor: 'pointer', opacity: 0 }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Cor de Fundo</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                flex: 1, display: 'flex', alignItems: 'center', gap: '1rem',
                                background: 'var(--bg-primary)', padding: '0.875rem 1rem',
                                border: '1px solid var(--glass-border)', borderRadius: '12px'
                            }}>
                                <Palette size={20} color={estab.theme_background_color} />
                                <input
                                    type="text"
                                    value={estab.theme_background_color}
                                    onChange={e => setEstab({ ...estab, theme_background_color: e.target.value })}
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                    placeholder="#000000"
                                    required
                                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '12px', background: estab.theme_background_color,
                                border: '2px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                            }}>
                                <input type="color" value={estab.theme_background_color} onChange={e => setEstab({ ...estab, theme_background_color: e.target.value })} style={{ width: '150%', height: '150%', border: 'none', cursor: 'pointer', opacity: 0 }} />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>Define a cor de fundo do app B2C. Um degradê é aplicado automaticamente.</p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                padding: '1rem', fontSize: '1rem', fontWeight: '600', backgroundColor: 'var(--primary)'
                            }}
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            {saving ? 'Salvando Alterações...' : 'Salvar Alterações de Tema'}
                        </button>
                    </div>
                </form>
            </div>

            {/* GERENCIAMENTO DE MESAS */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>2. Gerenciamento de Mesas</h2>
                
                <div style={{
                    display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem',
                    background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ flex: '1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Número</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <Hash size={16} color="var(--primary)" />
                            <input type="number" placeholder="Ex: 1" value={newTableNum} onChange={e => setNewTableNum(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none' }} />
                        </div>
                    </div>
                    <div style={{ flex: '2' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Código do QR (Identificador)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <Key size={16} color="var(--primary)" />
                            <input type="text" placeholder="Ex: PC0001" value={newTableCode} onChange={e => setNewTableCode(e.target.value.toUpperCase())} style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none', textTransform: 'uppercase' }} />
                        </div>
                    </div>
                    <button onClick={handleAddTable} disabled={addingTable} style={{
                        padding: '0.675rem 1.5rem', borderRadius: '8px', background: 'var(--success)', color: 'white',
                        border: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', height: '42px'
                    }}>
                        {addingTable ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        Criar
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {tables.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Nenhuma mesa cadastrada ainda.</p>
                    ) : (
                        tables.map(table => (
                            <div key={table.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)'
                            }}>
                                <div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Mesa {table.number}</span>
                                    <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>CODE: {table.code}</span>
                                </div>
                                <button onClick={() => handleDeleteTable(table.id)} style={{
                                    background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'none',
                                    padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};
export default Settings;
