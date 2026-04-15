import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    // 0. Immediate Check for Hash Errors or Token
    const checkHash = async () => {
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            
            // Check for Errors sent by Supabase
            const errorDesc = params.get('error_description');
            const error = params.get('error');
            if (error || errorDesc) {
                setError(`Erro do Login: ${errorDesc ? errorDesc.replace(/\+/g, ' ') : error}`);
                return;
            }

            // Check for Tokens manually (if listeners fail)
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
                 const { data } = await supabase.auth.setSession({
                     access_token: accessToken,
                     refresh_token: refreshToken
                 });
                 if (data.session) {
                     setSession(data.session);
                     setError('');
                 }
            }
        }
    };
    checkHash();

    // 1. Listen for Auth Changes (URL parsing happens here)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        if (session) {
            setError(''); // Clear any timeout errors if session arrives
        }
      }
    });

    // 2. Set a timeout to show error if session never arrives
    const timer = setTimeout(async () => {
        if (!mounted) return;
        
        // Double check strictly against current session state via API
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
            // Manual fallback: Check if we have hash params but supabase didn't catch them
            const hash = window.location.hash;
            
            if (hash && hash.includes('access_token')) {
                 // Convert hash to keys
                 const params = new URLSearchParams(hash.substring(1)); // remove #
                 const accessToken = params.get('access_token');
                 const refreshToken = params.get('refresh_token');

                 if (accessToken && refreshToken) {
                     const { data } = await supabase.auth.setSession({
                         access_token: accessToken,
                         refresh_token: refreshToken
                     });
                     if (data.session) {
                         setSession(data.session);
                         setError('');
                         return; 
                     }
                 }
            }

            setError('Não foi possível verificar o link. (Timeout)');
        }
    }, 4000); // Wait 4 seconds for hash parsing

    return () => {
        mounted = false;
        subscription.unsubscribe();
        clearTimeout(timer);
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      // Mark invite as accepted
      const userId = session?.user?.id;
      if (userId) {
        // Update employee invite_status
        await supabase
          .from('employees')
          .update({ invite_status: 'accepted', user_id: userId })
          .eq('email', session.user.email)
          .in('invite_status', ['pending', 'sent']);

        // Update invite record
        await supabase
          .from('invites')
          .update({ status: 'accepted' })
          .eq('invited_email', session.user.email)
          .in('status', ['pending', 'sent']);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Senha Definida!</h1>
          <p className="text-neutral-500 mb-8">
            Sua conta está pronta. Agora você pode entrar no aplicativo usando sua nova senha.
          </p>

          <a 
            href="meurebanho://"
            className="block w-full bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Abrir Aplicativo
          </a>
        </div>
      </div>
    );
  }

  if (!session) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
             <div className="text-center">
                {error ? (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <p className="text-neutral-900 font-bold mb-2">Ops!</p>
                        <p className="text-neutral-500">{error}</p>
                    </>
                ) : (
                    <>
                        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-neutral-500">Verificando link de convite...</p>
                    </>
                )}
             </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary-50 p-6 text-center border-b border-primary-100">
          <h2 className="text-2xl font-bold text-primary-900">Definir Senha</h2>
          <p className="text-primary-700 mt-1">Crie uma senha para acessar sua conta</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleUpdatePassword}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Repita a senha"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
              >
                {loading ? 'Salvando...' : 'Definir Senha e Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
