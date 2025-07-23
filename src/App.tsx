import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Dashboard } from '@/components/dashboard/Dashboard'
import DocumentLibrary from '@/components/pages/DocumentLibrary'
import FundingDirectory from '@/components/pages/FundingDirectory'
import PartnershipHub from '@/components/pages/PartnershipHub'
import JobsPortal from '@/components/pages/JobsPortal'
import { Toaster } from '@/components/ui/toaster'
import blink from '@/blink/client'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 co2re-gradient rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">CO2RE Innovation Hub</h2>
            <p className="text-muted-foreground">Loading your carbon removal platform...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show sign-in prompt only for jobs page when not authenticated
  if (!user && currentPage === 'jobs') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-co2re-orange/5 via-co2re-green/5 to-co2re-blue/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 co2re-gradient rounded-3xl flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold co2re-text-gradient">
                Sign In Required
              </h1>
              <p className="text-muted-foreground text-lg">
                To apply for jobs and access personalized recommendations, please sign in to your CO2RE account.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => blink.auth.login()}
              className="w-full py-3 px-6 co2re-gradient text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign In to Access Jobs
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="w-full py-3 px-6 bg-white/50 border text-gray-700 font-medium rounded-lg hover:bg-white/70 transition-colors"
            >
              Browse Platform Without Signing In
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            You can explore documents, funding, and partnerships without signing in
          </p>
        </div>
      </div>
    )
  }

  // Show welcome screen for non-authenticated users on first visit
  if (!user && currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-co2re-orange/5 via-co2re-green/5 to-co2re-blue/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 co2re-gradient rounded-3xl flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold co2re-text-gradient">
                CO2RE Innovation Hub
              </h1>
              <p className="text-muted-foreground text-lg">
                Your AI-powered platform for carbon removal innovation
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-white/50 border">
                <div className="font-medium text-co2re-orange">1.2k+</div>
                <div className="text-muted-foreground">Documents</div>
              </div>
              <div className="p-4 rounded-lg bg-white/50 border">
                <div className="font-medium text-co2re-green">£50M+</div>
                <div className="text-muted-foreground">Funding</div>
              </div>
              <div className="p-4 rounded-lg bg-white/50 border">
                <div className="font-medium text-co2re-blue">500+</div>
                <div className="text-muted-foreground">Partners</div>
              </div>
              <div className="p-4 rounded-lg bg-white/50 border">
                <div className="font-medium text-co2re-orange">150+</div>
                <div className="text-muted-foreground">Jobs</div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setCurrentPage('documents')}
                className="w-full py-3 px-6 bg-white border text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Explore Platform (No Sign-in Required)
              </button>
              <button
                onClick={() => blink.auth.login()}
                className="w-full py-3 px-6 co2re-gradient text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign In for Full Access
              </button>
            </div>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-6">
              <span>✓ GGR Frameworks</span>
              <span>✓ MRV Best Practices</span>
            </div>
            <div className="flex items-center justify-center gap-6">
              <span>✓ AI-Powered Search</span>
              <span>✓ Partnership Matching</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'documents':
        return <DocumentLibrary />
      case 'funding':
        return <FundingDirectory />
      case 'partnerships':
        return <PartnershipHub />
      case 'jobs':
        return <JobsPortal />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-80">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {renderCurrentPage()}
            </div>
          </main>
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}

export default App