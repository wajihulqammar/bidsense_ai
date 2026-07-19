import { AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts'
import { useWorkspace } from '../context/WorkspaceContext'
import { mapHistoricalData, PageEmpty, PageError, PageLoading } from '../utils/pipelineHelpers'

export default function HistoricalInsights() {
  const { pipeline, activeWorkspace } = useWorkspace()

  if (pipeline.loading && !pipeline.historical) return <PageLoading message={pipeline.step} />
  if (pipeline.error && !pipeline.historical) return <PageError message={pipeline.error} />
  if (!pipeline.historical) return <PageEmpty />

  const {
    summaryStats,
    historicalBids,
    winRateByYear,
    lossReasons,
    pieData,
  } = mapHistoricalData(pipeline.historical, activeWorkspace?.sector)

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Historical Bid Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">Evidence base for win probability — live data from bid history database</p>
        </div>
        <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full font-600">{activeWorkspace?.sector || 'All'} Filter Active</span>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map(s => (
          <div key={s.label} className={`bg-white rounded-xl border ${s.border} p-5 shadow-sm`}>
            <div className={`text-2xl font-700 ${s.color}`}>{s.value}</div>
            <div className="text-xs font-600 text-gray-600 mt-1">{s.label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Win rate by year */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-600 text-gray-800 mb-1">Win Rate Trend — IT Services Sector</h2>
          <p className="text-xs text-gray-400 mb-4">5-year historical performance in comparable government cloud bids</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={winRateByYear} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 90]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, n) => [n === 'rate' ? `${v}%` : v, n === 'rate' ? 'Win Rate' : 'Bids']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Win/loss pie */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-600 text-gray-800 mb-1">Outcome Distribution</h2>
          <p className="text-xs text-gray-400 mb-2">{historicalBids.length} similar bids</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-xs text-gray-600 font-500">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Bids Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-600 text-gray-800">Comparable Historical Bids</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-600">{historicalBids.length} matches · sorted by relevance</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                {['Bid ID', 'Tender Name', 'Sector', 'Value (PKR M)', 'Eval Score', 'Year', 'Result'].map(h => (
                  <th key={h} className="text-left text-[11px] font-600 text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {historicalBids.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{row.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-500">{row.name}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-600 bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full">{row.sector}</span></td>
                  <td className="px-4 py-3 text-sm font-600 text-gray-700">{row.value}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 rounded-full" style={{ width: `${row.score}%`, backgroundColor: row.score >= 75 ? '#10b981' : '#f59e0b' }} />
                      </div>
                      <span className="text-xs font-600 text-gray-700">{row.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{row.year}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-700 px-2 py-0.5 rounded-full border ${row.result === 'Won' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {row.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loss Reasons */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={15} className="text-red-400" />
          <h2 className="text-sm font-600 text-gray-800">Most Common Loss Reasons — Historical Analysis</h2>
        </div>
        <div className="space-y-3">
          {lossReasons.map(r => (
            <div key={r.reason} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 w-48 shrink-0">{r.reason}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-red-300 rounded-full" style={{ width: `${r.pct * 3}%` }} />
              </div>
              <span className="text-xs font-700 text-gray-600 w-8 text-right">{r.pct}%</span>
              <span className="text-xs text-gray-400 w-16">{r.count} bids</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-xs text-amber-800"><span className="font-600">Key insight:</span> "Weak local content proof" is the second most common loss reason and is currently a gap in this bid. Recommend prioritising LCC documentation before submission.</p>
        </div>
      </div>
    </div>
  )
}
