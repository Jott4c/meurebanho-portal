import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUIStore } from '../stores/useUIStore'
import {
  LayoutDashboard,
  Beef,
  Syringe,
  AlertTriangle,
  Users,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/rebanho', icon: Beef, label: 'Rebanho' },
  { to: '/app/vacinas', icon: Syringe, label: 'Vacinas' },
  { to: '/app/ocorrencias', icon: AlertTriangle, label: 'Ocorrências' },
  { to: '/app/equipe', icon: Users, label: 'Equipe' },
  { to: '/app/relatorios', icon: FileBarChart, label: 'Relatórios' },
  { to: '/app/configuracoes', icon: Settings, label: 'Configurações' },
]

function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.replace('/app', '').split('/').filter(Boolean)
  if (segments.length === 0) return ['Dashboard']

  const labelMap: Record<string, string> = {
    rebanho: 'Rebanho',
    vacinas: 'Vacinas',
    ocorrencias: 'Ocorrências',
    equipe: 'Equipe',
    relatorios: 'Relatórios',
    configuracoes: 'Configurações',
    novo: 'Novo',
    editar: 'Editar',
  }

  return segments.map((s) => labelMap[s] || s)
}

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()
  const location = useLocation()
  const breadcrumb = getBreadcrumb(location.pathname)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full bg-white border-r border-neutral-200
          flex flex-col transition-transform duration-200 ease-in-out
          w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Beef className="text-white" size={18} />
            </div>
            <span className="font-bold text-neutral-900 text-lg">MeuRebanho</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-neutral-100"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => {
                if (window.innerWidth < 1024) setSidebarOpen(false)
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé sidebar */}
        <div className="p-3 border-t border-neutral-100">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100"
            >
              <Menu size={20} className="text-neutral-600" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm">
              <span className="text-neutral-400">MeuRebanho</span>
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight size={14} className="text-neutral-300" />
                  <span className={i === breadcrumb.length - 1 ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
                    {item}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Usuário */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-neutral-900">{userName}</p>
              <p className="text-xs text-neutral-400">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
