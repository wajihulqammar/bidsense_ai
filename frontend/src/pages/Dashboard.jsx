import { TrendingUp, ShieldCheck, Zap, ArrowUpRight, Calendar, ExternalLink, MoreHorizontal, Brain, CheckCircle, Target } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageEmpty, PageLoading } from '../utils/pipelineHelpers'

const statusColor = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Review: 'bg-amber-50 text-amber-700 border-amber-100',
  'At Risk': 'bg-red-50 text-red-600 border-red-100',
}

export default function Dashboard({ setActivePage }) {
  const { workspaces, activeWorkspace, pipeline } = useWorkspace()

  if (pipeline.loading && !pipeline.decision) return <PageLoading message={pipeline.step} />
  if (!activeWorkspace && workspaces.length === 0) return <PageEmpty message="Create a workspace and upload an RFP to see the dashboard." />

  const decision = pipeline.decision?.decision === 'NO-GO' ? 'NO-GO' : pipeline.decision?.decision || activeWorkspace?.decision || 'Pending'
  const compliance = Math.round(pipeline.compliance?.compliance_score || activeWorkspace?.compliance || 0)
  const capability = Math.round(pipeline.capabilityMatching?.summary?.capability_score || 0)
  const winProb = Math.round(pipeline.winProbability?.win_probability || activeWorkspace?.win || 0)

  const winProbData = (pipeline.winProbability?.radar_data || []).map((r, i) => ({
    month: `F${i + 1}`,
    probability: r.value,
  }))

  const scoreBreakdown = (pipeline.winProbability?.radar_data || []).map(r => ({
    label: r.factor,
    value: r.value,
    color: r.value >= 75 ? '#10b981' : r.value >= 60 ? '#6366f1' : '#f87171',
  }))

  const rfpTableData = workspaces.map(ws => ({
    name: ws.name,
    sector: ws.sector,
    deadline: ws.deadline,
    compliance: ws.compliance,
    win: ws.win,
    status: ws.status,
    decision: ws.decision,
  }))

  const decisionReasons = [
    pipeline.compliance?.compliance_score ? `${compliance}% compliance — ${compliance >= 75 ? 'above' : 'below'} 75% threshold` : null,
    ...(pipeline.compliance?.strengths || []).slice(0, 2).map(s => typeof s === 'string' ? s : s.text),
  ].filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Executive Bid Intelligence Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeWorkspace?.name || 'No active workspace'} — {pipeline.loading ? 'Processing…' : 'Live data'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-500">Export Report</button>
        </div>
      </div>

      {/* HERO: GO/NO-GO + Key Metrics above the fold */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* GO Decision — large hero */}
        <div className={`lg:col-span-2 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between ${
          decision === 'NO-GO' ? 'bg-gradient-to-br from-red-600 to-rose-700' : 'bg-gradient-to-br from-emerald-600 to-teal-700'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-emerald-200" />
              <span className="text-xs font-600 text-emerald-200 uppercase tracking-wider">AI Decision Engine</span>
            </div>
            <div className="text-6xl font-900 text-white leading-none tracking-tight">{decision}</div>
            <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
              {pipeline.decision?.reason || (decision === 'GO' ? 'Proceed with bid preparation.' : 'Review analysis before proceeding.')}
            </p>
          </div>
          <div className="mt-5 space-y-2">
            {(decisionReasons.length ? decisionReasons : ['Upload an RFP to generate decision insights']).map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-300 shrink-0" />
                <span className="text-xs text-emerald-100">{r}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActivePage('gonogo')}
            className="mt-5 w-full bg-white/15 hover:bg-white/25 text-white text-sm font-600 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            View Full Decision Center <ExternalLink size={13} />
          </button>
        </div>

        {/* 4 KPI cards */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-4">
          {[
            { title: 'Tender Value', value: activeWorkspace?.value || 'TBD', sub: activeWorkspace?.org || '', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            { title: 'Compliance Score', value: compliance ? `${compliance}%` : '—', sub: compliance >= 75 ? 'Above threshold' : 'Below threshold', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: compliance >= 75 },
            { title: 'Capability Match', value: capability ? `${capability}%` : '—', sub: 'RAG-matched', icon: Zap, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', trend: capability >= 70 },
            { title: 'Win Probability', value: winProb ? `${winProb}%` : '—', sub: winProb >= 70 ? 'Above 70% threshold' : 'Below threshold', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', trend: winProb >= 70 },
          ].map(card => {
            const Icon = card.icon
            return (
              <div key={card.title} className={`bg-white rounded-xl border ${card.border} p-4 shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={15} className={card.color} />
                  </div>
                  {card.trend && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-600 flex items-center gap-0.5">
                      <ArrowUpRight size={9} /> Up
                    </span>
                  )}
                </div>
                <div className="text-2xl font-700 text-gray-900">{card.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{card.title}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{card.sub}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-600 text-gray-800">Win Probability Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">6-month historical performance</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={winProbData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[40, 90]} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} formatter={(v) => [`${v}%`, 'Win Probability']} />
              <Area type="monotone" dataKey="probability" stroke="#6366f1" strokeWidth={2} fill="url(#probGrad)" dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-600 text-gray-800 mb-1">Bid Score Breakdown</h2>
          <p className="text-xs text-gray-400 mb-4">Current tender assessment</p>
          {scoreBreakdown.map(item => (
            <div key={item.label} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-600 text-gray-800">{item.value}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-1.5 rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent RFP Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-600 text-gray-800">Bid Intelligence Pipeline</h2>
            <p className="text-xs text-gray-400 mt-0.5">{workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} — AI decision applied</p>
          </div>
          <button onClick={() => setActivePage('workspace')} className="text-xs text-indigo-600 font-500 flex items-center gap-1 hover:text-indigo-700 transition-colors">
            View all <ExternalLink size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                {['Tender Name', 'Sector', 'Deadline', 'Compliance', 'Win Probability', 'Status', 'Decision', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-600 text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rfpTableData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3.5 text-sm font-500 text-gray-800 group-hover:text-indigo-600 transition-colors cursor-pointer">{row.name}</td>
                  <td className="px-5 py-3.5"><span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{row.sector}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} className="text-gray-300" />{row.deadline}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-1.5 bg-emerald-400 rounded-full" style={{ width: `${row.compliance}%` }} />
                      </div>
                      <span className={`text-xs font-600 ${row.compliance >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{row.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-700 ${row.win >= 70 ? 'text-emerald-600' : row.win >= 55 ? 'text-amber-600' : 'text-red-500'}`}>{row.win}%</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-600 border px-2 py-0.5 rounded-full ${statusColor[row.status]}`}>{row.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-700 px-2.5 py-1 rounded-full border ${row.decision === 'GO' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      {row.decision}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all">
                      <MoreHorizontal size={14} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
