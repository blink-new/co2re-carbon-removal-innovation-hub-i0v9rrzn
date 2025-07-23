import React, { useState } from 'react'
import { Search, Filter, Building, Users, MapPin, Star, MessageCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

const PartnershipHub = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const partners = [
    {
      id: 1,
      name: "GreenTech Ventures",
      type: "VC Fund",
      category: "Finance",
      location: "London, UK",
      expertise: ["Series A", "Climate Tech", "Carbon Markets"],
      description: "Leading climate tech investor with £200M AUM, specializing in carbon removal and clean energy technologies.",
      matchScore: 94,
      logo: "/api/placeholder/40/40",
      employees: "15-50",
      founded: "2019",
      totalInvestments: 23,
      avgInvestment: "£2.5M",
      recentActivity: "Invested in 3 carbon removal startups this quarter",
      isVerified: true,
      responseRate: 85,
      responseTime: "2 days"
    },
    {
      id: 2,
      name: "Carbon Legal Partners",
      type: "Law Firm",
      category: "Legal",
      location: "Edinburgh, UK",
      expertise: ["Carbon Credits", "Environmental Law", "IP Protection"],
      description: "Specialized legal services for carbon removal companies, with expertise in regulatory compliance and IP strategy.",
      matchScore: 89,
      logo: "/api/placeholder/40/40",
      employees: "50-100",
      founded: "2015",
      totalClients: 45,
      avgProject: "£15K",
      recentActivity: "Helped 5 companies navigate new carbon credit regulations",
      isVerified: true,
      responseRate: 92,
      responseTime: "1 day"
    },
    {
      id: 3,
      name: "Imperial College Carbon Research Lab",
      type: "Research Institution",
      category: "Academia",
      location: "London, UK",
      expertise: ["DAC Research", "MRV Development", "Technology Assessment"],
      description: "Leading research lab focused on carbon removal technologies with 15+ years of experience in the field.",
      matchScore: 82,
      logo: "/api/placeholder/40/40",
      employees: "20-30",
      founded: "2008",
      totalProjects: 67,
      avgProject: "£50K",
      recentActivity: "Published breakthrough DAC efficiency study",
      isVerified: true,
      responseRate: 78,
      responseTime: "3 days"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partnership Hub</h1>
          <p className="text-gray-600 mt-2">Connect with investors, legal experts, researchers, and industry partners</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search partners by expertise, location, or industry..."
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
          <Badge variant="secondary" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            All Partners
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            Finance
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            Legal
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            Insurance
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            Academia
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            UK Based
          </Badge>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {partners.map((partner) => (
          <Card key={partner.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={partner.logo} alt={partner.name} />
                    <AvatarFallback>{partner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg hover:text-co2re-orange cursor-pointer">
                        {partner.name}
                      </CardTitle>
                      {partner.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Building className="h-3 w-3" />
                      <span>{partner.type}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {partner.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{partner.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-co2re-orange">{partner.matchScore}% Match</div>
                  <Progress value={partner.matchScore} className="w-16 h-2 mt-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{partner.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {partner.expertise.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Team Size:</span>
                  <div className="font-medium">{partner.employees}</div>
                </div>
                <div>
                  <span className="text-gray-500">Founded:</span>
                  <div className="font-medium">{partner.founded}</div>
                </div>
                <div>
                  <span className="text-gray-500">Response Rate:</span>
                  <div className="font-medium">{partner.responseRate}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Response Time:</span>
                  <div className="font-medium">{partner.responseTime}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">Recent Activity</span>
                </div>
                <p className="text-sm text-gray-700">{partner.recentActivity}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{partner.category === 'Finance' ? partner.totalInvestments : partner.totalClients} {partner.category === 'Finance' ? 'investments' : 'clients'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button size="sm" className="bg-co2re-orange hover:bg-co2re-orange/90">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PartnershipHub