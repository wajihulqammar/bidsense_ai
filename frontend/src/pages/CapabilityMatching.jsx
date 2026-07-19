import { CheckCircle, AlertCircle, XCircle, ChevronRight, FileText, Award } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { mapCapabilityMatches, PageEmpty, PageError, PageLoading } from '../utils/pipelineHelpers'

const statusConfig = {
  matched: { label: 'Matched', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle, iconColor: 'text-emerald-500' },
  partial: { label: 'Partial', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle, iconColor: 'text-amber-500' },
  missing: { label: 'Missing', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: XCircle, iconColor: 'text-red-400' },
}

const confidenceColor = (v) => v >= 80 ? '#10b981' : v >= 50 ? '#f59e0b' : '#ef4444'

export default function CapabilityMatching() {
  const { pipeline } = useWorkspace()

  if (pipeline.loading && !pipeline.capabilityMatching) return <PageLoading message={pipeline.step} />
  if (pipeline.error && !pipeline.capabilityMatching) return <PageError message={pipeline.error} />
  if (!pipeline.capabilityMatching) return <PageEmpty />

  const matches = mapCapabilityMatches(pipeline.capabilityMatching.matched)
  const summary = pipeline.capabilityMatching.summary || {}
  const matchRate = summary.capability_score || 0

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Capability Matching</h1>
          <p className="text-sm text-gray-500 mt-0.5">Requirements matched against internal capability library via ChromaDB RAG · {matches.length} requirements</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xl font-700 text-emerald-600">{Math.round(matchRate)}%</div>
            <div className="text-xs text-gray-400">Match Rate</div>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Strong Matches', count: matches.filter(m => m.status === 'matched').length, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Partial Matches', count: matches.filter(m => m.status === 'partial').length, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Capability Gaps', count: matches.filter(m => m.status === 'missing').length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-center justify-between`}>
            <span className={`text-sm font-600 ${s.color}`}>{s.label}</span>
            <span className={`text-2xl font-700 ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Match Cards */}
      <div className="space-y-3">
        {matches.map((match, i) => {
          const cfg = statusConfig[match.status]
          const StatusIcon = cfg.icon
          return (
            <div key={i} className={`bg-white rounded-xl border ${cfg.border} shadow-sm overflow-hidden`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-50">
                {/* Left — Requirement */}
                <div className="p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-[10px] font-600 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full mt-0.5">{match.category}</span>
                    <span className={`text-[10px] font-600 border px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} ${cfg.border} mt-0.5`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed font-500">{match.requirement}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${match.confidence}%`, backgroundColor: confidenceColor(match.confidence) }}
                      />
                    </div>
                    <span className="text-xs font-700 min-w-8 text-right" style={{ color: confidenceColor(match.confidence) }}>
                      {match.confidence}%
                    </span>
                    <span className="text-xs text-gray-400">confidence</span>
                  </div>
                </div>

                {/* Right — Evidence */}
                <div className="p-5">
                  {match.evidence ? (
                    <div>
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          {match.category === 'Certification' ? <Award size={15} className="text-indigo-500" /> : <FileText size={15} className="text-indigo-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-600 text-gray-800">{match.evidence.title}</p>
                          <p className="text-xs text-indigo-500 font-500 mt-0.5">{match.evidence.source}</p>
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{match.evidence.detail}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        <StatusIcon size={14} className={cfg.iconColor} />
                        <span className={`text-xs font-600 ${cfg.color}`}>
                          {match.status === 'matched' ? 'Evidence verified and ready for proposal' : 'Evidence available — needs strengthening'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                      <XCircle size={24} className="text-red-300 mb-2" />
                      <p className="text-sm font-500 text-gray-500">No matching evidence found</p>
                      <p className="text-xs text-gray-400 mt-1">Capability gap — action required</p>
                      <button className="mt-3 text-xs text-indigo-600 font-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                        Add evidence <ChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
