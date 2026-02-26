// ============================================================
// RentalDetail — Detalhe do anúncio com botões WhatsApp/Site
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import type { Rental } from '../types';

const formatPropertyType = (val: string) => {
    const map: Record<string, string> = {
        CASA: 'Casa', APARTAMENTO: 'Apartamento', SALA_COMERCIAL: 'Sala Comercial',
        KITNET: 'Kitnet', TERRENO: 'Terreno', CHACARA: 'Chácara', OUTRO: 'Outro',
    };
    return map[val] || val;
};

const formatWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    const num = digits.startsWith('55') ? digits : '55' + digits;
    return `https://wa.me/${num}`;
};

export default function RentalDetail() {
    const { id } = useParams<{ id: string }>();
    const [rental, setRental] = useState<Rental | null>(null);
    const [loading, setLoading] = useState(true);
    const [showContact, setShowContact] = useState(false);
    const [contactForm, setContactForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
    const [contactMsg, setContactMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedImg, setSelectedImg] = useState(0);

    useEffect(() => {
        if (!id) return;
        api.rentals.get(id).then(res => setRental(res.data)).catch(() => { }).finally(() => setLoading(false));
    }, [id]);

    const handleContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSending(true);
        try {
            await api.rentals.contact(id, contactForm);
            setContactMsg('Mensagem enviada com sucesso! O anunciante entrará em contato. ✅');
            setShowContact(false);
        } catch (err: any) {
            setContactMsg(err.message);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /></div>;
    if (!rental) return <div className="page container"><p>Anúncio não encontrado.</p></div>;

    const whatsapp = rental.whatsapp || rental.company?.whatsapp;

    return (
        <div className="page container">
            <Link to="/alugueis" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>← Voltar para aluguéis</Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', marginTop: '1.5rem', alignItems: 'start' }}>
                <div>
                    {/* Galeria de imagens */}
                    {rental.imagens && rental.imagens.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '0.75rem', height: '360px', background: '#e2e8f0' }}>
                                <img src={rental.imagens[selectedImg]?.url} alt={rental.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            {rental.imagens.length > 1 && (
                                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                                    {rental.imagens.map((img, i) => (
                                        <div
                                            key={img.id}
                                            onClick={() => setSelectedImg(i)}
                                            style={{
                                                width: '70px', height: '50px', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
                                                border: i === selectedImg ? '2px solid var(--primary)' : '2px solid transparent', flexShrink: 0,
                                            }}
                                        >
                                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span className="badge badge-gray">{formatPropertyType(rental.tipoImovel)}</span>
                        {rental.destaque && <span className="badge badge-yellow">⭐ Destaque</span>}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{rental.titulo}</h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>📍 {rental.cidade} - {rental.estado}</p>

                    <div className="card">
                        <h3 style={{ marginBottom: '0.75rem' }}>Descrição</h3>
                        <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{rental.descricao}</p>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '80px' }}>
                        <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                            R$ {rental.valorAluguel.toLocaleString('pt-BR')}
                        </p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>por mês</p>

                        {contactMsg && <div className="alert alert-success">{contactMsg}</div>}

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

                        {/* Botão link externo */}
                        {rental.linkExterno && (
                            <a
                                href={rental.linkExterno}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginBottom: '0.75rem' }}
                            >
                                🔗 Ver no Site
                            </a>
                        )}

                        {/* Botão contato via formulário */}
                        {!showContact ? (
                            <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} onClick={() => setShowContact(true)}>
                                ✉️ Enviar Mensagem
                            </button>
                        ) : (
                            <form onSubmit={handleContact}>
                                <div className="form-group">
                                    <label className="form-label">Nome *</label>
                                    <input className="form-input" required value={contactForm.nome} onChange={e => setContactForm({ ...contactForm, nome: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">E-mail *</label>
                                    <input type="email" className="form-input" required value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Telefone</label>
                                    <input className="form-input" value={contactForm.telefone} onChange={e => setContactForm({ ...contactForm, telefone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mensagem *</label>
                                    <textarea className="form-textarea" required value={contactForm.mensagem} onChange={e => setContactForm({ ...contactForm, mensagem: e.target.value })} placeholder="Tenho interesse neste imóvel..." />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={sending} style={{ width: '100%' }}>
                                    {sending ? 'Enviando...' : 'Enviar Mensagem'}
                                </button>
                                <button type="button" className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setShowContact(false)}>
                                    Cancelar
                                </button>
                            </form>
                        )}

                        {rental.company && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Anunciante</h4>
                                <p style={{ fontWeight: 600 }}>{rental.company.nomeEmpresa}</p>
                                {rental.company.site && <a href={rental.company.site} target="_blank" rel="noopener" style={{ fontSize: '0.85rem' }}>{rental.company.site}</a>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
