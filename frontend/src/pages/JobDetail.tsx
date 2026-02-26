// ============================================================
// JobDetail — Detalhe da vaga com botões WhatsApp/Site
// Candidatos não precisam mais se cadastrar
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import type { Job } from '../types';

const formatLabel = (val: string) => {
    const map: Record<string, string> = {
        PRESENCIAL: 'Presencial', HIBRIDO: 'Híbrido', REMOTO: 'Remoto',
        CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio', TEMPORARIO: 'Temporário', FREELANCER: 'Freelancer',
    };
    return map[val] || val;
};

const formatWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    const num = digits.startsWith('55') ? digits : '55' + digits;
    return `https://wa.me/${num}`;
};

export default function JobDetail() {
    const { id } = useParams<{ id: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.jobs.get(id).then(res => setJob(res.data)).catch(() => { }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading"><div className="spinner" /></div>;
    if (!job) return <div className="page container"><p>Vaga não encontrada.</p></div>;

    // Determine WhatsApp: job-level > company-level
    const whatsapp = job.whatsapp || job.company?.whatsapp;

    return (
        <div className="page container">
            <Link to="/vagas" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>← Voltar para vagas</Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', marginTop: '1.5rem', alignItems: 'start' }}>
                {/* Conteúdo principal */}
                <div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span className="badge badge-green">{formatLabel(job.modeloTrabalho)}</span>
                        <span className="badge badge-blue">{formatLabel(job.tipoContrato)}</span>
                        {job.destaque && <span className="badge badge-yellow">⭐ Destaque</span>}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{job.titulo}</h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        {job.company?.nomeEmpresa} · 📍 {job.cidade} - {job.estado}
                        {job.faixaSalarial && <> · 💰 {job.faixaSalarial}</>}
                    </p>

                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '0.75rem' }}>Descrição</h3>
                        <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{job.descricao}</p>
                    </div>

                    {job.requisitos && (
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.75rem' }}>Requisitos</h3>
                            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{job.requisitos}</p>
                        </div>
                    )}

                    {job.beneficios && (
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.75rem' }}>Benefícios</h3>
                            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{job.beneficios}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar — Contato */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '80px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Interessado nesta vaga?</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                            Entre em contato diretamente com a empresa para se candidatar.
                        </p>

                        {/* Botão WhatsApp */}
                        {whatsapp && (
                            <a
                                href={formatWhatsApp(whatsapp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-lg"
                                style={{
                                    width: '100%', marginBottom: '0.75rem',
                                    background: '#25D366', borderColor: '#25D366', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                }}
                            >
                                📱 WhatsApp
                            </a>
                        )}

                        {/* Botão Site/Link externo */}
                        {job.linkExterno && (
                            <a
                                href={job.linkExterno}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginBottom: '0.75rem' }}
                            >
                                🔗 Ver no Site
                            </a>
                        )}

                        {/* Fallback: site da empresa */}
                        {!job.linkExterno && job.company?.site && (
                            <a
                                href={job.company.site}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary btn-lg"
                                style={{ width: '100%', marginBottom: '0.75rem' }}
                            >
                                🌐 Site da Empresa
                            </a>
                        )}

                        {/* Sem contato */}
                        {!whatsapp && !job.linkExterno && !job.company?.site && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-lighter)', textAlign: 'center' }}>
                                Nenhuma informação de contato disponível.
                            </p>
                        )}

                        {/* Info da empresa */}
                        {job.company && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Sobre a Empresa</h4>
                                <p style={{ fontWeight: 600 }}>{job.company.nomeEmpresa}</p>
                                {job.company.areaAtuacao && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{job.company.areaAtuacao}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
