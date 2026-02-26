// ============================================================
// NewsDetail — Página de detalhe da notícia
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import type { NewsArticle } from '../types';

export default function NewsDetail() {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.content.newsDetail(id).then(res => setArticle(res.data)).catch(() => { }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading"><div className="spinner" /></div>;
    if (!article) return <div className="page container"><p>Notícia não encontrada.</p></div>;

    return (
        <div className="page container">
            <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>← Voltar para início</Link>

            <div style={{ maxWidth: '800px', margin: '2rem auto 0' }}>
                {article.destaquePrincipal && (
                    <span className="badge" style={{ background: 'var(--danger)', color: 'white', marginBottom: '1rem', display: 'inline-block' }}>
                        🔴 DESTAQUE PRINCIPAL
                    </span>
                )}

                <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{article.titulo}</h1>
                <p style={{ color: 'var(--text-lighter)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    📅 {new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>

                {article.imagemUrl && (
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '2rem', maxHeight: '400px' }}>
                        <img src={article.imagemUrl} alt={article.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}

                <div className="card" style={{ padding: '2rem' }}>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        {article.conteudo}
                    </div>
                </div>
            </div>
        </div>
    );
}
