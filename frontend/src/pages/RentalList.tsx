// ============================================================
// RentalList — Lista de anúncios de aluguel
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Rental } from '../types';

const formatPropertyType = (val: string) => {
    const map: Record<string, string> = {
        CASA: 'Casa', APARTAMENTO: 'Apartamento', SALA_COMERCIAL: 'Sala Comercial',
        KITNET: 'Kitnet', TERRENO: 'Terreno', CHACARA: 'Chácara', OUTRO: 'Outro',
    };
    return map[val] || val;
};

export default function RentalList() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState('');
    const [cidade, setCidade] = useState('');
    const [tipoImovel, setTipoImovel] = useState('');

    const fetchRentals = async (p: number = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(p));
            params.set('limit', '12');
            if (busca) params.set('busca', busca);
            if (cidade) params.set('cidade', cidade);
            if (tipoImovel) params.set('tipoImovel', tipoImovel);

            const res = await api.rentals.list(params.toString());
            setRentals(res.data);
            setTotal(res.pagination.total);
            setPage(res.pagination.page);
            setTotalPages(res.pagination.totalPages);
        } catch {
            setRentals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRentals(); }, []);

    return (
        <div className="page container">
            <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Imóveis para Alugar</h1>

            <form className="filters" onSubmit={e => { e.preventDefault(); fetchRentals(1); }}>
                <input className="form-input" placeholder="Buscar anúncios..." value={busca} onChange={e => setBusca(e.target.value)} />
                <input className="form-input" placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} style={{ maxWidth: '160px' }} />
                <select className="form-select" value={tipoImovel} onChange={e => setTipoImovel(e.target.value)} style={{ maxWidth: '180px' }}>
                    <option value="">Tipo de Imóvel</option>
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="SALA_COMERCIAL">Sala Comercial</option>
                    <option value="KITNET">Kitnet</option>
                    <option value="TERRENO">Terreno</option>
                    <option value="CHACARA">Chácara</option>
                    <option value="OUTRO">Outro</option>
                </select>
                <button type="submit" className="btn btn-primary">Filtrar</button>
            </form>

            <p style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.9rem' }}>{total} anúncio(s) encontrado(s)</p>

            {loading ? (
                <div className="loading"><div className="spinner" /></div>
            ) : rentals.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">🏠</div>
                    <p>Nenhum anúncio encontrado.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-3">
                        {rentals.map(rental => (
                            <Link to={`/alugueis/${rental.id}`} key={rental.id} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}>
                                <div style={{ height: '180px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {rental.imagens && rental.imagens.length > 0 ? (
                                        <img src={rental.imagens[0].url} alt={rental.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '3rem' }}>🏠</span>
                                    )}
                                </div>
                                <div style={{ padding: '1.25rem' }}>
                                    {rental.destaque && <span className="badge badge-yellow" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>⭐ Destaque</span>}
                                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.375rem' }}>{rental.titulo}</h3>
                                    <span className="badge badge-gray">{formatPropertyType(rental.tipoImovel)}</span>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', margin: '0.5rem 0' }}>
                                        R$ {rental.valorAluguel.toLocaleString('pt-BR')}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/mês</span>
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-lighter)' }}>📍 {rental.cidade} - {rental.estado}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={page <= 1} onClick={() => fetchRentals(page - 1)}>← Anterior</button>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Página {page} de {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => fetchRentals(page + 1)}>Próxima →</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
