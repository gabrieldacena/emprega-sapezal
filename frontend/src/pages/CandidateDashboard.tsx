// ============================================================
// CandidateDashboard — Painel do candidato
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import type { User, JobApplication } from '../types';

const statusLabels: Record<string, { label: string; class: string }> = {
    ENVIADO: { label: 'Enviado', class: 'badge-blue' },
    EM_ANALISE: { label: 'Em Análise', class: 'badge-yellow' },
    APROVADO: { label: 'Aprovado', class: 'badge-green' },
    REPROVADO: { label: 'Reprovado', class: 'badge-red' },
};

export default function CandidateDashboard() {
    const { user, refreshUser } = useAuth();
    const [tab, setTab] = useState<'perfil' | 'candidaturas'>('perfil');
    const [profile, setProfile] = useState<User | null>(null);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    // Form fields
    const [nome, setNome] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [telefone, setTelefone] = useState('');
    const [resumo, setResumo] = useState('');
    const [linkCurriculo, setLinkCurriculo] = useState('');
    const [linkLinkedin, setLinkLinkedin] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profileRes, appRes] = await Promise.all([
                api.users.profile(),
                api.applications.my(),
            ]);
            setProfile(profileRes.data);
            setApplications(appRes.data);

            const p = profileRes.data;
            setNome(p.nome || '');
            setCidade(p.cidade || '');
            setEstado(p.estado || '');
            setTelefone(p.telefone || '');
            setResumo(p.candidateProfile?.resumoProfissional || '');
            setLinkCurriculo(p.candidateProfile?.linkCurriculo || '');
            setLinkLinkedin(p.candidateProfile?.linkLinkedin || '');
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            await api.users.updateProfile({
                nome, cidade, estado, telefone,
                resumoProfissional: resumo,
                linkCurriculo: linkCurriculo || undefined,
                linkLinkedin: linkLinkedin || undefined,
            });
            await refreshUser();
            setMsg('Perfil atualizado com sucesso! ✅');
        } catch (err: any) {
            setMsg(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div className="page container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Meu Painel</h1>

            <div className="tabs">
                <button className={`tab ${tab === 'perfil' ? 'active' : ''}`} onClick={() => setTab('perfil')}>
                    👤 Meu Perfil
                </button>
                <button className={`tab ${tab === 'candidaturas' ? 'active' : ''}`} onClick={() => setTab('candidaturas')}>
                    📋 Candidaturas ({applications.length})
                </button>
            </div>

            {tab === 'perfil' && (
                <div className="card" style={{ maxWidth: '600px' }}>
                    {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label className="form-label">Nome completo</label>
                            <input className="form-input" value={nome} onChange={e => setNome(e.target.value)} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.75rem' }}>
                            <div className="form-group">
                                <label className="form-label">Cidade</label>
                                <input className="form-input" value={cidade} onChange={e => setCidade(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">UF</label>
                                <input className="form-input" value={estado} onChange={e => setEstado(e.target.value)} maxLength={2} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telefone</label>
                            <input className="form-input" value={telefone} onChange={e => setTelefone(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Resumo profissional</label>
                            <textarea className="form-textarea" value={resumo} onChange={e => setResumo(e.target.value)} rows={5} placeholder="Fale sobre sua experiência, habilidades, objetivos..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Link do currículo (PDF, Google Drive, etc.)</label>
                            <input className="form-input" value={linkCurriculo} onChange={e => setLinkCurriculo(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">LinkedIn</label>
                            <input className="form-input" value={linkLinkedin} onChange={e => setLinkLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                </div>
            )}

            {tab === 'candidaturas' && (
                applications.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📋</div>
                        <p>Você ainda não se candidatou a nenhuma vaga.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Vaga</th>
                                    <th>Empresa</th>
                                    <th>Local</th>
                                    <th>Status</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => (
                                    <tr key={app.id}>
                                        <td><strong>{app.job?.titulo}</strong></td>
                                        <td>{app.job?.company?.nomeEmpresa}</td>
                                        <td>{app.job?.cidade} - {app.job?.estado}</td>
                                        <td><span className={`badge ${statusLabels[app.status]?.class || 'badge-gray'}`}>{statusLabels[app.status]?.label || app.status}</span></td>
                                        <td>{new Date(app.createdAt).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}
