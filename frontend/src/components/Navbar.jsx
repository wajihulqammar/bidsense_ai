import { Bell, Search, ChevronDown, Menu, Sparkles } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'

export default function Navbar({ setSidebarOpen, sidebarOpen }) {
  const { activeWorkspace, pipeline } = useWorkspace()
  const wsName = activeWorkspace?.name || 'No workspace selected'
  const wsStatus = activeWorkspace?.status || 'Review'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 shrink-0">
      <button
        onClick={() => setSidebarOpen(v => !v)}
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-gray-400">Workspaces</span>
        <ChevronDown size={14} className="text-gray-300" />
        <span className="font-500 text-gray-800 truncate max-w-xs">{wsName}</span>
        <span className={`ml-1 text-[10px] border px-2 py-0.5 rounded-full font-600 shrink-0 ${
          wsStatus === 'Active' ? 'bg-amber-50 text-amber-700 border-amber-100' :
          wsStatus === 'At Risk' ? 'bg-red-50 text-red-600 border-red-100' :
          'bg-gray-50 text-gray-600 border-gray-100'
        }`}>{pipeline.loading ? 'Processing' : wsStatus}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors min-w-52">
        <Search size={14} />
        <span>Search tenders, requirements…</span>
        <span className="ml-auto text-[10px] bg-white border border-gray-200 text-gray-400 px-1.5 py-0.5 rounded font-mono">⌘K</span>
      </div>

      <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-500 hover:bg-indigo-700 transition-colors">
        <Sparkles size={14} />
        <span>AI Assist</span>
      </button>

      <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
      </button>

      <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100 cursor-pointer group">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-700 text-indigo-700">AK</div>
        <div className="hidden sm:block">
          <p className="text-xs font-600 text-gray-800 leading-none">Ahmed Khan</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Bid Manager</p>
        </div>
        <ChevronDown size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </header>
  )
}
