import { useState } from 'react';
import { Users, Phone, Star, Zap, Clock } from 'lucide-react';

// Reusing the same mock structure for consistency across apps
const staffMembers = [
    { id: 1, name: "João Pedro", role: "Garçom Líder", shift: "18:00 - 02:00", phone: "(11) 99999-1111", active: true, status: "online" },
    { id: 2, name: "Maria Silva", role: "Atendente", shift: "18:00 - 23:00", phone: "(11) 99999-2222", active: true, status: "online" },
    { id: 3, name: "Carlos Souza", role: "Barman", shift: "19:00 - 03:00", phone: "(11) 99999-3333", active: true, status: "offline" },
];

const freelancers = [
    { id: 101, name: "Jorge da Silva", role: "Garçom", rating: 4.9, jobs: 12, phone: "5511999998888", skills: ["Bandeja", "Vinhos"] },
    { id: 102, name: "Ana Clara", role: "Bartender", rating: 5.0, jobs: 8, phone: "5511999997777", skills: ["Mixologia", "Agilidade"] },
    { id: 103, name: "Roberto Junior", role: "Cumim", rating: 4.5, jobs: 3, phone: "5511999996666", skills: ["Limpeza", "Organização"] },
];

const Team = () => {
    const handleWhatsApp = (phone, name) => {
        const msg = `SOS Bar do Zé: ${name}, precisamos de você agora!`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div>
            <div className="header">
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Equipe Operacional</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Visão da equipe presente e reforços.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left Column: Who is here */}
                <div>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} /> Plantão Atual
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {staffMembers.map(member => (
                            <div key={member.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: member.status === 'online' ? '4px solid var(--success)' : '4px solid #334155' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {member.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold' }}>{member.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.role}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px',
                                        backgroundColor: member.status === 'online' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                        color: member.status === 'online' ? 'var(--success)' : '#94a3b8'
                                    }}>
                                        {member.status === 'online' ? 'ATIVE' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: SOS Freelancers */}
                <div>
                    <div className="card" style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
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
        </div>
    );
};

export default Team;
