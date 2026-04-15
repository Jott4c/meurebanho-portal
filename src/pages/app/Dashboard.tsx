import { useDashboard } from '../../hooks/useDashboard'
import {
  Beef,
  Syringe,
  AlertTriangle,
  Users,
  ArrowRight,
  ShieldCheck,
  Zap,
  Crown,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import LoadingSpinner from '../../components/LoadingSpinner'

type PlanTier = 'free' | 'basic' | 'professional' | 'farm' | 'unlimited'

const PLAN_CONFIG: Record<PlanTier, {
  label: string
  color: string
  bg: string
  border: string
  gradient: string
  icon: any
  maxAnimals: number | null
  maxUsers: number | null
}> = {
  free:         { label: 'Gratuito',      color: 'text-neutral-600',   bg: 'bg-neutral-100',  border: 'border-neutral-200', gradient: 'from-neutral-500 to-neutral-700',     icon: Star,  maxAnimals: 30,   maxUsers: 1 },
  basic:        { label: 'Básico',        color: 'text-blue-700',      bg: 'bg-blue-50',      border: 'border-blue-200',    gradient: 'from-blue-500 to-blue-700',          icon: Star,  maxAnimals: 100,  maxUsers: 1 },
  professional: { label: 'Profissional',  color: 'text-purple-700',    bg: 'bg-purple-50',    border: 'border-purple-200',  gradient: 'from-purple-500 to-purple-700',      icon: Zap,   maxAnimals: 300,  maxUsers: 3 },
  farm:         { label: 'Fazenda',       color: 'text-emerald-700',   bg: 'bg-emerald-50',   border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-700',    icon: Zap,   maxAnimals: 1000, maxUsers: 10 },
  unlimited:    { label: 'Ilimitado',     color: 'text-amber-700',     bg: 'bg-amber-50',     border: 'border-amber-200',   gradient: 'from-amber-400 to-orange-500',       icon: Crown, maxAnimals: null, maxUsers: null },
}

function PlanBanner({ totalAnimais, funcionariosAtivos, plan }: { totalAnimais: number; funcionariosAtivos: number; plan: PlanTier }) {

  const cfg = PLAN_CONFIG[plan]
  const Icon = cfg.icon
  const isUnlimited = plan === 'unlimited'
  const { planExpirationDate } = useAuth()

  const animalPct = cfg.maxAnimals ? Math.min(100, Math.round((totalAnimais / cfg.maxAnimals) * 100)) : 0
  const userPct   = cfg.maxUsers   ? Math.min(100, Math.round((funcionariosAtivos / cfg.maxUsers) * 100)) : 0

  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  return (
    <div className={`rounded-2xl border ${cfg.border} overflow-hidden`}>
      <div className={`bg-gradient-to-r ${cfg.gradient} p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">Seu plano atual</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-black tracking-tight">{cfg.label}</p>
              {plan !== 'free' && planExpirationDate && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                  Válido até {formatExpirationDate(planExpirationDate)}
                </span>
              )}
            </div>
          </div>
        </div>
        {!isUnlimited && (
          <Link
            to="/planos"
            className="flex items-center gap-2 bg-white text-neutral-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow-md whitespace-nowrap self-start sm:self-auto"
          >
            <Zap size={15} className="text-amber-500" />
            Fazer Upgrade
          </Link>
        )}
      </div>

      {!isUnlimited && (
        <div className="bg-white px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Animais */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-neutral-600">Animais cadastrados</span>
              <span className={`text-xs font-bold ${animalPct >= 90 ? 'text-red-600' : 'text-neutral-700'}`}>
                {totalAnimais} / {cfg.maxAnimals}
              </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  animalPct >= 90 ? 'bg-red-500' : animalPct >= 70 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${animalPct}%` }}
              />
            </div>
            {animalPct >= 90 && (
              <p className="text-xs text-red-600 mt-1">⚠️ Limite quase atingido — considere um upgrade</p>
            )}
          </div>

          {/* Equipe */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-neutral-600">Usuários na equipe</span>
              <span className={`text-xs font-bold ${userPct >= 90 ? 'text-red-600' : 'text-neutral-700'}`}>
                {funcionariosAtivos} / {cfg.maxUsers}
              </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  userPct >= 90 ? 'bg-red-500' : userPct >= 70 ? 'bg-amber-400' : 'bg-blue-500'
                }`}
                style={{ width: `${userPct}%` }}
              />
            </div>
            {cfg.maxUsers === 1 && (
              <p className="text-xs text-neutral-500 mt-1">Equipe disponível a partir do plano Profissional</p>
            )}
          </div>
        </div>
      )}

      {isUnlimited && (
        <div className="bg-white px-5 py-3 text-sm text-neutral-500 flex items-center gap-2">
          <Crown size={14} className="text-amber-500" />
          Animais, usuários e propriedades ilimitados — sem restrições.
        </div>
      )}
    </div>
  )
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#6366f1', '#ec4899', '#8b5cf6']

function DashboardCard({ title, value, icon: Icon, colorClass, linkTo }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-neutral-500 font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={colorClass} size={20} />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-neutral-900">{value}</h3>
      </div>
      {linkTo && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <Link to={linkTo} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors w-fit">
            Ver detalhes <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard()
  const { profile } = useAuth()

  if (isLoading) {
    return <LoadingSpinner message="Carregando resumo da propriedade..." />
  }

  if (error) {
    return (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          Erro ao carregar dados do dashboard. {(error as Error).message}
        </div>
    )
  }

  const {
    totalAnimais = 0,
    chartData = [],
    vacinasPendentes = 0,
    proximasVacinas = [],
    ocorrenciasAbertas = 0,
    ultimasOcorrencias = [],
    funcionariosAtivos = 0,
  } = data || {}

  // Use profile.plan as authoritative source (works even without a property)
  const plan = (profile?.plan || data?.plan || 'free') as PlanTier

  // Cálculo simplificado de meta/score de sustentabilidade (PNIB)
  const scoreBase = 100
  const punicaoVacina = vacinasPendentes * 5
  const punicaoOcorrencia = ocorrenciasAbertas * 2
  const maxScore = Math.max(0, scoreBase - punicaoVacina - punicaoOcorrencia)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Visão Geral</h1>
          <p className="text-sm text-neutral-500 mt-1">Acompanhe os principais indicadores da sua propriedade.</p>
        </div>
      </div>

      <PlanBanner totalAnimais={totalAnimais} funcionariosAtivos={funcionariosAtivos} plan={plan} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Total de Animais" 
          value={totalAnimais} 
          icon={Beef} 
          colorClass="text-emerald-600 bg-emerald-100" 
          linkTo="/app/rebanho"
        />
        <DashboardCard 
          title="Vacinas Pendentes" 
          value={vacinasPendentes} 
          icon={Syringe} 
          colorClass={vacinasPendentes > 0 ? "text-red-500 bg-red-100" : "text-amber-500 bg-amber-100"} 
          linkTo="/app/vacinas"
        />
        <DashboardCard 
          title="Ocorrências em Aberto" 
          value={ocorrenciasAbertas} 
          icon={AlertTriangle} 
          colorClass={ocorrenciasAbertas > 0 ? "text-amber-500 bg-amber-100" : "text-neutral-500 bg-neutral-100"} 
          linkTo="/app/ocorrencias"
        />
        <DashboardCard 
          title="Equipe Ativa" 
          value={funcionariosAtivos} 
          icon={Users} 
          colorClass="text-blue-500 bg-blue-100" 
          linkTo="/app/equipe"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Distribuição do Rebanho */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-neutral-900 mb-6">Distribuição do Rebanho</h3>
          <div className="flex-1 min-h-[250px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     formatter={(value: any) => [`${value} animais`, 'Quantidade']}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-sm text-neutral-400 pb-10">
                 Sem animais cadastrados
               </div>
            )}
          </div>
        </div>

        {/* Listas e Score PNIB */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Alertas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Próximas Vacinas</h3>
                <Link to="/app/vacinas" className="text-xs font-medium text-primary-600 hover:text-primary-700">Ver todas</Link>
              </div>
              <div className="space-y-3">
                {proximasVacinas.length > 0 ? proximasVacinas.map((vacina: any) => (
                  <div key={vacina.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{vacina.vaccine_type}</p>
                      <p className="text-xs text-neutral-500">Registrada em {new Date(vacina.application_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-neutral-500 text-center py-4 bg-neutral-50 rounded-xl">Nenhuma vacina pendente no radar.</div>
                )}
              </div>
            </div>

             <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-900">Ocorrências Recentes</h3>
                <Link to="/app/ocorrencias" className="text-xs font-medium text-primary-600 hover:text-primary-700">Ver todas</Link>
              </div>
              <div className="space-y-3">
                {ultimasOcorrencias.length > 0 ? ultimasOcorrencias.map((ocorrencia: any) => (
                  <div key={ocorrencia.id} className="p-3 bg-neutral-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">{ocorrencia.occurrence_type}</span>
                      <span className="text-xs text-neutral-400">{new Date(ocorrencia.occurred_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-sm text-neutral-700 line-clamp-1">{ocorrencia.description || 'Sem descrição'}</p>
                    {ocorrencia.animals && (
                      <p className="text-xs text-neutral-500 mt-1">Brinco: {ocorrencia.animals.ear_tag}</p>
                    )}
                  </div>
                )) : (
                  <div className="text-sm text-neutral-500 text-center py-4 bg-neutral-50 rounded-xl">Nenhuma ocorrência em andamento.</div>
                )}
              </div>
            </div>
          </div>

          {/* Score PNIB Mockado */}
          <div className="bg-gradient-to-r from-emerald-600 to-primary-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
              <ShieldCheck size={180} />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Saúde do Rebanho & PNIB</h3>
                <p className="text-emerald-100 text-sm mt-1 max-w-md">
                  Índice baseado em vacinações em dia, controle de ocorrências e boas práticas.
                </p>
              </div>
              <div className="flex items-end gap-2 bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <span className="text-4xl font-black leading-none">{maxScore}</span>
                <span className="text-emerald-100 font-medium">/ 100</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
