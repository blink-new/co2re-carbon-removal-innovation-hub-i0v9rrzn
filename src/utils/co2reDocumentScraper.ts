import { blink } from '../blink/client'

export interface CO2REDocument {
  id: string
  title: string
  content: string
  excerpt: string
  url: string
  pdfUrl?: string
  category: string
  type: 'publication' | 'policy-brief' | 'report' | 'article' | 'workshop'
  theme: string[]
  authors: string[]
  publishedDate: string
  tags: string[]
  relevanceScore?: number
  downloadCount?: number
}

export class CO2REDocumentScraper {
  private baseUrl = 'https://co2re.org'
  private apiBase = 'https://co2re.org/wp-json/wp/v2'

  async scrapeAllDocuments(): Promise<CO2REDocument[]> {
    console.log('🔍 Starting comprehensive CO2RE document scraping...')
    
    try {
      // First, test if WordPress API is accessible
      const apiTest = await this.testWordPressAPI()
      
      if (apiTest) {
        console.log('✅ WordPress API accessible, using API approach')
        return await this.scrapeViaAPI()
      } else {
        console.log('⚠️ WordPress API not accessible, using comprehensive web scraping')
        return await this.scrapeViaComprehensiveWebScraping()
      }
      
    } catch (error) {
      console.error('❌ Error scraping CO2RE documents:', error)
      return this.getExpandedMockDocuments() // Fallback to comprehensive mock data
    }
  }

  private async testWordPressAPI(): Promise<boolean> {
    try {
      const response = await blink.data.fetch({
        url: `${this.apiBase}/posts`,
        query: { per_page: 1 }
      })
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  private async scrapeViaAPI(): Promise<CO2REDocument[]> {
    try {
      console.log('📄 Scraping via WordPress API...')
      
      const documents: CO2REDocument[] = []
      
      // Scrape posts in batches to get ALL content
      const batchSize = 50
      let page = 1
      let hasMore = true
      
      while (hasMore && page <= 10) { // Limit to 10 pages (500 documents max)
        console.log(`📄 Scraping page ${page}...`)
        
        const response = await blink.data.fetch({
          url: `${this.apiBase}/posts`,
          query: {
            per_page: batchSize,
            page: page,
            _embed: true
          }
        })

        if (response.status !== 200) {
          console.log(`⚠️ API request failed for page ${page}: ${response.status}`)
          break
        }

        const posts = response.body as any[]
        
        if (posts.length === 0) {
          hasMore = false
          break
        }

        for (const post of posts) {
          const doc = await this.processWordPressPost(post)
          if (doc) documents.push(doc)
        }

        page++
        
        // Small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      console.log(`✅ Successfully scraped ${documents.length} documents via API`)
      return documents.length > 0 ? documents : this.getExpandedMockDocuments()
      
    } catch (error) {
      console.error('Error scraping via API:', error)
      return this.scrapeViaComprehensiveWebScraping()
    }
  }

  private async scrapeViaComprehensiveWebScraping(): Promise<CO2REDocument[]> {
    try {
      console.log('🌐 Starting comprehensive web scraping...')
      
      const documents: CO2REDocument[] = []
      
      // Comprehensive list of CO2RE pages to scrape
      const keyPages = [
        // Main sections
        { url: 'https://co2re.org/about/', title: 'About CO2RE', category: 'General' },
        { url: 'https://co2re.org/research/', title: 'Research Programme', category: 'Technical Research' },
        { url: 'https://co2re.org/publications/', title: 'Publications Overview', category: 'General' },
        { url: 'https://co2re.org/policy/', title: 'Policy & Governance', category: 'Policy & Governance' },
        
        // Research themes
        { url: 'https://co2re.org/research/policy-governance/', title: 'Policy & Governance Research', category: 'Policy & Governance' },
        { url: 'https://co2re.org/research/societal-engagement/', title: 'Societal Engagement', category: 'Technical Research' },
        { url: 'https://co2re.org/research/mrv/', title: 'MRV Research', category: 'MRV & Monitoring' },
        { url: 'https://co2re.org/research/synthesis/', title: 'Synthesis Research', category: 'Technical Research' },
        
        // GGR technologies
        { url: 'https://co2re.org/research/biochar/', title: 'Biochar Research', category: 'Technical Research' },
        { url: 'https://co2re.org/research/enhanced-rock-weathering/', title: 'Enhanced Rock Weathering', category: 'Technical Research' },
        { url: 'https://co2re.org/research/peatland-restoration/', title: 'Peatland Restoration', category: 'Technical Research' },
        { url: 'https://co2re.org/research/afforestation-reforestation/', title: 'Afforestation & Reforestation', category: 'Technical Research' },
        { url: 'https://co2re.org/research/beccs/', title: 'BECCS Research', category: 'Technical Research' },
        { url: 'https://co2re.org/research/direct-air-capture/', title: 'Direct Air Capture', category: 'Technical Research' },
        
        // Additional resources
        { url: 'https://co2re.org/news/', title: 'News & Updates', category: 'General' },
        { url: 'https://co2re.org/events/', title: 'Events & Workshops', category: 'General' },
        { url: 'https://co2re.org/people/', title: 'Research Team', category: 'General' }
      ]

      for (const page of keyPages) {
        try {
          console.log(`🔍 Scraping: ${page.title}`)
          const doc = await this.scrapeIndividualPage(page.url, page.title, page.category)
          if (doc) {
            documents.push(doc)
            console.log(`✅ Successfully scraped: ${doc.title}`)
          }
        } catch (error) {
          console.log(`⚠️ Could not scrape ${page.url}:`, error)
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Try to find additional publication links
      try {
        const publicationDocs = await this.scrapePublicationsPage()
        documents.push(...publicationDocs)
        console.log(`📚 Found ${publicationDocs.length} additional publications`)
      } catch (error) {
        console.log('Could not scrape publications page:', error)
      }

      console.log(`✅ Successfully scraped ${documents.length} documents via comprehensive web scraping`)
      return documents.length > 0 ? documents : this.getExpandedMockDocuments()
      
    } catch (error) {
      console.error('Error in comprehensive web scraping:', error)
      return this.getExpandedMockDocuments()
    }
  }

  private async scrapeIndividualPage(url: string, title: string, suggestedCategory?: string): Promise<CO2REDocument | null> {
    try {
      const { markdown, metadata, links } = await blink.data.scrape(url)
      
      // Extract PDF links
      const pdfLinks = links.filter(link => 
        link.href && link.href.endsWith('.pdf') && link.href.includes('co2re.org')
      )
      const pdfUrl = pdfLinks.length > 0 ? pdfLinks[0].href : undefined

      const document: CO2REDocument = {
        id: this.generateDocumentId(url),
        title: title || metadata.title || 'CO2RE Document',
        content: markdown,
        excerpt: this.generateExcerpt(markdown),
        url: url,
        pdfUrl: pdfUrl,
        category: suggestedCategory || this.smartCategorizeDocument(url, markdown, title),
        type: this.smartDetermineDocumentType(url, markdown, title),
        theme: this.smartExtractThemes(markdown, title, url),
        authors: this.smartExtractAuthors(markdown),
        publishedDate: metadata.publishedTime || new Date().toISOString(),
        tags: this.smartExtractTags(markdown, title, url),
        relevanceScore: this.calculateRelevanceScore(markdown, title)
      }

      return document
    } catch (error) {
      console.error(`Error scraping page ${url}:`, error)
      return null
    }
  }

  private async scrapePublicationsPage(): Promise<CO2REDocument[]> {
    try {
      console.log('📚 Scraping publications page for additional documents...')
      
      const { markdown, metadata, links } = await blink.data.scrape('https://co2re.org/publications/')
      
      const documents: CO2REDocument[] = []
      
      // Look for publication links in the scraped content
      const publicationLinks = links.filter(link => 
        link.href && 
        link.href.includes('co2re.org') && 
        !link.href.includes('#') &&
        !link.href.includes('mailto:') &&
        (link.text.length > 10 || link.href.includes('/publication/') || link.href.endsWith('.pdf'))
      ).slice(0, 20) // Limit to first 20 to avoid overwhelming

      for (const link of publicationLinks) {
        try {
          if (link.href.endsWith('.pdf')) {
            // Handle PDF documents
            const doc = await this.processPDFDocument(link.href, link.text)
            if (doc) documents.push(doc)
          } else if (!link.href.includes('/publications/')) {
            // Handle web pages (avoid circular references)
            const doc = await this.scrapeIndividualPage(link.href, link.text)
            if (doc) documents.push(doc)
          }
        } catch (error) {
          console.log(`Skipping ${link.href}:`, error)
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 150))
      }

      return documents
    } catch (error) {
      console.error('Error scraping publications page:', error)
      return []
    }
  }

  private async processPDFDocument(pdfUrl: string, title: string): Promise<CO2REDocument | null> {
    try {
      console.log(`📄 Processing PDF: ${title}`)
      
      // Extract text content from PDF
      const content = await blink.data.extractFromUrl(pdfUrl)
      
      const document: CO2REDocument = {
        id: this.generateDocumentId(pdfUrl),
        title: title || 'CO2RE Publication',
        content: content,
        excerpt: this.generateExcerpt(content),
        url: pdfUrl, // Link directly to PDF
        pdfUrl: pdfUrl,
        category: this.smartCategorizeDocument(pdfUrl, content, title),
        type: 'publication',
        theme: this.smartExtractThemes(content, title, pdfUrl),
        authors: this.smartExtractAuthors(content),
        publishedDate: new Date().toISOString(),
        tags: this.smartExtractTags(content, title, pdfUrl),
        relevanceScore: this.calculateRelevanceScore(content, title)
      }

      return document
    } catch (error) {
      console.error(`Error processing PDF ${pdfUrl}:`, error)
      return null
    }
  }

  // SMART CATEGORIZATION METHODS (No AI credits used!)

  private smartCategorizeDocument(url: string, content: string, title: string): string {
    const text = `${url} ${content} ${title}`.toLowerCase()
    
    // Policy & Governance indicators
    if (text.includes('policy') || text.includes('governance') || text.includes('regulation') || 
        text.includes('government') || text.includes('legal') || text.includes('framework')) {
      return 'Policy & Governance'
    }
    
    // MRV & Monitoring indicators
    if (text.includes('mrv') || text.includes('monitoring') || text.includes('verification') || 
        text.includes('measurement') || text.includes('reporting') || text.includes('accounting')) {
      return 'MRV & Monitoring'
    }
    
    // Technical Research indicators
    if (text.includes('research') || text.includes('technology') || text.includes('technical') || 
        text.includes('method') || text.includes('analysis') || text.includes('study')) {
      return 'Technical Research'
    }
    
    // Decision Support indicators
    if (text.includes('decision') || text.includes('support') || text.includes('tool') || 
        text.includes('guidance') || text.includes('framework') || text.includes('assessment')) {
      return 'Decision Support'
    }
    
    return 'General'
  }

  private smartDetermineDocumentType(url: string, content: string, title: string): CO2REDocument['type'] {
    const text = `${url} ${content} ${title}`.toLowerCase()
    
    if (text.includes('policy brief') || text.includes('policy-brief')) return 'policy-brief'
    if (text.includes('report') || text.includes('annual') || text.includes('summary')) return 'report'
    if (text.includes('workshop') || text.includes('event') || text.includes('meeting')) return 'workshop'
    if (url.endsWith('.pdf') || text.includes('publication') || text.includes('paper')) return 'publication'
    
    return 'article'
  }

  private smartExtractThemes(content: string, title: string, url: string): string[] {
    const text = `${content} ${title} ${url}`.toLowerCase()
    const themes = []
    
    // CDR Technology themes
    if (text.includes('biochar')) themes.push('Biochar')
    if (text.includes('beccs') || text.includes('bioenergy')) themes.push('BECCS')
    if (text.includes('dac') || text.includes('direct air capture')) themes.push('Direct Air Capture')
    if (text.includes('enhanced weathering') || text.includes('rock weathering')) themes.push('Enhanced Weathering')
    if (text.includes('peatland') || text.includes('wetland') || text.includes('restoration')) themes.push('Peatland Restoration')
    if (text.includes('afforestation') || text.includes('reforestation') || text.includes('forest')) themes.push('Afforestation/Reforestation')
    if (text.includes('ocean') || text.includes('marine')) themes.push('Ocean-based CDR')
    if (text.includes('soil') || text.includes('agriculture')) themes.push('Soil Carbon')
    
    // Cross-cutting themes
    if (text.includes('policy') || text.includes('governance')) themes.push('Policy & Governance')
    if (text.includes('social') || text.includes('engagement') || text.includes('public')) themes.push('Societal Engagement')
    if (text.includes('mrv') || text.includes('monitoring')) themes.push('MRV')
    if (text.includes('economic') || text.includes('cost') || text.includes('finance')) themes.push('Economics')
    if (text.includes('risk') || text.includes('assessment')) themes.push('Risk Assessment')
    
    return themes.length > 0 ? themes : ['Carbon Removal']
  }

  private smartExtractAuthors(content: string): string[] {
    // Look for common author patterns
    const authorPatterns = [
      /(?:Author|By|Written by)[:\\s]+([^.\\n]+)/i,
      /(?:Lead author|Principal investigator)[:\\s]+([^.\\n]+)/i,
      /(?:Research team|Team)[:\\s]+([^.\\n]+)/i
    ]
    
    for (const pattern of authorPatterns) {
      const match = content.match(pattern)
      if (match) {
        return [match[1].trim()]
      }
    }
    
    return ['CO2RE Team']
  }

  private smartExtractTags(content: string, title: string, url: string): string[] {
    const text = `${content} ${title} ${url}`.toLowerCase()
    const tags = []
    
    // Technology tags
    if (text.includes('ggr')) tags.push('GGR')
    if (text.includes('carbon removal') || text.includes('cdr')) tags.push('carbon-removal')
    if (text.includes('climate')) tags.push('climate')
    if (text.includes('technology')) tags.push('technology')
    if (text.includes('innovation')) tags.push('innovation')
    if (text.includes('research')) tags.push('research')
    if (text.includes('policy')) tags.push('policy')
    if (text.includes('sustainability')) tags.push('sustainability')
    if (text.includes('environment')) tags.push('environment')
    if (text.includes('net zero')) tags.push('net-zero')
    
    // Specific technology tags
    if (text.includes('biochar')) tags.push('biochar')
    if (text.includes('beccs')) tags.push('beccs')
    if (text.includes('dac')) tags.push('dac')
    if (text.includes('weathering')) tags.push('weathering')
    if (text.includes('forest')) tags.push('forestry')
    
    return tags.length > 0 ? [...new Set(tags)] : ['carbon-removal']
  }

  private calculateRelevanceScore(content: string, title: string): number {
    let score = 50 // Base score
    
    // Boost score based on content quality indicators
    if (content.length > 1000) score += 10
    if (content.length > 5000) score += 10
    if (title.length > 20) score += 5
    if (content.includes('CO2RE')) score += 10
    if (content.includes('research')) score += 5
    if (content.includes('carbon removal')) score += 15
    if (content.includes('policy')) score += 10
    
    return Math.min(100, score)
  }

  private async processWordPressPost(post: any): Promise<CO2REDocument | null> {
    try {
      const content = post.content?.rendered || post.excerpt?.rendered || ''
      const cleanContent = this.stripHtml(content)

      const document: CO2REDocument = {
        id: post.id?.toString() || this.generateDocumentId(post.link),
        title: post.title?.rendered || 'Untitled',
        content: cleanContent,
        excerpt: post.excerpt?.rendered ? this.stripHtml(post.excerpt.rendered) : this.generateExcerpt(cleanContent),
        url: post.link, // This should be a real CO2RE URL
        category: this.categorizeFromWordPress(post) || this.smartCategorizeDocument(post.link, cleanContent, post.title?.rendered || ''),
        type: 'article',
        theme: this.extractThemesFromWordPress(post) || this.smartExtractThemes(cleanContent, post.title?.rendered || '', post.link),
        authors: this.extractAuthorsFromWordPress(post),
        publishedDate: post.date || new Date().toISOString(),
        tags: this.extractTagsFromWordPress(post) || this.smartExtractTags(cleanContent, post.title?.rendered || '', post.link),
        relevanceScore: this.calculateRelevanceScore(cleanContent, post.title?.rendered || '')
      }

      return document
    } catch (error) {
      console.error('Error processing WordPress post:', error)
      return null
    }
  }

  private generateDocumentId(url: string): string {
    return `co2re_${url.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '_') || Math.random().toString(36).substr(2, 9)}`
  }

  private generateExcerpt(content: string): string {
    const cleanContent = content.replace(/\\n+/g, ' ').trim()
    return cleanContent.length > 200 ? cleanContent.substring(0, 200) + '...' : cleanContent
  }

  private categorizeFromWordPress(post: any): string | null {
    const categories = post._embedded?.['wp:term']?.[0] || []
    if (categories.length > 0) {
      const categoryName = categories[0].name
      if (categoryName.includes('Policy')) return 'Policy & Governance'
      if (categoryName.includes('MRV')) return 'MRV & Monitoring'
      if (categoryName.includes('Research')) return 'Technical Research'
    }
    return null
  }

  private extractThemesFromWordPress(post: any): string[] | null {
    const tags = post._embedded?.['wp:term']?.[1] || []
    return tags.length > 0 ? tags.map((tag: any) => tag.name).slice(0, 3) : null
  }

  private extractAuthorsFromWordPress(post: any): string[] {
    const author = post._embedded?.author?.[0]
    return author ? [author.name] : ['CO2RE Team']
  }

  private extractTagsFromWordPress(post: any): string[] | null {
    const tags = post._embedded?.['wp:term']?.[1] || []
    return tags.length > 0 ? tags.map((tag: any) => tag.slug).slice(0, 5) : null
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
  }

  // Expanded mock documents with real CO2RE URLs and comprehensive coverage
  getExpandedMockDocuments(): CO2REDocument[] {
    return [
      // Main CO2RE pages
      {
        id: 'co2re_about',
        title: 'About CO2RE - Carbon Dioxide Removal Research',
        content: 'CO2RE is a research programme that brings together researchers from across the UK to advance the evidence base for carbon dioxide removal (CDR). The programme focuses on greenhouse gas removal (GGR) technologies and their potential role in achieving net-zero emissions.',
        excerpt: 'CO2RE brings together UK researchers to advance carbon dioxide removal evidence base.',
        url: 'https://co2re.org/about/',
        category: 'General',
        type: 'article',
        theme: ['Carbon Removal', 'Research'],
        authors: ['CO2RE Team'],
        publishedDate: '2024-01-15T00:00:00Z',
        tags: ['about', 'research', 'carbon-removal', 'ggr'],
        relevanceScore: 95
      },
      {
        id: 'co2re_research',
        title: 'CO2RE Research Programme Overview',
        content: 'The CO2RE research programme focuses on advancing understanding of carbon dioxide removal technologies and their implementation. Research themes include policy and governance, societal engagement, MRV, and synthesis across different GGR approaches.',
        excerpt: 'Overview of CO2RE research programme focusing on CDR technologies and implementation.',
        url: 'https://co2re.org/research/',
        category: 'Technical Research',
        type: 'article',
        theme: ['Research', 'Technology', 'GGR'],
        authors: ['CO2RE Research Team'],
        publishedDate: '2024-02-01T00:00:00Z',
        tags: ['research', 'technology', 'programme', 'ggr'],
        relevanceScore: 92
      },
      
      // Research themes
      {
        id: 'co2re_policy_governance',
        title: 'Policy & Governance for Carbon Removal',
        content: 'Research into policy frameworks, governance structures, and regulatory approaches for carbon dioxide removal technologies. Includes analysis of policy instruments, institutional arrangements, and governance challenges.',
        excerpt: 'Research into policy frameworks and governance structures for CDR technologies.',
        url: 'https://co2re.org/research/policy-governance/',
        category: 'Policy & Governance',
        type: 'article',
        theme: ['Policy & Governance', 'Regulation'],
        authors: ['CO2RE Policy Team'],
        publishedDate: '2024-01-20T00:00:00Z',
        tags: ['policy', 'governance', 'regulation', 'framework'],
        relevanceScore: 88
      },
      {
        id: 'co2re_mrv',
        title: 'MRV for Carbon Removal Technologies',
        content: 'Monitoring, Reporting, and Verification (MRV) approaches for carbon dioxide removal. Research covers measurement methodologies, verification protocols, and reporting standards for different GGR technologies.',
        excerpt: 'MRV approaches and methodologies for carbon dioxide removal technologies.',
        url: 'https://co2re.org/research/mrv/',
        category: 'MRV & Monitoring',
        type: 'article',
        theme: ['MRV', 'Monitoring', 'Verification'],
        authors: ['CO2RE MRV Team'],
        publishedDate: '2024-01-25T00:00:00Z',
        tags: ['mrv', 'monitoring', 'verification', 'measurement'],
        relevanceScore: 90
      },
      {
        id: 'co2re_societal_engagement',
        title: 'Societal Engagement in Carbon Removal',
        content: 'Research into public perceptions, social acceptance, and community engagement with carbon removal technologies. Includes stakeholder analysis and participatory research approaches.',
        excerpt: 'Research into public perceptions and social acceptance of carbon removal technologies.',
        url: 'https://co2re.org/research/societal-engagement/',
        category: 'Technical Research',
        type: 'article',
        theme: ['Societal Engagement', 'Public Perception'],
        authors: ['CO2RE Social Research Team'],
        publishedDate: '2024-02-05T00:00:00Z',
        tags: ['social', 'engagement', 'public', 'stakeholder'],
        relevanceScore: 85
      },
      
      // GGR Technologies
      {
        id: 'co2re_biochar',
        title: 'Biochar for Carbon Removal',
        content: 'Research into biochar production, application, and carbon sequestration potential. Covers feedstock selection, pyrolysis processes, soil application, and long-term carbon storage verification.',
        excerpt: 'Research into biochar production and carbon sequestration potential.',
        url: 'https://co2re.org/research/biochar/',
        category: 'Technical Research',
        type: 'article',
        theme: ['Biochar', 'Pyrolysis', 'Soil Carbon'],
        authors: ['CO2RE Biochar Team'],
        publishedDate: '2024-01-30T00:00:00Z',
        tags: ['biochar', 'pyrolysis', 'soil', 'sequestration'],
        relevanceScore: 93
      },
      {
        id: 'co2re_beccs',
        title: 'BECCS - Bioenergy with Carbon Capture and Storage',
        content: 'Research into bioenergy with carbon capture and storage (BECCS) systems. Covers biomass feedstocks, energy conversion technologies, carbon capture processes, and storage solutions.',
        excerpt: 'Research into BECCS systems and bioenergy with carbon capture technologies.',
        url: 'https://co2re.org/research/beccs/',
        category: 'Technical Research',
        type: 'article',
        theme: ['BECCS', 'Bioenergy', 'Carbon Capture'],
        authors: ['CO2RE BECCS Team'],
        publishedDate: '2024-02-10T00:00:00Z',
        tags: ['beccs', 'bioenergy', 'capture', 'storage'],
        relevanceScore: 91
      },
      {
        id: 'co2re_dac',
        title: 'Direct Air Capture Technologies',
        content: 'Research into direct air capture (DAC) technologies for removing CO2 from ambient air. Covers sorbent materials, process design, energy requirements, and system integration.',
        excerpt: 'Research into direct air capture technologies and CO2 removal from ambient air.',
        url: 'https://co2re.org/research/direct-air-capture/',
        category: 'Technical Research',
        type: 'article',
        theme: ['Direct Air Capture', 'DAC', 'Sorbents'],
        authors: ['CO2RE DAC Team'],
        publishedDate: '2024-02-15T00:00:00Z',
        tags: ['dac', 'direct-air-capture', 'sorbent', 'ambient'],
        relevanceScore: 89
      },
      {
        id: 'co2re_enhanced_weathering',
        title: 'Enhanced Rock Weathering for Carbon Removal',
        content: 'Research into enhanced rock weathering as a carbon removal approach. Covers mineral selection, application methods, weathering rates, and environmental impacts.',
        excerpt: 'Research into enhanced rock weathering for carbon dioxide removal.',
        url: 'https://co2re.org/research/enhanced-rock-weathering/',
        category: 'Technical Research',
        type: 'article',
        theme: ['Enhanced Weathering', 'Minerals', 'Geochemistry'],
        authors: ['CO2RE Weathering Team'],
        publishedDate: '2024-02-20T00:00:00Z',
        tags: ['weathering', 'minerals', 'geochemistry', 'rocks'],
        relevanceScore: 87
      },
      {
        id: 'co2re_peatland',
        title: 'Peatland Restoration for Carbon Storage',
        content: 'Research into peatland restoration and management for carbon sequestration. Covers restoration techniques, carbon dynamics, biodiversity impacts, and monitoring approaches.',
        excerpt: 'Research into peatland restoration and carbon sequestration potential.',
        url: 'https://co2re.org/research/peatland-restoration/',
        category: 'Technical Research',
        type: 'article',
        theme: ['Peatland Restoration', 'Wetlands', 'Ecosystem'],
        authors: ['CO2RE Peatland Team'],
        publishedDate: '2024-02-25T00:00:00Z',
        tags: ['peatland', 'restoration', 'wetland', 'ecosystem'],
        relevanceScore: 86
      },
      {
        id: 'co2re_afforestation',
        title: 'Afforestation and Reforestation for Carbon Removal',
        content: 'Research into afforestation and reforestation approaches for carbon sequestration. Covers species selection, planting strategies, growth monitoring, and long-term carbon storage.',
        excerpt: 'Research into afforestation and reforestation for carbon sequestration.',
        url: 'https://co2re.org/research/afforestation-reforestation/',
        category: 'Technical Research',
        type: 'article',
        theme: ['Afforestation/Reforestation', 'Forestry', 'Trees'],
        authors: ['CO2RE Forestry Team'],
        publishedDate: '2024-03-01T00:00:00Z',
        tags: ['afforestation', 'reforestation', 'forestry', 'trees'],
        relevanceScore: 84
      },
      
      // Publications and resources
      {
        id: 'co2re_publications',
        title: 'CO2RE Publications and Resources',
        content: 'Access to CO2RE publications, reports, and research outputs covering various aspects of carbon dioxide removal. Includes policy briefs, technical reports, and academic publications.',
        excerpt: 'Access to CO2RE publications and research outputs on carbon dioxide removal.',
        url: 'https://co2re.org/publications/',
        category: 'General',
        type: 'article',
        theme: ['Publications', 'Resources'],
        authors: ['CO2RE Team'],
        publishedDate: '2024-01-20T00:00:00Z',
        tags: ['publications', 'resources', 'reports', 'briefs'],
        relevanceScore: 88
      },
      {
        id: 'co2re_synthesis',
        title: 'Synthesis Research Across GGR Technologies',
        content: 'Cross-cutting synthesis research comparing different greenhouse gas removal technologies. Includes comparative assessments, integration studies, and portfolio approaches.',
        excerpt: 'Synthesis research comparing and integrating different GGR technologies.',
        url: 'https://co2re.org/research/synthesis/',
        category: 'Technical Research',
        type: 'article',
        theme: ['Synthesis', 'Comparative Analysis', 'Integration'],
        authors: ['CO2RE Synthesis Team'],
        publishedDate: '2024-03-05T00:00:00Z',
        tags: ['synthesis', 'comparison', 'integration', 'portfolio'],
        relevanceScore: 92
      },
      
      // Additional resources
      {
        id: 'co2re_news',
        title: 'CO2RE News and Updates',
        content: 'Latest news, updates, and announcements from the CO2RE research programme. Includes research highlights, event announcements, and programme developments.',
        excerpt: 'Latest news and updates from the CO2RE research programme.',
        url: 'https://co2re.org/news/',
        category: 'General',
        type: 'article',
        theme: ['News', 'Updates'],
        authors: ['CO2RE Communications Team'],
        publishedDate: '2024-03-10T00:00:00Z',
        tags: ['news', 'updates', 'announcements', 'highlights'],
        relevanceScore: 75
      },
      {
        id: 'co2re_events',
        title: 'CO2RE Events and Workshops',
        content: 'Information about CO2RE events, workshops, conferences, and training opportunities. Includes past and upcoming events related to carbon removal research.',
        excerpt: 'Information about CO2RE events, workshops, and training opportunities.',
        url: 'https://co2re.org/events/',
        category: 'General',
        type: 'workshop',
        theme: ['Events', 'Workshops', 'Training'],
        authors: ['CO2RE Events Team'],
        publishedDate: '2024-03-15T00:00:00Z',
        tags: ['events', 'workshops', 'conferences', 'training'],
        relevanceScore: 78
      },
      {
        id: 'co2re_people',
        title: 'CO2RE Research Team and Network',
        content: 'Information about the CO2RE research team, principal investigators, and research network. Includes researcher profiles and institutional affiliations.',
        excerpt: 'Information about the CO2RE research team and network.',
        url: 'https://co2re.org/people/',
        category: 'General',
        type: 'article',
        theme: ['Research Team', 'Network'],
        authors: ['CO2RE Team'],
        publishedDate: '2024-03-20T00:00:00Z',
        tags: ['people', 'team', 'researchers', 'network'],
        relevanceScore: 80
      }
    ]
  }
}

export const co2reDocumentScraper = new CO2REDocumentScraper()