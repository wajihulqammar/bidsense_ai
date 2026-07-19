import { Brain, ShieldCheck, Zap, Clock, DollarSign, Calendar, ChevronRight, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageEmpty, PageError, PageLoading } from '../utils/pipelineHelpers'

function ScoreRing({ value, color, size = 80 }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

export default function BidIntelligence() {
  const { pipeline, activeWorkspace } = useWorkspace()

  if (pipeline.loading && !pipeline.executiveSummary) return <PageLoading message={pipeline.step} />
  if (pipeline.error && !pipeline.executiveSummary) return <PageError message={pipeline.error} />
  if (!pipeline.executiveSummary) return <PageEmpty />

  const summary = pipeline.executiveSummary?.summary || {}
  const req = pipeline.requirements || {}
  const winProb = pipeline.winProbability || {}
  const decision = pipeline.decision || {}

  const metrics = [
    { label: 'Tender Value', value: activeWorkspace?.value || 'TBD', sub: req.issuing_organization || activeWorkspace?.org || '', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Submission Deadline', value: activeWorkspace?.deadline || 'TBD', sub: `${activeWorkspace?.daysLeft || 0} days remaining`, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Sector', value: activeWorkspace?.sector || req.sector || 'N/A', sub: req.document_title || 'RFP Document', icon: Brain, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'Pages Processed', value: `${pipeline.pages || 0}`, sub: `${pipeline.requirements?.mandatory_requirements?.length || 0} requirements`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  ]

  const scores = [
    { label: 'Capability Match', value: Math.round(pipeline.capabilityMatching?.summary?.capability_score || 0), color: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
    { label: 'Compliance Score', value: Math.round(pipeline.compliance?.compliance_score || 0), color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    { label: 'Historical Similarity', value: Math.round(winProb.historical_win_rate || 0), color: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
    { label: 'Win Probability', value: Math.round(winProb.win_probability || 0), color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  ]

  const insights = [
    ...(summary.major_strengths || []).map(text => ({ type: 'strength', text })),
    ...(summary.major_weaknesses || []).map(text => ({ type: 'risk', text })),
  ]

  const trendData = [
    { week: 'Extract', score: Math.round((pipeline.capabilityMatching?.summary?.capability_score || 0) * 0.8) },
    { week: 'Match', score: Math.round(pipeline.capabilityMatching?.summary?.capability_score || 0) },
    { week: 'Comply', score: Math.round(pipeline.compliance?.compliance_score || 0) },
    { week: 'History', score: Math.round(winProb.historical_win_rate || 0) },
    { week: 'Score', score: Math.round(winProb.win_probability || 0) },
    { week: 'Final', score: Math.round(winProb.win_probability || 0) },
  ]

  const decisionLabel = decision.decision === 'NO-GO' ? 'NO-GO' : 'GO'

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} className="text-indigo-500" />
            <span className="text-xs text-indigo-600 font-600 uppercase tracking-wider">AI Executive Intelligence</span>
          </div>
          <h1 className="text-2xl font-700 text-gray-900">Bid Intelligence Summary</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeWorkspace?.name || 'Active tender'} · {pipeline.pages || 0} pages processed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm ${
            decisionLabel === 'GO' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <CheckCircle size={16} />
            <span className="text-sm font-600">Recommendation: {decisionLabel}</span>
          </div>
        </div>
      </div>

      {/* Tender Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} className={`bg-white rounded-xl border ${m.border} p-4 shadow-sm`}>
              <div className={`w-9 h-9 ${m.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={16} className={m.color} />
              </div>
              <div className="text-lg font-700 text-gray-900">{m.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{m.label}</div>
              <div className={`text-[11px] font-500 mt-1 ${m.color}`}>{m.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Score Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {scores.map(s => (
          <div key={s.label} className={`bg-white rounded-xl border ${s.border} p-5 shadow-sm flex flex-col items-center`}>
            <div className="relative flex items-center justify-center mb-2">
              <ScoreRing value={s.value} color={s.color} size={88} />
              <div className="absolute text-center">
                <span className={`text-xl font-700 ${s.text}`}>{s.value}%</span>
              </div>
            </div>
            <p className="text-xs font-600 text-gray-600 text-center">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Executive Summary + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-600 text-indigo-200 uppercase tracking-wider">AI Executive Summary</span>
          </div>
          <p className="text-base leading-relaxed text-white/90 mb-5">
            {summary.tender_overview || summary.compliance_summary || 'Executive summary generated from live analysis pipeline.'}
          </p>
          <p className="text-base leading-relaxed text-white/90 mb-5">
            {summary.historical_insights || summary.final_recommendation || decision.executive_recommendation || ''}
          </p>
          <div className="bg-white/15 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-200 font-500 uppercase tracking-wider">AI Decision</p>
              <p className="text-xl font-700 text-white mt-0.5">{summary.final_recommendation || decision.executive_recommendation || (decisionLabel === 'GO' ? 'Proceed with bid preparation' : 'Do not proceed')}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronRight size={18} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-600 text-gray-800 mb-1">Win Probability Trend</h2>
          <p className="text-xs text-gray-400 mb-3">Score evolution as documents were analyzed</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 90]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#trendGrad)" dot={{ r: 3, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between text-xs">
            <span className="text-gray-400">Starting score</span>
            <span className="font-600 text-gray-600">{trendData[0]?.score || 0}% → {trendData[trendData.length - 1]?.score || 0}%</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <Brain size={15} className="text-indigo-500" />
          <h2 className="text-sm font-600 text-gray-800">AI Intelligence Findings</h2>
          <span className="ml-auto text-xs text-gray-400">{insights.length} findings · auto-generated</span>
        </div>
        <div className="divide-y divide-gray-50">
          {insights.map((item, i) => (
            <div key={i} className={`flex items-start gap-4 px-5 py-4 ${item.type === 'risk' ? 'bg-amber-50/30' : ''}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.type === 'strength' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {item.type === 'strength'
                  ? <CheckCircle size={13} className="text-emerald-600" />
                  : <AlertTriangle size={13} className="text-amber-600" />}
              </div>
              <div className="flex-1">
                <span className={`text-[10px] font-700 uppercase tracking-wider mr-2 ${item.type === 'strength' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {item.type === 'strength' ? 'Strength' : 'Risk'}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed mt-0.5">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
