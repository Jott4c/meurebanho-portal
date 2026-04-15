import { useState } from 'react';
import { 
  CheckCircle, Star, Sparkles, Zap, Crown, 
  Shield, Rocket, Infinity, ChevronRight, TrendingUp, RotateCcw
} from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PlanTier = 'free' | 'basic' | 'professional' | 'farm' | 'unlimited';

interface Plan {
  id: PlanTier;
  name: string;
  monthlyPrice: number;
  subtitle: string;
  features: string[];
  recommended?: boolean;
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
  badgeColor: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    monthlyPrice: 0,
    subtitle: 'Para começar',
    icon: <Shield size={24} />,
    gradient: 'from-neutral-400 to-neutral-500',
    accentColor: 'text-neutral-500',
    badgeColor: 'bg-neutral-100 text-neutral-600',
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
    icon: <Zap size={24} />,
    gradient: 'from-blue-500 to-cyan-400',
    accentColor: 'text-blue-500',
    badgeColor: 'bg-blue-50 text-blue-600',
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
    icon: <Rocket size={24} />,
    gradient: 'from-primary-500 to-emerald-400',
    accentColor: 'text-primary-600',
    badgeColor: 'bg-primary-50 text-primary-700',
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
    icon: <Crown size={24} />,
    gradient: 'from-amber-500 to-orange-400',
    accentColor: 'text-amber-600',
    badgeColor: 'bg-amber-50 text-amber-700',
    features: [
      'Até 1.000 animais',
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
    icon: <Infinity size={24} />,
    gradient: 'from-violet-600 to-purple-400',
    accentColor: 'text-violet-600',
    badgeColor: 'bg-violet-50 text-violet-700',
    features: [
      'Animais ilimitados',
      'Usuários ilimitados',
      'API de Integração',
      'Consultoria de implantação',
      'Gestor de conta dedicado',
    ],
  },
];

const PLAN_ORDER: PlanTier[] = ['free', 'basic', 'professional', 'farm', 'unlimited'];

export default function Planos() {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const navigate = useNavigate();
  const { refreshProfile, profile, planBillingCycle, planExpirationDate } = useAuth();

  const currentPlan = (profile?.plan || 'free') as PlanTier;
  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);

  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  const roundToX9 = (value: number): number => {
    return Math.ceil((value + 1) / 10) * 10 - 1;
  };

  const calculatePrices = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return { current: 0, original: null, monthlyEquivalent: 0, savings: 0 };
    
    if (billingCycle === 'month') {
      return { current: monthlyPrice, original: null, monthlyEquivalent: monthlyPrice, savings: 0 };
    } else {
      const fullAnnual = monthlyPrice * 12;
      const currentAnnual = roundToX9(fullAnnual * 0.8);
      return { 
        current: currentAnnual, 
        original: fullAnnual, 
        monthlyEquivalent: Math.round(currentAnnual / 12),
        savings: fullAnnual - currentAnnual,
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
      navigate('/cadastro');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/[0.06] rounded-full border border-white/[0.08] backdrop-blur-sm mb-8 animate-fade-in">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-300 tracking-wide">
              Mais de 2.000 fazendas já usam o MeuRebanho
            </span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-white mb-6 animate-fade-in">
            Escolha o plano{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-300 to-primary-400">
                ideal
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8C50 2 150 2 198 8" stroke="url(#underlineGrad)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="underlineGrad" x1="0" y1="0" x2="200" y2="0">
                    <stop stopColor="#4ADE80" />
                    <stop offset="1" stopColor="#22C55E" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br/>
            para sua fazenda
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-12 animate-fade-in">
            Comece grátis e escale conforme seu rebanho cresce.
            <br className="hidden sm:block" />
            Sem fidelidade. Cancele quando quiser.
          </p>

          {/* ── Billing Toggle ── */}
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="relative flex bg-white/[0.06] p-1 rounded-2xl border border-white/[0.08] backdrop-blur-sm">
              {/* Slider indicator */}
              <div 
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-lg transition-transform duration-300 ease-out"
                style={{ transform: billingCycle === 'year' ? 'translateX(calc(100% + 8px))' : 'translateX(0)' }}
              />
              <button
                onClick={() => setBillingCycle('month')}
                className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${
                  billingCycle === 'month' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('year')}
                className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${
                  billingCycle === 'year' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Anual
              </button>
            </div>

            {/* Savings badge */}
            <div className={`flex items-center gap-1.5 transition-all duration-300 ${
              billingCycle === 'year' 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}>
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">
                Economize até 20% com o plano anual
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans Grid ── */}
      <section className="relative pb-28 -mt-4 z-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {PLANS.map((plan, index) => {
              const prices = calculatePrices(plan.monthlyPrice);
              const planIndex = PLAN_ORDER.indexOf(plan.id);
              const isSameTier = plan.id === currentPlan;
              const isLowerTier = planIndex < currentPlanIndex;
              const isHigherTier = planIndex > currentPlanIndex;
              // Plano gratuito nunca é "current" — é o estado padrão do app
              const hasPaidPlan = currentPlan !== 'free';
              const isCurrent = hasPaidPlan && isSameTier && billingCycle === planBillingCycle;
              const isUpgradeToAnnual = hasPaidPlan && isSameTier && planBillingCycle === 'month' && billingCycle === 'year';
              const isDowngradeToMonthly = hasPaidPlan && isSameTier && planBillingCycle === 'year' && billingCycle === 'month';
              const isBlocked = hasPaidPlan && (isLowerTier || isDowngradeToMonthly);
              
              return (
                <div
                  key={plan.id}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Recommended glow ring */}
                  {plan.recommended && (isHigherTier || isUpgradeToAnnual || (!isSameTier && !isBlocked)) && (
                    <div className="absolute -inset-[2px] bg-gradient-to-b from-primary-400 via-emerald-400 to-primary-600 rounded-[28px] opacity-60 blur-[1px]" />
                  )}

                  {/* Current plan glow ring */}
                  {isCurrent && (
                    <div className="absolute -inset-[2px] bg-gradient-to-b from-emerald-300 to-emerald-600 rounded-[28px] opacity-50 blur-[1px]" />
                  )}

                  <div
                    className={`relative h-full rounded-[26px] p-6 lg:p-7 flex flex-col transition-all duration-500
                      ${isCurrent 
                        ? 'bg-neutral-900 border border-emerald-500/30'
                        : plan.recommended && !isBlocked
                          ? 'bg-neutral-900 border border-primary-500/20'
                          : isBlocked 
                            ? 'bg-neutral-900/60 border border-white/[0.04] opacity-50'
                            : 'bg-neutral-900 border border-white/[0.06] hover:border-white/[0.12]'
                      }
                      ${!isBlocked && !isCurrent ? 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20' : ''}`}
                  >
                    {/* ── Top Badges ── */}
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/25 whitespace-nowrap">
                          <CheckCircle size={11} />
                          PLANO ATUAL
                        </span>
                      </div>
                    )}
                    {!isCurrent && plan.recommended && !isBlocked && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary-500/25 whitespace-nowrap">
                          <Star size={11} fill="currentColor" />
                          MAIS POPULAR
                        </span>
                      </div>
                    )}

                    {/* ── Icon + Name ── */}
                    <div className="flex items-start gap-3 mb-5 mt-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg flex-shrink-0`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{plan.name}</h3>
                        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{plan.subtitle}</p>
                      </div>
                    </div>

                    {/* ── Price ── */}
                    <div className="mb-6">
                      {prices.original && (
                        <p className="text-neutral-500 text-sm line-through mb-0.5">
                          R$ {prices.original.toLocaleString('pt-BR')}
                        </p>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-neutral-400 text-sm font-semibold">R$</span>
                        <span className="text-4xl font-black text-white tracking-tight">
                          {prices.current.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-neutral-500 text-sm font-medium">
                          {plan.monthlyPrice === 0 ? '' : billingCycle === 'month' ? '/mês' : '/ano'}
                        </span>
                      </div>

                      {billingCycle === 'year' && plan.monthlyPrice > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            ≈ R$ {prices.monthlyEquivalent}/mês
                          </span>
                          {prices.savings > 0 && (
                            <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md">
                              −R$ {prices.savings}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {plan.monthlyPrice === 0 && (
                        <p className="text-neutral-500 text-xs font-medium mt-1">Para sempre</p>
                      )}
                    </div>

                    {/* ── Divider ── */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-5" />

                    {/* ── Features ── */}
                    <ul className="space-y-3 mb-7 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle size={15} className={`flex-shrink-0 mt-0.5 ${
                            isBlocked ? 'text-neutral-600' : plan.accentColor
                          }`} />
                          <span className={`text-xs font-medium leading-relaxed ${
                            isBlocked ? 'text-neutral-600' : 'text-neutral-300'
                          }`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* ── CTA Button ── */}
                    {isCurrent ? (
                      <div className="w-full flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 cursor-default">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                          <CheckCircle size={15} />
                          Seu Plano Atual
                        </div>
                        {planExpirationDate && (
                          <div className="text-[10px] text-emerald-500/80 font-medium">
                            Válido até {formatExpirationDate(planExpirationDate)}
                          </div>
                        )}
                      </div>
                    ) : isBlocked ? (
                      <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/[0.03] text-neutral-600 cursor-default">
                        {isLowerTier ? 'Incluso no seu plano' : 'Indisponível'}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribeClick(plan)}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 
                          ${plan.recommended
                            ? 'bg-gradient-to-r from-primary-500 to-emerald-500 hover:from-primary-400 hover:to-emerald-400 text-white shadow-lg shadow-primary-500/20 active:scale-[0.97]'
                            : plan.monthlyPrice === 0
                              ? 'bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 border border-white/[0.08] active:scale-[0.97]'
                              : 'bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.08] active:scale-[0.97]'
                          }`}
                      >
                        {isUpgradeToAnnual 
                          ? 'Mudar para Anual' 
                          : currentPlan !== 'free' 
                            ? 'Fazer Upgrade' 
                            : plan.monthlyPrice === 0 
                              ? 'Começar Grátis' 
                              : 'Assinar Agora'}
                        <ChevronRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Trust Signals ── */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-neutral-500 animate-fade-in">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary-500" />
              <span className="text-xs font-semibold">Pagamento seguro via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-500" />
              <span className="text-xs font-semibold">Sem fidelidade ou multa</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary-500" />
              <span className="text-xs font-semibold">Ativação instantânea</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-primary-500" />
              <span className="text-xs font-semibold">Garantia total de 7 dias ou seu dinheiro de volta</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Perguntas frequentes</h2>
          
          <div className="space-y-4">
            {[
              { q: 'Posso mudar de plano a qualquer momento?', a: 'Sim! Você pode fazer upgrade a qualquer momento. Seu novo plano é ativado imediatamente e a cobrança começa do dia da mudança.' },
              { q: 'Como funciona o plano anual?', a: 'O plano anual oferece 20% de desconto. O valor total é cobrado uma única vez e renova automaticamente após 12 meses.' },
              { q: 'Existe fidelidade ou multa de cancelamento?', a: 'Não. Você pode cancelar seu plano a qualquer momento, sem taxas ou multas. O acesso continua até o fim do período pago.' },
              { q: 'Como funciona a garantia de 7 dias?', a: 'Segundo o Art. 49 do CDC, se você assinar e não gostar, pode cancelar a assinatura diretamente nas suas Configurações até 7 dias após a compra, e o estorno total do valor é feito automaticamente na mesma hora. Risco zero!' },
              { q: 'Como funciona o suporte?', a: 'Todos os planos pagos incluem suporte via WhatsApp. Os planos Fazenda e Ilimitado contam com suporte prioritário e atendimento dedicado.' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-semibold text-neutral-200">{faq.q}</span>
                  <ChevronRight size={16} className="text-neutral-500 transition-transform group-open:rotate-90 flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-neutral-400 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Checkout Modal ── */}
      {selectedPlan && (
        <CheckoutModal 
          plan={selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
          onRefreshProfile={refreshProfile}
          onSuccess={() => {
            setSelectedPlan(null);
            navigate('/app/dashboard');
          }} 
        />
      )}
    </div>
  );
}
