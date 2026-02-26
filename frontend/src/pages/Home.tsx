// ============================================================
// Home — Página inicial com hero, busca, destaques, notícias e anúncios
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Job, Rental, Advertisement, NewsArticle } from '../types';

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
    const [featuredRentals, setFeaturedRentals] = useState<Rental[]>([]);
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [headline, setHeadline] = useState<NewsArticle | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.jobs.list('limit=6').then(res => setFeaturedJobs(res.data)).catch(() => { });
        api.rentals.list('limit=6').then(res => setFeaturedRentals(res.data)).catch(() => { });
        api.content.ads().then(res => setAds(res.data)).catch(() => { });
        api.content.news().then(res => setNews(res.data)).catch(() => { });
        api.content.headline().then(res => setHeadline(res.data)).catch(() => { });
    }, []);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/vagas?busca=${encodeURIComponent(searchTerm)}`);
        }
    };

    const formatLabel = (val: string) => {
        const map: Record<string, string> = {
            PRESENCIAL: 'Presencial', HIBRIDO: 'Híbrido', REMOTO: 'Remoto',
            CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio',
            CASA: 'Casa', APARTAMENTO: 'Apartamento', SALA_COMERCIAL: 'Sala Comercial',
            KITNET: 'Kitnet', TERRENO: 'Terreno', CHACARA: 'Chácara', OUTRO: 'Outro',
        };
        return map[val] || val;
    };

    const topoAds = ads.filter(a => a.posicao === 'TOPO');
    const entreAds = ads.filter(a => a.posicao === 'ENTRE_SECOES');
    const rodapeAds = ads.filter(a => a.posicao === 'RODAPE');

    const renderAdBanner = (ad: Advertisement) => (
        <a
            key={ad.id}
            href={ad.linkUrl || '#'}
            target={ad.linkUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            style={{ display: 'block', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxHeight: '200px' }}
        >
            <img src={ad.imagemUrl} alt={ad.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </a>
    );

    const renderAdSection = (adList: Advertisement[]) => {
        if (adList.length === 0) return null;
        return (
            <section className="section" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: adList.length > 1 ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '1rem' }}>
                        {adList.map(renderAdBanner)}
                    </div>
                </div>
            </section>
        );
    };

    return (
        <>
            {/* ---- HEADLINE / DESTAQUE PRINCIPAL ---- */}
            {headline && (
                <section style={{
                    background: 'linear-gradient(135deg, #1a1d23 0%, #2d3748 100%)', color: 'white',
                    padding: '1rem 0', borderBottom: '3px solid var(--accent)',
                }}>
                    <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ background: 'var(--danger)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            🔴 DESTAQUE
                        </span>
                        <Link to={`/noticias/${headline.id}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '1rem', flex: 1 }}>
                            {headline.titulo}
                        </Link>
                        <Link to={`/noticias/${headline.id}`} style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            Ler mais →
                        </Link>
                    </div>
                </section>
            )}

            {/* ---- ANÚNCIOS TOPO ---- */}
            {renderAdSection(topoAds)}

            {/* ---- HERO ---- */}
            <section className="hero">
                <h1>Encontre Oportunidades em Sapezal</h1>
                <p>Vagas de emprego e imóveis para alugar na região que mais cresce no Mato Grosso.</p>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar vagas, cargos, empresas..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch}>Buscar</button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <Link to="/vagas" className="btn btn-secondary" style={{ borderColor: 'white', color: 'white' }}>
                        Ver Todas as Vagas
                    </Link>
                    <Link to="/alugueis" className="btn btn-accent">
                        Ver Aluguéis
                    </Link>
                </div>
            </section>

            {/* ---- STATS ---- */}
            <section className="section" style={{ marginTop: '-2rem', position: 'relative', zIndex: 2 }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[
                            { icon: '💼', label: 'Vagas Disponíveis', value: featuredJobs.length > 0 ? `${featuredJobs.length}+` : '—' },
                            { icon: '🏠', label: 'Imóveis para Alugar', value: featuredRentals.length > 0 ? `${featuredRentals.length}+` : '—' },
                            { icon: '🌾', label: 'Região', value: 'Sapezal - MT' },
                            { icon: '✅', label: 'Cadastro Gratuito', value: '100%' },
                        ].map((s, i) => (
                            <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem' }}>{s.icon}</div>
                                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- VAGAS EM DESTAQUE ---- */}
            {featuredJobs.length > 0 && (
                <section className="section">
                    <div className="container">
                        <h2 className="section-title">🔥 Vagas em Destaque</h2>
                        <p className="section-subtitle">As melhores oportunidades da região</p>
                        <div className="grid grid-3">
                            {featuredJobs.map(job => (
                                <Link to={`/vagas/${job.id}`} key={job.id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {job.destaque && <div style={{ marginBottom: '0.5rem' }}><span className="badge badge-yellow">⭐ Destaque</span></div>}
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{job.titulo}</h3>
                                    <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                        {job.company?.nomeEmpresa || 'Empresa'}
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
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <Link to="/vagas" className="btn btn-secondary">Ver Todas as Vagas →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ---- ANÚNCIOS ENTRE SEÇÕES ---- */}
            {renderAdSection(entreAds)}

            {/* ---- ALUGUÉIS EM DESTAQUE ---- */}
            {featuredRentals.length > 0 && (
                <section className="section" style={{ background: 'white' }}>
                    <div className="container">
                        <h2 className="section-title">🏠 Imóveis para Alugar</h2>
                        <p className="section-subtitle">Encontre o imóvel ideal em Sapezal</p>
                        <div className="grid grid-3">
                            {featuredRentals.map(rental => (
                                <Link to={`/alugueis/${rental.id}`} key={rental.id} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
                                    <div style={{ height: '180px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {rental.imagens && rental.imagens.length > 0 ? (
                                            <img src={rental.imagens[0].url} alt={rental.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '3rem' }}>🏠</span>
                                        )}
                                    </div>
                                    <div style={{ padding: '1.25rem' }}>
                                        {rental.destaque && <span className="badge badge-yellow" style={{ marginBottom: '0.5rem' }}>⭐ Destaque</span>}
                                        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.375rem' }}>{rental.titulo}</h3>
                                        <span className="badge badge-gray" style={{ marginBottom: '0.5rem' }}>{formatLabel(rental.tipoImovel)}</span>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', margin: '0.5rem 0' }}>
                                            R$ {rental.valorAluguel.toLocaleString('pt-BR')}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/mês</span>
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-lighter)' }}>📍 {rental.cidade} - {rental.estado}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <Link to="/alugueis" className="btn btn-secondary">Ver Todos os Aluguéis →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ---- NOTÍCIAS ---- */}
            {news.length > 0 && (
                <section className="section">
                    <div className="container">
                        <h2 className="section-title">📰 Notícias de Sapezal</h2>
                        <p className="section-subtitle">Fique por dentro do que acontece na região</p>
                        <div className="grid grid-3">
                            {news.slice(0, 6).map(article => (
                                <Link to={`/noticias/${article.id}`} key={article.id} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
                                    {article.imagemUrl && (
                                        <div style={{ height: '160px', background: '#e2e8f0' }}>
                                            <img src={article.imagemUrl} alt={article.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ padding: '1.25rem' }}>
                                        {article.destaquePrincipal && <span className="badge badge-red" style={{ marginBottom: '0.5rem' }}>🔴 Destaque</span>}
                                        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{article.titulo}</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-lighter)' }}>
                                            {new Date(article.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ---- ANÚNCIOS RODAPÉ ---- */}
            {renderAdSection(rodapeAds)}

            {/* ---- CTA ---- */}
            <section className="section" style={{ textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Quer anunciar?</h2>
                    <p style={{ color: 'var(--text-light)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                        Publique vagas de emprego ou anúncios de aluguel e alcance toda a região de Sapezal.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/cadastro" className="btn btn-primary btn-lg">Cadastre sua Empresa</Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">Já tem conta? Entrar</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
