// ============================================================
// Register — Cadastro apenas para Empresas/Anunciantes
// Candidatos não precisam mais se cadastrar
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    const [eNome, setENome] = useState('');
    const [eEmail, setEEmail] = useState('');
    const [eSenha, setESenha] = useState('');
    const [eNomeEmpresa, setENomeEmpresa] = useState('');
    const [eCnpj, setECnpj] = useState('');
    const [eAreaAtuacao, setEAreaAtuacao] = useState('');
    const [eCidade, setECidade] = useState('');
    const [eEstado, setEEstado] = useState('');
    const [eTelefone, setETelefone] = useState('');
    const [eWhatsapp, setEWhatsapp] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.auth.registerCompany({
                nome: eNome, email: eEmail, senha: eSenha,
                nomeEmpresa: eNomeEmpresa, cnpj: eCnpj || undefined,
                areaAtuacao: eAreaAtuacao || undefined,
                cidade: eCidade || undefined, estado: eEstado || undefined,
                telefone: eTelefone || undefined,
            });
            await refreshUser();
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Erro ao cadastrar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '2rem' }}>
            <div style={{ maxWidth: '500px', width: '100%', padding: '0 1.5rem' }}>
                <div className="card" style={{ padding: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>Cadastre sua Empresa</h1>
                    <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Crie sua conta para publicar vagas e anúncios de aluguel
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Seu nome (responsável) *</label>
                            <input className="form-input" value={eNome} onChange={e => setENome(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nome da empresa *</label>
                            <input className="form-input" value={eNomeEmpresa} onChange={e => setENomeEmpresa(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">E-mail *</label>
                            <input type="email" className="form-input" value={eEmail} onChange={e => setEEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Senha *</label>
                            <input type="password" className="form-input" value={eSenha} onChange={e => setESenha(e.target.value)} required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">CNPJ (opcional)</label>
                            <input className="form-input" value={eCnpj} onChange={e => setECnpj(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Área de atuação</label>
                            <input className="form-input" value={eAreaAtuacao} onChange={e => setEAreaAtuacao(e.target.value)} placeholder="Ex: Agronegócio, Tecnologia..." />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.75rem' }}>
                            <div className="form-group">
                                <label className="form-label">Cidade</label>
                                <input className="form-input" value={eCidade} onChange={e => setECidade(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">UF</label>
                                <input className="form-input" value={eEstado} onChange={e => setEEstado(e.target.value)} maxLength={2} placeholder="MT" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telefone</label>
                            <input className="form-input" value={eTelefone} onChange={e => setETelefone(e.target.value)} placeholder="(65) 99999-9999" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">WhatsApp</label>
                            <input className="form-input" value={eWhatsapp} onChange={e => setEWhatsapp(e.target.value)} placeholder="(65) 99999-9999" />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                            {loading ? 'Cadastrando...' : 'Criar Conta'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Já tem conta? <Link to="/login" style={{ fontWeight: 600 }}>Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
