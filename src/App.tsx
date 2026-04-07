import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Planos from './pages/Planos';
import Contato from './pages/Contato';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Privacidade from './pages/Privacidade';
import SetPassword from './SetPassword';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/app/Dashboard';
import RebanhoList from './pages/app/RebanhoList';

// Páginas criadas futuramente serão importadas aqui:
// import RebanhoDetail from './pages/app/RebanhoDetail';
// import RebanhoForm from './pages/app/RebanhoForm';
// import Vacinas from './pages/app/Vacinas';
// import Ocorrencias from './pages/app/Ocorrencias';
// import Equipe from './pages/app/Equipe';
// import Relatorios from './pages/app/Relatorios';
// import Configuracoes from './pages/app/Configuracoes';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de definir senha — sem Navbar/Footer */}
        <Route path="/definir-senha" element={<SetPassword />} />

        {/* Páginas com layout (Navbar + Footer) */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/planos" element={<Layout><Planos /></Layout>} />
        <Route path="/contato" element={<Layout><Contato /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/cadastro" element={<Layout><Cadastro /></Layout>} />
        <Route path="/privacidade" element={<Layout><Privacidade /></Layout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* --- ROTAS PRIVADAS --- */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/app" element={<Dashboard />} />
            {/* 
              Essas rotas entrarão nas próximas fases:
              <Route path="/app/rebanho" element={<RebanhoList />} />
              <Route path="/app/rebanho/novo" element={<RebanhoForm />} />
              <Route path="/app/rebanho/:id/editar" element={<RebanhoForm />} />
              <Route path="/app/rebanho/:id" element={<RebanhoDetail />} />
              <Route path="/app/vacinas" element={<Vacinas />} />
              <Route path="/app/ocorrencias" element={<Ocorrencias />} />
              <Route path="/app/equipe" element={<Equipe />} />
              <Route path="/app/relatorios" element={<Relatorios />} />
              <Route path="/app/configuracoes" element={<Configuracoes />} /> 
            */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
