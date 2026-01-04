import { useState } from 'react';
import { Users, Phone, Star, Zap, UserPlus, X, Briefcase, Clock, UserMinus } from 'lucide-react';

const initialStaff = [
    { id: 1, name: "João Pedro", role: "Garçom Líder", shift: "18:00 - 02:00", phone: "(11) 99999-1111", active: true, status: "online" },
    { id: 2, name: "Maria Silva", role: "Atendente", shift: "18:00 - 23:00", phone: "(11) 99999-2222", active: true, status: "offline" },
    { id: 3, name: "Carlos Souza", role: "Barman", shift: "19:00 - 03:00", phone: "(11) 99999-3333", active: true, status: "late" },
    { id: 4, name: "Fernanda Lima", role: "Hostess", shift: "18:00 - 00:00", phone: "(11) 99999-4444", active: true, status: "absent" },
    { id: 5, name: "Roberto Justus", role: "Cozinheiro", shift: "08:00 - 16:00", phone: "(11) 99999-5555", active: true, status: "overtime" },
];

const freelancers = [
    { id: 101, name: "Jorge da Silva", role: "Garçom", rating: 4.9, jobs: 12, phone: "5511999998888", skills: ["Bandeja", "Vinhos"] },
    { id: 102, name: "Ana Clara", role: "Bartender", rating: 5.0, jobs: 8, phone: "5511999997777", skills: ["Mixologia", "Agilidade"] },
    { id: 103, name: "Roberto Junior", role: "Cumim", rating: 4.5, jobs: 3, phone: "5511999996666", skills: ["Limpeza", "Organização"] },
];

const roles = ["Garçom", "Cozinheiro", "Barman", "Hostess", "Limpeza", "Gerente"];

const Team = () => {
    const [employees, setEmployees] = useState(initialStaff);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({ name: '', role: 'Garçom', shift: '', phone: '' });

    const handleWhatsApp = (phone, name) => {
        const msg = `SOS Bar do Zé: ${name}, precisamos de você agora!`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleAddEmployee = () => {
        if (!newEmployee.name || !newEmployee.shift) return;

        const newId = employees.length + 10;
        const employeeToAdd = {
            id: newId,
            ...newEmployee,
            active: true,
            status: 'offline' // Default status for new hire
        };

        setEmployees([...employees, employeeToAdd]);
        setIsAddModalOpen(false);
        setNewEmployee({ name: '', role: 'Garçom', shift: '', phone: '' });
        alert("Funcionário adicionado com sucesso!");
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'online': return { label: 'ATIVO', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', border: 'var(--success)' };
            case 'overtime': return { label: 'HORA EXTRA', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7' };
            case 'offline': return { label: 'OFFLINE', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: '#334155' };
            case 'late': return { label: 'ATRASADO', color: 'var(--warning)', bg: 'rgba(234, 179, 8, 0.1)', border: 'var(--warning)' };
            case 'absent': return { label: 'FALTOU', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'var(--danger)' };
            default: return { label: status, color: '#94a3b8', bg: '#f1f5f9', border: '#e2e8f0' };
        }
    };

    const activeStaff = employees.filter(e => e.status !== 'offline');
    const offlineStaff = employees.filter(e => e.status === 'offline');

    return (
        <div>
            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Equipe Operacional</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gestão de plantão e reforços.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                    <UserPlus size={18} style={{ marginRight: '8px' }} />
                    Novo Colaborador
                </button>
            </div>

            <div className="dashboard-main-grid">
                {/* Left Column: Staff Lists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Active Staff */}
                    <div>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div>
                            Em Plantão / Aguardados
                        </h3>
                        {activeStaff.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Ninguém no plantão agora.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {activeStaff.map(member => {
                                    const config = getStatusConfig(member.status);
                                    return (
                                        <div key={member.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `4px solid ${config.border}` }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {member.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.role} • {member.shift}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{
                                                    fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold',
                                                    backgroundColor: config.bg,
                                                    color: config.color
                                                }}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Offline Staff */}
                    <div>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748b' }}></div>
                            Fora de Serviço / Folga
                        </h3>
                        {offlineStaff.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Ninguém de folga.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {offlineStaff.map(member => {
                                    const config = getStatusConfig(member.status);
                                    return (
                                        <div key={member.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `4px solid ${config.border}`, opacity: 0.7 }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', opacity: 0.5 }}>
                                                {member.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', color: '#94a3b8' }}>{member.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.role}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{
                                                    fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold',
                                                    backgroundColor: config.bg,
                                                    color: config.color
                                                }}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: SOS Freelancers */}
                <div>
                    <div className="card" style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', position: 'sticky', top: '2rem' }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={20} /> SOS - Reforço Rápido
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Precisa de gente agora? Chame um parceiro verificado.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {freelancers.map(freela => (
                                <div key={freela.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{freela.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <Star size={12} style={{ display: 'inline', color: '#eab308' }} /> {freela.rating} • {freela.role}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleWhatsApp(freela.phone, freela.name)}
                                        className="btn"
                                        style={{ backgroundColor: '#25D366', color: 'white', padding: '0.5rem', height: 'auto' }}
                                    >
                                        <Phone size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD EMPLOYEE MODAL */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserPlus size={20} /> Cadastrar Colaborador
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome Completo</label>
                                <input
                                    type="text"
                                    className="input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-tertiary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    placeholder="Ex: Ana Silva"
                                    value={newEmployee.name}
                                    onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cargo / Função</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-tertiary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    value={newEmployee.role}
                                    onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                >
                                    {roles.map(role => <option key={role} value={role}>{role}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Turno (Entrada - Saída)</label>
                                <input
                                    type="text"
                                    className="input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-tertiary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    placeholder="Ex: 18:00 - 02:00"
                                    value={newEmployee.shift}
                                    onChange={e => setNewEmployee({ ...newEmployee, shift: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Telefone / WhatsApp</label>
                                <input
                                    type="text"
                                    className="input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-tertiary)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                    placeholder="(00) 00000-0000"
                                    value={newEmployee.phone}
                                    onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                                />
                            </div>

                            <button onClick={handleAddEmployee} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                                <Briefcase size={18} style={{ marginRight: '8px' }} />
                                Contratar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Team;
