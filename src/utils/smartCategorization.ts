// Smart categorization system that doesn't use AI credits
// Uses rule-based content analysis and keyword matching

export interface CategoryResult {
  category: string
  confidence: number
  themes: string[]
  tags: string[]
  type: 'publication' | 'policy-brief' | 'report' | 'article' | 'workshop'
}

export class SmartCategorizer {
  // Category definitions with keywords and patterns
  private categoryRules = {
    'Policy & Governance': {
      keywords: [
        'policy', 'governance', 'regulation', 'regulatory', 'government', 'legal',
        'framework', 'legislation', 'compliance', 'institutional', 'political',
        'public policy', 'policy brief', 'policy instrument', 'governance structure'
      ],
      patterns: [
        /policy\s+framework/i,
        /regulatory\s+approach/i,
        /governance\s+structure/i,
        /legal\s+framework/i,
        /institutional\s+arrangement/i
      ],
      weight: 1.0
    },
    'MRV & Monitoring': {
      keywords: [
        'mrv', 'monitoring', 'verification', 'measurement', 'reporting',
        'accounting', 'quantification', 'assessment', 'validation', 'audit',
        'tracking', 'surveillance', 'observation', 'detection', 'analysis'
      ],
      patterns: [
        /monitoring[,\s]+reporting[,\s]+verification/i,
        /measurement\s+and\s+verification/i,
        /carbon\s+accounting/i,
        /verification\s+protocol/i,
        /monitoring\s+system/i
      ],
      weight: 1.0
    },
    'Technical Research': {
      keywords: [
        'research', 'technology', 'technical', 'method', 'methodology',
        'analysis', 'study', 'investigation', 'experiment', 'development',
        'innovation', 'engineering', 'scientific', 'laboratory', 'testing'
      ],
      patterns: [
        /technical\s+assessment/i,
        /research\s+methodology/i,
        /experimental\s+design/i,
        /technology\s+development/i,
        /scientific\s+study/i
      ],
      weight: 1.0
    },
    'Decision Support': {
      keywords: [
        'decision', 'support', 'tool', 'guidance', 'framework', 'assessment',
        'evaluation', 'comparison', 'selection', 'criteria', 'recommendation',
        'best practice', 'guideline', 'standard', 'protocol'
      ],
      patterns: [
        /decision\s+support/i,
        /assessment\s+framework/i,
        /evaluation\s+criteria/i,
        /best\s+practice/i,
        /guidance\s+document/i
      ],
      weight: 1.0
    }
  }

  // GGR Technology themes
  private technologyThemes = {
    'Biochar': {
      keywords: ['biochar', 'pyrolysis', 'biomass', 'charcoal', 'carbonization'],
      patterns: [/biochar\s+production/i, /pyrolysis\s+process/i]
    },
    'BECCS': {
      keywords: ['beccs', 'bioenergy', 'biomass energy', 'bio-energy', 'ccs'],
      patterns: [/bioenergy\s+with\s+carbon\s+capture/i, /beccs\s+system/i]
    },
    'Direct Air Capture': {
      keywords: ['dac', 'direct air capture', 'ambient air', 'air capture', 'sorbent'],
      patterns: [/direct\s+air\s+capture/i, /dac\s+technology/i, /ambient\s+air\s+capture/i]
    },
    'Enhanced Weathering': {
      keywords: ['enhanced weathering', 'rock weathering', 'mineral weathering', 'silicate', 'basalt'],
      patterns: [/enhanced\s+rock\s+weathering/i, /mineral\s+weathering/i]
    },
    'Peatland Restoration': {
      keywords: ['peatland', 'wetland', 'bog', 'marsh', 'restoration', 'rewetting'],
      patterns: [/peatland\s+restoration/i, /wetland\s+restoration/i]
    },
    'Afforestation/Reforestation': {
      keywords: ['afforestation', 'reforestation', 'forest', 'tree', 'woodland', 'plantation'],
      patterns: [/afforestation\s+and\s+reforestation/i, /forest\s+restoration/i]
    },
    'Ocean-based CDR': {
      keywords: ['ocean', 'marine', 'seawater', 'alkalinity', 'blue carbon'],
      patterns: [/ocean\s+alkalinization/i, /marine\s+carbon/i, /blue\s+carbon/i]
    },
    'Soil Carbon': {
      keywords: ['soil carbon', 'soil organic carbon', 'agriculture', 'farming', 'cropland'],
      patterns: [/soil\s+carbon\s+sequestration/i, /agricultural\s+carbon/i]
    }
  }

  // Document type patterns
  private typePatterns = {
    'policy-brief': {
      keywords: ['policy brief', 'policy-brief', 'briefing', 'brief'],
      patterns: [/policy\s+brief/i, /briefing\s+paper/i]
    },
    'report': {
      keywords: ['report', 'annual report', 'summary report', 'final report'],
      patterns: [/annual\s+report/i, /final\s+report/i, /summary\s+report/i]
    },
    'workshop': {
      keywords: ['workshop', 'event', 'meeting', 'conference', 'symposium'],
      patterns: [/workshop\s+report/i, /event\s+summary/i]
    },
    'publication': {
      keywords: ['publication', 'paper', 'journal', 'article', 'study'],
      patterns: [/research\s+paper/i, /journal\s+article/i, /published\s+study/i]
    }
  }

  // Cross-cutting themes
  private crossCuttingThemes = {
    'Economics': ['economic', 'cost', 'finance', 'financial', 'investment', 'market'],
    'Risk Assessment': ['risk', 'assessment', 'uncertainty', 'evaluation', 'analysis'],
    'Societal Engagement': ['social', 'public', 'community', 'stakeholder', 'engagement'],
    'Sustainability': ['sustainable', 'sustainability', 'environmental', 'ecological'],
    'Innovation': ['innovation', 'innovative', 'novel', 'breakthrough', 'emerging'],
    'Net Zero': ['net zero', 'net-zero', 'carbon neutral', 'carbon neutrality'],
    'Climate': ['climate', 'climate change', 'global warming', 'greenhouse gas']
  }

  categorizeDocument(title: string, content: string, url?: string): CategoryResult {
    const text = `${title} ${content} ${url || ''}`.toLowerCase()
    
    // Calculate category scores
    const categoryScores = this.calculateCategoryScores(text)
    
    // Find best category
    const bestCategory = this.getBestCategory(categoryScores)
    
    // Extract themes
    const themes = this.extractThemes(text)
    
    // Extract tags
    const tags = this.extractTags(text, title)
    
    // Determine document type
    const type = this.determineDocumentType(text, url)
    
    return {
      category: bestCategory.category,
      confidence: bestCategory.score,
      themes,
      tags,
      type
    }
  }

  private calculateCategoryScores(text: string): Record<string, number> {
    const scores: Record<string, number> = {}
    
    for (const [category, rules] of Object.entries(this.categoryRules)) {
      let score = 0
      
      // Keyword matching
      for (const keyword of rules.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        const matches = text.match(regex)
        if (matches) {
          score += matches.length * rules.weight
        }
      }
      
      // Pattern matching (higher weight)
      for (const pattern of rules.patterns) {
        const matches = text.match(pattern)
        if (matches) {
          score += matches.length * rules.weight * 2
        }
      }
      
      scores[category] = score
    }
    
    return scores
  }

  private getBestCategory(scores: Record<string, number>): { category: string; score: number } {
    let bestCategory = 'General'
    let bestScore = 0
    
    for (const [category, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestCategory = category
        bestScore = score
      }
    }
    
    // Convert score to confidence percentage
    const maxPossibleScore = 20 // Rough estimate
    const confidence = Math.min(100, Math.round((bestScore / maxPossibleScore) * 100))
    
    return {
      category: bestCategory,
      score: Math.max(50, confidence) // Minimum 50% confidence
    }
  }

  private extractThemes(text: string): string[] {
    const themes: string[] = []
    
    // Check technology themes
    for (const [theme, rules] of Object.entries(this.technologyThemes)) {
      let found = false
      
      // Check keywords
      for (const keyword of rules.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          found = true
          break
        }
      }
      
      // Check patterns
      if (!found) {
        for (const pattern of rules.patterns) {
          if (pattern.test(text)) {
            found = true
            break
          }
        }
      }
      
      if (found) {
        themes.push(theme)
      }
    }
    
    // Check cross-cutting themes
    for (const [theme, keywords] of Object.entries(this.crossCuttingThemes)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          themes.push(theme)
          break
        }
      }
    }
    
    // Default theme if none found
    if (themes.length === 0) {
      themes.push('Carbon Removal')
    }
    
    // Remove duplicates and limit to top 5
    return [...new Set(themes)].slice(0, 5)
  }

  private extractTags(text: string, title: string): string[] {
    const tags: string[] = []
    
    // Common CDR tags
    const commonTags = {
      'carbon-removal': ['carbon removal', 'cdr', 'carbon dioxide removal'],
      'ggr': ['ggr', 'greenhouse gas removal'],
      'climate': ['climate', 'climate change'],
      'technology': ['technology', 'technical', 'innovation'],
      'research': ['research', 'study', 'analysis'],
      'policy': ['policy', 'governance', 'regulation'],
      'monitoring': ['monitoring', 'mrv', 'verification'],
      'sustainability': ['sustainable', 'sustainability'],
      'net-zero': ['net zero', 'net-zero', 'carbon neutral'],
      'uk': ['uk', 'united kingdom', 'britain', 'british']
    }
    
    for (const [tag, keywords] of Object.entries(commonTags)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase()) || title.toLowerCase().includes(keyword.toLowerCase())) {
          tags.push(tag)
          break
        }
      }
    }
    
    // Technology-specific tags
    const techTags = {
      'biochar': ['biochar', 'pyrolysis'],
      'beccs': ['beccs', 'bioenergy'],
      'dac': ['dac', 'direct air capture'],
      'weathering': ['weathering', 'mineral'],
      'forestry': ['forest', 'tree', 'afforestation'],
      'peatland': ['peatland', 'wetland'],
      'ocean': ['ocean', 'marine'],
      'soil': ['soil', 'agriculture']
    }
    
    for (const [tag, keywords] of Object.entries(techTags)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          tags.push(tag)
          break
        }
      }
    }
    
    // Default tags
    if (tags.length === 0) {
      tags.push('carbon-removal')
    }
    
    // Remove duplicates and limit
    return [...new Set(tags)].slice(0, 8)
  }

  private determineDocumentType(text: string, url?: string): CategoryResult['type'] {
    // Check URL first
    if (url) {
      if (url.endsWith('.pdf')) return 'publication'
      if (url.includes('policy-brief')) return 'policy-brief'
      if (url.includes('report')) return 'report'
      if (url.includes('workshop') || url.includes('event')) return 'workshop'
    }
    
    // Check content patterns
    for (const [type, rules] of Object.entries(this.typePatterns)) {
      // Check keywords
      for (const keyword of rules.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return type as CategoryResult['type']
        }
      }
      
      // Check patterns
      for (const pattern of rules.patterns) {
        if (pattern.test(text)) {
          return type as CategoryResult['type']
        }
      }
    }
    
    return 'article'
  }

  // Batch categorization for multiple documents
  categorizeDocuments(documents: Array<{ title: string; content: string; url?: string }>): CategoryResult[] {
    return documents.map(doc => this.categorizeDocument(doc.title, doc.content, doc.url))
  }

  // Get category statistics
  getCategoryStats(documents: CategoryResult[]): Record<string, number> {
    const stats: Record<string, number> = {}
    
    for (const doc of documents) {
      stats[doc.category] = (stats[doc.category] || 0) + 1
    }
    
    return stats
  }

  // Get theme statistics
  getThemeStats(documents: CategoryResult[]): Record<string, number> {
    const stats: Record<string, number> = {}
    
    for (const doc of documents) {
      for (const theme of doc.themes) {
        stats[theme] = (stats[theme] || 0) + 1
      }
    }
    
    return stats
  }
}

export const smartCategorizer = new SmartCategorizer()