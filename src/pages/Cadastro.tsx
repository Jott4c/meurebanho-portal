import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Cadastro() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const params = new URLSearchParams(location.search);
  const isRedirect = params.get('redirect') === '/planos';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Cadastro concluído (Supabase cria a account). 
      // Se houver trigger para criar profile, ótimo. Caso contrário, deveríamos criar aqui, 
      // mas no MeuRebanho normalmente há trigger. Vamos confiar na trigger do banco.

      if (data.session) {
        if (isRedirect) {
          navigate('/planos');
        } else {
          navigate('/');
        }
      } else {
        // Se a confirmação de e-mail estiver ativa, não terá session.
        setError('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${isRedirect ? '/planos' : '/app'}`,
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
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-neutral-100 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Crie sua conta</h1>
          <p className="text-neutral-500 mt-2">
            Comece a gerenciar seu rebanho agora mesmo.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className={`p-4 rounded-xl text-sm border animate-in fade-in
              ${error.includes('verifique seu e-mail') ? 'bg-green-50 ztext-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}
            `}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Completo</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="João da Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Celular / WhatsApp (Opcional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Senha</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Mínimo de 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Criar Conta Grátis'}
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

        <p className="text-center text-sm text-neutral-500 mt-6">
          Já tem conta?{' '}
          <Link to={`/login${isRedirect ? '?redirect=/planos' : ''}`} className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
