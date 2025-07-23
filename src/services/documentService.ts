import { blink } from '../blink/client'
import { co2reDocumentScraper, CO2REDocument } from '../utils/co2reDocumentScraper'
import { smartCategorizer } from '../utils/smartCategorization'

export class DocumentService {
  async getDocuments(): Promise<CO2REDocument[]> {
    try {
      const result = await blink.db.documents.list({
        orderBy: { publishedDate: 'desc' },
        limit: 100
      })
      
      if (result.length === 0) {
        // If no documents in database, return real mock data with working URLs
        return co2reDocumentScraper.getRealMockDocuments()
      }
      
      return result.map(this.mapDbToDocument)
    } catch (error) {
      console.error('Error fetching documents:', error)
      return co2reDocumentScraper.getRealMockDocuments()
    }
  }

  async searchDocuments(query: string, filters?: {
    category?: string
    type?: string
    theme?: string
  }): Promise<CO2REDocument[]> {
    try {
      const whereClause: any = {}
      
      if (filters?.category) {
        whereClause.category = filters.category
      }
      
      if (filters?.type) {
        whereClause.type = filters.type
      }

      const result = await blink.db.documents.list({
        where: whereClause,
        orderBy: { relevanceScore: 'desc' },
        limit: 50
      })

      let documents = result.map(this.mapDbToDocument)

      // Filter by search query
      if (query) {
        documents = documents.filter(doc => 
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.content.toLowerCase().includes(query.toLowerCase()) ||
          doc.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
      }

      // Filter by theme
      if (filters?.theme) {
        documents = documents.filter(doc => 
          doc.theme.some(t => t.toLowerCase().includes(filters.theme!.toLowerCase()))
        )
      }

      return documents
    } catch (error) {
      console.error('Error searching documents:', error)
      return []
    }
  }

  async updateDocuments(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      console.log('🔄 Starting comprehensive CO2RE document update...')
      
      const documents = await co2reDocumentScraper.scrapeAllDocuments()
      
      if (documents.length === 0) {
        return {
          success: false,
          count: 0,
          message: 'No documents found during scraping'
        }
      }

      console.log('🤖 Applying smart categorization to documents...')
      
      // Apply smart categorization to improve document metadata
      const enhancedDocuments = documents.map(doc => {
        const categorization = smartCategorizer.categorizeDocument(doc.title, doc.content, doc.url)
        
        return {
          ...doc,
          category: categorization.category,
          type: categorization.type,
          theme: [...new Set([...doc.theme, ...categorization.themes])], // Merge themes
          tags: [...new Set([...doc.tags, ...categorization.tags])], // Merge tags
          relevanceScore: Math.max(doc.relevanceScore || 0, categorization.confidence)
        }
      })

      // Store enhanced documents in database
      let successCount = 0
      for (const doc of enhancedDocuments) {
        try {
          await blink.db.documents.create({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            excerpt: doc.excerpt,
            url: doc.url,
            pdfUrl: doc.pdfUrl || '',
            category: doc.category,
            type: doc.type,
            theme: JSON.stringify(doc.theme),
            authors: JSON.stringify(doc.authors),
            publishedDate: doc.publishedDate,
            tags: JSON.stringify(doc.tags),
            relevanceScore: doc.relevanceScore || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          successCount++
        } catch (error) {
          // Document might already exist, try to update
          try {
            await blink.db.documents.update(doc.id, {
              title: doc.title,
              content: doc.content,
              excerpt: doc.excerpt,
              url: doc.url,
              pdfUrl: doc.pdfUrl || '',
              category: doc.category,
              type: doc.type,
              theme: JSON.stringify(doc.theme),
              authors: JSON.stringify(doc.authors),
              publishedDate: doc.publishedDate,
              tags: JSON.stringify(doc.tags),
              relevanceScore: doc.relevanceScore || 0,
              updatedAt: new Date().toISOString()
            })
            successCount++
          } catch (updateError) {
            console.error(`Failed to create/update document ${doc.id}:`, updateError)
          }
        }
      }

      // Log categorization statistics
      const categoryStats = smartCategorizer.getCategoryStats(enhancedDocuments.map(doc => ({
        category: doc.category,
        confidence: doc.relevanceScore || 0,
        themes: doc.theme,
        tags: doc.tags,
        type: doc.type
      })))
      
      console.log('📊 Document categories:', categoryStats)
      console.log(`✅ Successfully updated ${successCount} documents with smart categorization`)

      return {
        success: true,
        count: successCount,
        message: `Successfully updated ${successCount} documents from CO2RE with smart categorization`
      }
    } catch (error) {
      console.error('Error updating documents:', error)
      return {
        success: false,
        count: 0,
        message: `Error updating documents: ${error.message}`
      }
    }
  }

  async getDocumentStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    byType: Record<string, number>
    recentCount: number
  }> {
    try {
      const documents = await this.getDocuments()
      
      const stats = {
        total: documents.length,
        byCategory: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        recentCount: 0
      }

      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      documents.forEach(doc => {
        // Count by category
        stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1
        
        // Count by type
        stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1
        
        // Count recent documents
        if (new Date(doc.publishedDate) > oneMonthAgo) {
          stats.recentCount++
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting document stats:', error)
      return {
        total: 0,
        byCategory: {},
        byType: {},
        recentCount: 0
      }
    }
  }

  private mapDbToDocument(dbDoc: any): CO2REDocument {
    return {
      id: dbDoc.id,
      title: dbDoc.title,
      content: dbDoc.content,
      excerpt: dbDoc.excerpt,
      url: dbDoc.url,
      pdfUrl: dbDoc.pdfUrl || undefined,
      category: dbDoc.category,
      type: dbDoc.type,
      theme: JSON.parse(dbDoc.theme || '[]'),
      authors: JSON.parse(dbDoc.authors || '[]'),
      publishedDate: dbDoc.publishedDate,
      tags: JSON.parse(dbDoc.tags || '[]'),
      relevanceScore: dbDoc.relevanceScore
    }
  }
}

export const documentService = new DocumentService()