/**
 * Utility functions to dynamically determine current NBA/WNBA seasons
 * This ensures the site stays current without manual updates
 */

export function getCurrentNBASeason(): string {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 0-based, so add 1

  // NBA season logic:
  // - The season typically starts in October and runs through June
  // - However, rosters for the UPCOMING season are often finalized in summer
  // - July 2025 = preparing for 2025-26 season (free agency, draft, trades)
  // - So from July onwards, we want the upcoming season
  
  if (currentMonth >= 7) {
    // July-December: upcoming season (current year to next year)
    return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
  } else {
    // January-June: current ongoing season (previous year to current year)  
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`
  }
}

export function getCurrentWNBASeason(): string {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // WNBA season typically runs from May to October
  // - May 2025 to October 2025 = "2025" season
  // - May 2026 to October 2026 = "2026" season
  
  if (currentMonth >= 5) {
    // May-December: current year season
    return currentYear.toString()
  } else {
    // January-April: previous year season
    return (currentYear - 1).toString()
  }
}

export function getSeasonInfo() {
  const nbaSeason = getCurrentNBASeason()
  const wnbaSeason = getCurrentWNBASeason()
  
  return {
    nba: {
      season: nbaSeason,
      format: 'YYYY-YY',
      description: `NBA ${nbaSeason} season`
    },
    wnba: {
      season: wnbaSeason,
      format: 'YYYY',
      description: `WNBA ${wnbaSeason} season`
    },
    generated_at: new Date().toISOString(),
    note: 'Automatically determined based on current date'
  }
}

// Test function to see what seasons would be returned for different dates
export function testSeasonCalculation(testDate: Date) {
  const originalDate = Date
  
  // Mock the Date constructor
  ;(global as any).Date = class extends originalDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(testDate)
      } else {
        super(...(args as ConstructorParameters<typeof Date>))
      }
    }
    static now() {
      return testDate.getTime()
    }
  }
  
  const result = getSeasonInfo()
  
  // Restore original Date
  ;(global as any).Date = originalDate
  
  return result
}