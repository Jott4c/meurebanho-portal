import { useState } from 'react';
import { X, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Inicializa a chave de homologação (Test Mode) do Stripe fornecida no prompt
const stripePromise = loadStripe('pk_test_51T8iuGHYv4RakNi3XKKWsdV7upUk13OeEoatObOMO0H5pr5OtfLXZsre2GR67ld2k0ItVc75kPEP5Iztxi2eTfXF00LRYYcrRh');

interface CheckoutModalProps {
  plan: { id: string; name: string; price: number };
  onClose: () => void;
  onSuccess: () => void;
}

function CheckoutForm({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Campos brutos minimalistas (o Stripe cuida da segurança dos dados do cartão e CEP)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Você precisa estar logado. Feche o modal e faça login.');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Erro ao carregar o campo de cartão');

      // 1. Criar o PaymentMethod usando o Stripe SDK (Garante PCI-compliance, o dado do cartão nem passa pelo nosso JS)
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: name,
          email: email,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Dados do cartão inválidos fornecidos para a Stripe');
      }

      // 2. Chamar nossa Edge Function com o ID estritamente cego gerado (Token Seguro)
      const response = await supabase.functions.invoke('stripe-create-subscription', {
        body: {
          plan_slug: plan.id,
          payment_method_id: paymentMethod.id,
          customer: {
            name: name,
            email: email,
          },
        },
      });

      if (response.error) {
        // O Supabase SDK retorna o erro da função aqui.
        // Tentamos extrair a mensagem de erro detalhada que enviamos no corpo da resposta 400.
        let errorMessage = 'Erro ao processar assinatura no servidor Supabase';
        
        try {
          // Em caso de erro HTTP (ex: 400), o corpo da resposta está disponível
          const errorBody = await response.error.context.json();
          if (errorBody?.error) errorMessage = errorBody.error;
          if (errorBody?.details) errorMessage += ` (${errorBody.details})`;
        } catch (e) {
          errorMessage = response.error.message || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const { data } = response;
      
      // Se a função retornou 200 mas com success: false (nosso tratamento de erro customizado)
      if (data && data.success === false) {
        let errorMsg = data.error || 'Erro interno no processamento da assinatura';
        if (data.details) errorMsg += ` - Detalhes: ${data.details}`;
        throw new Error(errorMsg);
      }
      
      // Validação Extra Exigida pelo Banco do Cliente (ex: 3D Secure / Confirmação OTP do App do Banco)
      if (data?.client_secret && (data.status === 'incomplete' || data.status === 'requires_action')) {
         console.log('Confirmação adicional necessária (3D Secure, etc)...');
         const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret);
         if (confirmError) throw new Error(confirmError.message);
      }

      setStep('success');
    } catch (err: any) {
      console.error('Erro detalhado no Checkout:', err);
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm';
  const labelClass = 'block text-sm font-medium text-neutral-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Assinar Plano {plan.name}</h2>
            <p className="text-sm text-neutral-500">R$ {plan.price}/mês • Cartão de Crédito</p>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'success' ? (
          <div className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 text-center">Assinatura Ativada!</h3>
            <p className="text-center text-neutral-600 px-4">
              Seu plano {plan.name} está ativo. Seu acesso já foi liberado na base Stripe!
            </p>
            <button
              onClick={onSuccess}
              className="w-full mt-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
            >
              Acessar Módulo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-2">Dados do Titular</legend>
              <div>
                <label className={labelClass}>Nome Completo</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João da Silva" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="joao@fazenda.com" className={inputClass} />
              </div>
            </fieldset>

            <fieldset className="space-y-3 mt-4">
              <legend className="flex items-center gap-2 text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-2">
                <CreditCard size={16} /> Detalhes do Pagamento
              </legend>
              {/* O CardElement nativo do Stripe já renderiza campos formatados localizados, CVV oculto, e o Postal Code nativo (substitui nossa lógica gigante de ViaCEP e Endereços extensos) */}
              <div className="p-[14px] border border-neutral-300 rounded-xl bg-white shadow-sm hover:border-primary-400 transition-colors">
                <CardElement 
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        fontFamily: 'system-ui, sans-serif',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                    hidePostalCode: false // Mantemos true e ele usa o CEP automaticamente pro Antifraude do Stripe blindar chargebacks
                  }} 
                />
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={loading || !stripe}
              className="w-full flex items-center justify-center gap-2 mt-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                `Assinar de forma segura (R$ ${plan.price})`
              )}
            </button>

            <p className="text-xs text-center text-neutral-400 mt-4 flex items-center justify-center gap-2">
              Processado em ambiente de segurança <strong>Stripe PCI Nível 1</strong>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// Wrapper do CheckoutModal que provê o contexto do Stripe para os sub-componentes "Stripe Elements" dentro dele
export default function CheckoutModalWrapper(props: CheckoutModalProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
