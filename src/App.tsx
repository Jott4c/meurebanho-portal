import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Planos from './pages/Planos';
import Contato from './pages/Contato';
import SetPassword from './SetPassword';

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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
