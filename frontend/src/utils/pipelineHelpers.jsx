import { CheckSquare, Star, Calendar, DollarSign, FileQuestion } from 'lucide-react'

function requirementText(item) {
  if (typeof item === 'string') return item.trim()
  if (!item || typeof item !== 'object') return ''
  return String(
    item.text || item.requirement || item.description || item.question
    || item.clause || item.name || '',
  ).trim()
}

/** Build a non-empty list of requirement objects for capability/compliance APIs. */
export function buildRequirementsList(requirements) {
  if (!requirements) return []

  const sources = [
    ...(requirements.mandatory_requirements || []),
    ...(requirements.evaluation_criteria || []),
    ...(requirements.deadlines || []).map((d) => ({
      ...d,
      text: requirementText(d) || `Deadline: ${d.date || d.text || ''}`.trim(),
      tag: d.tag || 'Deadline',
    })),
    ...(requirements.budget || []).map((b) => ({
      ...b,
      text: requirementText(b) || `Budget: ${b.amount || b.text || ''}`.trim(),
      tag: b.tag || 'Budget',
    })),
    ...(requirements.qa_sections || []).map((q) => ({
      ...q,
      text: requirementText(q),
      tag: q.section || 'Q&A',
    })),
  ]

  const ner = requirements.ner_entities || {}
  const nerItems = [
    ...(ner.compliance_clauses || []).map((c) => ({
      text: typeof c === 'string' ? c : requirementText(c),
      tag: 'Compliance',
      priority: 'High',
    })),
    ...(ner.evaluation_weights || []).map((w) => ({
      text: typeof w === 'string' ? w : `${w.criterion || w.text || ''}: ${w.weight || ''}%`.trim(),
      tag: 'Evaluation',
    })),
  ]

  const seen = new Set()
  const result = []
  for (const item of [...sources, ...nerItems]) {
    const text = requirementText(item)
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(typeof item === 'string' ? { text } : { ...item, text })
  }
  return result
}

export function mapMatchStatus(status) {
  if (status === 'Found') return 'matched'
  if (status === 'Partial') return 'partial'
  return 'missing'
}

export function mapComplianceStatus(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'pass' || s === 'found') return 'pass'
  if (s === 'partial') return 'partial'
  return 'missing'
}

export function mapCapabilityMatches(matched = []) {
  return matched.map(m => ({
    requirement: m.requirement,
    category: m.matched_caps?.[0]?.split(' ')[0] || 'Requirement',
    evidence: m.evidence ? {
      title: m.matched_caps?.[0] || 'Matched Evidence',
      source: 'Capability Library (ChromaDB RAG)',
      detail: m.evidence,
    } : null,
    confidence: Math.round(m.confidence || 0),
    status: mapMatchStatus(m.status),
  }))
}

export function mapComplianceRequirements(compliance) {
  if (!compliance?.compliance_details?.length) return []
  return compliance.compliance_details.map(d => ({
    req: d.requirement,
    evidence: d.evidence || 'No evidence',
    status: mapComplianceStatus(d.status),
    risk: d.risk_level || 'None',
    impact: d.risk_level === 'High' ? 'Disqualification' : d.risk_level === 'Medium' ? 'Score deduction' : 'Minor',
    category: 'Compliance',
  }))
}

export function buildRequirementSections(requirements) {
  if (!requirements) return []
  const configs = [
    { id: 'mandatory', key: 'mandatory_requirements', label: 'Mandatory Requirements', icon: CheckSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', badgeColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'evaluation', key: 'evaluation_criteria', label: 'Evaluation Criteria', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'deadlines', key: 'deadlines', label: 'Submission Deadlines', icon: Calendar, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', badgeColor: 'bg-red-100 text-red-600' },
    { id: 'budget', key: 'budget', label: 'Budget Information', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', badgeColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'qa', key: 'qa_sections', label: 'Q&A Sections', icon: FileQuestion, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', badgeColor: 'bg-violet-100 text-violet-700' },
  ]
  return configs.map(c => {
    const items = (requirements[c.key] || []).map(item => ({
      text: item.text || item.question || '',
      priority: item.priority || 'Medium',
      tag: item.tag || item.section || 'General',
      weight: item.weight,
    }))
    return {
      ...c,
      badge: `${items.length} item${items.length !== 1 ? 's' : ''}`,
      items,
    }
  }).filter(s => s.items.length > 0)
}

export function mapHistoricalData(historical, sector = '') {
  const analysis = historical?.analysis || historical || {}
  const similar = analysis.similar_projects || []
  const sectorPerf = analysis.sector_performance || {}
  const lossReasons = (analysis.most_common_loss_reasons || []).map((reason, i) => ({
    reason,
    count: 5 - i,
    pct: Math.round(100 / Math.max((analysis.most_common_loss_reasons || []).length, 1)),
  }))

  const wins = similar.filter(p => String(p.outcome).toLowerCase() === 'win').length
  const losses = similar.length - wins

  const winRateByYear = Object.entries(
    similar.reduce((acc, p) => {
      const y = p.year || '2024'
      if (!acc[y]) acc[y] = { wins: 0, total: 0 }
      acc[y].total += 1
      if (String(p.outcome).toLowerCase() === 'win') acc[y].wins += 1
      return acc
    }, {}),
  ).map(([year, v]) => ({
    year,
    rate: v.total ? Math.round(v.wins / v.total * 100) : 0,
    bids: v.total,
  }))

  return {
    summaryStats: [
      { label: 'Similar Bids Found', value: String(analysis.total_bids_analyzed || similar.length), sub: 'From bid history database', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
      { label: 'Average Win Rate', value: `${analysis.avg_win_rate || 0}%`, sub: `${sector || analysis.sector_filter || 'All'} sector`, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
      { label: 'Avg Evaluation Score', value: String(analysis.avg_evaluation_score || 0), sub: 'Out of 100 points', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
      { label: 'Avg Contract Value', value: analysis.avg_contract_value || 'N/A', sub: 'Similar scope bids', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    ],
    historicalBids: similar.map((p, i) => ({
      id: `BID-${p.year || 2024}-${String(i + 1).padStart(3, '0')}`,
      name: p.project,
      value: parseInt(String(p.value).replace(/\D/g, ''), 10) / 1000000 || 50,
      sector: sector || 'IT Services',
      score: 75,
      result: String(p.outcome).toLowerCase() === 'win' ? 'Won' : 'Lost',
      year: p.year,
    })),
    winRateByYear: winRateByYear.length ? winRateByYear : [{ year: '2024', rate: analysis.avg_win_rate || 0, bids: similar.length }],
    lossReasons,
    pieData: [
      { name: 'Won', value: wins || 1, fill: '#10b981' },
      { name: 'Lost', value: losses || 0, fill: '#f87171' },
    ],
    sectorChart: Object.entries(sectorPerf).map(([s, v]) => ({
      sector: s,
      winRate: v.win_rate,
      bids: v.total_bids,
    })),
  }
}

const PROPOSAL_LABELS = {
  executive_summary: 'Executive Summary',
  technical_response: 'Technical Response',
  compliance_response: 'Compliance Response',
  past_experience: 'Past Experience & References',
  implementation_methodology: 'Implementation Methodology',
  risk_mitigation: 'Risk Mitigation',
  company_profile: 'Company Profile',
}

export function mapProposalSections(proposalData) {
  const proposal = proposalData?.proposal || proposalData || {}
  return Object.entries(PROPOSAL_LABELS).map(([id, label]) => {
    const content = proposal[id] || ''
    return {
      id,
      label,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      status: content ? 'generated' : 'empty',
      content,
    }
  }).filter(s => s.content)
}

export function PageLoading({ message }) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
      <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
      <p className="text-sm font-600 text-gray-700">{message || 'Loading analysis…'}</p>
    </div>
  )
}

export function PageError({ message, onRetry }) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-600 text-red-600 mb-2">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Retry
        </button>
      )}
    </div>
  )
}

export function PageEmpty({ message }) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm text-gray-500">{message || 'Upload an RFP in Workspaces to begin analysis.'}</p>
    </div>
  )
}
