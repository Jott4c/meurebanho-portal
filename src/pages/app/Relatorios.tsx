import { useState } from 'react'
import { 
  PieChart as PieChartIcon, TrendingUp, 
  Activity, Shield, Download, FileSpreadsheet, 
  ClipboardList, ArrowUpRight, ArrowDownRight, Users,
  Zap
} from 'lucide-react'
import { useReports } from '../../hooks/useReports'
import { 
  PieChart as RePie, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  Area, CartesianGrid, ComposedChart
} from 'recharts'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ANIMAL_CATEGORY_LABELS, OCCURRENCE_TYPE_LABELS } from '../../types'
import * as XLSX from 'xlsx'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const CATEGORIES = [
  { id: 'all', name: 'Visão Geral', icon: Zap },
  { id: 'herd', name: 'Rebanho', icon: ClipboardList },
  { id: 'financial', name: 'Financeiro', icon: TrendingUp },
  { id: 'sanitary', name: 'Sanitário', icon: Shield },
  { id: 'team', name: 'Equipe', icon: Users },
]

export default function Relatorios() {
  const [activeCategory, setActiveCategory] = useState('all')
  const { data: reports, isLoading } = useReports()

  // 1. Chart Data Mapping
  const inventoryData = reports?.inventoryByCategory 
    ? Object.keys(reports.inventoryByCategory).map((cat, idx) => ({
        name: ANIMAL_CATEGORY_LABELS[cat] || cat,
        value: reports.inventoryByCategory[cat],
        color: COLORS[idx % COLORS.length]
      }))
    : []

  const financialData = reports?.financialByMonth
    ? Object.keys(reports.financialByMonth).map(month => ({
        month,
        custos: reports.financialByMonth[month],
        ocorrencias: reports.sanitaryTrends?.[month] || 0
      }))
    : []

  const teamData = reports?.actionsByEmployee
    ? Object.keys(reports.actionsByEmployee).map(emp => ({
        name: emp,
        acoes: reports.actionsByEmployee[emp]
      }))
    : []

  // 2. Export Handler
  const handleExport = (type: 'inventory' | 'financial' | 'sanitary') => {
    if (!reports?.raw) return

    let dataToExport: any[] = []
    let fileName = ""

    switch (type) {
      case 'inventory':
        dataToExport = reports.raw.animals.map((a: any) => ({
          'Brinco': a.ear_tag,
          'Categoria': ANIMAL_CATEGORY_LABELS[a.category] || a.category,
          'Raça': a.breed,
          'Status': a.status === 'active' ? 'Ativo' : 'Inativo',
          'Data Cadastro': new Date(a.created_at).toLocaleDateString('pt-BR'),
          'Obs': a.observations || ''
        }))
        fileName = "Inventario_MeuRebanho.xlsx"
        break
      case 'financial':
        dataToExport = reports.raw.treatments.map((t: any) => ({
          'Data': new Date(t.applied_at).toLocaleDateString('pt-BR'),
          'Custo (R$)': t.cost,
          'Medicamento': t.medication_name,
          'Dosagem': t.dosage
        }))
        fileName = "Financeiro_MeuRebanho.xlsx"
        break
      case 'sanitary':
        dataToExport = reports.raw.occurrences.map((o: any) => ({
          'Data': new Date(o.occurred_at).toLocaleDateString('pt-BR'),
          'Tipo': OCCURRENCE_TYPE_LABELS[o.occurrence_type] || o.occurrence_type,
          'Gravidade': o.severity,
          'Animal (Brinco)': o.animals?.ear_tag || 'N/A',
          'Descrição': o.description || ''
        }))
        fileName = "Ocorrencias_MeuRebanho.xlsx"
        break
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Dados")
    XLSX.writeFile(wb, fileName)
  }

  if (isLoading) return <LoadingSpinner message="Calculando métricas estratégicas..." />

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Sub-Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Relatórios & BI</h1>
          <p className="text-neutral-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-primary-500" />
            Análise em tempo real da performance agropecuária
          </p>
        </div>

        {/* Category Switcher */}
        <div className="flex bg-neutral-100 p-1.5 rounded-[2rem] border border-neutral-200 shadow-inner overflow-x-auto max-w-full no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${
                activeCategory === cat.id ? 'bg-white text-neutral-900 shadow-xl' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <cat.icon size={14} strokeWidth={3} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Rebanho" 
          value={reports?.totalAnimals || 0} 
          unit="cabeças"
          trend="+2.4%"
          positive={true}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard 
          title="Investimento Sanitário" 
          value={`R$ ${reports?.totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
          unit="este ano"
          trend="+12%"
          positive={false}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard 
          title="Produtividade Média" 
          value="8.2" 
          unit="score"
          trend="+0.5"
          positive={true}
          icon={Zap}
          color="amber"
        />
        <StatCard 
          title="Taxa de Mortalidade" 
          value="1.2" 
          unit="%"
          trend="-0.5%"
          positive={true}
          icon={Activity}
          color="red"
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost & Sanitary Trends - Large Area */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-neutral-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-500" />
              Evolução: Custos vs Sanidade
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary-500" /> Custos</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-neutral-900" /> Ocorrências</div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#737373' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#737373' }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#737373' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                  itemStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="custos" fill="#10b981" fillOpacity={0.1} stroke="#10b981" strokeWidth={4} />
                <Bar yAxisId="right" dataKey="ocorrencias" fill="#171717" radius={[10, 10, 0, 0]} barSize={30} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Analytics Stack */}
        <div className="space-y-8">
          {/* Inventory Pie */}
          <div className="bg-white p-8 rounded-[3rem] border border-neutral-100 shadow-sm h-full">
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <PieChartIcon size={18} className="text-amber-500" />
              Distribuição: Categoria
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePie>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </RePie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Team Productivity & Export Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Productivity */}
        <div className="bg-neutral-900 p-8 rounded-[3rem] shadow-2xl space-y-8 text-white">
          <h3 className="text-lg font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Users size={20} className="text-primary-400" />
            Engajamento da Equipe
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#525252" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '15px' }} />
                <Bar dataKey="acoes" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest text-center">Ações registradas via aplicativo por funcionário</p>
        </div>

        {/* Export Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-neutral-900 tracking-tight">Exportação de Dados</h3>
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-400"><Download size={20} /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExportCard 
              title="Inventário Geral" 
              desc="Resumo completo de cabeças por categoria, raça e status."
              onExport={() => handleExport('inventory')}
              isLoading={isLoading}
            />
            <ExportCard 
              title="Movimentação Financeira" 
              desc="Detalhamento de custos com medicamentos e aplicações."
              onExport={() => handleExport('financial')}
              isLoading={isLoading}
            />
            <ExportCard 
              title="Dossiê Sanitário" 
              desc="Histórico completo de ocorrências, diagnósticos e gravidade."
              onExport={() => handleExport('sanitary')}
              isLoading={isLoading}
            />
            <ExportCard 
              title="Métricas de Equipe" 
              desc="Performance e registros de campo por operador."
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, unit, trend, positive, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm group hover:border-neutral-900 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-3xl ${colors[color] || 'bg-neutral-50'} transition-all group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">{value}</h3>
        <span className="text-[10px] text-neutral-400 font-bold uppercase">{unit}</span>
      </div>
    </div>
  )
}

function ExportCard({ title, desc, onExport, disabled, isLoading }: any) {
  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm flex flex-col justify-between group h-full ${disabled ? 'opacity-50 grayscale' : 'hover:border-neutral-900'}`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-neutral-50 text-neutral-400 rounded-2xl group-hover:bg-neutral-900 group-hover:text-white transition-all">
            <FileSpreadsheet size={24} />
          </div>
          {!disabled && (
            <button 
              onClick={onExport}
              disabled={isLoading}
              className="p-2 text-neutral-300 hover:text-neutral-900 transition-colors"
            >
              <Download size={20} />
            </button>
          )}
        </div>
        <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-2">{title}</h4>
        <p className="text-[11px] text-neutral-500 font-medium leading-relaxed mb-6">{desc}</p>
      </div>
      <button 
        onClick={onExport}
        disabled={disabled || isLoading}
        className="w-full py-3 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-700 transition-all flex items-center justify-center gap-2"
      >
        <FileSpreadsheet size={16} />
        GERAR EXCEL
      </button>
    </div>
  )
}
