import {
  LayoutDashboard, FolderOpen, FileSearch, Zap,
  ShieldCheck, TrendingUp, GitBranch, FileEdit,
  Settings, Brain, History, CheckSquare, Layers, Globe
} from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'

const navGroups = [
  {
    label: 'Intelligence',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'bidintelligence', label: 'Bid Intelligence', icon: Brain, badge: 'New' },
      { id: 'workspace', label: 'RFP Workspaces', icon: FolderOpen },
    ]
  },
  {
    label: 'Analysis',
    items: [
      { id: 'requirements', label: 'Requirement Extraction', icon: FileSearch },
      { id: 'capability', label: 'Capability Matching', icon: Zap },
      { id: 'compliance', label: 'Compliance Analysis', icon: ShieldCheck },
      { id: 'historical', label: 'Historical Insights', icon: History },
      { id: 'winprobability', label: 'Win Probability', icon: TrendingUp },
    ]
  },
  {
    label: 'Decision',
    items: [
      { id: 'gonogo', label: 'GO / NO-GO Center', icon: GitBranch, highlight: true },
      { id: 'proposal', label: 'Proposal Generator', icon: FileEdit },
    ]
  },
  {
    label: 'Platform',
    items: [
      { id: 'validation', label: 'Validation & Reliability', icon: CheckSquare },
      { id: 'scalability', label: 'Feasibility & Scale', icon: Globe },
    ]
  }
]

export default function Sidebar({ activePage, setActivePage, open }) {
  const { activeWorkspace, pipeline } = useWorkspace()
  if (!open) return null
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-700 text-gray-900 tracking-tight">BidSense</span>
            <span className="text-sm font-700 text-indigo-600 tracking-tight"> AI</span>
          </div>
        </div>
        <div className="mt-1">
          <span className="text-[10px] font-500 text-gray-400 uppercase tracking-widest">Bid Intelligence & Decision Engine</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-700 text-gray-400 uppercase tracking-widest px-2 mb-1.5">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon, badge, highlight }) => {
                const active = activePage === id
                return (
                  <button
                    key={id}
                    onClick={() => setActivePage(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150 ${
                      active ? 'bg-indigo-50 text-indigo-700 font-600'
                      : highlight ? 'text-gray-700 hover:bg-indigo-50/50 hover:text-indigo-600 font-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-400'
                    }`}
                  >
                    <Icon size={15} className={active ? 'text-indigo-600' : highlight ? 'text-indigo-400' : 'text-gray-400'} />
                    <span className="truncate flex-1">{label}</span>
                    {badge && (
                      <span className="text-[9px] bg-indigo-600 text-white font-700 px-1.5 py-0.5 rounded-full">{badge}</span>
                    )}
                    {id === 'gonogo' && !active && activeWorkspace?.decision && activeWorkspace.decision !== 'Pending' && (
                      <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-full ${
                        activeWorkspace.decision === 'NO-GO' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{activeWorkspace.decision}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-gray-600 hover:bg-gray-50 transition-all">
          <Settings size={15} className="text-gray-400" />
          <span>Settings</span>
        </button>
        <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
          <p className="text-xs font-600 text-indigo-800">Active Workspace</p>
          <p className="text-xs text-indigo-600 mt-0.5 truncate">{activeWorkspace?.name || 'None selected'}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 bg-indigo-100 rounded-full">
              <div
                className="h-1.5 bg-indigo-500 rounded-full transition-all"
                style={{ width: `${activeWorkspace?.win || 0}%` }}
              />
            </div>
            <span className="text-[10px] text-indigo-600 font-600">
              {pipeline.loading ? '…' : activeWorkspace?.win ? `${activeWorkspace.win}%` : '—'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
