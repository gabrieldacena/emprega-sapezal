// ============================================================
// Login — Tela de login com "Esqueci minha senha"
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, senha);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '420px', width: '100%', padding: '0 1.5rem' }}>
                <div className="card" style={{ padding: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>Entrar</h1>
                    <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Acesse sua conta para continuar
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">E-mail</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="form-label" htmlFor="senha">Senha</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(!showForgot)}
                                    style={{
                                        background: 'none', border: 'none', color: 'var(--primary)',
                                        fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font)',
                                    }}
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                            <input
                                id="senha"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={senha}
                                onChange={e => setSenha(e.target.value)}
                                required
                            />
                        </div>

                        {showForgot && (
                            <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                                📧 Para redefinir sua senha, entre em contato com o administrador pelo WhatsApp ou e-mail do site. Informe o e-mail cadastrado para que possamos auxiliá-lo.
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        <p>
                            Quer anunciar?{' '}
                            <Link to="/cadastro" style={{ fontWeight: 600 }}>Cadastre sua empresa</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
