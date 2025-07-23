import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Star,
  Zap,
  Target,
  BookOpen,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { documentService } from '@/services/documentService'
import { fundingService } from '@/services/fundingService'

const stats = [
  {
    title: 'CO2RE Documents',
    value: '15+',
    change: 'All categories',
    icon: FileText,
    color: 'co2re-orange'
  },
  {
    title: 'Funding Sources',
    value: '8',
    change: 'UK focused',
    icon: DollarSign,
    color: 'co2re-green'
  },
  {
    title: 'GGR Technologies',
    value: '6',
    change: 'Research areas',
    icon: Users,
    color: 'co2re-blue'
  },
  {
    title: 'Research Themes',
    value: '4',
    change: 'Core themes',
    icon: Briefcase,
    color: 'co2re-orange'
  }
]

const recentDocuments = [
  {
    title: 'Direct Air Capture Technologies',
    type: 'CO2RE Research',
    date: 'Latest',
    relevance: 89,
    category: 'Technical'
  },
  {
    title: 'MRV for Carbon Removal Technologies',
    type: 'CO2RE Research',
    date: 'Latest',
    relevance: 90,
    category: 'MRV'
  },
  {
    title: 'Biochar for Carbon Removal',
    type: 'CO2RE Research',
    date: 'Latest',
    relevance: 93,
    category: 'Technical'
  },
  {
    title: 'Policy & Governance for Carbon Removal',
    type: 'CO2RE Research',
    date: 'Latest',
    relevance: 88,
    category: 'Policy'
  }
]

const fundingOpportunities = [
  {
    title: 'Innovate UK: Net Zero Innovation Portfolio',
    amount: '£2.5M',
    deadline: '15 days',
    match: 94,
    type: 'Grant'
  },
  {
    title: 'Breakthrough Energy Ventures',
    amount: '$50M+',
    deadline: 'Rolling',
    match: 87,
    type: 'VC'
  },
  {
    title: 'UKRI Future Leaders Fellowship',
    amount: '£1.5M',
    deadline: '28 days',
    match: 91,
    type: 'Fellowship'
  }
]

const partnerships = [
  {
    name: 'Imperial College London',
    type: 'Academic',
    expertise: 'DAC Research',
    match: 96,
    location: 'London, UK'
  },
  {
    name: 'Drax Group',
    type: 'Corporate',
    expertise: 'BECCS',
    match: 89,
    location: 'Yorkshire, UK'
  },
  {
    name: 'Carbon Engineering',
    type: 'Technology',
    expertise: 'Direct Air Capture',
    match: 92,
    location: 'Global'
  }
]

export function Dashboard() {
  const [stats, setStats] = useState({
    documents: 0,
    funding: 0,
    ggrTechnologies: 6,
    researchThemes: 4
  })
  const [recentDocuments, setRecentDocuments] = useState<any[]>([])
  const [fundingOpportunities, setFundingOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load real document data
        const documents = await documentService.getDocuments()
        const funding = await fundingService.getFundingOpportunities({ limit: 3 })
        
        setStats({
          documents: documents.length,
          funding: funding.length,
          ggrTechnologies: 6,
          researchThemes: 4
        })
        
        setRecentDocuments(documents.slice(0, 4))
        setFundingOpportunities(funding.slice(0, 3))
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const dashboardStats = [
    {
      title: 'CO2RE Documents',
      value: stats.documents.toString(),
      change: 'All categories',
      icon: FileText,
      color: 'co2re-orange'
    },
    {
      title: 'Funding Sources',
      value: stats.funding.toString(),
      change: 'UK focused',
      icon: DollarSign,
      color: 'co2re-green'
    },
    {
      title: 'GGR Technologies',
      value: stats.ggrTechnologies.toString(),
      change: 'Research areas',
      icon: Users,
      color: 'co2re-blue'
    },
    {
      title: 'Research Themes',
      value: stats.researchThemes.toString(),
      change: 'Core themes',
      icon: Briefcase,
      color: 'co2re-orange'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-co2re-orange/10 via-co2re-green/10 to-co2re-blue/10 rounded-2xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-co2re-orange/10 via-co2re-green/10 to-co2re-blue/10 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
            <p className="text-muted-foreground text-lg">
              Your carbon removal innovation journey continues. Here's what's new today.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button className="co2re-gradient">
              <Zap className="mr-2 h-4 w-4" />
              AI Insights
            </Button>
            <Button variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Set Goals
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                  <Icon className={`h-4 w-4 text-${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-sm text-co2re-green">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-co2re-orange" />
                  Recent Documents
                </CardTitle>
                <CardDescription>
                  AI-curated documents based on your interests
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{doc.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {doc.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>CO2RE Research</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Latest
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-co2re-green">
                      {doc.relevanceScore || 90}% match
                    </div>
                    <Progress value={doc.relevanceScore || 90} className="w-16 h-2" />
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-co2re-orange" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Accelerate your innovation journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start co2re-gradient">
              <FileText className="mr-2 h-4 w-4" />
              Search Documents
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Find Funding
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Connect Partners
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Briefcase className="mr-2 h-4 w-4" />
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funding Opportunities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-co2re-green" />
                  Top Funding Matches
                </CardTitle>
                <CardDescription>
                  Opportunities tailored to your profile
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fundingOpportunities.map((opportunity, index) => (
              <div key={index} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium flex-1">{opportunity.title}</h4>
                  <Badge className="co2re-gradient text-white">
                    {opportunity.matchScore || 85}% match
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-co2re-green">{opportunity.amount}</span>
                    <Badge variant="outline">{opportunity.type}</Badge>
                  </div>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {opportunity.deadline}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Partnership Matches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-co2re-blue" />
                  Partnership Matches
                </CardTitle>
                <CardDescription>
                  Strategic connections for your venture
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {partnerships.map((partner, index) => (
              <div key={index} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{partner.name}</h4>
                    <p className="text-sm text-muted-foreground">{partner.expertise}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-co2re-orange fill-current" />
                    <span className="text-sm font-medium">{partner.match}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{partner.type}</Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {partner.location}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}