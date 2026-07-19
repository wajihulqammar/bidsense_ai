import { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle, ThumbsUp, ThumbsDown, TrendingUp, ShieldCheck, Zap, BarChart2, Clock } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageEmpty, PageError, PageLoading } from '../utils/pipelineHelpers'

const severityBg = {
  High: 'bg-red-50 text-red-600 border-red-100',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100',
  Low: 'bg-blue-50 text-blue-600 border-blue-100',
}
const priorityBg = {
  Critical: 'bg-red-50 text-red-600 border-red-100',
  High: 'bg-amber-50 text-amber-700 border-amber-100',
}

export default function GoNoGo() {
  const { pipeline, activeWorkspace } = useWorkspace()
  const apiDecision = pipeline.decision?.decision === 'NO-GO' ? 'NO-GO' : 'GO'
  const [decision, setDecision] = useState(apiDecision)

  useEffect(() => {
    if (pipeline.decision) {
      setDecision(pipeline.decision.decision === 'NO-GO' ? 'NO-GO' : 'GO')
    }
  }, [pipeline.decision])

  if (pipeline.loading && !pipeline.decision) return <PageLoading message={pipeline.step} />
  if (pipeline.error && !pipeline.decision) return <PageError message={pipeline.error} />
  if (!pipeline.decision) return <PageEmpty />

  const d = pipeline.decision
  const winProb = pipeline.winProbability || {}
  const comp = pipeline.compliance || {}
  const cap = pipeline.capabilityMatching?.summary || {}

  const scoreMetrics = [
    { label: 'Compliance Score', value: Math.round(d.compliance_score || 0), threshold: 75, icon: ShieldCheck },
    { label: 'Capability Match', value: Math.round(cap.capability_score || 0), threshold: 70, icon: Zap },
    { label: 'Historical Success', value: Math.round(winProb.historical_win_rate || 0), threshold: 60, icon: BarChart2 },
    { label: 'Risk Score', value: Math.round(comp.missing * 5 || 0), threshold: 40, icon: AlertTriangle, inverse: true, label2: comp.missing <= 3 ? 'Low Risk' : 'Elevated Risk' },
    { label: 'Win Probability', value: Math.round(d.win_probability || 0), threshold: 70, icon: TrendingUp },
  ]

  const supportingReasons = (
    (pipeline.compliance?.strengths?.length ? pipeline.compliance.strengths : pipeline.winProbability?.positive_factors) || []
  ).map(text => ({
    text: typeof text === 'string' ? text : text.text || String(text),
    icon: CheckCircle,
    color: 'text-emerald-500',
  }))

  const topRisks = (d.risks || []).map(r => ({
    text: typeof r === 'string' ? r : r.text || r.description || String(r),
    severity: typeof r === 'object' ? (r.severity || 'Medium') : 'Medium',
  }))

  const radarData = (winProb.radar_data || []).slice(0, 6).map(r => ({
    factor: r.factor?.split(' ')[0] || r.factor,
    value: r.value,
  }))

  const actionItems = (d.action_items || []).map((item, i) => ({
    task: typeof item === 'string' ? item : item.task || item.text || String(item),
    priority: typeof item === 'object' ? (item.priority || 'High') : 'High',
    days: typeof item === 'object' ? (item.days || 5) : 5,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">GO / NO-GO Decision Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Executive recommendation — {activeWorkspace?.name || 'Active tender'}</p>
        </div>
        <div className="text-xs text-gray-400">
          Generated: {new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Hero Decision Card */}
      <div className={`relative rounded-2xl overflow-hidden border-2 shadow-lg ${decision === 'GO' ? 'border-emerald-200' : 'border-red-200'}`}>
        <div className={`absolute inset-0 ${decision === 'GO' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-red-600 to-rose-700'}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Big Decision */}
            <div className="text-center lg:text-left shrink-0">
              <div className="text-xs font-700 text-white/60 uppercase tracking-widest mb-2">AI Recommendation</div>
              <div className="text-8xl font-900 text-white tracking-tighter leading-none">{decision}</div>
              <div className="text-white/80 text-sm mt-2 font-500">
                {decision === 'GO' ? 'Proceed with bid preparation' : 'Do not invest bid resources'}
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setDecision('GO')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-600 transition-all ${decision === 'GO' ? 'bg-white text-emerald-700 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  <ThumbsUp size={15} /> Confirm GO
                </button>
                <button
                  onClick={() => setDecision('NO-GO')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-600 transition-all ${decision === 'NO-GO' ? 'bg-white text-red-600 shadow-md' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  <ThumbsDown size={15} /> Override to NO-GO
                </button>
              </div>
            </div>

            {/* Score Metrics */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3 w-full">
              {scoreMetrics.map(m => {
                const Icon = m.icon
                const exceeded = m.inverse ? m.value < m.threshold : m.value >= m.threshold
                return (
                  <div key={m.label} className="bg-white/15 backdrop-blur rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={13} className="text-white/70" />
                      <span className="text-[11px] text-white/70 font-500 truncate">{m.label}</span>
                    </div>
                    <div className="text-2xl font-700 text-white">
                      {m.inverse ? <span className="text-emerald-300">{m.label2 || `${m.value}%`}</span> : `${m.value}%`}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      <div className="flex-1 h-1 bg-white/20 rounded-full">
                        <div className="h-1 bg-white/70 rounded-full" style={{ width: `${m.inverse ? 100 - m.value : m.value}%` }} />
                      </div>
                      <span className={`text-[9px] font-600 ${exceeded ? 'text-emerald-300' : 'text-red-300'}`}>
                        {exceeded ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Reasons + Risk side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Supporting Reasons */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-emerald-50 bg-emerald-50/50 flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={14} className="text-emerald-600" />
            </div>
            <h2 className="text-sm font-700 text-emerald-800">Top Reasons Supporting GO</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {supportingReasons.map((r, i) => {
              const Icon = r.icon
              return (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <Icon size={14} className={`${r.color} mt-0.5 shrink-0`} />
                  <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Risks */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-50 bg-amber-50/50 flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-600" />
            </div>
            <h2 className="text-sm font-700 text-amber-800">Top Risks to Mitigate</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {topRisks.map((r, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className={`text-[10px] font-700 border px-1.5 py-0.5 rounded-full mt-0.5 shrink-0 whitespace-nowrap ${severityBg[r.severity]}`}>{r.severity}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar + Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-600 text-gray-800 mb-1">Decision Radar — 6 Key Dimensions</h2>
          <p className="text-xs text-gray-400 mb-2">All dimensions must exceed threshold for GO</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-indigo-500" />
              <h2 className="text-sm font-600 text-gray-800">Pre-Submission Action Plan</h2>
            </div>
            <span className="text-xs text-gray-400">18 days remaining</span>
          </div>
          <div className="divide-y divide-gray-50">
            {actionItems.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-5 h-5 rounded border-2 border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer shrink-0" />
                <p className="text-sm text-gray-700 flex-1 leading-snug">{a.task}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-600 border px-1.5 py-0.5 rounded-full ${priorityBg[a.priority]}`}>{a.priority}</span>
                  <span className="text-[10px] text-gray-400 font-500">{a.days}d</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-indigo-50/50 border-t border-indigo-50">
            <p className="text-xs text-indigo-600 font-500">Complete critical items within 5 days to maintain GO status</p>
          </div>
        </div>
      </div>

      {/* Executive Summary Banner */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-600 text-gray-400 uppercase tracking-widest">Executive Summary</p>
            <p className="text-base font-700 text-white mt-1">Government Cloud Infrastructure Tender — Decision Brief</p>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-600">Confidential</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          Analysis of the Federal Ministry of IT & Telecom RFP confirms strong strategic alignment with the organization's cloud infrastructure capabilities. With a compliance score of 87%, a win probability of 74%, and three directly comparable government references, this opportunity represents a high-value, high-confidence pursuit. Two critical gaps — Local Content Certificate and DPA 2023 documentation — must be resolved within the next 5 business days. Subject to resolution of these gaps, the AI decision engine recommends <span className="text-emerald-400 font-600">GO</span>.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[['Compliance', '87%'], ['Win Probability', '74%'], ['Recommendation', 'GO']].map(([label, val]) => (
            <div key={label} className="bg-white/5 rounded-lg px-3 py-2.5 text-center">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-lg font-700 mt-0.5 ${val === 'GO' ? 'text-emerald-400' : 'text-white'}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
