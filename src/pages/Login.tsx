import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check if we came from plans with intent to subscribe
  const params = new URLSearchParams(location.search);
  const isRedirect = params.get('redirect') === '/planos';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(signInError.message);
      }
    } else {
      if (isRedirect) {
        navigate('/planos');
      } else {
        navigate('/app'); 
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${isRedirect ? '/planos' : '/app'}` ,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] pt-20 flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-neutral-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Bem-vindo de volta!</h1>
          <p className="text-neutral-500 mt-2">
            {isRedirect ? 'Faça login para continuar sua assinatura.' : 'Acesse sua conta para gerenciar seu rebanho.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 animate-in fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-neutral-700">Senha</label>
              {/* Fake link for now, could be an actual 'EsqueciSenha' page */}
              <button type="button" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Esqueceu?</button>
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-neutral-500">Ou continue com</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-semibold py-3 rounded-xl transition-all disabled:opacity-70"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 rounded-full" />
          Google
        </button>

        <p className="text-center text-sm text-neutral-500 mt-8">
          Ainda não tem uma conta?{' '}
          <Link to={`/cadastro${isRedirect ? '?redirect=/planos' : ''}`} className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
