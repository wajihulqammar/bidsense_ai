import { useState } from 'react'
import { CheckCircle, AlertCircle, XCircle, ShieldCheck, Filter } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { mapComplianceRequirements, PageEmpty, PageError, PageLoading } from '../utils/pipelineHelpers'

const statusCfg = {
  pass: { label: 'Pass', icon: CheckCircle, rowBg: '', cellBg: 'bg-emerald-500', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100', iconColor: 'text-emerald-500' },
  partial: { label: 'Partial', icon: AlertCircle, rowBg: 'bg-amber-50/30', cellBg: 'bg-amber-400', badgeBg: 'bg-amber-50 text-amber-700 border-amber-100', iconColor: 'text-amber-500' },
  missing: { label: 'Missing', icon: XCircle, rowBg: 'bg-red-50/20', cellBg: 'bg-red-500', badgeBg: 'bg-red-50 text-red-600 border-red-100', iconColor: 'text-red-500' },
}

const riskStyle = {
  None: { text: 'text-gray-400', dot: 'bg-gray-300' },
  Low: { text: 'text-blue-500', dot: 'bg-blue-400' },
  Medium: { text: 'text-amber-600', dot: 'bg-amber-400' },
  High: { text: 'text-red-600 font-700', dot: 'bg-red-500' },
}

const impactStyle = {
  'Disqualification': 'text-red-600 font-700',
  'Score deduction': 'text-amber-600',
  'Minor deduction': 'text-gray-400',
  'Minor': 'text-gray-400',
}

export default function ComplianceAnalysis() {
  const { pipeline } = useWorkspace()
  const [filter, setFilter] = useState('all')

  if (pipeline.loading && !pipeline.compliance) return <PageLoading message={pipeline.step} />
  if (pipeline.error && !pipeline.compliance) return <PageError message={pipeline.error} />
  if (!pipeline.compliance) return <PageEmpty />

  const requirements = mapComplianceRequirements(pipeline.compliance)
  const pass = pipeline.compliance.pass ?? requirements.filter(r => r.status === 'pass').length
  const partial = pipeline.compliance.partial ?? requirements.filter(r => r.status === 'partial').length
  const missing = pipeline.compliance.missing ?? requirements.filter(r => r.status === 'missing').length
  const total = pipeline.compliance.total ?? requirements.length
  const score = Math.round(pipeline.compliance.compliance_score || 0)

  const filtered = filter === 'all' ? requirements : requirements.filter(r => r.status === filter)
  const highRisk = requirements.filter(r => r.risk === 'High')

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Compliance Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} requirements checked against company capability library</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-700 text-indigo-600">{score}%</div>
          <div className="text-xs text-gray-400">Overall Compliance</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pass', count: pass, desc: 'Requirements met', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle, iconColor: 'text-emerald-500' },
          { label: 'Partial', count: partial, desc: 'Needs strengthening', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle, iconColor: 'text-amber-500' },
          { label: 'Missing', count: missing, desc: 'Action required', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: XCircle, iconColor: 'text-red-500' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`bg-white border ${s.border} rounded-xl p-5 shadow-sm`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={16} className={s.iconColor} />
                </div>
                <span className={`text-3xl font-700 ${s.color}`}>{s.count}</span>
              </div>
              <div className={`text-sm font-600 ${s.color}`}>{s.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.desc}</div>
            </div>
          )
        })}
      </div>

      {/* HIGH RISK HEATMAP */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-red-50 bg-red-50/40 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-sm font-700 text-red-800">Critical Risk Heatmap — {highRisk.length} High-Risk Items</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {highRisk.map((r, i) => {
              const cfg = statusCfg[r.status]
              const StatusIcon = cfg.icon
              return (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${r.status === 'missing' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.status === 'missing' ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <StatusIcon size={15} className={cfg.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-700 text-gray-800">{r.req}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{r.evidence}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-600 border px-1.5 py-0.5 rounded-full ${cfg.badgeBg}`}>{cfg.label}</span>
                      <span className={`text-[10px] font-700 ${impactStyle[r.impact]}`}>⚠ {r.impact}</span>
                      <span className="text-[10px] font-600 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{r.category}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Visual Heatmap Grid */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-600 text-gray-800">Full Compliance Heatmap</h2>
          <div className="flex items-center gap-3">
            {[['bg-emerald-400', 'Pass'], ['bg-amber-400', 'Partial'], ['bg-red-500', 'Missing']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${color} opacity-80`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {requirements.map((req, i) => {
            const cfg = statusCfg[req.status]
            const isHigh = req.risk === 'High'
            return (
              <div
                key={i}
                title={`${req.req} — ${req.status.toUpperCase()} · Risk: ${req.risk}`}
                className={`h-9 rounded-lg cursor-pointer transition-all hover:scale-105 hover:opacity-100 opacity-75 flex items-end justify-center pb-1 ${cfg.cellBg} ${isHigh ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
              >
                {isHigh && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Hover for details · Red outline = High Risk · {requirements.length} requirements total</p>
      </div>

      {/* Filter + Full Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-600 text-gray-800">Compliance Checklist</h2>
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            {['all', 'pass', 'partial', 'missing'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-lg font-500 transition-colors capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {f === 'all' ? `All (${total})` : f === 'pass' ? `Pass (${pass})` : f === 'partial' ? `Partial (${partial})` : `Missing (${missing})`}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                {['#', 'Requirement', 'Category', 'Evidence Found', 'Status', 'Risk Level', 'Impact'].map(h => (
                  <th key={h} className="text-left text-[11px] font-600 text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((row, i) => {
                const cfg = statusCfg[row.status]
                const StatusIcon = cfg.icon
                const rs = riskStyle[row.risk]
                return (
                  <tr key={i} className={`${cfg.rowBg} hover:bg-gray-50 transition-colors`}>
                    <td className="px-4 py-3 text-xs text-gray-400 font-500">{String(requirements.indexOf(row) + 1).padStart(2, '0')}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-500 max-w-48">{row.req}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-600 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{row.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-44">{row.evidence}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[11px] font-600 border px-2 py-0.5 rounded-full w-fit ${cfg.badgeBg}`}>
                        <StatusIcon size={10} className={cfg.iconColor} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs ${rs.text}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
                        {row.risk}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-xs ${impactStyle[row.impact]}`}>{row.impact}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
