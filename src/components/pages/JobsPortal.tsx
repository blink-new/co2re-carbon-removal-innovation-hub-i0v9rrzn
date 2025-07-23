import React, { useState } from 'react'
import { Search, Filter, MapPin, Clock, Building, DollarSign, Users, BookmarkPlus, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const JobsPortal = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const jobs = [
    {
      id: 1,
      title: "Senior Carbon Removal Engineer",
      company: "Climeworks",
      location: "London, UK",
      type: "Full-time",
      experience: "5+ years",
      salary: "£70,000 - £90,000",
      posted: "2 days ago",
      description: "Lead the development of next-generation direct air capture systems. Work with cutting-edge technology to scale carbon removal solutions.",
      requirements: ["PhD in Chemical/Mechanical Engineering", "Experience with DAC systems", "Process optimization expertise"],
      benefits: ["Equity package", "Remote work options", "Professional development budget"],
      logo: "/api/placeholder/40/40",
      isRemote: false,
      isUrgent: true,
      applicants: 23,
      tags: ["Engineering", "DAC", "Senior Level"]
    },
    {
      id: 2,
      title: "Carbon Markets Analyst",
      company: "Microsoft Climate Innovation Fund",
      location: "Remote, UK",
      type: "Full-time",
      experience: "2-4 years",
      salary: "£50,000 - £65,000",
      posted: "1 week ago",
      description: "Analyze carbon credit markets and evaluate carbon removal projects for investment opportunities.",
      requirements: ["Finance/Economics background", "Carbon markets knowledge", "Data analysis skills"],
      benefits: ["Stock options", "Health insurance", "Learning stipend"],
      logo: "/api/placeholder/40/40",
      isRemote: true,
      isUrgent: false,
      applicants: 45,
      tags: ["Finance", "Analysis", "Remote"]
    },
    {
      id: 3,
      title: "MRV Specialist - Entry Level",
      company: "Puro.earth",
      location: "Edinburgh, UK",
      type: "Full-time",
      experience: "0-2 years",
      salary: "£35,000 - £45,000",
      posted: "3 days ago",
      description: "Join our team to develop monitoring, reporting, and verification protocols for carbon removal projects.",
      requirements: ["Environmental Science degree", "Attention to detail", "Willingness to learn"],
      benefits: ["Training program", "Mentorship", "Career progression"],
      logo: "/api/placeholder/40/40",
      isRemote: false,
      isUrgent: false,
      applicants: 67,
      tags: ["Entry Level", "MRV", "Environmental"]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Portal</h1>
          <p className="text-gray-600 mt-2">Find career opportunities in the carbon removal sector</p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              🔒 <strong>Sign in required:</strong> Create a profile to apply for jobs, save opportunities, and get personalized recommendations.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs by title, company, or skills..."
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
              Sort by Date
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            All Jobs
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            Entry Level
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            Remote
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            Engineering
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            Finance
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-co2re-orange hover:text-white">
            UK Only
          </Badge>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.logo} alt={job.company} />
                    <AvatarFallback>{job.company.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg hover:text-co2re-orange cursor-pointer">
                        {job.title}
                      </CardTitle>
                      {job.isUrgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      {job.isRemote && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Remote
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Building className="h-3 w-3" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{job.posted}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <BookmarkPlus className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{job.description}</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <div className="font-medium">{job.type}</div>
                </div>
                <div>
                  <span className="text-gray-500">Experience:</span>
                  <div className="font-medium">{job.experience}</div>
                </div>
                <div>
                  <span className="text-gray-500">Salary:</span>
                  <div className="font-medium">{job.salary}</div>
                </div>
                <div>
                  <span className="text-gray-500">Applicants:</span>
                  <div className="font-medium">{job.applicants}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {job.requirements.slice(0, 2).map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-co2re-orange rounded-full"></div>
                        {req}
                      </li>
                    ))}
                    {job.requirements.length > 2 && (
                      <li className="text-co2re-orange text-xs cursor-pointer">
                        +{job.requirements.length - 2} more requirements
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Benefits:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {job.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                    {job.benefits.length > 2 && (
                      <li className="text-co2re-orange text-xs cursor-pointer">
                        +{job.benefits.length - 2} more benefits
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{job.applicants} applicants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{job.salary}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm" className="bg-co2re-orange hover:bg-co2re-orange/90">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Apply Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sign-in CTA */}
      <Card className="bg-gradient-to-r from-co2re-orange/10 to-blue-50 border-co2re-orange/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Ready to find your dream job in carbon removal?</h3>
          <p className="text-gray-600 mb-4">Sign in to apply for positions, save jobs, and get personalized recommendations based on your skills and interests.</p>
          <Button className="bg-co2re-orange hover:bg-co2re-orange/90">
            Sign In to Apply for Jobs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default JobsPortal