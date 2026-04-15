import { useState } from 'react';
import { X, CreditCard, Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51T8iuGHYv4RakNi3XKKWsdV7upUk13OeEoatObOMO0H5pr5OtfLXZsre2GR67ld2k0ItVc75kPEP5Iztxi2eTfXF00LRYYcrRh';
const stripePromise = loadStripe(stripePublicKey);

interface CheckoutModalProps {
  plan: { id: string; name: string; price: number; billingCycle: 'month' | 'year' };
  onClose: () => void;
  onSuccess: () => void;
  onRefreshProfile?: () => Promise<void>;
}

function CheckoutForm({ plan, onClose, onSuccess, onRefreshProfile }: CheckoutModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Erro ao carregar o campo de cartão');

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name, email },
      });

      if (stripeError) throw new Error(stripeError.message);

      const response = await supabase.functions.invoke('stripe-create-subscription', {
        body: {
          plan_slug: plan.id,
          billing_cycle: plan.billingCycle,
          payment_method_id: paymentMethod.id,
          customer: { name, email },
        },
      });

      if (response.error) {
        let errorMessage = 'Erro no servidor';
        try {
          const errorBody = await response.error.context.json();
          if (errorBody?.error) errorMessage = errorBody.error;
        } catch (e) {
          errorMessage = response.error.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const { data } = response;
      if (data && data.success === false) throw new Error(data.error || 'Erro no processamento');
      
      if (data?.client_secret && (data.status === 'incomplete' || data.status === 'requires_action')) {
         const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret);
         if (confirmError) throw new Error(confirmError.message);
      }

      // Refresh the user profile to pick up the new plan
      if (onRefreshProfile) {
        await onRefreshProfile();
      }

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const isAnnual = plan.billingCycle === 'year';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col border border-neutral-100">
        
        <div className="flex items-center justify-between p-8 border-b border-neutral-50 bg-neutral-50/30">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isAnnual ? 'bg-emerald-100 text-emerald-600' : 'bg-primary-100 text-primary-600'}`}>
              {isAnnual ? <Zap size={24} strokeWidth={2.5} /> : <CreditCard size={24} strokeWidth={2.5} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 leading-tight">Plano {plan.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-neutral-900 tracking-tighter">
                  R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-neutral-100 shadow-sm">
                  {isAnnual ? 'Cobrança Anual' : 'Cobrança Mensal'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-neutral-400 hover:text-neutral-900 rounded-2xl hover:bg-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === 'success' ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-50">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center shadow-inner ring-8 ring-emerald-50/50">
                <CheckCircle2 size={48} strokeWidth={2.5} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-neutral-900">Uau! Assinatura Ativada</h3>
                <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
                  Seu plano {plan.name} já está validado na base Stripe.
                </p>
              </div>
              <button
                onClick={onSuccess}
                className="w-full py-5 bg-neutral-900 hover:bg-neutral-800 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-neutral-900/20 transition-all active:scale-95"
              >
                COMEÇAR AGORA
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-wider border border-red-100 animate-in shake duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                 {/* Identity Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck size={14} /> Dados do Titular
                  </h4>
                  <div className="space-y-4">
                    <input 
                      required 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Nome Completo" 
                      className="w-full px-6 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all" 
                    />
                    <input 
                      required 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="E-mail" 
                      className="w-full px-6 py-4 bg-neutral-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all" 
                    />
                  </div>
                </div>

                {/* Card Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 text-primary-600">
                    <CreditCard size={14} /> Dados do Cartão
                  </h4>
                  <div className="p-5 border-2 border-neutral-50 rounded-2xl bg-white shadow-inner focus-within:border-primary-500 transition-all">
                    <CardElement 
                      options={{
                        style: {
                          base: { fontSize: '14px', color: '#171717', fontWeight: 'bold', fontFamily: 'Inter, system-ui, sans-serif' },
                          invalid: { color: '#ef4444' },
                        },
                        hidePostalCode: false
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || !stripe}
                  className="w-full flex items-center justify-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white font-black py-5 rounded-[1.5rem] text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-2xl shadow-neutral-900/40 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      CONFIRMAR ASSINATURA R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}{isAnnual ? ',90' : ''}
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-4 py-2 opacity-50">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                   <div className="h-4 w-px bg-neutral-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Ambiente Criptografado</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutModalWrapper(props: CheckoutModalProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
