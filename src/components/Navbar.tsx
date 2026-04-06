import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import logo from '../assets/icon.png';
import { supabase } from '../lib/supabase';

const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'Funcionalidades', href: '/#funcionalidades' },
  { label: 'Planos', href: '/planos' },
  { label: 'Contato', href: '/contato' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    // Escutar estado de autenticação
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
        return;
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-neutral-900/5' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="MeuRebanho" className="w-10 h-10 rounded-xl group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold text-neutral-900">
              Meu<span className="text-primary-600">Rebanho</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === link.href 
                    ? 'text-primary-700 bg-primary-50' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-neutral-200 mx-2"></div>
            
            {user ? (
              <div className="flex items-center gap-2 pl-2">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 px-3 py-2 bg-neutral-50 rounded-lg">
                  <User size={16} />
                  <span>{user.user_metadata?.full_name?.split(' ')[0] || 'Minha Conta'}</span>
                </div>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                  Entrar
                </Link>
                <Link to="/cadastro" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md">
                  Criar Conta
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-80 border-t border-neutral-200' : 'max-h-0'
      }`}>
        <div className="bg-white/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${location.pathname === link.href 
                  ? 'text-primary-700 bg-primary-50' 
                  : 'text-neutral-600 hover:bg-neutral-50'
                }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="flex px-4 py-3 bg-neutral-50 rounded-xl text-sm font-medium text-neutral-700 mt-2 items-center gap-2">
                <User size={18} className="text-primary-600" />
                {user.user_metadata?.full_name || user.email}
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full text-left px-4 py-3 text-red-600 font-medium text-sm flex items-center gap-2 mt-1"
              >
                <LogOut size={18} /> Sair da conta
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-neutral-100">
              <Link to="/login" className="block text-center px-4 py-3 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-xl">
                Entrar
              </Link>
              <Link to="/cadastro" className="block text-center px-4 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl">
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
