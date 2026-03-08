import { Link } from 'react-router-dom';
import { 
  WifiOff, Shield, BarChart3, MapPin, Users, Smartphone,
  ArrowRight, CheckCircle, Zap, Clock
} from 'lucide-react';
import logo from '../assets/icon.png';

const features = [
  {
    icon: WifiOff,
    title: 'Funciona Offline',
    description: 'Registre dados no campo mesmo sem internet. Sincroniza automaticamente quando reconectar.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Rastreabilidade PNIB',
    description: 'Preparado para o Plano Nacional de Identificação de Bovinos. Fique em conformidade.',
    color: 'text-primary-600',
    bg: 'bg-primary-50',
  },
  {
    icon: BarChart3,
    title: 'Manejo Inteligente',
    description: 'Controle sanitário, pesagens, reprodução e ocorrências em um só lugar.',
    color: 'text-secondary-600',
    bg: 'bg-secondary-50',
  },
  {
    icon: MapPin,
    title: 'Controle de Ponto GPS',
    description: 'Gerencie seus funcionários com registro de ponto e localização por GPS.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Users,
    title: 'Multi-Usuário',
    description: 'Adicione vaqueiros, veterinários e gerentes com permissões diferentes.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Smartphone,
    title: 'Simples de Usar',
    description: 'Interface pensada para o campo. Rápido, intuitivo e sem complicação.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

const stats = [
  { value: '100%', label: 'Offline First' },
  { value: '5+', label: 'Planos disponíveis' },
  { value: '24/7', label: 'Suporte WhatsApp' },
  { value: '0', label: 'Burocracia' },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* ================ HERO ================ */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* BG Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-secondary-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap size={16} />
                Gestão Pecuária Simplificada
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
                Seu rebanho na
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400"> palma da mão</span>
              </h1>
              
              <p className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
                Controle completo do seu rebanho, mesmo sem internet. 
                Manejo, rastreabilidade, reprodução e muito mais em um app simples e poderoso.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-2xl 
                             transition-all hover:shadow-xl hover:shadow-primary-600/25 hover:-translate-y-1 active:translate-y-0"
                >
                  Baixar Grátis
                  <ArrowRight size={20} />
                </a>
                <Link
                  to="/planos"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-2xl 
                             border border-neutral-200 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  Ver Planos
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-primary-500" /> Gratuito para começar</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-primary-500" /> Sem cartão de crédito</span>
              </div>
            </div>

            {/* Right — App Mockup */}
            <div className="relative animate-fade-in-up hidden lg:block">
              <div className="relative mx-auto w-72">
                {/* Phone Frame */}
                <div className="bg-neutral-900 rounded-[3rem] p-3 shadow-2xl shadow-neutral-900/30">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.4rem] overflow-hidden aspect-[9/19] flex flex-col items-center justify-center text-white p-8">
                    <img src={logo} alt="MeuRebanho" className="w-24 h-24 rounded-3xl mb-6 shadow-lg" />
                    <h3 className="text-2xl font-bold mb-2">MeuRebanho</h3>
                    <p className="text-primary-200 text-center text-sm">Gestão pecuária inteligente</p>
                    <div className="mt-8 grid grid-cols-2 gap-3 w-full">
                      {[
                        { icon: '🐂', text: 'Animais' },
                        { icon: '💉', text: 'Vacinas' },
                        { icon: '📊', text: 'Relatórios' },
                        { icon: '👥', text: 'Equipe' },
                      ].map((item) => (
                        <div key={item.text} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                          <span className="text-2xl">{item.icon}</span>
                          <p className="text-xs mt-1 text-primary-100">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -left-16 top-24 bg-white rounded-2xl shadow-xl p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <WifiOff size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Offline First</p>
                      <p className="text-xs text-neutral-500">Funciona sem internet</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-16 bottom-32 bg-white rounded-2xl shadow-xl p-4 animate-float-delay">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                      <Clock size={20} className="text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">Sync automático</p>
                      <p className="text-xs text-neutral-500">Dados sempre atualizados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================ STATS ================ */}
      <section className="py-16 bg-white border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-primary-600 mb-1">{stat.value}</p>
                <p className="text-sm text-neutral-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================ FEATURES ================ */}
      <section id="funcionalidades" className="py-20 lg:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Tudo que você precisa para
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400"> gerenciar seu rebanho</span>
            </h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Ferramentas modernas pensadas para o produtor rural. Do campo ao escritório.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="group bg-white rounded-2xl p-8 border border-neutral-100 hover:border-primary-200 
                           transition-all duration-300 hover:shadow-xl hover:shadow-primary-600/5 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6
                               group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={28} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================ CTA FINAL ================ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-12 lg:p-20 text-center overflow-hidden">
            {/* Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Comece a gerenciar seu rebanho agora
              </h2>
              <p className="text-primary-200 text-lg max-w-2xl mx-auto mb-10">
                Junte-se a produtores que já simplificaram a gestão da fazenda. Comece grátis, sem compromisso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 text-primary-700 font-bold rounded-2xl 
                             transition-all hover:shadow-xl hover:-translate-y-1 text-lg"
                >
                  Baixar para Android
                  <ArrowRight size={20} />
                </a>
                <Link
                  to="/planos"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500/30 hover:bg-primary-500/40 text-white font-semibold rounded-2xl 
                             border border-white/20 transition-all hover:-translate-y-1 text-lg"
                >
                  Ver Planos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
