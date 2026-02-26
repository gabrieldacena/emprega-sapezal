// ============================================================
// Navbar — Barra de navegação responsiva
// ============================================================

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'ADMIN') return '/admin';
        return '/empresa';
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    Emprega<span>Sapezal</span>
                </Link>

                <button className="navbar-mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? '✕' : '☰'}
                </button>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/vagas" className={isActive('/vagas')} onClick={() => setMenuOpen(false)}>
                        Vagas
                    </Link>
                    <Link to="/alugueis" className={isActive('/alugueis')} onClick={() => setMenuOpen(false)}>
                        Aluguéis
                    </Link>

                    {user ? (
                        <>
                            <Link to={getDashboardPath()} className="navbar-link" onClick={() => setMenuOpen(false)}>
                                Painel
                            </Link>
                            <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ marginLeft: '0.5rem' }}>
                                Sair
                            </button>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', padding: '0 0.5rem' }}>
                                {user.nome.split(' ')[0]}
                            </span>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={isActive('/login')} onClick={() => setMenuOpen(false)}>
                                Entrar
                            </Link>
                            <Link
                                to="/cadastro"
                                className="btn btn-primary btn-sm"
                                onClick={() => setMenuOpen(false)}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                Anuncie Grátis
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
