// ============================================================
// JobList — Lista de vagas com filtros
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import type { Job } from '../types';

const formatLabel = (val: string) => {
    const map: Record<string, string> = {
        PRESENCIAL: 'Presencial', HIBRIDO: 'Híbrido', REMOTO: 'Remoto',
        CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio', TEMPORARIO: 'Temporário', FREELANCER: 'Freelancer',
    };
    return map[val] || val;
};

export default function JobList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [busca, setBusca] = useState(searchParams.get('busca') || '');
    const [cidade, setCidade] = useState('');
    const [modeloTrabalho, setModeloTrabalho] = useState('');
    const [tipoContrato, setTipoContrato] = useState('');

    const fetchJobs = async (p: number = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(p));
            params.set('limit', '12');
            if (busca) params.set('busca', busca);
            if (cidade) params.set('cidade', cidade);
            if (modeloTrabalho) params.set('modeloTrabalho', modeloTrabalho);
            if (tipoContrato) params.set('tipoContrato', tipoContrato);

            const res = await api.jobs.list(params.toString());
            setJobs(res.data);
            setTotal(res.pagination.total);
            setPage(res.pagination.page);
            setTotalPages(res.pagination.totalPages);
        } catch {
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJobs(1);
    };

    return (
        <div className="page container">
            <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Vagas de Emprego</h1>

            {/* Filtros */}
            <form className="filters" onSubmit={handleFilter}>
                <input className="form-input" placeholder="Buscar vagas..." value={busca} onChange={e => setBusca(e.target.value)} />
                <input className="form-input" placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} style={{ maxWidth: '160px' }} />
                <select className="form-select" value={modeloTrabalho} onChange={e => setModeloTrabalho(e.target.value)} style={{ maxWidth: '160px' }}>
                    <option value="">Modelo</option>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="HIBRIDO">Híbrido</option>
                    <option value="REMOTO">Remoto</option>
                </select>
                <select className="form-select" value={tipoContrato} onChange={e => setTipoContrato(e.target.value)} style={{ maxWidth: '160px' }}>
                    <option value="">Contrato</option>
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="ESTAGIO">Estágio</option>
                    <option value="TEMPORARIO">Temporário</option>
                    <option value="FREELANCER">Freelancer</option>
                </select>
                <button type="submit" className="btn btn-primary">Filtrar</button>
            </form>

            <p style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.9rem' }}>{total} vaga(s) encontrada(s)</p>

            {loading ? (
                <div className="loading"><div className="spinner" /></div>
            ) : jobs.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">💼</div>
                    <p>Nenhuma vaga encontrada.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-2">
                        {jobs.map(job => (
                            <Link to={`/vagas/${job.id}`} key={job.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.05rem', flex: 1 }}>{job.titulo}</h3>
                                    {job.destaque && <span className="badge badge-yellow" style={{ marginLeft: '0.5rem', flexShrink: 0 }}>⭐</span>}
                                </div>
                                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                    {job.company?.nomeEmpresa}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                    <span className="badge badge-green">{formatLabel(job.modeloTrabalho)}</span>
                                    <span className="badge badge-blue">{formatLabel(job.tipoContrato)}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-lighter)' }}>
                                    📍 {job.cidade} - {job.estado}
                                    {job.faixaSalarial && <> · 💰 {job.faixaSalarial}</>}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={page <= 1} onClick={() => fetchJobs(page - 1)}>← Anterior</button>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Página {page} de {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => fetchJobs(page + 1)}>Próxima →</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
