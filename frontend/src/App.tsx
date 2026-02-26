// ============================================================
// App — Roteamento principal + cor dinâmica do site
// ============================================================

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { api } from './api';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import RentalList from './pages/RentalList';
import RentalDetail from './pages/RentalDetail';
import NewsDetail from './pages/NewsDetail';

// Painéis
import CandidateDashboard from './pages/CandidateDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';

/** Rota protegida por role */
function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading"><div className="spinner" /></div>;
    if (!user) return <Navigate to="/login" />;
    if (!roles.includes(user.role)) return <Navigate to="/" />;

    return <>{children}</>;
}

export default function App() {
    const { user } = useAuth();

    // Aplicar tema azul quando logado como empresa
    useEffect(() => {
        if (user?.role === 'EMPRESA') {
            document.documentElement.setAttribute('data-theme', 'empresa');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [user]);

    // Carregar cores personalizadas do admin (eventos especiais)
    useEffect(() => {
        api.content.settings().then(res => {
            const settings = res.data;
            if (settings?.corPrimaria) {
                document.documentElement.style.setProperty('--primary', settings.corPrimaria);
            }
            if (settings?.corPrimariaLight) {
                document.documentElement.style.setProperty('--primary-light', settings.corPrimariaLight);
            }
            if (settings?.corPrimariaDark) {
                document.documentElement.style.setProperty('--primary-dark', settings.corPrimariaDark);
            }
        }).catch(() => { });
    }, []);

    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    {/* Públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Register />} />
                    <Route path="/vagas" element={<JobList />} />
                    <Route path="/vagas/:id" element={<JobDetail />} />
                    <Route path="/alugueis" element={<RentalList />} />
                    <Route path="/alugueis/:id" element={<RentalDetail />} />
                    <Route path="/noticias/:id" element={<NewsDetail />} />

                    {/* Candidato */}
                    <Route path="/candidato/*" element={
                        <ProtectedRoute roles={['CANDIDATO']}>
                            <CandidateDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Empresa */}
                    <Route path="/empresa/*" element={
                        <ProtectedRoute roles={['EMPRESA']}>
                            <CompanyDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Admin */}
                    <Route path="/admin/*" element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* 404 */}
                    <Route path="*" element={
                        <div className="page container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                            <h1>404</h1>
                            <p>Página não encontrada.</p>
                        </div>
                    } />
                </Routes>
            </main>
            <Footer />
        </>
    );
}
