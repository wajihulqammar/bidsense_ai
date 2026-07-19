import { Server, Building2, Globe, Users, CheckCircle, ArrowRight, Database, Cpu, Shield, Zap, Cloud, GitBranch } from 'lucide-react'

const tiers = [
  {
    tier: 'Current Prototype',
    icon: Cpu,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'POC',
    badgeColor: 'bg-gray-100 text-gray-600',
    users: '1–3 users',
    bids: 'Up to 10 bids/month',
    storage: 'Local / single DB',
    ai: 'Single LLM instance',
    features: [
      'Manual document upload',
      'Single workspace',
      'Static capability library',
      'Basic compliance check',
      'PDF/DOCX export',
    ],
    infra: 'Single-node deployment (Vite + FastAPI + PostgreSQL)',
  },
  {
    tier: 'Department Deployment',
    icon: Building2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    badge: 'Phase 1',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    users: '10–50 users',
    bids: 'Up to 120 bids/year',
    storage: 'Managed PostgreSQL + S3',
    ai: 'LLM API + RAG pipeline',
    features: [
      'Role-based access control',
      'Multi-workspace support',
      'Version-controlled capability library',
      'Real-time collaboration',
      'Audit trail & approvals',
    ],
    infra: 'Docker Compose / AWS ECS — single-region, multi-AZ',
  },
  {
    tier: 'Enterprise Deployment',
    icon: Server,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'Phase 2',
    badgeColor: 'bg-violet-100 text-violet-700',
    users: '100–500 users',
    bids: '500+ bids/year',
    storage: 'Distributed DB + vector store',
    ai: 'Fine-tuned LLM + private RAG',
    features: [
      'SSO / Active Directory integration',
      'Custom scoring models per sector',
      'ERP & CRM connectors',
      'Advanced analytics & BI export',
      'SLA-backed 99.9% uptime',
    ],
    infra: 'Kubernetes (EKS/AKS) — multi-region, auto-scaling',
  },
  {
    tier: 'Multi-Organization SaaS',
    icon: Globe,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'Phase 3',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    users: '1,000+ users across orgs',
    bids: 'Unlimited',
    storage: 'Multi-tenant isolated DB clusters',
    ai: 'Shared LLM + tenant-isolated RAG',
    features: [
      'Full multi-tenancy with data isolation',
      'Marketplace for capability templates',
      'Anonymised cross-org win analytics',
      'White-label & custom branding',
      'Pakistan PPRA & global RFP formats',
    ],
    infra: 'Global CDN + Kubernetes multi-cluster (Islamabad + Karachi + Dubai edge)',
  },
]

const techStack = [
  { layer: 'Frontend', tech: 'React + Vite + Tailwind CSS', icon: Zap, color: 'text-blue-500' },
  { layer: 'API Layer', tech: 'FastAPI (Python) + REST / WebSocket', icon: Server, color: 'text-indigo-500' },
  { layer: 'AI / LLM', tech: 'Anthropic Claude API + LangChain RAG', icon: Cpu, color: 'text-violet-500' },
  { layer: 'Vector Store', tech: 'Pinecone / pgvector for capability RAG', icon: Database, color: 'text-emerald-500' },
  { layer: 'Storage', tech: 'PostgreSQL + AWS S3 (document storage)', icon: Cloud, color: 'text-amber-500' },
  { layer: 'Auth', tech: 'Auth0 / Keycloak (SSO + RBAC)', icon: Shield, color: 'text-rose-500' },
  { layer: 'Orchestration', tech: 'Docker → Kubernetes (EKS)', icon: GitBranch, color: 'text-gray-600' },
]

const pkFeatures = [
  { feature: 'PPRA-compliant tender format recognition', status: true },
  { feature: 'Urdu/English bilingual extraction (roadmap)', status: false },
  { feature: 'Pakistan Data Protection Act 2023 compliance mapping', status: true },
  { feature: 'Integration with Karandaz / PPRA portal (roadmap)', status: false },
  { feature: 'PKR financial figure parsing (crore/lakh notation)', status: true },
  { feature: 'Local government reference validation', status: true },
  { feature: 'Pakistan-specific sector taxonomy (IT, Construction, Logistics)', status: true },
]

export default function Scalability() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-700 text-gray-900">Feasibility & Scalability</h1>
        <p className="text-sm text-gray-500 mt-0.5">Deployment roadmap from prototype to enterprise-grade multi-organisation SaaS</p>
      </div>

      {/* Deployment Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tiers.map((t, i) => {
          const Icon = t.icon
          return (
            <div key={t.tier} className={`bg-white rounded-xl border-2 ${t.border} p-5 shadow-sm relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5`} style={{ background: 'currentColor' }} />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} className={t.color} />
                  </div>
                  <div>
                    <p className="text-sm font-700 text-gray-900">{t.tier}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.users} · {t.bids}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
              </div>

              <div className="space-y-1.5 mb-4">
                {t.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <CheckCircle size={12} className={t.color} />
                    <span className="text-xs text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              <div className={`${t.bg} rounded-lg p-3 mt-3`}>
                <p className={`text-[10px] font-700 uppercase tracking-wider ${t.color} mb-1`}>Infrastructure</p>
                <p className="text-xs text-gray-600">{t.infra}</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 font-500">Storage</p>
                  <p className="text-xs text-gray-700 font-600 mt-0.5">{t.storage}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 font-500">AI Layer</p>
                  <p className="text-xs text-gray-700 font-600 mt-0.5">{t.ai}</p>
                </div>
              </div>

              {i < tiers.length - 1 && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:flex w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center z-10">
                  <ArrowRight size={10} className="text-gray-400" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tech Stack */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-600 text-gray-800 mb-4">Core Technology Stack</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {techStack.map(t => {
            const Icon = t.icon
            return (
              <div key={t.layer} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Icon size={16} className={t.color} />
                <div>
                  <p className="text-xs font-700 text-gray-700">{t.layer}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.tech}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pakistan-specific features */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-4 overflow-hidden rounded-sm shrink-0 flex flex-col">
            <div className="flex-1 bg-green-600" />
            <div className="flex-1 bg-white" />
          </div>
          <h2 className="text-sm font-600 text-gray-800">Pakistan-Specific Feature Readiness</h2>
        </div>
        <div className="space-y-2.5">
          {pkFeatures.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${f.status ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                {f.status ? <CheckCircle size={11} className="text-emerald-600" /> : <span className="text-[9px] text-gray-400 font-600">—</span>}
              </div>
              <p className="text-sm text-gray-700">{f.feature}</p>
              {!f.status && <span className="text-[10px] text-amber-600 font-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full ml-auto">Roadmap</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
