import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import BidIntelligence from './pages/BidIntelligence'
import RFPWorkspace from './pages/RFPWorkspace'
import RequirementExtraction from './pages/RequirementExtraction'
import CapabilityMatching from './pages/CapabilityMatching'
import ComplianceAnalysis from './pages/ComplianceAnalysis'
import HistoricalInsights from './pages/HistoricalInsights'
import WinProbability from './pages/WinProbability'
import GoNoGo from './pages/GoNoGo'
import ProposalGenerator from './pages/ProposalGenerator'
import ValidationDashboard from './pages/ValidationDashboard'
import Scalability from './pages/Scalability'
import { WorkspaceProvider } from './context/WorkspaceContext'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const pages = {
    dashboard: <Dashboard setActivePage={setActivePage} />,
    bidintelligence: <BidIntelligence />,
    workspace: <RFPWorkspace setActivePage={setActivePage} />,
    requirements: <RequirementExtraction />,
    capability: <CapabilityMatching />,
    compliance: <ComplianceAnalysis />,
    historical: <HistoricalInsights />,
    winprobability: <WinProbability />,
    gonogo: <GoNoGo />,
    proposal: <ProposalGenerator />,
    validation: <ValidationDashboard />,
    scalability: <Scalability />,
  }

  return (
    <WorkspaceProvider>
      <div className="flex h-screen overflow-hidden bg-[#F8F9FB]">
        <Sidebar activePage={activePage} setActivePage={setActivePage} open={sidebarOpen} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            {pages[activePage] || pages.dashboard}
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  )
}
