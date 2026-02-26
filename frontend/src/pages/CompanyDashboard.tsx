// ============================================================
// CompanyDashboard — Painel da empresa
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import type { Job, Rental, JobApplication } from '../types';

const formatLabel = (val: string) => {
    const map: Record<string, string> = {
        PRESENCIAL: 'Presencial', HIBRIDO: 'Híbrido', REMOTO: 'Remoto',
        CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio', TEMPORARIO: 'Temporário', FREELANCER: 'Freelancer',
        ATIVA: 'Ativa', INATIVA: 'Inativa', PENDENTE_APROVACAO: 'Pendente', REPROVADA: 'Reprovada', OCULTA: 'Oculta',
        ATIVO: 'Ativo', INATIVO: 'Inativo', REPROVADO: 'Reprovado', OCULTO: 'Oculto',
        CASA: 'Casa', APARTAMENTO: 'Apartamento', SALA_COMERCIAL: 'Sala Comercial',
        KITNET: 'Kitnet', TERRENO: 'Terreno', CHACARA: 'Chácara', OUTRO: 'Outro',
        ENVIADO: 'Enviado', EM_ANALISE: 'Em Análise', APROVADO: 'Aprovado',
    };
    return map[val] || val;
};

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        ATIVA: 'badge-green', ATIVO: 'badge-green', INATIVA: 'badge-gray', INATIVO: 'badge-gray',
        PENDENTE_APROVACAO: 'badge-yellow', REPROVADA: 'badge-red', REPROVADO: 'badge-red',
        OCULTA: 'badge-gray', OCULTO: 'badge-gray', ENVIADO: 'badge-blue',
        EM_ANALISE: 'badge-yellow', APROVADO: 'badge-green',
    };
    return map[status] || 'badge-gray';
};

export default function CompanyDashboard() {
    const { refreshUser } = useAuth();
    const [tab, setTab] = useState<'vagas' | 'candidaturas' | 'alugueis' | 'perfil'>('vagas');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [selectedJobApps, setSelectedJobApps] = useState<{ jobTitle: string; apps: JobApplication[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    // Form para nova vaga/aluguel
    const [showJobForm, setShowJobForm] = useState(false);
    const [showRentalForm, setShowRentalForm] = useState(false);
    const [jobForm, setJobForm] = useState({
        titulo: '', descricao: '', requisitos: '', beneficios: '',
        tipoContrato: 'CLT', faixaSalarial: '', modeloTrabalho: 'PRESENCIAL', cidade: '', estado: '',
    });
    const [rentalForm, setRentalForm] = useState({
        titulo: '', tipoImovel: 'CASA', valorAluguel: 0, cidade: '', estado: '', descricao: '', imagens: '',
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [jobsRes, rentalsRes] = await Promise.all([api.jobs.my(), api.rentals.my()]);
            setJobs(jobsRes.data);
            setRentals(rentalsRes.data);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.jobs.create(jobForm);
            setMsg('Vaga criada com sucesso! Aguardando aprovação. ✅');
            setShowJobForm(false);
            setJobForm({ titulo: '', descricao: '', requisitos: '', beneficios: '', tipoContrato: 'CLT', faixaSalarial: '', modeloTrabalho: 'PRESENCIAL', cidade: '', estado: '' });
            loadData();
        } catch (err: any) { setMsg(err.message); }
    };

    const handleCreateRental = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const imagens = rentalForm.imagens ? rentalForm.imagens.split('\n').map(s => s.trim()).filter(Boolean) : undefined;
            await api.rentals.create({ ...rentalForm, valorAluguel: Number(rentalForm.valorAluguel), imagens });
            setMsg('Anúncio criado! Aguardando aprovação. ✅');
            setShowRentalForm(false);
            setRentalForm({ titulo: '', tipoImovel: 'CASA', valorAluguel: 0, cidade: '', estado: '', descricao: '', imagens: '' });
            loadData();
        } catch (err: any) { setMsg(err.message); }
    };

    const handleToggleJobStatus = async (jobId: string, current: string) => {
        try {
            await api.jobs.updateStatus(jobId, current === 'ATIVA' ? 'INATIVA' : 'ATIVA');
            loadData();
        } catch (err: any) { setMsg(err.message); }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Excluir esta vaga?')) return;
        try { await api.jobs.delete(jobId); loadData(); } catch (err: any) { setMsg(err.message); }
    };

    const handleViewApps = async (jobId: string, title: string) => {
        try {
            const res = await api.applications.byJob(jobId);
            setSelectedJobApps({ jobTitle: title, apps: res.data });
            setTab('candidaturas');
        } catch (err: any) { setMsg(err.message); }
    };

    const handleUpdateAppStatus = async (appId: string, status: string) => {
        try {
            await api.applications.updateStatus(appId, status);
            if (selectedJobApps) {
                const updated = selectedJobApps.apps.map(a => a.id === appId ? { ...a, status: status as any } : a);
                setSelectedJobApps({ ...selectedJobApps, apps: updated });
            }
        } catch (err: any) { setMsg(err.message); }
    };

    const handleToggleRentalStatus = async (id: string, current: string) => {
        try { await api.rentals.updateStatus(id, current === 'ATIVO' ? 'INATIVO' : 'ATIVO'); loadData(); } catch (err: any) { setMsg(err.message); }
    };

    const handleDeleteRental = async (id: string) => {
        if (!confirm('Excluir este anúncio?')) return;
        try { await api.rentals.delete(id); loadData(); } catch (err: any) { setMsg(err.message); }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;

    return (
        <div className="page container">
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Painel da Empresa</h1>

            {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`} onClick={() => setMsg('')}>{msg}</div>}

            <div className="tabs">
                <button className={`tab ${tab === 'vagas' ? 'active' : ''}`} onClick={() => setTab('vagas')}>💼 Vagas ({jobs.length})</button>
                <button className={`tab ${tab === 'candidaturas' ? 'active' : ''}`} onClick={() => setTab('candidaturas')}>📋 Candidaturas</button>
                <button className={`tab ${tab === 'alugueis' ? 'active' : ''}`} onClick={() => setTab('alugueis')}>🏠 Aluguéis ({rentals.length})</button>
            </div>

            {/* VAGAS */}
            {tab === 'vagas' && (
                <>
                    <div style={{ marginBottom: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => setShowJobForm(!showJobForm)}>
                            {showJobForm ? 'Cancelar' : '+ Criar Nova Vaga'}
                        </button>
                    </div>

                    {showJobForm && (
                        <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '600px' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Nova Vaga</h3>
                            <form onSubmit={handleCreateJob}>
                                <div className="form-group">
                                    <label className="form-label">Título *</label>
                                    <input className="form-input" required value={jobForm.titulo} onChange={e => setJobForm({ ...jobForm, titulo: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Descrição *</label>
                                    <textarea className="form-textarea" required value={jobForm.descricao} onChange={e => setJobForm({ ...jobForm, descricao: e.target.value })} rows={4} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Requisitos</label>
                                    <textarea className="form-textarea" value={jobForm.requisitos} onChange={e => setJobForm({ ...jobForm, requisitos: e.target.value })} rows={3} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Benefícios</label>
                                    <textarea className="form-textarea" value={jobForm.beneficios} onChange={e => setJobForm({ ...jobForm, beneficios: e.target.value })} rows={3} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Tipo de Contrato</label>
                                        <select className="form-select" value={jobForm.tipoContrato} onChange={e => setJobForm({ ...jobForm, tipoContrato: e.target.value })}>
                                            <option value="CLT">CLT</option><option value="PJ">PJ</option><option value="ESTAGIO">Estágio</option>
                                            <option value="TEMPORARIO">Temporário</option><option value="FREELANCER">Freelancer</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Modelo de Trabalho</label>
                                        <select className="form-select" value={jobForm.modeloTrabalho} onChange={e => setJobForm({ ...jobForm, modeloTrabalho: e.target.value })}>
                                            <option value="PRESENCIAL">Presencial</option><option value="HIBRIDO">Híbrido</option><option value="REMOTO">Remoto</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Faixa Salarial (opcional)</label>
                                    <input className="form-input" value={jobForm.faixaSalarial} onChange={e => setJobForm({ ...jobForm, faixaSalarial: e.target.value })} placeholder="Ex: R$ 3.000 - R$ 5.000" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.75rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Cidade *</label>
                                        <input className="form-input" required value={jobForm.cidade} onChange={e => setJobForm({ ...jobForm, cidade: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">UF *</label>
                                        <input className="form-input" required value={jobForm.estado} onChange={e => setJobForm({ ...jobForm, estado: e.target.value })} maxLength={2} />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary">Criar Vaga</button>
                            </form>
                        </div>
                    )}

                    {jobs.length === 0 ? (
                        <div className="empty-state"><p>Nenhuma vaga cadastrada.</p></div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead><tr><th>Título</th><th>Local</th><th>Contrato</th><th>Status</th><th>Candidatos</th><th>Ações</th></tr></thead>
                                <tbody>
                                    {jobs.map(job => (
                                        <tr key={job.id}>
                                            <td><strong>{job.titulo}</strong></td>
                                            <td>{job.cidade} - {job.estado}</td>
                                            <td>{formatLabel(job.tipoContrato)}</td>
                                            <td><span className={`badge ${statusBadge(job.status)}`}>{formatLabel(job.status)}</span></td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm" onClick={() => handleViewApps(job.id, job.titulo)}>
                                                    {job._count?.applications || 0} candidatos
                                                </button>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    {(job.status === 'ATIVA' || job.status === 'INATIVA') && (
                                                        <button className="btn btn-ghost btn-sm" onClick={() => handleToggleJobStatus(job.id, job.status)}>
                                                            {job.status === 'ATIVA' ? 'Pausar' : 'Ativar'}
                                                        </button>
                                                    )}
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)}>Excluir</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* CANDIDATURAS */}
            {tab === 'candidaturas' && (
                selectedJobApps ? (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedJobApps(null); setTab('vagas'); }}>← Voltar</button>
                            <h3 style={{ marginTop: '0.5rem' }}>Candidaturas para: {selectedJobApps.jobTitle}</h3>
                        </div>
                        {selectedJobApps.apps.length === 0 ? (
                            <div className="empty-state"><p>Nenhuma candidatura recebida.</p></div>
                        ) : (
                            <div className="grid grid-2">
                                {selectedJobApps.apps.map(app => (
                                    <div key={app.id} className="card">
                                        <h4>{app.candidate?.user?.nome}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                                            📧 {app.candidate?.user?.email}
                                            {app.candidate?.user?.telefone && <> · 📞 {app.candidate?.user?.telefone}</>}
                                        </p>
                                        {app.candidate?.resumoProfissional && (
                                            <p style={{ fontSize: '0.85rem', margin: '0.5rem 0', lineHeight: 1.5 }}>{app.candidate.resumoProfissional.substring(0, 200)}...</p>
                                        )}
                                        {app.mensagem && <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-light)' }}>"{app.mensagem}"</p>}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                            <span className={`badge ${statusBadge(app.status)}`}>{formatLabel(app.status)}</span>
                                            <select className="form-select" value={app.status} onChange={e => handleUpdateAppStatus(app.id, e.target.value)} style={{ width: 'auto', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                                                <option value="ENVIADO">Enviado</option>
                                                <option value="EM_ANALISE">Em Análise</option>
                                                <option value="APROVADO">Aprovado</option>
                                                <option value="REPROVADO">Reprovado</option>
                                            </select>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-lighter)', marginTop: '0.5rem' }}>
                                            Candidatura em {new Date(app.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <p>Selecione uma vaga na aba "Vagas" para ver as candidaturas.</p>
                    </div>
                )
            )}

            {/* ALUGUÉIS */}
            {tab === 'alugueis' && (
                <>
                    <div style={{ marginBottom: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => setShowRentalForm(!showRentalForm)}>
                            {showRentalForm ? 'Cancelar' : '+ Criar Novo Anúncio'}
                        </button>
                    </div>

                    {showRentalForm && (
                        <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '600px' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Novo Anúncio de Aluguel</h3>
                            <form onSubmit={handleCreateRental}>
                                <div className="form-group">
                                    <label className="form-label">Título *</label>
                                    <input className="form-input" required value={rentalForm.titulo} onChange={e => setRentalForm({ ...rentalForm, titulo: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Tipo de Imóvel</label>
                                        <select className="form-select" value={rentalForm.tipoImovel} onChange={e => setRentalForm({ ...rentalForm, tipoImovel: e.target.value })}>
                                            <option value="CASA">Casa</option><option value="APARTAMENTO">Apartamento</option>
                                            <option value="SALA_COMERCIAL">Sala Comercial</option><option value="KITNET">Kitnet</option>
                                            <option value="TERRENO">Terreno</option><option value="CHACARA">Chácara</option><option value="OUTRO">Outro</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Valor do Aluguel (R$) *</label>
                                        <input type="number" className="form-input" required value={rentalForm.valorAluguel || ''} onChange={e => setRentalForm({ ...rentalForm, valorAluguel: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.75rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Cidade *</label>
                                        <input className="form-input" required value={rentalForm.cidade} onChange={e => setRentalForm({ ...rentalForm, cidade: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">UF *</label>
                                        <input className="form-input" required value={rentalForm.estado} onChange={e => setRentalForm({ ...rentalForm, estado: e.target.value })} maxLength={2} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Descrição *</label>
                                    <textarea className="form-textarea" required value={rentalForm.descricao} onChange={e => setRentalForm({ ...rentalForm, descricao: e.target.value })} rows={4} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">URLs de Imagens (uma por linha)</label>
                                    <textarea className="form-textarea" value={rentalForm.imagens} onChange={e => setRentalForm({ ...rentalForm, imagens: e.target.value })} rows={3} placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg" />
                                </div>
                                <button type="submit" className="btn btn-primary">Criar Anúncio</button>
                            </form>
                        </div>
                    )}

                    {rentals.length === 0 ? (
                        <div className="empty-state"><p>Nenhum anúncio cadastrado.</p></div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead><tr><th>Título</th><th>Tipo</th><th>Valor</th><th>Local</th><th>Status</th><th>Ações</th></tr></thead>
                                <tbody>
                                    {rentals.map(r => (
                                        <tr key={r.id}>
                                            <td><strong>{r.titulo}</strong></td>
                                            <td>{formatLabel(r.tipoImovel)}</td>
                                            <td>R$ {r.valorAluguel.toLocaleString('pt-BR')}</td>
                                            <td>{r.cidade} - {r.estado}</td>
                                            <td><span className={`badge ${statusBadge(r.status)}`}>{formatLabel(r.status)}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                    {(r.status === 'ATIVO' || r.status === 'INATIVO') && (
                                                        <button className="btn btn-ghost btn-sm" onClick={() => handleToggleRentalStatus(r.id, r.status)}>
                                                            {r.status === 'ATIVO' ? 'Pausar' : 'Ativar'}
                                                        </button>
                                                    )}
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRental(r.id)}>Excluir</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
