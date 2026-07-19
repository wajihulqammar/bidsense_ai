import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { buildRequirementSections, PageEmpty, PageError, PageLoading } from '../utils/pipelineHelpers'

const priorityColors = {
  Critical: 'bg-red-50 text-red-600 border border-red-100',
  High: 'bg-amber-50 text-amber-700 border border-amber-100',
  Medium: 'bg-blue-50 text-blue-700 border border-blue-100',
}

function AccordionSection({ section, open, onToggle }) {
  const Icon = section.icon
  return (
    <div className={`bg-white rounded-xl border ${section.border} shadow-sm overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left"
      >
        <div className={`w-8 h-8 ${section.bg} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon size={15} className={section.color} />
        </div>
        <span className="text-sm font-600 text-gray-800 flex-1">{section.label}</span>
        <span className={`text-[11px] font-600 px-2 py-0.5 rounded-full ${section.badgeColor}`}>{section.badge}</span>
        {open ? <ChevronDown size={16} className="text-gray-400 ml-2" /> : <ChevronRight size={16} className="text-gray-400 ml-2" />}
      </button>
      {open && (
        <div className="border-t border-gray-50">
          {section.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors group">
              <div className="w-5 h-5 rounded border-2 border-gray-200 group-hover:border-indigo-300 mt-0.5 shrink-0 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                {item.weight && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 max-w-48 bg-gray-100 rounded-full">
                      <div className="h-1 bg-amber-400 rounded-full" style={{ width: `${item.weight * 3}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 font-500">{item.weight}% weight</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                <span className={`text-[10px] font-600 px-1.5 py-0.5 rounded-full ${priorityColors[item.priority]}`}>{item.priority}</span>
                <span className="text-[10px] font-500 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RequirementExtraction() {
  const { pipeline, activeWorkspace } = useWorkspace()
  const [openSections, setOpenSections] = useState({ mandatory: true, evaluation: true })

  const toggle = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))

  if (pipeline.loading && !pipeline.requirements) return <PageLoading message={pipeline.step} />
  if (pipeline.error && !pipeline.requirements) return <PageError message={pipeline.error} />
  if (!pipeline.requirements) return <PageEmpty />

  const sections = buildRequirementSections(pipeline.requirements)
  const req = pipeline.requirements
  const counts = [
    { label: 'Mandatory', count: req.mandatory_requirements?.length || 0, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { label: 'Evaluation', count: req.evaluation_criteria?.length || 0, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Deadlines', count: req.deadlines?.length || 0, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Budget Items', count: req.budget?.length || 0, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Q&A Items', count: req.qa_sections?.length || 0, color: 'text-violet-700', bg: 'bg-violet-50' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Requirement Extraction</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-extracted from {activeWorkspace?.docs?.[0]?.name || pipeline.filename || 'uploaded document'} · {pipeline.pages || activeWorkspace?.pages || 0} pages · {sections.length} sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-full font-600 ${
            pipeline.loading ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${pipeline.loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {pipeline.loading ? 'Processing…' : 'Extraction Complete'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {counts.map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <div className={`text-2xl font-700 ${s.color}`}>{s.count}</div>
            <div className={`text-xs font-500 ${s.color} opacity-80 mt-0.5`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {sections.map(section => (
          <AccordionSection
            key={section.id}
            section={section}
            open={!!openSections[section.id]}
            onToggle={() => toggle(section.id)}
          />
        ))}
      </div>
    </div>
  )
}
