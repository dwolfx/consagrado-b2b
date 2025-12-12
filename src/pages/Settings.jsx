import { useState, useEffect } from 'react';
import { api, supabase } from '../services/api'; // Ensure supabase is exported or use api method
import { Save, Store, Palette, Loader2 } from 'lucide-react';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [estab, setEstab] = useState({ name: '', theme_color: '#6366f1' });

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
                    theme_color: estab.theme_color
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
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                <Store /> Configurações do Estabelecimento
            </h1>

            <div className="card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nome do Local</label>
                        <div className="input-group">
                            <Store size={20} color="#94a3b8" />
                            <input
                                type="text"
                                value={estab.name}
                                onChange={e => setEstab({ ...estab, name: e.target.value })}
                                required
                                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cor da Marca (Tema)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="input-group" style={{ flex: 1 }}>
                                <Palette size={20} color={estab.theme_color} />
                                <input
                                    type="text"
                                    value={estab.theme_color}
                                    onChange={e => setEstab({ ...estab, theme_color: e.target.value })}
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                    placeholder="#000000"
                                    required
                                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }}
                                />
                            </div>
                            <input
                                type="color"
                                value={estab.theme_color}
                                onChange={e => setEstab({ ...estab, theme_color: e.target.value })}
                                style={{ width: '50px', height: '50px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Essa cor será usada no App do Cliente e nos botões principais.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                        style={{ marginTop: '1rem', justifyContent: 'center' }}
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>

                </form>
            </div>

            {/* Quick CSS for this page */}
            <style>{`
                .input-group {
                    display: flex; alignItems: center; gap: 0.75rem;
                    background: var(--bg-secondary); padding: 0.75rem 1rem;
                    border: 1px solid var(--border-color); border-radius: 8px;
                }
                .input-group:focus-within {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
                }
            `}</style>
        </div>
    );
};

export default Settings;
