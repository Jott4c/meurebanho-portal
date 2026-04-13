import { ShieldCheck, Leaf, CheckCircle2, AlertCircle, Info, TrendingUp, Award, ArrowUpRight, Activity } from 'lucide-react'
import { useDashboard } from '../../hooks/useDashboard'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function Sustentabilidade() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <LoadingSpinner />

  const { vacinasPendentes = 0, ocorrenciasAbertas = 0 } = data || {}
  
  // Cálculo de Score PNIB (Simulado)
  const scoreBase = 100
  const punicaoVacina = vacinasPendentes * 5
  const punicaoOcorrencia = ocorrenciasAbertas * 2
  const score = Math.max(0, scoreBase - punicaoVacina - punicaoOcorrencia)

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-500'
    if (s >= 70) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBg = (s: number) => {
    if (s >= 90) return 'bg-emerald-50'
    if (s >= 70) return 'bg-amber-50'
    return 'bg-red-50'
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Sustentabilidade & PNIB</h1>
          <p className="text-sm text-neutral-500 mt-1">Monitore o índice de conformidade e rastreabilidade da sua fazenda.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-sm">
          <ShieldCheck size={18} />
          ISO 14001 Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Principal */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-6">Seu Score Atual</h3>
          <div className={`relative w-48 h-48 flex items-center justify-center rounded-full border-8 ${getScoreBg(score).replace('bg-', 'border-')} border-opacity-30`}>
            <div className="text-center">
              <span className={`text-6xl font-black ${getScoreColor(score)}`}>{score}</span>
              <p className="text-xs font-bold text-neutral-400 mt-1">de 100 pts</p>
            </div>
            {/* Círculo de progresso simplificado */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="553"
                strokeDashoffset={553 - (553 * score) / 100}
                className={getScoreColor(score)}
              />
            </svg>
          </div>
          <div className="mt-8 space-y-2 w-full">
            <div className={`py-3 px-4 rounded-xl ${getScoreBg(score)} ${getScoreColor(score)} font-bold flex items-center justify-center gap-2`}>
              {score >= 90 ? 'Excelente Desempenho' : score >= 70 ? 'Bom Desempenho' : 'Ação Necessária'}
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed px-4">
              Seu score é calculado com base na sanidade, rastreabilidade e manejo ambiental.
            </p>
          </div>
        </div>

        {/* Detalhamento de Pilares */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PillarCard 
              title="Sanidade Animal" 
              score={100 - punicaoVacina} 
              icon={ShieldCheck} 
              description={`${vacinasPendentes} vacinas pendentes de registro.`}
              status={vacinasPendentes === 0 ? 'success' : 'warning'}
            />
            <PillarCard 
              title="Manejo e Bem-Estar" 
              score={100 - punicaoOcorrencia} 
              icon={Activity} 
              description={`${ocorrenciasAbertas} ocorrências graves não resolvidas.`}
              status={ocorrenciasAbertas === 0 ? 'success' : 'important'}
            />
            <PillarCard 
              title="Rastreabilidade" 
              score={95} 
              icon={TrendingUp} 
              description="95% do rebanho possui brinco eletrônico cadastrado."
              status="success"
            />
            <PillarCard 
              title="Preservação Ambiental" 
              score={80} 
              icon={Leaf} 
              description="Área de reserva legal preservada (C.A.R. ativo)."
              status="success"
            />
          </div>

          {/* Destaque de Selo */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
               <Award size={240} />
             </div>
             <div className="relative z-10 max-w-md">
               <div className="flex items-center gap-2 text-primary-400 mb-4">
                 <Award size={20} />
                 <span className="text-xs font-black uppercase tracking-[0.2em]">Pecuária Sustentável</span>
               </div>
               <h3 className="text-2xl font-bold mb-4">Você está qualificado para o Selo Bronze</h3>
               <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                 Sua fazenda atingiu os critérios mínimos de rastreabilidade para certificação de exportação. Continue evoluindo para o Selo Ouro.
               </p>
               <button className="bg-white text-neutral-900 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-primary-500 hover:text-white transition-all shadow-lg group">
                 Ver Requisitos
                 <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
        <h3 className="font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Info size={20} className="text-blue-500" />
          Como melhorar seu score?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RecommendationItem 
            title="Sincronize Vacinas" 
            text="Gere os certificados de vacinação para comprovar a imunidade do lote."
            action="Ir para Vacinas"
          />
          <RecommendationItem 
            title="Resolva Ocorrências" 
            text="Ocorrências em aberto reduzem o índice de bem-estar animal."
            action="Ver Ocorrências"
          />
          <RecommendationItem 
            title="Mapeie Piquetes" 
            text="Utilize a rotação de pastagem para melhorar a conservação do solo."
            action="Mapear Agora"
          />
        </div>
      </div>
    </div>
  )
}

function PillarCard({ title, score, icon: Icon, description, status }: any) {
  const statusColors: any = {
    success: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-500 bg-amber-50 border-amber-100',
    important: 'text-red-500 bg-red-50 border-red-100',
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl bg-neutral-50 text-neutral-400`}>
          <Icon size={20} />
        </div>
        <span className={`text-lg font-black ${score >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{score}%</span>
      </div>
      <h4 className="font-bold text-neutral-800 text-sm mb-1">{title}</h4>
      <p className="text-[10px] text-neutral-400 uppercase font-black tracking-wider mb-2">{description}</p>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${score >= 90 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function RecommendationItem({ title, text, action }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-neutral-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
      <div className="mt-1">
        <CheckCircle2 size={18} className="text-neutral-300 group-hover:text-blue-500 transition-colors" />
      </div>
      <div>
        <h4 className="font-bold text-neutral-800 text-sm mb-1">{title}</h4>
        <p className="text-xs text-neutral-500 leading-relaxed mb-3">{text}</p>
        <button className="text-xs font-black text-blue-600 hover:underline">{action}</button>
      </div>
    </div>
  )
}
