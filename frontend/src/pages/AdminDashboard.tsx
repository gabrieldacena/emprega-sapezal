// ============================================================
// AdminDashboard — Painel administrativo com controle total
// Layout sidebar + seções: Dashboard, Usuários, Vagas, Aluguéis, Candidaturas, Mensagens
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { DashboardStats, RecentActivity, User, Job, Rental, JobApplication, ContactMessage, Advertisement, NewsArticle } from '../types';

type AdminTab = 'dashboard' | 'users' | 'jobs' | 'rentals' | 'applications' | 'messages' | 'ads' | 'news' | 'settings';

const formatLabel = (val: string) => {
    const map: Record<string, string> = {
        CANDIDATO: 'Candidato', EMPRESA: 'Empresa', ADMIN: 'Admin',
        ATIVA: 'Ativa', INATIVA: 'Inativa', PENDENTE_APROVACAO: 'Pendente', REPROVADA: 'Reprovada', OCULTA: 'Oculta',
        ATIVO: 'Ativo', INATIVO: 'Inativo', REPROVADO: 'Reprovado', OCULTO: 'Oculto',
        CASA: 'Casa', APARTAMENTO: 'Apartamento', SALA_COMERCIAL: 'Sala Comercial',
        KITNET: 'Kitnet', TERRENO: 'Terreno', CHACARA: 'Chácara', OUTRO: 'Outro',
        CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio', TEMPORARIO: 'Temporário', FREELANCER: 'Freelancer',
        ENVIADO: 'Enviado', EM_ANALISE: 'Em Análise', APROVADO: 'Aprovado', REPROVADO_APP: 'Reprovado',
    };
    return map[val] || val;
};

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        ATIVA: 'badge-green', ATIVO: 'badge-green', APROVADO: 'badge-green',
        INATIVA: 'badge-gray', INATIVO: 'badge-gray',
        PENDENTE_APROVACAO: 'badge-yellow', EM_ANALISE: 'badge-yellow', ENVIADO: 'badge-blue',
        REPROVADA: 'badge-red', REPROVADO: 'badge-red',
        OCULTA: 'badge-gray', OCULTO: 'badge-gray',
        CANDIDATO: 'badge-blue', EMPRESA: 'badge-purple', ADMIN: 'badge-green',
    };
    return map[status] || 'badge-gray';
};

const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d atrás`;
    return new Date(date).toLocaleDateString('pt-BR');
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

const sidebarItems: { key: AdminTab; icon: string; label: string }[] = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'users', icon: '👥', label: 'Usuários' },
    { key: 'jobs', icon: '💼', label: 'Vagas' },
    { key: 'rentals', icon: '🏠', label: 'Aluguéis' },
    { key: 'applications', icon: '📋', label: 'Candidaturas' },
    { key: 'messages', icon: '💬', label: 'Mensagens' },
    { key: 'ads', icon: '📢', label: 'Anúncios' },
    { key: 'news', icon: '📰', label: 'Notícias' },
    { key: 'settings', icon: '⚙️', label: 'Configurações' },
];

export default function AdminDashboard() {
    const [tab, setTab] = useState<AdminTab>('dashboard');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activity, setActivity] = useState<RecentActivity | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [adsList, setAdsList] = useState<Advertisement[]>([]);
    const [newsList, setNewsList] = useState<NewsArticle[]>([]);
    const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    // Filters
    const [userSearch, setUserSearch] = useState('');
    const [userType, setUserType] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [jobStatus, setJobStatus] = useState('');
    const [rentalSearch, setRentalSearch] = useState('');
    const [rentalStatus, setRentalStatus] = useState('');
    const [appStatus, setAppStatus] = useState('');

    // Ad form
    const [adTitulo, setAdTitulo] = useState('');
    const [adImagem, setAdImagem] = useState('');
    const [adLink, setAdLink] = useState('');
    const [adPosicao, setAdPosicao] = useState('ENTRE_SECOES');
    const [adOrdem, setAdOrdem] = useState(0);
    const [editingAdId, setEditingAdId] = useState<string | null>(null);

    // News form
    const [nwTitulo, setNwTitulo] = useState('');
    const [nwConteudo, setNwConteudo] = useState('');
    const [nwImagem, setNwImagem] = useState('');
    const [nwDestaque, setNwDestaque] = useState(false);
    const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

    // Settings form
    const [stCorPrimaria, setStCorPrimaria] = useState('');
    const [stCorPrimariaLight, setStCorPrimariaLight] = useState('');
    const [stCorPrimariaDark, setStCorPrimariaDark] = useState('');

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const statsRes = await api.admin.dashboard();
            setStats(statsRes.data);
        } catch { } finally { setLoading(false); }
        // Activity loads separately — doesn't block dashboard
        try {
            const actRes = await api.admin.activity();
            setActivity(actRes.data);
        } catch { }
    }, []);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('limit', '50');
            if (userSearch) params.set('busca', userSearch);
            if (userType) params.set('tipo', userType);
            const res = await api.admin.users(params.toString());
            setUsers(res.data);
        } catch { } finally { setLoading(false); }
    }, [userSearch, userType]);

    const loadJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('limit', '50');
            if (jobSearch) params.set('busca', jobSearch);
            if (jobStatus) params.set('status', jobStatus);
            const res = await api.admin.jobs(params.toString());
            setJobs(res.data);
        } catch { } finally { setLoading(false); }
    }, [jobSearch, jobStatus]);

    const loadRentals = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('limit', '50');
            if (rentalSearch) params.set('busca', rentalSearch);
            if (rentalStatus) params.set('status', rentalStatus);
            const res = await api.admin.rentals(params.toString());
            setRentals(res.data);
        } catch { } finally { setLoading(false); }
    }, [rentalSearch, rentalStatus]);

    const loadApplications = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('limit', '50');
            if (appStatus) params.set('status', appStatus);
            const res = await api.admin.applications(params.toString());
            setApplications(res.data);
        } catch { } finally { setLoading(false); }
    }, [appStatus]);

    const loadMessages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.admin.messages('limit=50');
            setMessages(res.data);
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadDashboard(); }, [loadDashboard]);

    const handleTabChange = (t: AdminTab) => {
        setTab(t);
        if (t === 'dashboard') loadDashboard();
        else if (t === 'users') loadUsers();
        else if (t === 'jobs') loadJobs();
        else if (t === 'rentals') loadRentals();
        else if (t === 'applications') loadApplications();
        else if (t === 'messages') loadMessages();
        else if (t === 'ads') loadAds();
        else if (t === 'news') loadNews();
        else if (t === 'settings') loadSettings();
    };

    // ---- ACTIONS ----
    const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(''), 4000); };

    const handleToggleUser = async (id: string) => {
        try { await api.admin.toggleUser(id); loadUsers(); showMsg('Status do usuário atualizado. ✅'); } catch (err: any) { showMsg(err.message); }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Excluir este usuário permanentemente? Todos os dados associados serão perdidos.')) return;
        try { await api.admin.deleteUser(id); loadUsers(); showMsg('Usuário excluído. ✅'); } catch (err: any) { showMsg(err.message); }
    };

    const handleModerateJob = async (id: string, action: string) => {
        try {
            await api.admin.moderateJob(id, { action });
            loadJobs();
            const labels: Record<string, string> = { approve: 'aprovada', reject: 'reprovada', feature: 'destacada', unfeature: 'removida do destaque', hide: 'ocultada' };
            showMsg(`Vaga ${labels[action] || action}. ✅`);
        } catch (err: any) { showMsg(err.message); }
    };

    const handleDeleteJob = async (id: string) => {
        if (!confirm('Excluir esta vaga permanentemente?')) return;
        try { await api.admin.deleteJob(id); loadJobs(); showMsg('Vaga excluída. ✅'); } catch (err: any) { showMsg(err.message); }
    };

    const handleModerateRental = async (id: string, action: string) => {
        try {
            await api.admin.moderateRental(id, { action });
            loadRentals();
            const labels: Record<string, string> = { approve: 'aprovado', reject: 'reprovado', feature: 'destacado', unfeature: 'removido do destaque', hide: 'ocultado' };
            showMsg(`Anúncio ${labels[action] || action}. ✅`);
        } catch (err: any) { showMsg(err.message); }
    };

    const handleDeleteRental = async (id: string) => {
        if (!confirm('Excluir este anúncio permanentemente?')) return;
        try { await api.admin.deleteRental(id); loadRentals(); showMsg('Anúncio excluído. ✅'); } catch (err: any) { showMsg(err.message); }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!confirm('Excluir esta mensagem?')) return;
        try { await api.admin.deleteMessage(id); loadMessages(); showMsg('Mensagem excluída. ✅'); } catch (err: any) { showMsg(err.message); }
    };

    // ---- RENDER HELPERS ----
    const renderStatCard = (label: string, value: number, icon: string, color: string) => (
        <div className="admin-stat-card" key={label}>
            <div className="admin-stat-icon" style={{ background: color + '18', color }}>{icon}</div>
            <div className="admin-stat-info">
                <div className="admin-stat-value" style={{ color }}>{value}</div>
                <div className="admin-stat-label">{label}</div>
            </div>
        </div>
    );

    const renderFilters = (children: React.ReactNode) => (
        <div className="filters" style={{ marginBottom: '1rem' }}>
            {children}
        </div>
    );

    const renderActionBar = (children: React.ReactNode) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>{children}</div>
    );

    // ---- SECTIONS ----
    const renderDashboard = () => {
        if (!stats) return null;
        return (
            <>
                <h2 className="admin-section-title">📊 Dashboard — Visão Geral</h2>

                <div className="admin-stats-grid">
                    {renderStatCard('Total Usuários', stats.totalUsers, '👥', '#3182ce')}
                    {renderStatCard('Novos (7 dias)', stats.novosUsuarios7d, '🆕', '#805ad5')}
                    {renderStatCard('Candidatos', stats.totalCandidatos, '🧑', '#3182ce')}
                    {renderStatCard('Empresas', stats.totalEmpresas, '🏢', '#805ad5')}
                    {renderStatCard('Vagas Ativas', stats.vagasAtivas, '💼', '#38a169')}
                    {renderStatCard('Vagas Pendentes', stats.vagasPendentes, '⏳', '#dd6b20')}
                    {renderStatCard('Aluguéis Ativos', stats.alugueisAtivos, '🏠', '#38a169')}
                    {renderStatCard('Aluguéis Pendentes', stats.alugueisPendentes, '⏳', '#dd6b20')}
                    {renderStatCard('Total Candidaturas', stats.totalCandidaturas, '📋', '#3182ce')}
                    {renderStatCard('Em Análise', stats.candidaturasEmAnalise, '🔍', '#dd6b20')}
                    {renderStatCard('Mensagens', stats.totalMensagens, '💬', '#805ad5')}
                    {renderStatCard('Total Vagas', stats.totalVagas, '📊', '#718096')}
                </div>

                {/* Recent activity */}
                {activity && (
                    <div className="admin-activity-grid">
                        <div className="admin-activity-card">
                            <h3>🆕 Últimos Cadastros</h3>
                            <ul>
                                {activity.recentUsers.map(u => (
                                    <li key={u.id}>
                                        <span className="admin-activity-name">{u.nome}</span>
                                        <span className={`badge ${statusBadge(u.role)}`} style={{ fontSize: '0.65rem' }}>{formatLabel(u.role)}</span>
                                        <span className="admin-activity-time">{timeAgo(u.createdAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="admin-activity-card">
                            <h3>💼 Últimas Vagas</h3>
                            <ul>
                                {activity.recentJobs.map(j => (
                                    <li key={j.id}>
                                        <span className="admin-activity-name">{j.titulo}</span>
                                        <span className={`badge ${statusBadge(j.status)}`} style={{ fontSize: '0.65rem' }}>{formatLabel(j.status)}</span>
                                        <span className="admin-activity-time">{timeAgo(j.createdAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="admin-activity-card">
                            <h3>📋 Últimas Candidaturas</h3>
                            <ul>
                                {activity.recentApplications.map(a => (
                                    <li key={a.id}>
                                        <span className="admin-activity-name">{a.candidate?.user?.nome || '—'}</span>
                                        <span style={{ color: 'var(--text-lighter)', fontSize: '0.75rem' }}>→ {a.job?.titulo || '—'}</span>
                                        <span className="admin-activity-time">{timeAgo(a.createdAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderUsers = () => (
        <>
            <h2 className="admin-section-title">👥 Gestão de Usuários</h2>
            {renderFilters(
                <>
                    <input
                        className="form-input"
                        placeholder="🔍 Buscar por nome ou e-mail..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && loadUsers()}
                    />
                    <select className="form-select" value={userType} onChange={e => { setUserType(e.target.value); }}>
                        <option value="">Todos os tipos</option>
                        <option value="CANDIDATO">Candidato</option>
                        <option value="EMPRESA">Empresa</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={loadUsers}>Filtrar</button>
                </>
            )}
            {loading ? <div className="loading"><div className="spinner" /></div> : (
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Telefone</th><th>Cidade</th><th>Ativo</th><th>Cadastro</th><th>Ações</th></tr></thead>
                        <tbody>
                            {users.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>Nenhum usuário encontrado.</td></tr>
                                : users.map(u => (
                                    <tr key={u.id}>
                                        <td><strong>{u.nome}</strong></td>
                                        <td>{u.email}</td>
                                        <td><span className={`badge ${statusBadge(u.role)}`}>{formatLabel(u.role)}</span></td>
                                        <td>{u.telefone || '—'}</td>
                                        <td>{u.cidade || '—'}</td>
                                        <td>{u.ativo ? <span className="badge badge-green">Sim</span> : <span className="badge badge-red">Não</span>}</td>
                                        <td>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            {u.role !== 'ADMIN' && renderActionBar(
                                                <>
                                                    <button className={`btn btn-sm ${u.ativo ? 'btn-secondary' : 'btn-primary'}`} onClick={() => handleToggleUser(u.id)}>
                                                        {u.ativo ? 'Desativar' : 'Ativar'}
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>Excluir</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );

    const renderJobs = () => (
        <>
            <h2 className="admin-section-title">💼 Gestão de Vagas</h2>
            {renderFilters(
                <>
                    <input
                        className="form-input"
                        placeholder="🔍 Buscar vagas..."
                        value={jobSearch}
                        onChange={e => setJobSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && loadJobs()}
                    />
                    <select className="form-select" value={jobStatus} onChange={e => setJobStatus(e.target.value)}>
                        <option value="">Todos os status</option>
                        <option value="ATIVA">Ativa</option>
                        <option value="PENDENTE_APROVACAO">Pendente</option>
                        <option value="REPROVADA">Reprovada</option>
                        <option value="OCULTA">Oculta</option>
                        <option value="INATIVA">Inativa</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={loadJobs}>Filtrar</button>
                </>
            )}
            {loading ? <div className="loading"><div className="spinner" /></div> : (
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Título</th><th>Empresa</th><th>Local</th><th>Status</th><th>Candidaturas</th><th>Destaque</th><th>Data</th><th>Ações</th></tr></thead>
                        <tbody>
                            {jobs.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>Nenhuma vaga encontrada.</td></tr>
                                : jobs.map(job => (
                                    <tr key={job.id}>
                                        <td><strong>{job.titulo}</strong></td>
                                        <td>{job.company?.nomeEmpresa || '—'}</td>
                                        <td>{job.cidade}</td>
                                        <td><span className={`badge ${statusBadge(job.status)}`}>{formatLabel(job.status)}</span></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge badge-blue">{job._count?.applications || 0}</span>
                                        </td>
                                        <td>{job.destaque ? '⭐' : '—'}</td>
                                        <td>{new Date(job.createdAt).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            {renderActionBar(
                                                <>
                                                    {job.status === 'PENDENTE_APROVACAO' && (
                                                        <>
                                                            <button className="btn btn-primary btn-sm" onClick={() => handleModerateJob(job.id, 'approve')}>✓ Aprovar</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleModerateJob(job.id, 'reject')}>✗ Reprovar</button>
                                                        </>
                                                    )}
                                                    <button className="btn btn-ghost btn-sm" onClick={() => handleModerateJob(job.id, job.destaque ? 'unfeature' : 'feature')}>
                                                        {job.destaque ? '☆ Tirar' : '⭐ Destacar'}
                                                    </button>
                                                    {job.status !== 'OCULTA' && <button className="btn btn-ghost btn-sm" onClick={() => handleModerateJob(job.id, 'hide')}>👁 Ocultar</button>}
                                                    {job.status !== 'ATIVA' && job.status !== 'PENDENTE_APROVACAO' && <button className="btn btn-primary btn-sm" onClick={() => handleModerateJob(job.id, 'approve')}>↩ Reativar</button>}
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)}>🗑 Excluir</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );

    const renderRentals = () => (
        <>
            <h2 className="admin-section-title">🏠 Gestão de Aluguéis</h2>
            {renderFilters(
                <>
                    <input
                        className="form-input"
                        placeholder="🔍 Buscar aluguéis..."
                        value={rentalSearch}
                        onChange={e => setRentalSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && loadRentals()}
                    />
                    <select className="form-select" value={rentalStatus} onChange={e => setRentalStatus(e.target.value)}>
                        <option value="">Todos os status</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="PENDENTE_APROVACAO">Pendente</option>
                        <option value="REPROVADO">Reprovado</option>
                        <option value="OCULTO">Oculto</option>
                        <option value="INATIVO">Inativo</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={loadRentals}>Filtrar</button>
                </>
            )}
            {loading ? <div className="loading"><div className="spinner" /></div> : (
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Título</th><th>Anunciante</th><th>Tipo</th><th>Valor</th><th>Status</th><th>Destaque</th><th>Data</th><th>Ações</th></tr></thead>
                        <tbody>
                            {rentals.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>Nenhum anúncio encontrado.</td></tr>
                                : rentals.map(r => (
                                    <tr key={r.id}>
                                        <td><strong>{r.titulo}</strong></td>
                                        <td>{r.company?.nomeEmpresa || '—'}</td>
                                        <td>{formatLabel(r.tipoImovel)}</td>
                                        <td>R$ {r.valorAluguel.toLocaleString('pt-BR')}</td>
                                        <td><span className={`badge ${statusBadge(r.status)}`}>{formatLabel(r.status)}</span></td>
                                        <td>{r.destaque ? '⭐' : '—'}</td>
                                        <td>{new Date(r.createdAt).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            {renderActionBar(
                                                <>
                                                    {r.status === 'PENDENTE_APROVACAO' && (
                                                        <>
                                                            <button className="btn btn-primary btn-sm" onClick={() => handleModerateRental(r.id, 'approve')}>✓ Aprovar</button>
                                                            <button className="btn btn-danger btn-sm" onClick={() => handleModerateRental(r.id, 'reject')}>✗ Reprovar</button>
                                                        </>
                                                    )}
                                                    <button className="btn btn-ghost btn-sm" onClick={() => handleModerateRental(r.id, r.destaque ? 'unfeature' : 'feature')}>
                                                        {r.destaque ? '☆ Tirar' : '⭐ Destacar'}
                                                    </button>
                                                    {r.status !== 'OCULTO' && <button className="btn btn-ghost btn-sm" onClick={() => handleModerateRental(r.id, 'hide')}>👁 Ocultar</button>}
                                                    {r.status !== 'ATIVO' && r.status !== 'PENDENTE_APROVACAO' && <button className="btn btn-primary btn-sm" onClick={() => handleModerateRental(r.id, 'approve')}>↩ Reativar</button>}
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRental(r.id)}>🗑 Excluir</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );

    const renderApplications = () => (
        <>
            <h2 className="admin-section-title">📋 Todas as Candidaturas</h2>
            {renderFilters(
                <>
                    <select className="form-select" value={appStatus} onChange={e => { setAppStatus(e.target.value); }}>
                        <option value="">Todos os status</option>
                        <option value="ENVIADO">Enviado</option>
                        <option value="EM_ANALISE">Em Análise</option>
                        <option value="APROVADO">Aprovado</option>
                        <option value="REPROVADO">Reprovado</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={loadApplications}>Filtrar</button>
                </>
            )}
            {loading ? <div className="loading"><div className="spinner" /></div> : (
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Candidato</th><th>E-mail</th><th>Telefone</th><th>Vaga</th><th>Empresa</th><th>Status</th><th>Data</th></tr></thead>
                        <tbody>
                            {applications.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>Nenhuma candidatura encontrada.</td></tr>
                                : applications.map(a => (
                                    <tr key={a.id}>
                                        <td><strong>{a.candidate?.user?.nome || '—'}</strong></td>
                                        <td>{a.candidate?.user?.email || '—'}</td>
                                        <td>{a.candidate?.user?.telefone || '—'}</td>
                                        <td>{a.job?.titulo || '—'}</td>
                                        <td>{a.job?.company?.nomeEmpresa || '—'}</td>
                                        <td><span className={`badge ${statusBadge(a.status)}`}>{formatLabel(a.status)}</span></td>
                                        <td>{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );

    const renderMessages = () => (
        <>
            <h2 className="admin-section-title">💬 Mensagens de Contato</h2>
            {loading ? <div className="loading"><div className="spinner" /></div> : (
                <>
                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon">💬</div>
                            <p>Nenhuma mensagem de contato ainda.</p>
                        </div>
                    ) : (
                        <div className="admin-messages-grid">
                            {messages.map(m => (
                                <div key={m.id} className="admin-message-card">
                                    <div className="admin-message-header">
                                        <div>
                                            <strong>{m.nome}</strong>
                                            <span className="admin-message-meta">{m.email} {m.telefone ? `• ${m.telefone}` : ''}</span>
                                        </div>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMessage(m.id)}>🗑</button>
                                    </div>
                                    <p className="admin-message-body">{m.mensagem}</p>
                                    <div className="admin-message-footer">
                                        <span>Ref: {m.rental?.titulo || '—'}</span>
                                        <span>{new Date(m.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );

    // ---- RENDER ADS ----
    const loadAds = async () => {
        try { const res = await api.admin.listAds(); setAdsList(res.data); } catch { }
    };
    const handleSaveAd = async () => {
        try {
            if (editingAdId) {
                await api.admin.updateAd(editingAdId, { titulo: adTitulo, imagemUrl: adImagem, linkUrl: adLink || undefined, posicao: adPosicao, ordem: adOrdem });
                setMsg('✅ Anúncio atualizado!');
            } else {
                await api.admin.createAd({ titulo: adTitulo, imagemUrl: adImagem, linkUrl: adLink || undefined, posicao: adPosicao, ordem: adOrdem });
                setMsg('✅ Anúncio criado!');
            }
            setAdTitulo(''); setAdImagem(''); setAdLink(''); setAdPosicao('ENTRE_SECOES'); setAdOrdem(0); setEditingAdId(null);
            loadAds();
        } catch { setMsg('❌ Erro ao salvar anúncio.'); }
    };
    const editAd = (ad: Advertisement) => {
        setEditingAdId(ad.id); setAdTitulo(ad.titulo); setAdImagem(ad.imagemUrl); setAdLink(ad.linkUrl || ''); setAdPosicao(ad.posicao); setAdOrdem(ad.ordem);
    };

    const renderAds = () => (
        <>
            <h2>📢 Anúncios</h2>
            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>{editingAdId ? 'Editar Anúncio' : 'Novo Anúncio'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                        <label className="form-label">Título</label>
                        <input className="form-input" value={adTitulo} onChange={e => setAdTitulo(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">URL da Imagem</label>
                        <input className="form-input" value={adImagem} onChange={e => setAdImagem(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Link (destino ao clicar)</label>
                        <input className="form-input" value={adLink} onChange={e => setAdLink(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Posição</label>
                        <select className="form-input" value={adPosicao} onChange={e => setAdPosicao(e.target.value)}>
                            <option value="TOPO">Topo</option>
                            <option value="ENTRE_SECOES">Entre Seções</option>
                            <option value="RODAPE">Rodapé</option>
                            <option value="LATERAL">Lateral</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Ordem</label>
                        <input type="number" className="form-input" value={adOrdem} onChange={e => setAdOrdem(Number(e.target.value))} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveAd}>{editingAdId ? 'Salvar' : 'Criar'}</button>
                    {editingAdId && <button className="btn btn-ghost btn-sm" onClick={() => { setEditingAdId(null); setAdTitulo(''); setAdImagem(''); setAdLink(''); setAdPosicao('ENTRE_SECOES'); setAdOrdem(0); }}>Cancelar</button>}
                </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
                {adsList.length === 0 ? <p style={{ color: 'var(--text-light)' }}>Nenhum anúncio cadastrado.</p> : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {adsList.map(ad => (
                            <div key={ad.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                                <img src={ad.imagemUrl} alt={ad.titulo} style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                                <div style={{ flex: 1 }}>
                                    <strong>{ad.titulo}</strong>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                        Posição: {ad.posicao} · Ordem: {ad.ordem} · {ad.ativo ? '🟢 Ativo' : '🔴 Inativo'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => editAd(ad)}>✏️</button>
                                    <button className="btn btn-ghost btn-sm" onClick={async () => { await api.admin.updateAd(ad.id, { ativo: !ad.ativo }); loadAds(); }}>
                                        {ad.ativo ? '⏸️' : '▶️'}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={async () => { if (confirm('Excluir anúncio?')) { await api.admin.deleteAd(ad.id); loadAds(); setMsg('✅ Anúncio excluído.'); } }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );

    // ---- RENDER NEWS ----
    const loadNews = async () => {
        try { const res = await api.admin.listNews(); setNewsList(res.data); } catch { }
    };
    const handleSaveNews = async () => {
        try {
            if (editingNewsId) {
                await api.admin.updateNews(editingNewsId, { titulo: nwTitulo, conteudo: nwConteudo, imagemUrl: nwImagem || undefined, destaquePrincipal: nwDestaque });
                setMsg('✅ Notícia atualizada!');
            } else {
                await api.admin.createNews({ titulo: nwTitulo, conteudo: nwConteudo, imagemUrl: nwImagem || undefined, destaquePrincipal: nwDestaque });
                setMsg('✅ Notícia criada!');
            }
            setNwTitulo(''); setNwConteudo(''); setNwImagem(''); setNwDestaque(false); setEditingNewsId(null);
            loadNews();
        } catch { setMsg('❌ Erro ao salvar notícia.'); }
    };
    const editNews = (a: NewsArticle) => {
        setEditingNewsId(a.id); setNwTitulo(a.titulo); setNwConteudo(a.conteudo); setNwImagem(a.imagemUrl || ''); setNwDestaque(a.destaquePrincipal);
    };

    const renderNews = () => (
        <>
            <h2>📰 Notícias</h2>
            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>{editingNewsId ? 'Editar Notícia' : 'Nova Notícia'}</h3>
                <div className="form-group">
                    <label className="form-label">Título</label>
                    <input className="form-input" value={nwTitulo} onChange={e => setNwTitulo(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Conteúdo</label>
                    <textarea className="form-input" value={nwConteudo} onChange={e => setNwConteudo(e.target.value)} rows={6} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div className="form-group">
                        <label className="form-label">URL da Imagem (opcional)</label>
                        <input className="form-input" value={nwImagem} onChange={e => setNwImagem(e.target.value)} placeholder="https://..." />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                        <input type="checkbox" checked={nwDestaque} onChange={e => setNwDestaque(e.target.checked)} />
                        <span style={{ fontSize: '0.9rem' }}>🔴 Destaque Principal</span>
                    </label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveNews}>{editingNewsId ? 'Salvar' : 'Criar'}</button>
                    {editingNewsId && <button className="btn btn-ghost btn-sm" onClick={() => { setEditingNewsId(null); setNwTitulo(''); setNwConteudo(''); setNwImagem(''); setNwDestaque(false); }}>Cancelar</button>}
                </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
                {newsList.length === 0 ? <p style={{ color: 'var(--text-light)' }}>Nenhuma notícia cadastrada.</p> : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {newsList.map(article => (
                            <div key={article.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                                {article.imagemUrl && <img src={article.imagemUrl} alt={article.titulo} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius)' }} />}
                                <div style={{ flex: 1 }}>
                                    <strong>{article.titulo}</strong>
                                    {article.destaquePrincipal && <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>DESTAQUE</span>}
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                        {formatDate(article.createdAt)} · {article.ativo ? '🟢 Ativo' : '🔴 Inativo'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => editNews(article)}>✏️</button>
                                    {!article.destaquePrincipal && (
                                        <button className="btn btn-ghost btn-sm" title="Definir como destaque" onClick={async () => { await api.admin.setHeadline(article.id); loadNews(); setMsg('✅ Destaque definido!'); }}>⭐</button>
                                    )}
                                    <button className="btn btn-ghost btn-sm" onClick={async () => { await api.admin.updateNews(article.id, { ativo: !article.ativo }); loadNews(); }}>
                                        {article.ativo ? '⏸️' : '▶️'}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={async () => { if (confirm('Excluir notícia?')) { await api.admin.deleteNews(article.id); loadNews(); setMsg('✅ Notícia excluída.'); } }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );

    // ---- RENDER SETTINGS ----
    const loadSettings = async () => {
        try { const res = await api.admin.getSettings(); setSiteSettings(res.data); setStCorPrimaria(res.data.corPrimaria || ''); setStCorPrimariaLight(res.data.corPrimariaLight || ''); setStCorPrimariaDark(res.data.corPrimariaDark || ''); } catch { }
    };
    const handleSaveSettings = async () => {
        try {
            const data: Record<string, string> = {};
            if (stCorPrimaria) data.corPrimaria = stCorPrimaria;
            if (stCorPrimariaLight) data.corPrimariaLight = stCorPrimariaLight;
            if (stCorPrimariaDark) data.corPrimariaDark = stCorPrimariaDark;
            await api.admin.updateSettings(data);
            setMsg('✅ Configurações salvas! Recarregue o site para ver as cores.');
            loadSettings();
        } catch { setMsg('❌ Erro ao salvar configurações.'); }
    };
    const handleResetColors = async () => {
        try {
            await api.admin.updateSettings({ corPrimaria: '', corPrimariaLight: '', corPrimariaDark: '' });
            setStCorPrimaria(''); setStCorPrimariaLight(''); setStCorPrimariaDark('');
            document.documentElement.style.removeProperty('--primary');
            document.documentElement.style.removeProperty('--primary-light');
            document.documentElement.style.removeProperty('--primary-dark');
            setMsg('✅ Cores resetadas para o padrão!');
            loadSettings();
        } catch { setMsg('❌ Erro ao resetar.'); }
    };

    const renderSettings = () => (
        <>
            <h2>⚙️ Configurações do Site</h2>
            <div className="card" style={{ marginTop: '1rem', padding: '1.5rem', maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>🎨 Cores do Site (Eventos Especiais)</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    Altere as cores para datas comemorativas. Deixe em branco para usar as cores padrão (verde).
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div className="form-group">
                        <label className="form-label">Cor Primária</label>
                        <input className="form-input" value={stCorPrimaria} onChange={e => setStCorPrimaria(e.target.value)} placeholder="#1a7a4a" />
                    </div>
                    <div className="form-group">
                        <input type="color" value={stCorPrimaria || '#1a7a4a'} onChange={e => setStCorPrimaria(e.target.value)} style={{ width: '40px', height: '38px', border: 'none', cursor: 'pointer' }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Cor Primária Light</label>
                        <input className="form-input" value={stCorPrimariaLight} onChange={e => setStCorPrimariaLight(e.target.value)} placeholder="#2a9d63" />
                    </div>
                    <div className="form-group">
                        <input type="color" value={stCorPrimariaLight || '#2a9d63'} onChange={e => setStCorPrimariaLight(e.target.value)} style={{ width: '40px', height: '38px', border: 'none', cursor: 'pointer' }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Cor Primária Dark</label>
                        <input className="form-input" value={stCorPrimariaDark} onChange={e => setStCorPrimariaDark(e.target.value)} placeholder="#145e39" />
                    </div>
                    <div className="form-group">
                        <input type="color" value={stCorPrimariaDark || '#145e39'} onChange={e => setStCorPrimariaDark(e.target.value)} style={{ width: '40px', height: '38px', border: 'none', cursor: 'pointer' }} />
                    </div>
                </div>
                {stCorPrimaria && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius)', background: stCorPrimaria, color: 'white', textAlign: 'center', fontWeight: 600 }}>
                        Pré-visualização da cor primária
                    </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveSettings}>💾 Salvar Cores</button>
                    <button className="btn btn-ghost btn-sm" onClick={handleResetColors}>🔄 Resetar Padrão</button>
                </div>
            </div>
        </>
    );

    return (
        <div className="dashboard" style={{ marginTop: 0 }}>
            {/* Sidebar */}
            <aside className="sidebar admin-sidebar">
                <div className="admin-sidebar-header">
                    <span className="admin-sidebar-icon">🛡️</span>
                    <span className="admin-sidebar-title">Admin</span>
                </div>
                {sidebarItems.map(item => (
                    <button
                        key={item.key}
                        className={`sidebar-link ${tab === item.key ? 'active' : ''}`}
                        onClick={() => handleTabChange(item.key)}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </aside>

            {/* Content */}
            <main className="dashboard-content">
                {msg && (
                    <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`} onClick={() => setMsg('')} style={{ cursor: 'pointer' }}>
                        {msg}
                    </div>
                )}

                {tab === 'dashboard' && renderDashboard()}
                {tab === 'users' && renderUsers()}
                {tab === 'jobs' && renderJobs()}
                {tab === 'rentals' && renderRentals()}
                {tab === 'applications' && renderApplications()}
                {tab === 'messages' && renderMessages()}
                {tab === 'ads' && renderAds()}
                {tab === 'news' && renderNews()}
                {tab === 'settings' && renderSettings()}
            </main>
        </div>
    );
}
