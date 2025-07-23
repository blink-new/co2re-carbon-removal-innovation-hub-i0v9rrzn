import { blink } from '../blink/client'
import { cdrFundingScraper, type FundingOpportunity } from '../utils/cdrFundingScraper'
import { cdrVcScraper, type CDRVCFunding } from '../utils/cdrVcScraper'

export class FundingService {
  
  async scrapeFundingData(): Promise<FundingOpportunity[]> {
    console.log('🔄 Starting comprehensive funding data scraping...')
    
    try {
      // Scrape traditional funding sources
      const generalOpportunities = await cdrFundingScraper.scrapeAllSources()
      
      // Scrape CDR-focused VCs and specialized funding
      const cdrVcOpportunities = await this.scrapeCDRVCs()
      
      // Combine all opportunities
      const allOpportunities = [...generalOpportunities, ...cdrVcOpportunities]
      
      // Store in database
      await this.storeFundingOpportunities(allOpportunities)
      
      console.log(`✅ Successfully scraped and stored ${allOpportunities.length} funding opportunities`)
      console.log(`   - General funding: ${generalOpportunities.length}`)
      console.log(`   - CDR VCs: ${cdrVcOpportunities.length}`)
      
      return allOpportunities
      
    } catch (error) {
      console.error('❌ Funding scraping error:', error)
      return []
    }
  }

  async scrapeCDRVCs(): Promise<FundingOpportunity[]> {
    console.log('🎯 Scraping CDR-focused VCs and specialized funding...')
    
    try {
      // Scrape real data from CDR funders (includes Counteract, Carbon Removal Partners, Grantham Foundation, etc.)
      const cdrFunding = await cdrVcScraper.scrapeAllCDRFunding()
      
      // Convert CDRVCFunding to FundingOpportunity format
      const opportunities: FundingOpportunity[] = cdrFunding.map(vc => ({
        id: vc.id,
        title: vc.title,
        organization: vc.organization,
        type: vc.type,
        amount: vc.amount,
        deadline: vc.deadline,
        description: vc.description,
        requirements: vc.requirements,
        website: vc.url,
        contactEmail: vc.contact_info?.includes('@') ? vc.contact_info : null,
        focusAreas: vc.focus_areas,
        stage: vc.stage,
        location: vc.geography.join(', '),
        matchScore: 85, // Default high match for CDR-focused funders
        lastUpdated: vc.created_at
      }))
      
      console.log(`✅ Found ${opportunities.length} CDR-focused funding sources`)
      return opportunities
      
    } catch (error) {
      console.error('❌ CDR VC scraping error:', error)
      
      // Fallback to curated mock data if real scraping fails
      try {
        console.log('🔄 Falling back to curated CDR funding data...')
        const fallbackFunding = await cdrVcScraper.getTargetedCDRFunders()
        
        const fallbackOpportunities: FundingOpportunity[] = fallbackFunding.map(vc => ({
          id: vc.id,
          title: vc.title,
          organization: vc.organization,
          type: vc.type,
          amount: vc.amount,
          deadline: vc.deadline,
          description: vc.description,
          requirements: vc.requirements,
          website: vc.url,
          contactEmail: vc.contact_info?.includes('@') ? vc.contact_info : null,
          focusAreas: vc.focus_areas,
          stage: vc.stage,
          location: vc.geography.join(', '),
          matchScore: 85,
          lastUpdated: vc.created_at
        }))
        
        console.log(`✅ Using ${fallbackOpportunities.length} curated CDR funding sources`)
        return fallbackOpportunities
        
      } catch (fallbackError) {
        console.error('❌ Fallback CDR data error:', fallbackError)
        return []
      }
    }
  }

  private async storeFundingOpportunities(opportunities: FundingOpportunity[]) {
    console.log('💾 Storing funding opportunities in database...')
    
    for (const opportunity of opportunities) {
      try {
        // Check if opportunity already exists
        const existing = await blink.db.fundingOpportunities.list({
          where: { id: opportunity.id },
          limit: 1
        })
        
        if (existing.length === 0) {
          // Insert new opportunity
          await blink.db.fundingOpportunities.create({
            id: opportunity.id,
            title: opportunity.title,
            organization: opportunity.organization,
            type: opportunity.type,
            amount: opportunity.amount,
            deadline: opportunity.deadline || null,
            description: opportunity.description,
            requirements: JSON.stringify(opportunity.requirements),
            website: opportunity.website,
            contactEmail: opportunity.contactEmail || null,
            focusAreas: JSON.stringify(opportunity.focusAreas),
            stage: JSON.stringify(opportunity.stage),
            location: opportunity.location,
            lastUpdated: opportunity.lastUpdated,
            isActive: true
          })
        } else {
          // Update existing opportunity
          await blink.db.fundingOpportunities.update(opportunity.id, {
            title: opportunity.title,
            organization: opportunity.organization,
            type: opportunity.type,
            amount: opportunity.amount,
            deadline: opportunity.deadline || null,
            description: opportunity.description,
            requirements: JSON.stringify(opportunity.requirements),
            website: opportunity.website,
            contactEmail: opportunity.contactEmail || null,
            focusAreas: JSON.stringify(opportunity.focusAreas),
            stage: JSON.stringify(opportunity.stage),
            location: opportunity.location,
            lastUpdated: opportunity.lastUpdated
          })
        }
        
      } catch (error) {
        console.error(`Error storing opportunity ${opportunity.id}:`, error)
      }
    }
  }

  async getFundingOpportunities(filters?: {
    type?: string
    stage?: string
    focusArea?: string
    location?: string
    limit?: number
  }): Promise<FundingOpportunity[]> {
    
    try {
      const whereConditions: any = { isActive: true }
      
      if (filters?.type) {
        whereConditions.type = filters.type
      }
      
      const results = await blink.db.fundingOpportunities.list({
        where: whereConditions,
        orderBy: { lastUpdated: 'desc' },
        limit: filters?.limit || 50
      })
      
      // Transform database results back to FundingOpportunity objects
      return results.map((row: any) => ({
        id: row.id,
        title: row.title,
        organization: row.organization,
        type: row.type,
        amount: row.amount,
        deadline: row.deadline,
        description: row.description,
        requirements: JSON.parse(row.requirements || '[]'),
        website: row.website,
        contactEmail: row.contactEmail,
        focusAreas: JSON.parse(row.focusAreas || '[]'),
        stage: JSON.parse(row.stage || '[]'),
        location: row.location,
        matchScore: row.matchScore,
        lastUpdated: row.lastUpdated
      }))
      
    } catch (error) {
      console.error('Error fetching funding opportunities:', error)
      return []
    }
  }

  async updateMatchScores(userProfile: any) {
    console.log('🎯 Updating match scores based on user profile...')
    
    try {
      const opportunities = await this.getFundingOpportunities()
      
      for (const opportunity of opportunities) {
        const matchScore = cdrFundingScraper.calculateMatchScore(opportunity, userProfile)
        
        await blink.db.fundingOpportunities.update(opportunity.id, {
          matchScore: matchScore
        })
      }
      
      console.log('✅ Match scores updated')
      
    } catch (error) {
      console.error('Error updating match scores:', error)
    }
  }

  async getTopMatches(userProfile: any, limit: number = 10): Promise<FundingOpportunity[]> {
    // Update match scores first
    await this.updateMatchScores(userProfile)
    
    // Get top matches
    const results = await blink.db.fundingOpportunities.list({
      where: { isActive: true },
      orderBy: { matchScore: 'desc' },
      limit: limit
    })
    
    return results.map((row: any) => ({
      id: row.id,
      title: row.title,
      organization: row.organization,
      type: row.type,
      amount: row.amount,
      deadline: row.deadline,
      description: row.description,
      requirements: JSON.parse(row.requirements || '[]'),
      website: row.website,
      contactEmail: row.contactEmail,
      focusAreas: JSON.parse(row.focusAreas || '[]'),
      stage: JSON.parse(row.stage || '[]'),
      location: row.location,
      matchScore: row.matchScore,
      lastUpdated: row.lastUpdated
    }))
  }

  async getFundingStats() {
    try {
      const allOpportunities = await blink.db.fundingOpportunities.list({
        where: { isActive: true }
      })
      
      const byType = allOpportunities.reduce((acc: any, opp: any) => {
        const existing = acc.find((item: any) => item.type === opp.type)
        if (existing) {
          existing.count++
        } else {
          acc.push({ type: opp.type, count: 1 })
        }
        return acc
      }, [])
      
      return {
        total: allOpportunities.length,
        byType: byType,
        lastUpdated: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Error getting funding stats:', error)
      return { total: 0, byType: [], lastUpdated: new Date().toISOString() }
    }
  }
}

// Export singleton instance
export const fundingService = new FundingService()