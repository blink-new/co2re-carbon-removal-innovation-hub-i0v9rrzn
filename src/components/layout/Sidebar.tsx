import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Users,
  Briefcase,
  User,
  Sparkles,
  TrendingUp,
  BookOpen,
  Target,
  X
} from 'lucide-react'
import { documentService } from '@/services/documentService'
import { fundingService } from '@/services/fundingService'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  currentPage?: string
  onPageChange?: (page: string) => void
}

const quickActions = [
  {
    name: 'AI Research Assistant',
    icon: Sparkles,
    description: 'Get instant insights',
    color: 'co2re-orange'
  },
  {
    name: 'Market Analysis',
    icon: TrendingUp,
    description: 'Latest trends',
    color: 'co2re-green'
  },
  {
    name: 'GGR Frameworks',
    icon: BookOpen,
    description: 'Best practices',
    color: 'co2re-blue'
  },
  {
    name: 'MRV Guidelines',
    icon: Target,
    description: 'Measurement standards',
    color: 'co2re-orange'
  }
]

export function Sidebar({ isOpen = true, onClose, currentPage = 'dashboard', onPageChange }: SidebarProps) {
  const [stats, setStats] = useState({
    documents: 0,
    funding: 0,
    partnerships: 500,
    jobs: 150
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get real document count
        const documents = await documentService.getDocuments()
        const documentCount = documents.length

        // Get real funding count
        const funding = await fundingService.getFundingOpportunities()
        const fundingCount = funding.length

        setStats({
          documents: documentCount,
          funding: fundingCount,
          partnerships: 500, // Static for now
          jobs: 150 // Static for now
        })
      } catch (error) {
        console.error('Error loading sidebar stats:', error)
        // Keep default values on error
      }
    }

    loadStats()
  }, [])

  const navigation = [
    {
      name: 'Dashboard',
      key: 'dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Document Library',
      key: 'documents',
      icon: FileText,
      badge: stats.documents > 0 ? stats.documents.toString() : '0'
    },
    {
      name: 'Funding Directory',
      key: 'funding',
      icon: DollarSign,
      badge: stats.funding > 0 ? stats.funding.toString() : '0'
    },
    {
      name: 'Partnership Hub',
      key: 'partnerships',
      icon: Users,
      badge: 'New'
    },
    {
      name: 'Jobs Portal',
      key: 'jobs',
      icon: Briefcase,
      badge: stats.jobs.toString()
    },
    {
      name: 'Profile',
      key: 'profile',
      icon: User,
      badge: null
    }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-80 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 co2re-gradient rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <div>
                <h2 className="font-semibold text-lg">CO2RE Hub</h2>
                <p className="text-xs text-muted-foreground">Innovation Platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.key
                
                return (
                  <Button
                    key={item.key}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-11",
                      isActive && "bg-co2re-orange/10 text-co2re-orange border-co2re-orange/20"
                    )}
                    onClick={() => {
                      onPageChange?.(item.key)
                      onClose?.()
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          isActive && "bg-co2re-orange text-white"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.name}
                      variant="outline"
                      className="h-auto p-3 flex-col gap-2 hover-lift"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        action.color === 'co2re-orange' && "bg-co2re-orange/10 text-co2re-orange",
                        action.color === 'co2re-green' && "bg-co2re-green/10 text-co2re-green",
                        action.color === 'co2re-blue' && "bg-co2re-blue/10 text-co2re-blue"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{action.name}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="bg-gradient-to-r from-co2re-orange/10 to-co2re-green/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-co2re-orange" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Get personalized insights and recommendations
              </p>
              <Button size="sm" className="w-full co2re-gradient">
                Ask AI
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}