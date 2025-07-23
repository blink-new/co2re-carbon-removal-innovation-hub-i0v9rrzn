import React, { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Calendar, DollarSign, Users, ExternalLink, Bookmark, RefreshCw, Database, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fundingService } from '../../services/fundingService'
import type { FundingOpportunity } from '../../utils/cdrFundingScraper'

// Mock data for initial display
const mockOpportunities: FundingOpportunity[] = [
  {
    id: 'innovate-uk-cdr-1',
    title: 'Innovate UK Carbon Removal Challenge',
    organization: 'Innovate UK',
    type: 'grant',
    amount: '£2M',
    deadline: '2024-12-31',
    description: 'Funding for innovative carbon dioxide removal technologies and solutions.',
    requirements: ['UK-based company', 'Technology readiness level 4+', 'Clear commercialization path'],
    website: 'https://innovateuk.ukri.org',
    contactEmail: 'support@innovateuk.ukri.org',
    focusAreas: ['Direct Air Capture', 'BECCS', 'Enhanced Weathering'],
    stage: ['Seed', 'Series A'],
    location: 'United Kingdom',
    matchScore: 85,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'breakthrough-energy-cdr-2',
    title: 'Breakthrough Energy Catalyst CDR Program',
    organization: 'Breakthrough Energy',
    type: 'philanthropy',
    amount: '$10M',
    deadline: '2024-11-15',
    description: 'Supporting breakthrough carbon removal technologies with significant scale potential.',
    requirements: ['Scalable technology', 'Cost pathway to <$100/tCO2', 'Strong team'],
    website: 'https://breakthroughenergy.org',
    contactEmail: 'catalyst@breakthroughenergy.org',
    focusAreas: ['Direct Air Capture', 'Ocean CDR', 'Biomass CDR'],
    stage: ['Series A', 'Series B'],
    location: 'Global',
    matchScore: 78,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'systemiq-capital-cdr-3',
    title: 'SYSTEMIQ Capital Climate Tech Fund',
    organization: 'SYSTEMIQ Capital',
    type: 'vc',
    amount: '£5M - £25M',
    deadline: 'Rolling',
    description: 'Investing in climate technologies including carbon removal solutions.',
    requirements: ['Proven technology', 'Clear market opportunity', 'Experienced team'],
    website: 'https://systemiq.earth',
    contactEmail: 'investments@systemiq.earth',
    focusAreas: ['Carbon Removal', 'Climate Tech', 'Circular Economy'],
    stage: ['Series A', 'Series B', 'Growth'],
    location: 'Europe',
    matchScore: 72,
    lastUpdated: new Date().toISOString()
  }
]

const FundingDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>(mockOpportunities)
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [stats, setStats] = useState({ 
    total: mockOpportunities.length, 
    byType: [
      { type: 'grant', count: 1 },
      { type: 'philanthropy', count: 1 },
      { type: 'vc', count: 1 }
    ], 
    lastUpdated: new Date().toISOString() 
  })

  const handleScrapeData = async () => {
    setScraping(true)
    try {
      console.log('Starting funding data scraping...')
      const scrapedData = await fundingService.scrapeFundingData()
      
      if (scrapedData.length > 0) {
        setOpportunities(scrapedData)
        
        // Update stats
        const statsData = await fundingService.getFundingStats()
        setStats(statsData)
        
        console.log(`Successfully loaded ${scrapedData.length} opportunities`)
      } else {
        console.log('No new data scraped, keeping existing data')
      }
      
    } catch (error) {
      console.error('Error scraping funding data:', error)
      // Keep existing mock data on error
    } finally {
      setScraping(false)
    }
  }

  const loadFundingData = async () => {
    setLoading(true)
    try {
      const data = await fundingService.getFundingOpportunities({ limit: 50 })
      
      if (data.length > 0) {
        setOpportunities(data)
        const statsData = await fundingService.getFundingStats()
        setStats(statsData)
      }
      // If no data from database, keep mock data
      
    } catch (error) {
      console.error('Error loading funding data:', error)
      // Keep mock data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFundingData()
  }, [])

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = searchQuery === '' || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = selectedType === 'all' || opp.type === selectedType
    
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grant': return 'bg-green-100 text-green-800'
      case 'vc': return 'bg-blue-100 text-blue-800'
      case 'philanthropy': return 'bg-purple-100 text-purple-800'
      case 'competition': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAmount = (amount: string) => {
    return amount || 'Amount TBD'
  }

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return 'Rolling deadline'
    try {
      return new Date(deadline).toLocaleDateString()
    } catch {
      return deadline
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-co2re-orange" />
          <p className="text-gray-600">Loading funding opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funding Directory</h1>
            <p className="text-gray-600 mt-2">
              Discover grants, VC funding, and investment opportunities for carbon removal ventures
            </p>
          </div>
          <Button 
            onClick={handleScrapeData} 
            disabled={scraping}
            className="bg-co2re-orange hover:bg-co2re-orange/90"
          >
            {scraping ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Update Data
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-co2re-orange">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Opportunities</p>
            </CardContent>
          </Card>
          {stats.byType.map((stat: any) => (
            <Card key={stat.type}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                <p className="text-sm text-gray-600 capitalize">{stat.type}s</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search funding opportunities, organizations, or requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              Sort by Match Score
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedType === 'all' ? 'default' : 'outline'} 
            className="cursor-pointer hover:bg-co2re-orange hover:text-white"
            onClick={() => setSelectedType('all')}
          >
            All Opportunities ({opportunities.length})
          </Badge>
          <Badge 
            variant={selectedType === 'grant' ? 'default' : 'outline'} 
            className="cursor-pointer hover:bg-co2re-orange hover:text-white"
            onClick={() => setSelectedType('grant')}
          >
            Grants ({opportunities.filter(o => o.type === 'grant').length})
          </Badge>
          <Badge 
            variant={selectedType === 'vc' ? 'default' : 'outline'} 
            className="cursor-pointer hover:bg-co2re-orange hover:text-white"
            onClick={() => setSelectedType('vc')}
          >
            VC Funding ({opportunities.filter(o => o.type === 'vc').length})
          </Badge>
          <Badge 
            variant={selectedType === 'philanthropy' ? 'default' : 'outline'} 
            className="cursor-pointer hover:bg-co2re-orange hover:text-white"
            onClick={() => setSelectedType('philanthropy')}
          >
            Philanthropy ({opportunities.filter(o => o.type === 'philanthropy').length})
          </Badge>
          <Badge 
            variant={selectedType === 'competition' ? 'default' : 'outline'} 
            className="cursor-pointer hover:bg-co2re-orange hover:text-white"
            onClick={() => setSelectedType('competition')}
          >
            Competitions ({opportunities.filter(o => o.type === 'competition').length})
          </Badge>
        </div>
      </div>

      {/* Data Source Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Data scraped from UK government sources, VC databases, and philanthropy organizations. 
          Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}
        </AlertDescription>
      </Alert>

      {/* Results */}
      <div className="grid gap-4">
        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No funding opportunities found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-co2re-orange" />
                      <Badge className={getTypeColor(opp.type)}>
                        {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                      </Badge>
                      {opp.stage.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {opp.stage[0]}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg hover:text-co2re-orange cursor-pointer">
                      {opp.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{opp.organization}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {opp.matchScore && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-co2re-orange">{opp.matchScore}% Match</div>
                        <Progress value={opp.matchScore} className="w-16 h-2" />
                      </div>
                    )}
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{opp.description}</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{formatAmount(opp.amount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span>{formatDeadline(opp.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{opp.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span>Active opportunity</span>
                  </div>
                </div>

                {opp.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {opp.focusAreas.map((area) => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}

                {opp.requirements.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-2">Key Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {opp.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-co2re-orange rounded-full"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Updated: {new Date(opp.lastUpdated).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {opp.website && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(opp.website, '_blank')}
                      >
                        Learn More
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      className="bg-co2re-orange hover:bg-co2re-orange/90"
                      onClick={() => window.open(opp.website || '#', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Apply Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default FundingDirectory