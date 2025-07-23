import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, FileText, Download, Eye, Star, RefreshCw, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { documentService } from '@/services/documentService'
import { CO2REDocument } from '@/utils/co2reDocumentScraper'

const DocumentLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<CO2REDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<CO2REDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    recentCount: 0
  })

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const docs = await documentService.getDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const docStats = await documentService.getDocumentStats()
      setStats(docStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }, [])

  const filterDocuments = useCallback(() => {
    let filtered = documents

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.theme.some(theme => theme.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType)
    }

    setFilteredDocuments(filtered)
  }, [documents, searchQuery, selectedCategory, selectedType])

  useEffect(() => {
    loadDocuments()
    loadStats()
  }, [loadDocuments, loadStats])

  useEffect(() => {
    filterDocuments()
  }, [filterDocuments])

  const handleUpdateDocuments = async () => {
    try {
      setUpdating(true)
      const result = await documentService.updateDocuments()
      
      if (result.success) {
        await loadDocuments()
        await loadStats()
        alert(`✅ Successfully updated ${result.count} documents from CO2RE!`)
      } else {
        alert(`❌ Update failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Error updating documents:', error)
      alert('❌ Error updating documents. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const getTypeIcon = (type: CO2REDocument['type']) => {
    switch (type) {
      case 'policy-brief': return '📋'
      case 'report': return '📊'
      case 'publication': return '📄'
      case 'workshop': return '🎯'
      default: return '📄'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-co2re-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading CO2RE documents...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">CO2RE Document Library</h1>
            <p className="text-gray-600 mt-2">
              Access {stats.total} GGR frameworks, MRV best practices, and research from CO2RE
            </p>
          </div>
          <Button 
            onClick={handleUpdateDocuments}
            disabled={updating}
            className="bg-co2re-orange hover:bg-co2re-orange/90"
          >
            {updating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Update from CO2RE
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-co2re-orange">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-co2re-orange">{stats.recentCount}</div>
              <div className="text-sm text-gray-600">Recent Updates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-co2re-orange">
                {Object.keys(stats.byCategory).length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-co2re-orange">
                {Object.keys(stats.byType).length}
              </div>
              <div className="text-sm text-gray-600">Document Types</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents, frameworks, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedCategory === 'all' ? 'default' : 'outline'} 
            className={`cursor-pointer ${selectedCategory === 'all' ? 'bg-co2re-orange' : 'hover:bg-co2re-orange hover:text-white'}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Categories ({stats.total})
          </Badge>
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'} 
              className={`cursor-pointer ${selectedCategory === category ? 'bg-co2re-orange' : 'hover:bg-co2re-orange hover:text-white'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category} ({count})
            </Badge>
          ))}
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedType === 'all' ? 'default' : 'outline'} 
            className={`cursor-pointer ${selectedType === 'all' ? 'bg-co2re-orange' : 'hover:bg-co2re-orange hover:text-white'}`}
            onClick={() => setSelectedType('all')}
          >
            All Types
          </Badge>
          {Object.entries(stats.byType).map(([type, count]) => (
            <Badge 
              key={type}
              variant={selectedType === type ? 'default' : 'outline'} 
              className={`cursor-pointer ${selectedType === type ? 'bg-co2re-orange' : 'hover:bg-co2re-orange hover:text-white'}`}
              onClick={() => setSelectedType(type)}
            >
              {getTypeIcon(type as CO2REDocument['type'])} {type} ({count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
          </h2>
        </div>

        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-co2re-orange" />
                      <Badge variant="outline" className="text-xs">
                        {getTypeIcon(doc.type)} {doc.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {doc.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg hover:text-co2re-orange cursor-pointer">
                      {doc.title}
                    </CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      By {doc.authors.join(', ')} • {formatDate(doc.publishedDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {((doc.relevanceScore || 0) / 20).toFixed(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{doc.excerpt}</p>
                
                {/* Themes */}
                {doc.theme.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.theme.map((theme) => (
                      <Badge key={theme} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Relevance: {doc.relevanceScore}% • CO2RE Source
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View on CO2RE
                    </Button>
                    {doc.pdfUrl && (
                      <Button 
                        size="sm" 
                        className="bg-co2re-orange hover:bg-co2re-orange/90"
                        onClick={() => window.open(doc.pdfUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters, or update the document library from CO2RE.
            </p>
            <Button 
              onClick={handleUpdateDocuments}
              disabled={updating}
              className="bg-co2re-orange hover:bg-co2re-orange/90"
            >
              {updating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Update from CO2RE
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentLibrary