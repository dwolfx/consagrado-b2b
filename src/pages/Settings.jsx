import { useState, useEffect } from 'react';
import { api, supabase } from '../services/api'; // Ensure supabase is exported or use api method
import { Save, Store, Palette, Loader2 } from 'lucide-react';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [estab, setEstab] = useState({ name: '', theme_color: '#6366f1', theme_secondary_color: '#f59e0b', theme_background_color: '#09090b', settings: {} });

    useEffect(() => {
        loadEstab();
    }, []);

    const loadEstab = async () => {
        // For this MVP, we assume ID 1 or fetch the first one associated with the user.
        // In real multi-tenant, we'd get this from the user's profile or context.
        // For this MVP/Demo, we explicitly target Establishment ID 1
        // This ensures that when the "Demo Manager" edits settings, they are editing the "Demo Establishment"
        const { data, error } = await supabase
            .from('establishments')
            .select('*')
            .eq('id', 1) // Force ID 1 for the Demo
            .single();

        if (data) {
            setEstab(data);
        }
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

    if (loading) return <div style={{ padding: '2rem' }}>Carregando...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div className="header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '700', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Configurações
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Personalize seu estabelecimento.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
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
                                width: '56px', height: '56px', borderRadius: '12px',
                                background: estab.theme_color,
                                border: '2px solid var(--glass-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <input
                                    type="color"
                                    value={estab.theme_color}
                                    onChange={e => setEstab({ ...estab, theme_color: e.target.value })}
                                    style={{ width: '150%', height: '150%', border: 'none', cursor: 'pointer', opacity: 0 }}
                                />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
                            Essa cor será usada no App do Cliente e nos botões principais.
                        </p>
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
                                width: '56px', height: '56px', borderRadius: '12px',
                                background: estab.theme_secondary_color,
                                border: '2px solid var(--glass-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <input
                                    type="color"
                                    value={estab.theme_secondary_color}
                                    onChange={e => setEstab({ ...estab, theme_secondary_color: e.target.value })}
                                    style={{ width: '150%', height: '150%', border: 'none', cursor: 'pointer', opacity: 0 }}
                                />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
                            Usada para detalhes, bordas e elementos de menor destaque.
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Cor de Fundo (Background)</label>
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
                                width: '56px', height: '56px', borderRadius: '12px',
                                background: estab.theme_background_color,
                                border: '2px solid var(--glass-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <input
                                    type="color"
                                    value={estab.theme_background_color}
                                    onChange={e => setEstab({ ...estab, theme_background_color: e.target.value })}
                                    style={{ width: '150%', height: '150%', border: 'none', cursor: 'pointer', opacity: 0 }}
                                />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
                            Define a cor de fundo do app. Um degradê sutil será gerado automaticamente.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>
                            Define a cor de fundo do app. Um degradê sutil será gerado automaticamente.
                        </p>
                    </div>



                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                padding: '1rem', fontSize: '1rem', fontWeight: '600'
                            }}
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            {saving ? 'Salvando Alterações...' : 'Salvar Alterações'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
export default Settings;
