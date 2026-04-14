import { useState } from 'react';
import { CheckCircle, ArrowRight, Star, Sparkles } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type PlanTier = 'free' | 'basic' | 'professional' | 'farm' | 'unlimited';

interface Plan {
  id: PlanTier;
  name: string;
  monthlyPrice: number;
  subtitle: string;
  features: string[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    monthlyPrice: 0,
    subtitle: 'Para começar',
    features: [
      'Até 30 animais',
      '1 usuário',
      'Controle básico de rebanho',
      'Alertas de vacinação',
    ],
  },
  {
    id: 'basic',
    name: 'Básico',
    monthlyPrice: 29,
    subtitle: 'Para pequenos produtores',
    features: [
      'Até 100 animais',
      '1 usuário (Dono)',
      'Todos os recursos do Gratuito',
      'Relatórios em PDF',
      'Suporte via WhatsApp',
    ],
  },
  {
    id: 'professional',
    name: 'Profissional',
    monthlyPrice: 59,
    subtitle: 'Para quem está crescendo',
    features: [
      'Até 300 animais',
      'Até 3 usuários',
      'Controle de Ponto (GPS)',
      'Gestão Financeira Básica',
      'Múltiplas Propriedades',
    ],
    recommended: true,
  },
  {
    id: 'farm',
    name: 'Fazenda',
    monthlyPrice: 99,
    subtitle: 'Gestão completa',
    features: [
      'Até 1000 animais',
      'Até 10 usuários',
      'Controle Financeiro Avançado',
      'Importação de planilhas',
      'Prioridade no Suporte',
    ],
  },
  {
    id: 'unlimited',
    name: 'Ilimitado',
    monthlyPrice: 199,
    subtitle: 'Sem limites',
    features: [
      'Animais ilimitados',
      'Usuários ilimitados',
      'API de Integração',
      'Consultoria de implantação',
      'Gestor de conta dedicado',
    ],
  },
];

export default function Planos() {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const navigate = useNavigate();

  const calculatePrices = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return { current: 0, original: 0, monthlyEquivalent: 0 };
    
    if (billingCycle === 'month') {
      return { 
        current: monthlyPrice, 
        original: null, 
        monthlyEquivalent: monthlyPrice 
      };
    } else {
      const fullAnnual = monthlyPrice * 12;
      // Formula: floor((Monthly * 12 * 0.8) / 10) * 10 + 9.90
      const baseAnnual = fullAnnual * 0.8;
      const currentAnnual = Math.floor(baseAnnual / 10) * 10 + 9.90;
      
      return { 
        current: currentAnnual, 
        original: fullAnnual, 
        monthlyEquivalent: currentAnnual / 12 
      };
    }
  };

  const handleSubscribeClick = async (plan: Plan) => {
    const prices = calculatePrices(plan.monthlyPrice);
    if (plan.monthlyPrice > 0) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login?redirect=/planos');
        return;
      }
      setSelectedPlan({
        id: plan.id,
        name: plan.name,
        price: prices.current,
        billingCycle: billingCycle
      });
    } else {
      window.open("https://play.google.com/store", "_blank");
    }
  };

  return (
    <div className="pt-20 pb-20 animate-in fade-in duration-500">
      {/* Hero with Glassmorphism */}
      <section className="py-20 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full -ml-48 -mb-48 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md mb-4">
            <Sparkles size={16} className="text-primary-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sua fazenda no próximo nível</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-4">
            Planos que cabem no seu <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">agronegócio</span>
          </h1>
          <p className="text-neutral-400 font-bold max-w-2xl mx-auto uppercase tracking-widest text-xs">
            Comece grátis e escale conforme seu rebanho cresce. <br/>Sem fidelidade, sem burocracia.
          </p>

          {/* Billing Toggle */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-lg">
              <button
                onClick={() => setBillingCycle('month')}
                className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  billingCycle === 'month' ? 'bg-white text-neutral-900 shadow-xl' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('year')}
                className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all relative ${
                  billingCycle === 'year' ? 'bg-white text-neutral-900 shadow-xl' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Anual
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black animate-bounce shadow-lg shadow-emerald-500/20">
                  20% OFF
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-20 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
            {PLANS.map((plan) => {
              const prices = calculatePrices(plan.monthlyPrice);
              
              return (
                <div
                  key={plan.id}
                  className={`group relative bg-white rounded-[2.5rem] p-6 lg:p-8 border-2 transition-all duration-500 flex flex-col h-full
                    ${plan.recommended 
                      ? 'border-primary-500 shadow-2xl shadow-primary-500/20 scale-105 z-10' 
                      : 'border-neutral-100 hover:border-primary-200 hover:shadow-xl'
                    }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 bg-primary-600 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-xl uppercase tracking-widest">
                        <Star size={12} fill="currentColor" />
                        Recomendado
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-black text-neutral-900 mb-1">{plan.name}</h3>
                    <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest">{plan.subtitle}</p>
                  </div>

                  <div className="mb-8 flex flex-col justify-end min-h-[100px]">
                    {prices.original && (
                      <p className="text-neutral-400 font-bold text-sm line-through decoration-red-500/50 decoration-2 mb-1">
                        R$ {prices.original.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-lg font-black text-neutral-900 tracking-tight">R$</span>
                      <span className={`${billingCycle === 'year' ? 'text-4xl' : 'text-5xl'} font-black text-neutral-900 tracking-tighter`}>
                        {billingCycle === 'month' ? prices.current : prices.current.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </span>
                      {billingCycle === 'year' && (
                        <span className="text-lg font-black text-neutral-900">,90</span>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-2 px-1">
                      {billingCycle === 'month' ? '/ mês' : '/ ano'}
                    </p>
                    {billingCycle === 'year' && plan.monthlyPrice > 0 && (
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-2 bg-emerald-50 py-1 px-3 rounded-full w-fit">
                        Equivale a R$ {prices.monthlyEquivalent.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} /mês
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="p-1 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-all">
                          <CheckCircle size={14} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-bold text-neutral-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribeClick(plan)}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all
                      ${plan.recommended
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-xl shadow-neutral-900/20 active:scale-95'
                        : plan.monthlyPrice === 0
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 active:scale-95'
                          : 'bg-primary-50 hover:bg-primary-100 text-primary-700 active:scale-95 border border-primary-100'
                      }`}
                  >
                    {plan.monthlyPrice === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal 
          plan={selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
          onSuccess={() => {
            setSelectedPlan(null);
            navigate('/app/dashboard');
          }} 
        />
      )}
    </div>
  );
}
