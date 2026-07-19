import { useRef, useState } from 'react'
import {
  Upload, FileText, Calendar, DollarSign, Layers, CheckCircle,
  Eye, Trash2, Download, Cloud, Building, Plus, ArrowRight,
  MoreHorizontal, Search, Filter, FolderOpen, Clock, TrendingUp,
  AlertTriangle, GitBranch, ChevronRight, X, Loader2
} from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'

const statusStyle = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Review: 'bg-amber-50 text-amber-700 border-amber-100',
  'At Risk': 'bg-red-50 text-red-600 border-red-100',
}

const sectorIcon = { 'IT Services': '💻', 'Technology': '⚙️', 'Construction': '🏗️', 'Logistics': '🚚' }

function CreateWorkspaceModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [value, setValue] = useState('')
  const [deadline, setDeadline] = useState('')
  const [sector, setSector] = useState('IT Services')

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({ name, org, value: value || 'TBD', deadline: deadline || 'TBD', sector })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-700 text-gray-900">Create New Workspace</h2>
            <p className="text-xs text-gray-400 mt-0.5">Each RFP gets its own isolated workspace</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-600 text-gray-600 block mb-1.5">Tender / RFP Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. National IT Infrastructure Tender 2025"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-400 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-600 text-gray-600 block mb-1.5">Issuing Organisation</label>
            <input
              value={org}
              onChange={e => setOrg(e.target.value)}
              placeholder="e.g. Ministry of IT & Telecom"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-400 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-600 text-gray-600 block mb-1.5">Contract Value</label>
              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="e.g. PKR 45M"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-600 text-gray-600 block mb-1.5">Submission Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-600 text-gray-600 block mb-1.5">Sector</label>
            <select
              value={sector}
              onChange={e => setSector(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-400 bg-white transition-colors"
            >
              {['IT Services', 'Technology', 'Construction', 'Logistics', 'Healthcare', 'Education', 'Finance'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-500">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Workspace
          </button>
        </div>
      </div>
    </div>
  )
}

function WorkspaceDetail({ ws, onBack, onUpload, uploading, uploadError, pipelineStep }) {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = (files) => {
    const file = files?.[0]
    if (!file) return
    onUpload(file)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 font-500 transition-colors">
            <FolderOpen size={13} /> RFP Workspaces
          </button>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-xs text-gray-600 font-500 truncate">{ws.name}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-700 text-gray-900">{ws.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{ws.org} · Created {ws.createdAt}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-600 border px-2.5 py-1 rounded-full ${statusStyle[ws.status]}`}>{ws.status}</span>
            <span className={`text-xs font-700 px-2.5 py-1 rounded-full border ${ws.decision === 'GO' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {ws.decision}
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Contract Value', value: ws.value, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Submission Deadline', value: ws.deadline, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sector', value: ws.sector, icon: Cloud, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Document Pages', value: `${ws.pages} pages`, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={16} className={c.color} />
              </div>
              <div>
                <div className="text-xs text-gray-400">{c.label}</div>
                <div className="text-sm font-700 text-gray-800 mt-0.5">{c.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Score strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <div className="text-2xl font-700 text-emerald-600">{ws.compliance}%</div>
          <div className="text-xs text-gray-500 mt-0.5">Compliance Score</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <div className="text-2xl font-700 text-indigo-600">{ws.win}%</div>
          <div className="text-xs text-gray-500 mt-0.5">Win Probability</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <div className={`text-2xl font-700 ${ws.gaps <= 3 ? 'text-amber-500' : 'text-red-500'}`}>{ws.gaps}</div>
          <div className="text-xs text-gray-500 mt-0.5">Compliance Gaps</div>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-600 text-gray-800 mb-4">Upload Documents</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer
            ${dragging ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
        >
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
            {uploading ? <Loader2 size={20} className="text-indigo-500 animate-spin" /> : <Upload size={20} className="text-indigo-500" />}
          </div>
          <p className="text-sm font-600 text-gray-700">
            {uploading ? pipelineStep || 'Processing…' : 'Drop RFP or tender documents here'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOCX — up to 50 MB</p>
          {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg font-500 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-600 text-gray-800">Workspace Documents</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-600">{ws.docs.length} files</span>
        </div>
        <div className="divide-y divide-gray-50">
          {ws.docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={15} className="text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-500 text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{doc.size} · {doc.pages} pages · {doc.uploaded}</p>
              </div>
              <div>
                {doc.status === 'processed'
                  ? <span className="flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-600"><CheckCircle size={10} /> Processed</span>
                  : <span className="flex items-center gap-1.5 text-[11px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-600"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> Processing</span>
                }
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Eye size={13} /></button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"><Download size={13} /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RFPWorkspace({ setActivePage }) {
  const {
    workspaces,
    createWorkspace,
    uploadAndAnalyze,
    setActiveWorkspaceId,
    pipeline,
  } = useWorkspace()
  const [selectedWs, setSelectedWs] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadError, setUploadError] = useState(null)

  const handleCreate = ({ name, org, value, deadline, sector }) => {
    const newWs = createWorkspace({ name, org, value, deadline, sector })
    setSelectedWs(newWs)
  }

  const handleUpload = async (file) => {
    setUploadError(null)
    try {
      await uploadAndAnalyze(file, selectedWs)
      if (setActivePage) setActivePage('requirements')
    } catch (err) {
      setUploadError(err.message)
    }
  }

  const openWorkspace = (ws) => {
    setSelectedWs(ws)
    setActiveWorkspaceId(ws.id)
  }

  if (selectedWs) {
    const liveWs = workspaces.find(w => w.id === selectedWs.id) || selectedWs
    return (
      <WorkspaceDetail
        ws={liveWs}
        onBack={() => setSelectedWs(null)}
        onUpload={handleUpload}
        uploading={pipeline.loading}
        uploadError={uploadError || pipeline.error}
        pipelineStep={pipeline.step}
      />
    )
  }

  const filtered = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(search.toLowerCase()) ||
    ws.org.toLowerCase().includes(search.toLowerCase()) ||
    ws.sector.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {showCreate && <CreateWorkspaceModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-700 text-gray-900">RFP Workspaces</h1>
          <p className="text-sm text-gray-500 mt-0.5">Each tender gets its own isolated workspace — documents, analysis, and decisions are kept separate</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={15} /> New Workspace
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Workspaces', value: workspaces.length, color: 'text-gray-800' },
          { label: 'Active Bids', value: workspaces.filter(w => w.status === 'Active').length, color: 'text-emerald-600' },
          { label: 'GO Decisions', value: workspaces.filter(w => w.decision === 'GO').length, color: 'text-emerald-700' },
          { label: 'At Risk', value: workspaces.filter(w => w.status === 'At Risk').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
            <div className={`text-2xl font-700 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workspaces by name, organisation, or sector..."
            className="flex-1 focus:outline-none text-gray-600 placeholder-gray-400 bg-transparent"
          />
        </div>
      </div>

      {/* Workspace Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(ws => (
          <div
            key={ws.id}
            onClick={() => openWorkspace(ws)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-lg shrink-0">
                  {sectorIcon[ws.sector] || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-700 text-gray-900 group-hover:text-indigo-700 transition-colors truncate">{ws.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{ws.org}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                <span className={`text-[10px] font-600 border px-1.5 py-0.5 rounded-full ${statusStyle[ws.status]}`}>{ws.status}</span>
                <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-full border ${ws.decision === 'GO' ? 'bg-emerald-600 text-white border-emerald-600' : ws.decision === 'NO-GO' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {ws.decision}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-400">Value</p>
                <p className="text-xs font-700 text-gray-700 mt-0.5">{ws.value}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-400">Deadline</p>
                <p className="text-xs font-700 text-gray-700 mt-0.5">{ws.deadline}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-400">Sector</p>
                <p className="text-xs font-700 text-gray-700 mt-0.5 truncate">{ws.sector}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Compliance</span>
                  <span className={`font-600 ${ws.compliance >= 75 ? 'text-emerald-600' : ws.compliance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {ws.compliance > 0 ? `${ws.compliance}%` : '—'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-1.5 bg-emerald-400 rounded-full" style={{ width: `${ws.compliance}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Win Prob.</span>
                  <span className={`font-600 ${ws.win >= 70 ? 'text-indigo-600' : ws.win >= 55 ? 'text-amber-600' : ws.win > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {ws.win > 0 ? `${ws.win}%` : '—'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-1.5 bg-indigo-400 rounded-full" style={{ width: `${ws.win}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><FileText size={11} /> {ws.docs.length} doc{ws.docs.length !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {ws.daysLeft}d left</span>
                {ws.gaps > 0 && <span className="flex items-center gap-1 text-amber-500"><AlertTriangle size={11} /> {ws.gaps} gaps</span>}
              </div>
              <span className="flex items-center gap-1 text-indigo-500 font-500 group-hover:gap-1.5 transition-all">
                Open <ArrowRight size={11} />
              </span>
            </div>
          </div>
        ))}

        {/* Empty state / New card */}
        <div
          onClick={() => setShowCreate(true)}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20 transition-all group"
        >
          <div className="w-12 h-12 bg-gray-100 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center mb-3 transition-colors">
            <Plus size={20} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <p className="text-sm font-600 text-gray-500 group-hover:text-indigo-600 transition-colors">Create New Workspace</p>
          <p className="text-xs text-gray-400 mt-1">Upload a new RFP/RFQ/Tender document</p>
        </div>
      </div>
    </div>
  )
}
