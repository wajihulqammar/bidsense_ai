import { useState } from 'react'
import { Sparkles, RefreshCw, Download, FileText, ChevronDown, Edit3, Eye, Loader2 } from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'
import { mapProposalSections, PageEmpty, PageError, PageLoading } from '../utils/pipelineHelpers'

const statusBadge = {
  generated: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  draft: 'bg-amber-50 text-amber-700 border-amber-100',
  empty: 'bg-gray-50 text-gray-500 border-gray-100',
}

function SectionEditor({ section, active, onToggle }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors text-left"
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${section.status === 'generated' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          <div className={`w-2 h-2 rounded-full ${section.status === 'generated' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
        <span className="text-sm font-600 text-gray-800 flex-1">{section.label}</span>
        <span className="text-xs text-gray-400 mr-2">{section.wordCount} words</span>
        <span className={`text-[10px] font-600 border px-1.5 py-0.5 rounded-full ${statusBadge[section.status]}`}>
          {section.status === 'generated' ? 'Generated' : 'Draft'}
        </span>
        <ChevronDown size={15} className={`text-gray-400 ml-2 transition-transform ${active ? 'rotate-180' : ''}`} />
      </button>
      {active && (
        <div className="border-t border-gray-50">
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-50 bg-gray-50/30">
            <button
              onClick={() => setEditing(false)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors font-500 ${!editing ? 'bg-white border border-gray-200 text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Eye size={12} /> Preview
            </button>
            <button
              onClick={() => setEditing(true)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors font-500 ${editing ? 'bg-white border border-gray-200 text-gray-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Edit3 size={12} /> Edit
            </button>
            <div className="flex-1" />
            <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-500 transition-colors">
              <RefreshCw size={11} /> Regenerate
            </button>
          </div>
          <div className="p-5">
            {editing ? (
              <textarea
                className="w-full text-sm text-gray-700 leading-relaxed border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-indigo-300 resize-none"
                rows={10}
                defaultValue={section.content}
              />
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProposalGenerator() {
  const { pipeline, activeWorkspace, regenerateProposal } = useWorkspace()
  const [activeSections, setActiveSections] = useState({ executive_summary: true })
  const [generating, setGenerating] = useState(false)
  const toggle = (id) => setActiveSections(prev => ({ ...prev, [id]: !prev[id] }))

  if (pipeline.loading && !pipeline.proposal) return <PageLoading message={pipeline.step} />
  if (pipeline.error && !pipeline.proposal) return <PageError message={pipeline.error} />
  if (!pipeline.proposal) return <PageEmpty />

  const sections = mapProposalSections(pipeline.proposal)
  const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0)
  const generatedCount = sections.filter(s => s.status === 'generated').length

  const handleRegenerate = async () => {
    setGenerating(true)
    try {
      await regenerateProposal()
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">Proposal Generator</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-generated draft — {activeWorkspace?.name || 'Active tender'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={generating || pipeline.loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-500 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate Full Draft
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-5">
        {[
          { label: 'Sections Generated', value: `${generatedCount} / ${sections.length}` },
          { label: 'Total Words', value: totalWords.toLocaleString() },
          { label: 'Compliance Addressed', value: `${pipeline.compliance?.pass || 0} / ${pipeline.compliance?.total || 0}` },
          { label: 'RAG Evidence Used', value: String(pipeline.proposal?.metadata?.rag_evidence_used || 'Yes') },
        ].map(stat => (
          <div key={stat.label} className="text-center flex-1">
            <div className="text-base font-700 text-gray-900">{stat.value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
        <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-500">
            <Download size={12} />
            Export PDF
          </button>
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-500">
            <FileText size={12} />
            Export DOCX
          </button>
        </div>
      </div>

      {/* Section Editors */}
      <div className="space-y-3">
        {sections.map(section => (
          <SectionEditor
            key={section.id}
            section={section}
            active={!!activeSections[section.id]}
            onToggle={() => toggle(section.id)}
          />
        ))}
      </div>

      {/* Footer Note */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <Sparkles size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-600 text-amber-800">Review before submission</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              AI-generated content is a starting point. Always have a senior bid manager review and approve all sections before final export. Verify factual claims, figures, and certifications against source documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
