const API_BASE = import.meta.env.VITE_API_URL || '/api'

function formatApiError(detail, status) {
  if (!detail) return `Request failed: ${status}`
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        const field = Array.isArray(item.loc) ? item.loc.filter(Boolean).join('.') : ''
        const msg = item.msg || item.message || JSON.stringify(item)
        return field ? `${field}: ${msg}` : msg
      })
      .join('; ')
  }
  if (typeof detail === 'object') {
    return detail.message || detail.msg || JSON.stringify(detail)
  }
  return String(detail)
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(formatApiError(data.detail || data.message, res.status))
  }
  return data
}

export async function checkHealth() {
  return request('/health')
}

export async function uploadRfp(file) {
  const form = new FormData()
  form.append('file', file)
  return request('/upload', { method: 'POST', body: form })
}

export async function extractRequirements(filepath) {
  return request('/extract-requirements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filepath }),
  })
}

export async function runNer(filepath) {
  return request('/ner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filepath }),
  })
}

export async function matchCapabilities(requirements, workspaceId = '') {
  return request('/match-capabilities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements, workspace_id: workspaceId }),
  })
}

export async function analyzeCompliance(requirements, matchedCapabilities) {
  return request('/compliance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements, matched_capabilities: matchedCapabilities }),
  })
}

export async function analyzeHistorical(sector = '', budget = '') {
  return request('/historical-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sector, budget }),
  })
}

export async function computeWinProbability(complianceScore, capabilityScore, sector = '', budget = '') {
  return request('/win-probability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compliance_score: complianceScore,
      capability_score: capabilityScore,
      sector,
      budget,
    }),
  })
}

export async function computeDecision(payload) {
  return request('/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function generateProposal(requirements, matchedCapabilities, complianceData, workspaceName = 'RFP') {
  return request('/generate-proposal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requirements,
      matched_capabilities: matchedCapabilities,
      compliance_data: complianceData,
      workspace_name: workspaceName,
    }),
  })
}

export async function generateExecutiveSummary(requirements, complianceData, winProbabilityData, decisionData, historicalData = null) {
  return request('/executive-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requirements,
      compliance_data: complianceData,
      win_probability_data: winProbabilityData,
      decision_data: decisionData,
      historical_data: historicalData,
    }),
  })
}
