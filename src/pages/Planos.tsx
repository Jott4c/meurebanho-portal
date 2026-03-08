// Planos page
import { CheckCircle, ArrowRight, Star } from 'lucide-react';

type PlanTier = 'free' | 'basic' | 'professional' | 'farm' | 'unlimited';

interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  subtitle: string;
  features: string[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
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
    price: 29,
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
    price: 59,
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
    price: 99,
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
    price: 199,
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
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
            Planos que cabem no seu
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400"> bolso</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Comece grátis e escale conforme seu rebanho cresce. Cancele a qualquer momento, sem fidelidade.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                  ${plan.recommended 
                    ? 'border-primary-500 shadow-lg shadow-primary-600/10 scale-105 z-10' 
                    : 'border-neutral-100 hover:border-primary-200'
                  }`}
              >
                {/* Badge Recomendado */}
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      <Star size={12} fill="currentColor" />
                      RECOMENDADO
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-neutral-900">{plan.name}</h3>
                  <p className="text-sm text-neutral-500">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-neutral-400">R$</span>
                    <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                    <span className="text-sm text-neutral-400">/mês</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-primary-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
                    ${plan.recommended
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg'
                      : plan.price === 0
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        : 'bg-primary-50 hover:bg-primary-100 text-primary-700'
                    }`}
                >
                  {plan.price === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                  <ArrowRight size={16} />
                </a>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-neutral-400 mt-12">
            Todos os planos incluem atualizações gratuitas e acesso ao app. Cancele a qualquer momento.
          </p>
        </div>
      </section>

      {/* FAQ Mini */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">Perguntas Frequentes</h2>
          <div className="space-y-6">
            {[
              { q: 'Posso trocar de plano a qualquer momento?', a: 'Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser, sem multa ou fidelidade.' },
              { q: 'Como funciona o pagamento?', a: 'O pagamento é mensal, feito pelo nosso portal seguro. Aceitamos cartão de crédito e PIX.' },
              { q: 'Meus dados são perdidos se eu cancelar?', a: 'Não. Seus dados ficam salvos por 90 dias após o cancelamento. Você pode exportar tudo antes de cancelar.' },
              { q: 'Funciona sem internet?', a: 'Sim! O app funciona 100% offline. Os dados sincronizam automaticamente quando você se reconectar.' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50 transition-colors">
                  <span className="font-semibold text-neutral-900">{faq.q}</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-5 pb-5 text-neutral-600 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
