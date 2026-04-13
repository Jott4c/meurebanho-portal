import { Heart, Baby, FlaskConical, Calendar, ChevronRight, AlertCircle, Plus } from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useReproduction } from '../../hooks/useReproduction'

export default function Reproducao() {
  const { metrics, events, isLoading } = useReproduction()

  if (isLoading) return <LoadingSpinner message="Carregando dados reprodutivos..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reprodução</h1>
          <p className="text-sm text-neutral-500 mt-1">Monitore e planeje o ciclo reprodutivo do seu rebanho.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 font-medium px-4 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
            onClick={() => alert('Gestão de sêmen em breve.')}
          >
            <FlaskConical size={18} />
            Estoque Sêmen
          </button>
          <button
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            onClick={() => alert('Novo lote IATF em breve.')}
          >
            <Plus size={18} />
            Novo Lote IATF
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Heart size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              ATIVOS
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-neutral-900">{metrics?.activeIatf || 0}</h3>
            <p className="text-sm text-neutral-500 font-medium">Lotes IATF em Andamento</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FlaskConical size={24} />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              ESTOQUE
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-neutral-900">{metrics?.totalSemen || 0}</h3>
            <p className="text-sm text-neutral-500 font-medium">Doses de Sêmen Disponíveis</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Baby size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              30 DIAS
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-neutral-900">{metrics?.recentBirths || 0}</h3>
            <p className="text-sm text-neutral-500 font-medium">Nascimentos Recentes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center">
            <h2 className="font-bold text-neutral-900">Últimos Eventos Reprodutivos</h2>
            <button className="text-sm font-semibold text-primary-600 hover:underline">Ver tudo</button>
          </div>
          
          <div className="overflow-x-auto">
            {!events || events.length === 0 ? (
                <div className="py-12 flex flex-col items-center">
                    <Calendar className="text-neutral-300" size={48} />
                    <p className="mt-4 text-neutral-500 font-medium">Nenhum evento registrado recentemente.</p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-50 text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                        <tr>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Animal</th>
                        <th className="px-6 py-3">Evento</th>
                        <th className="px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {events.map((event) => (
                        <tr key={event.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-neutral-600">
                                {new Date(event.event_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-neutral-900">
                                {event.animals?.ear_tag || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 rounded-full font-bold text-[10px] uppercase ${
                                    event.event_type === 'birth' ? 'bg-emerald-50 text-emerald-700' :
                                    event.event_type === 'abortion' ? 'bg-red-50 text-red-700' :
                                    'bg-neutral-100 text-neutral-700'
                                }`}>
                                    {event.event_type === 'birth' ? 'Parto' :
                                     event.event_type === 'abortion' ? 'Aborto' :
                                     event.event_type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-400">
                                <button className="hover:text-primary-600"><ChevronRight size={18} /></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            )}
          </div>
        </div>

        {/* Attention Section */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h2 className="font-bold text-neutral-900 flex items-center gap-2 mb-4">
                    <AlertCircle className="text-amber-500" size={20} />
                    Atenção Necessária
                </h2>
                <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-sm font-bold text-amber-900">Estoque de Sêmen</p>
                        <p className="text-xs text-amber-700 mt-1">Considere repor o estoque de Brangus (restam 5 doses).</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-sm font-bold text-blue-900">Próximo Toque (DG)</p>
                        <p className="text-xs text-blue-700 mt-1">Lote 002-C está programado para amanhã (13/04).</p>
                    </div>
                </div>
            </div>

            <div className="bg-primary-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2">Relatórios Reprodutivos</h3>
                    <p className="text-primary-100 text-sm mb-4">Acesse estatísticas avançadas de fertilidade e prenhez.</p>
                    <button className="bg-white text-primary-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-50 transition-colors">
                        Ver Relatórios
                    </button>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-10">
                    <Heart size={120} />
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
