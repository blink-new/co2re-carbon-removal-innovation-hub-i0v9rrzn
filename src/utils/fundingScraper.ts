// Funding Data Scraper Utility
// This demonstrates how we could scrape funding opportunities from various sources

export interface FundingOpportunity {
  id: string
  title: string
  organization: string
  type: 'Grant' | 'VC Funding' | 'Competition' | 'Accelerator' | 'Government'
  amount: string
  deadline: string
  location: string
  stage: string
  description: string
  requirements: string[]
  tags: string[]
  sourceUrl: string
  scrapedAt: Date
}

// Mock data sources that could be scraped
const FUNDING_SOURCES = [
  {
    name: 'Innovate UK',
    url: 'https://www.gov.uk/government/organisations/innovate-uk',
    selectors: {
      title: '.gem-c-title__text',
      description: '.gem-c-lead-paragraph',
      deadline: '.gem-c-metadata__definition'
    }
  },
  {
    name: 'Climate Investment Coalition',
    url: 'https://www.climateinvestmentcoalition.org/',
    selectors: {
      title: 'h2.opportunity-title',
      amount: '.funding-amount',
      deadline: '.deadline-date'
    }
  },
  {
    name: 'XPRIZE',
    url: 'https://www.xprize.org/prizes',
    selectors: {
      title: '.prize-title',
      amount: '.prize-purse',
      description: '.prize-description'
    }
  }
]

// Simulated scraping function (in real implementation, this would use web scraping)
export async function scrapeFundingOpportunities(): Promise<FundingOpportunity[]> {
  // In a real implementation, this would:
  // 1. Use a web scraping library like Puppeteer or Playwright
  // 2. Navigate to each funding source
  // 3. Extract data using CSS selectors
  // 4. Clean and normalize the data
  // 5. Store in database with deduplication
  
  console.log('🔍 Scraping funding opportunities from multiple sources...')
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock scraped data (in real implementation, this would come from actual scraping)
  const mockScrapedData: FundingOpportunity[] = [
    {
      id: 'scraped_1',
      title: 'Clean Growth Fund - Carbon Removal Technologies',
      organization: 'UK Government',
      type: 'Grant',
      amount: '£100,000 - £2,000,000',
      deadline: '2024-04-30',
      location: 'UK',
      stage: 'Early to Growth Stage',
      description: 'Government funding for innovative carbon removal technologies with commercial potential. Focus on scalable solutions.',
      requirements: [
        'UK-registered company',
        'Technology readiness level 4-7',
        'Clear commercialization plan',
        'Environmental impact assessment'
      ],
      tags: ['Government', 'Clean Growth', 'Technology', 'UK'],
      sourceUrl: 'https://www.gov.uk/government/collections/clean-growth-fund',
      scrapedAt: new Date()
    },
    {
      id: 'scraped_2',
      title: 'European Innovation Council - Climate Tech',
      organization: 'European Commission',
      type: 'Grant',
      amount: '€500,000 - €17,500,000',
      deadline: '2024-06-15',
      location: 'Europe',
      stage: 'Any Stage',
      description: 'EU funding for breakthrough climate technologies including carbon removal, with fast-track to market support.',
      requirements: [
        'EU-based company or consortium',
        'Breakthrough innovation',
        'High-risk, high-gain project',
        'Clear European added value'
      ],
      tags: ['EU', 'Innovation', 'Climate Tech', 'Breakthrough'],
      sourceUrl: 'https://eic.ec.europa.eu/eic-funding-opportunities_en',
      scrapedAt: new Date()
    },
    {
      id: 'scraped_3',
      title: 'Breakthrough Energy Catalyst',
      organization: 'Breakthrough Energy',
      type: 'VC Funding',
      amount: '$10M - $100M',
      deadline: 'Rolling',
      location: 'Global',
      stage: 'Scale-up',
      description: 'Patient capital for climate technologies ready for commercial deployment, including direct air capture and other carbon removal solutions.',
      requirements: [
        'Proven technology at pilot scale',
        'Clear path to gigaton-scale impact',
        'Strong management team',
        'Sustainable business model'
      ],
      tags: ['Patient Capital', 'Scale-up', 'Climate Tech', 'Global'],
      sourceUrl: 'https://www.breakthroughenergy.org/catalyst',
      scrapedAt: new Date()
    }
  ]
  
  console.log(`✅ Successfully scraped ${mockScrapedData.length} funding opportunities`)
  
  return mockScrapedData
}

// Function to scrape specific funding source
export async function scrapeSpecificSource(sourceName: string): Promise<FundingOpportunity[]> {
  const source = FUNDING_SOURCES.find(s => s.name === sourceName)
  if (!source) {
    throw new Error(`Unknown funding source: ${sourceName}`)
  }
  
  console.log(`🔍 Scraping ${sourceName}...`)
  
  // In real implementation, this would:
  // 1. Navigate to the source URL
  // 2. Use the specific selectors for that source
  // 3. Extract and clean the data
  // 4. Return structured funding opportunities
  
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    {
      id: `${sourceName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      title: `Latest opportunity from ${sourceName}`,
      organization: sourceName,
      type: 'Grant',
      amount: 'TBD',
      deadline: 'TBD',
      location: 'UK',
      stage: 'Various',
      description: `Recently discovered funding opportunity from ${sourceName}`,
      requirements: ['To be determined from source'],
      tags: [sourceName],
      sourceUrl: source.url,
      scrapedAt: new Date()
    }
  ]
}

// Function to get funding match score based on user profile
export function calculateFundingMatch(
  opportunity: FundingOpportunity,
  userProfile: {
    stage: string
    location: string
    sector: string[]
    fundingRange: string
  }
): number {
  let score = 0
  
  // Stage matching (30% weight)
  if (opportunity.stage.toLowerCase().includes(userProfile.stage.toLowerCase())) {
    score += 30
  }
  
  // Location matching (25% weight)
  if (opportunity.location.toLowerCase().includes(userProfile.location.toLowerCase()) || 
      opportunity.location.toLowerCase() === 'global') {
    score += 25
  }
  
  // Sector/tag matching (25% weight)
  const matchingTags = opportunity.tags.filter(tag => 
    userProfile.sector.some(sector => 
      tag.toLowerCase().includes(sector.toLowerCase())
    )
  )
  score += Math.min(25, matchingTags.length * 8)
  
  // Funding range matching (20% weight)
  // This would need more sophisticated parsing in real implementation
  score += 20
  
  return Math.min(100, Math.max(0, score))
}

// Export configuration for external scraping tools
export const SCRAPING_CONFIG = {
  sources: FUNDING_SOURCES,
  updateFrequency: '24h', // How often to re-scrape
  dataRetention: '6m', // How long to keep scraped data
  deduplicationFields: ['title', 'organization', 'deadline']
}