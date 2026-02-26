// ============================================================
// Footer — Rodapé do site
// ============================================================

import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div>
                    <h4>EmpregaSapezal</h4>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                        Portal de vagas de emprego e anúncios de aluguel em Sapezal e região.
                    </p>
                </div>
                <div>
                    <h4>Links Rápidos</h4>
                    <Link to="/vagas">Vagas de Emprego</Link>
                    <Link to="/alugueis">Anúncios de Aluguel</Link>
                    <Link to="/cadastro">Cadastre-se</Link>
                    <Link to="/login">Entrar</Link>
                </div>
                <div>
                    <h4>Para Empresas</h4>
                    <Link to="/cadastro">Criar Conta</Link>
                    <Link to="/empresa">Publicar Vagas</Link>
                    <Link to="/empresa">Anunciar Imóvel</Link>
                </div>
                <div>
                    <h4>Contato</h4>
                    <p style={{ fontSize: '0.875rem' }}>Sapezal — MT</p>
                    <p style={{ fontSize: '0.875rem' }}>contato@empregasapezal.com</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} EmpregaSapezal. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}
