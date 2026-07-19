import { AlertTriangle, Target } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts'
import { useWorkspace } from '../context/WorkspaceContext'
import { PageEmpty, PageError, PageLoading } from '../utils/pipelineHelpers'

const severityColor = { High: 'bg-red-50 text-red-600 border-red-100', Medium: 'bg-amber-50 text-amber-700 border-amber-100', Low: 'bg-blue-50 text-blue-600 border-blue-100' }

function CircularScore({ value }) {
  const r = 70
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg width="192" height="192" className="transform -rotate-90">
        <circle cx="96" cy="96" r={r} fill="none" stroke="#EEF2FF" strokeWidth="12" />
        <circle
          cx="96" cy="96" r={r} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-700 text-gray-900">{value}%</div>
        <div className="text-xs text-gray-400 font-500 mt-0.5">Win Probability</div>
      </div>
    </div>
  )
}

export default function WinProbability() {
  const { pipeline } = useWorkspace()

  if (pipeline.loading && !pipeline.winProbability) return <PageLoading message={pipeline.step} />
  if (pipeline.error && !pipeline.winProbability) return <PageError message={pipeline.error} />
  if (!pipeline.winProbability) return <PageEmpty />

  const winProb = pipeline.winProbability
  const winScore = Math.round(winProb.win_probability || 0)
  const radarData = (winProb.radar_data || []).map(r => ({
    factor: r.factor || 'Factor',
    value: Number(r.value) || 0,
    fullMark: 100,
  }))
  const historicalData = (winProb.sector_chart || []).map(s => ({
    sector: s.sector || 'Unknown',
    winRate: Number(s.winRate ?? s.win_rate) || 0,
    bids: s.bids || 0,
  }))
  const riskFactors = (winProb.negative_factors || []).map(f => ({
    factor: typeof f === 'string' ? f : f.text || f.factor || String(f),
    severity: typeof f === 'object' && f.severity ? f.severity : 'Medium',
    impact: typeof f === 'object' && f.impact ? f.impact : 'May reduce evaluation score or win probability',
  }))
  const opportunityFactors = (winProb.positive_factors || []).map(f => ({
    factor: typeof f === 'string' ? f : f.text || f.factor || String(f),
    sentiment: 'positive',
  }))
  const aboveThreshold = winScore >= 70

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-700 text-gray-900">Win Probability Assessment</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered scoring based on historical bids and key factors</p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score Circle */}
        <div className="bg-white rounded-xl border border-indigo-100 p-6 shadow-sm flex flex-col items-center justify-center">
          <CircularScore value={winScore} />
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-sm font-600 border px-3 py-1 rounded-full ${
              aboveThreshold ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'
            }`}>{aboveThreshold ? 'Above Threshold' : 'Below Threshold'}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">{winScore}% — confidence: {winProb.confidence || 'Medium'}</p>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-600 text-gray-800 mb-2">Factor Breakdown</h2>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Historical win rates */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-600 text-gray-800 mb-2">Win Rate by Sector</h2>
          <p className="text-xs text-gray-400 mb-3">Based on 47 historical bids</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={historicalData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#F3F4F6" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="sector" type="category" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v) => [`${v}%`, 'Win Rate']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
                {historicalData.map((entry, i) => (
                  <Cell key={i} fill={entry.winRate >= 70 ? '#6366f1' : entry.winRate >= 55 ? '#f59e0b' : '#f87171'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Factor scores grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {radarData.map(item => (
          <div key={item.factor} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-500 text-gray-700">{item.factor}</span>
              <span className="font-700 text-gray-900">{item.value}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.value >= 75 ? '#10b981' : item.value >= 60 ? '#6366f1' : '#f59e0b'
                }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1.5">
              {item.value >= 75 ? 'Strong' : item.value >= 60 ? 'Adequate' : 'Needs Improvement'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Factors */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="text-sm font-600 text-gray-800">Risk Factors</h2>
          </div>
          <div className="space-y-3">
            {riskFactors.length === 0 ? (
              <p className="text-sm text-gray-400">No major risk factors identified.</p>
            ) : riskFactors.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`text-[10px] font-600 border px-1.5 py-0.5 rounded-full mt-0.5 shrink-0 ${severityColor[r.severity]}`}>{r.severity}</span>
                <div>
                  <p className="text-sm text-gray-700 font-500">{r.factor}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunity Assessment */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-emerald-500" />
            <h2 className="text-sm font-600 text-gray-800">Opportunity Strengths</h2>
          </div>
          <div className="space-y-2.5">
            {opportunityFactors.length === 0 ? (
              <p className="text-sm text-gray-400">No opportunity strengths listed yet.</p>
            ) : opportunityFactors.map((o, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-sm text-gray-700">{o.factor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
