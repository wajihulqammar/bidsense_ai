import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '../api/client'
import { buildRequirementsList } from '../utils/pipelineHelpers'

const STORAGE_KEY = 'bidsense_workspaces'
const PIPELINE_CACHE_KEY = 'bidsense_pipeline_cache'

const EMPTY_PIPELINE = {
  loading: false,
  error: null,
  step: '',
  requirements: null,
  nerEntities: null,
  capabilityMatching: null,
  compliance: null,
  historical: null,
  winProbability: null,
  decision: null,
  proposal: null,
  executiveSummary: null,
  pages: 0,
  filename: '',
  processingTimeMs: null,
}

const WorkspaceContext = createContext(null)

function loadWorkspaces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveWorkspaces(workspaces) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces))
}

function loadPipelineCache() {
  try {
    const raw = localStorage.getItem(PIPELINE_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function savePipelineCache(cache) {
  localStorage.setItem(PIPELINE_CACHE_KEY, JSON.stringify(cache))
}

function pipelineToCache(pipeline) {
  return {
    requirements: pipeline.requirements,
    nerEntities: pipeline.nerEntities,
    capabilityMatching: pipeline.capabilityMatching,
    compliance: pipeline.compliance,
    historical: pipeline.historical,
    winProbability: pipeline.winProbability,
    decision: pipeline.decision,
    proposal: pipeline.proposal,
    executiveSummary: pipeline.executiveSummary,
    pages: pipeline.pages,
    filename: pipeline.filename,
  }
}

function extractBudget(requirements) {
  const budgets = requirements?.budget || []
  if (!budgets.length) return ''
  return String(budgets[0].amount || budgets[0].text || '')
}

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState(loadWorkspaces)
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => loadWorkspaces()[0]?.id || null)
  const [pipeline, setPipeline] = useState(() => {
    const id = loadWorkspaces()[0]?.id
    const cached = id ? loadPipelineCache()[id] : null
    return cached
      ? { ...EMPTY_PIPELINE, ...cached, step: 'Complete', loading: false, error: null }
      : { ...EMPTY_PIPELINE }
  })

  useEffect(() => {
    saveWorkspaces(workspaces)
  }, [workspaces])

  // Restore cached analysis when switching workspace (skip during active upload)
  useEffect(() => {
    if (!activeWorkspaceId) return

    setPipeline(prev => {
      if (prev.loading) return prev
      const cached = loadPipelineCache()[activeWorkspaceId]
      if (cached?.decision) {
        return { ...EMPTY_PIPELINE, ...cached, step: 'Complete', loading: false, error: null }
      }
      if (!cached) return { ...EMPTY_PIPELINE }
      return prev
    })
  }, [activeWorkspaceId])

  // Persist completed pipeline per workspace
  useEffect(() => {
    if (!activeWorkspaceId || pipeline.loading || !pipeline.decision) return
    const cache = loadPipelineCache()
    cache[activeWorkspaceId] = pipelineToCache(pipeline)
    savePipelineCache(cache)
  }, [
    activeWorkspaceId,
    pipeline.loading,
    pipeline.decision,
    pipeline.proposal,
    pipeline.executiveSummary,
    pipeline.compliance,
    pipeline.winProbability,
  ])

  const activeWorkspace = useMemo(
    () => workspaces.find(w => w.id === activeWorkspaceId) || null,
    [workspaces, activeWorkspaceId],
  )

  const updateWorkspace = useCallback((id, patch) => {
    setWorkspaces(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)))
  }, [])

  const runAnalysisPipeline = useCallback(async (workspace, filepath) => {
    const sector = workspace.sector || ''
    const workspaceName = workspace.name || 'RFP'

    setPipeline(prev => ({ ...prev, loading: true, error: null, step: 'Extracting requirements & running NER…' }))

    try {
      const extraction = await api.extractRequirements(filepath)
      const requirements = extraction.requirements
      const nerEntities = requirements?.ner_entities || extraction.ner_entities
      const reqList = buildRequirementsList(requirements)
      const budget = extractBudget(requirements)
      const detectedSector = sector || requirements?.sector || ''

      if (!reqList.length) {
        throw new Error(
          'No requirements were extracted from this document. '
          + 'This usually means GEMINI_API_KEY is missing or invalid in backend/.env. '
          + 'Create a new key at https://aistudio.google.com/apikey and restart the backend.',
        )
      }

      setPipeline(prev => ({
        ...prev,
        requirements,
        nerEntities,
        pages: extraction.pages || prev.pages,
        step: 'Matching capabilities via RAG…',
      }))

      const capabilityMatching = await api.matchCapabilities(reqList, workspace.id)
      const matched = capabilityMatching.matched || []
      const summary = capabilityMatching.summary || {}

      setPipeline(prev => ({ ...prev, capabilityMatching, step: 'Analyzing compliance…' }))

      const compliance = await api.analyzeCompliance(reqList, matched)

      setPipeline(prev => ({ ...prev, compliance, step: 'Running historical analysis…' }))

      const historical = await api.analyzeHistorical(detectedSector, budget)

      setPipeline(prev => ({ ...prev, historical, step: 'Computing win probability…' }))

      const winProbability = await api.computeWinProbability(
        compliance.compliance_score,
        summary.capability_score || 0,
        detectedSector,
        budget,
      )

      setPipeline(prev => ({ ...prev, winProbability, step: 'Generating GO/NO-GO decision…' }))

      const decision = await api.computeDecision({
        win_probability: winProbability.win_probability,
        compliance_score: compliance.compliance_score,
        capability_score: summary.capability_score || 0,
        missing_count: compliance.missing || 0,
        sector: detectedSector,
        requirements: reqList,
        matched_capabilities: matched,
      })

      setPipeline(prev => ({ ...prev, decision, step: 'Generating proposal draft…' }))

      const proposal = await api.generateProposal(reqList, matched, compliance, workspaceName)

      setPipeline(prev => ({ ...prev, proposal, step: 'Generating executive summary…' }))

      const executiveSummary = await api.generateExecutiveSummary(
        requirements,
        compliance,
        winProbability,
        decision,
        historical.analysis,
      )

      const decisionLabel = decision.decision === 'NO-GO' ? 'NO-GO' : decision.decision === 'CONDITIONAL GO' ? 'GO' : 'GO'
      const status = decision.decision === 'NO-GO' ? 'At Risk' : compliance.compliance_score >= 75 ? 'Active' : 'Review'

      updateWorkspace(workspace.id, {
        pages: extraction.pages || workspace.pages,
        compliance: Math.round(compliance.compliance_score || 0),
        win: Math.round(winProbability.win_probability || 0),
        decision: decisionLabel,
        status,
        requirements: compliance.total || reqList.length,
        gaps: compliance.missing || 0,
        org: requirements?.issuing_organization || workspace.org,
        value: budget || workspace.value,
      })

      setPipeline(prev => ({
        ...prev,
        executiveSummary,
        loading: false,
        step: 'Complete',
        error: null,
      }))

      return { requirements, capabilityMatching, compliance, historical, winProbability, decision, proposal, executiveSummary }
    } catch (err) {
      setPipeline(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Analysis pipeline failed',
        step: 'Failed',
      }))
      throw err
    }
  }, [updateWorkspace])

  const uploadAndAnalyze = useCallback(async (file, workspaceMeta) => {
    setPipeline(prev => ({ ...prev, loading: true, error: null, step: 'Uploading document…' }))

    try {
      const upload = await api.uploadRfp(file)
      setActiveWorkspaceId(upload.workspace_id)
      const workspace = {
        id: upload.workspace_id,
        name: workspaceMeta?.name || file.name.replace(/\.[^.]+$/, ''),
        org: workspaceMeta?.org || 'Pending extraction',
        value: workspaceMeta?.value || 'TBD',
        deadline: workspaceMeta?.deadline || 'TBD',
        sector: workspaceMeta?.sector || 'IT Services',
        pages: upload.pages || 0,
        compliance: 0,
        win: 0,
        decision: 'Pending',
        status: 'Review',
        docs: [{
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          pages: upload.pages || 0,
          uploaded: 'Just now',
          status: 'processing',
        }],
        createdAt: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }),
        daysLeft: 30,
        requirements: 0,
        gaps: 0,
        filepath: upload.filepath,
        filename: upload.filename,
      }

      setWorkspaces(prev => [workspace, ...prev.filter(w => w.id !== workspace.id)])
      setPipeline(prev => ({
        ...prev,
        filename: upload.filename,
        pages: upload.pages || 0,
      }))

      await runAnalysisPipeline(workspace, upload.filepath)

      setWorkspaces(prev => prev.map(w =>
        w.id === workspace.id
          ? { ...w, docs: w.docs.map(d => ({ ...d, status: 'processed' })) }
          : w,
      ))

      return workspace
    } catch (err) {
      setPipeline(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Upload failed',
        step: 'Failed',
      }))
      throw err
    }
  }, [runAnalysisPipeline])

  const createWorkspace = useCallback((meta) => {
    const workspace = {
      id: `ws-${Date.now()}`,
      name: meta.name,
      org: meta.org || '',
      value: meta.value || 'TBD',
      deadline: meta.deadline || 'TBD',
      sector: meta.sector || 'IT Services',
      pages: 0,
      compliance: 0,
      win: 0,
      decision: 'Pending',
      status: 'Review',
      docs: [],
      createdAt: new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }),
      daysLeft: 30,
      requirements: 0,
      gaps: 0,
    }
    setWorkspaces(prev => [workspace, ...prev])
    setActiveWorkspaceId(workspace.id)
    return workspace
  }, [])

  const regenerateProposal = useCallback(async () => {
    if (!activeWorkspace || !pipeline.requirements || !pipeline.capabilityMatching) return
    const reqList = buildRequirementsList(pipeline.requirements)
    const matched = pipeline.capabilityMatching.matched || []
    setPipeline(prev => ({ ...prev, loading: true, step: 'Regenerating proposal…' }))
    try {
      const proposal = await api.generateProposal(
        reqList,
        matched,
        pipeline.compliance,
        activeWorkspace.name,
      )
      setPipeline(prev => ({ ...prev, proposal, loading: false, step: 'Complete' }))
      return proposal
    } catch (err) {
      setPipeline(prev => ({ ...prev, loading: false, error: err.message }))
      throw err
    }
  }, [activeWorkspace, pipeline])

  const value = useMemo(() => ({
    workspaces,
    setWorkspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    pipeline,
    uploadAndAnalyze,
    createWorkspace,
    updateWorkspace,
    runAnalysisPipeline,
    regenerateProposal,
  }), [
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    pipeline,
    uploadAndAnalyze,
    createWorkspace,
    updateWorkspace,
    runAnalysisPipeline,
    regenerateProposal,
  ])

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
