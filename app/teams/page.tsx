'use client'

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Users, Trophy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Navigation from '@/components/layout/navigation'
import Footer from '@/components/layout/footer'

interface Team {
  id: string
  name: string
  city: string
  abbreviation: string
  league: string
  logo_url: string
  primary_color: string | null
  secondary_color: string | null
  conference: string | null
  division: string | null
}

interface Player {
  id: string
  name: string
  position: string
  jersey_number: number
}

interface TeamWithPlayers extends Team {
  players?: Player[]
}

interface TeamsResponse {
  teams: Team[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
}

const statsVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { delay: 0.2 }
  }
}

// Team colors mapping
const getTeamColors = (teamName: string, league: string) => {
  const teamColors: Record<string, { primary: string; secondary: string; gradient: string }> = {
    // NBA Teams
    'Lakers': { primary: '#552583', secondary: '#FDB927', gradient: 'linear-gradient(90deg, #552583, #FDB927)' },
    'Warriors': { primary: '#1D428A', secondary: '#FFC72C', gradient: 'linear-gradient(90deg, #1D428A, #FFC72C)' },
    'Celtics': { primary: '#007A33', secondary: '#BA9653', gradient: 'linear-gradient(90deg, #007A33, #BA9653)' },
    'Bulls': { primary: '#CE1141', secondary: '#000000', gradient: 'linear-gradient(90deg, #CE1141, #000000)' },
    'Heat': { primary: '#98002E', secondary: '#F9A01B', gradient: 'linear-gradient(90deg, #98002E, #F9A01B)' },
    'Knicks': { primary: '#006BB6', secondary: '#F58426', gradient: 'linear-gradient(90deg, #006BB6, #F58426)' },
    'Nets': { primary: '#000000', secondary: '#FFFFFF', gradient: 'linear-gradient(90deg, #000000, #444444)' },
    '76ers': { primary: '#006BB6', secondary: '#ED174C', gradient: 'linear-gradient(90deg, #006BB6, #ED174C)' },
    'Raptors': { primary: '#CE1141', secondary: '#000000', gradient: 'linear-gradient(90deg, #CE1141, #000000)' },
    'Bucks': { primary: '#00471B', secondary: '#EEE1C6', gradient: 'linear-gradient(90deg, #00471B, #EEE1C6)' },
    'Cavaliers': { primary: '#860038', secondary: '#FDBB30', gradient: 'linear-gradient(90deg, #860038, #FDBB30)' },
    'Pistons': { primary: '#C8102E', secondary: '#006BB6', gradient: 'linear-gradient(90deg, #C8102E, #006BB6)' },
    'Pacers': { primary: '#002D62', secondary: '#FDBB30', gradient: 'linear-gradient(90deg, #002D62, #FDBB30)' },
    'Hawks': { primary: '#E03A3E', secondary: '#C1D32F', gradient: 'linear-gradient(90deg, #E03A3E, #C1D32F)' },
    'Hornets': { primary: '#1D1160', secondary: '#00788C', gradient: 'linear-gradient(90deg, #1D1160, #00788C)' },
    'Magic': { primary: '#0077C0', secondary: '#C4CED4', gradient: 'linear-gradient(90deg, #0077C0, #C4CED4)' },
    'Wizards': { primary: '#002B5C', secondary: '#E31837', gradient: 'linear-gradient(90deg, #002B5C, #E31837)' },
    'Mavericks': { primary: '#00538C', secondary: '#002F5F', gradient: 'linear-gradient(90deg, #00538C, #002F5F)' },
    'Rockets': { primary: '#CE1141', secondary: '#000000', gradient: 'linear-gradient(90deg, #CE1141, #000000)' },
    'Grizzlies': { primary: '#5D76A9', secondary: '#12173F', gradient: 'linear-gradient(90deg, #5D76A9, #12173F)' },
    'Pelicans': { primary: '#0C2340', secondary: '#C8102E', gradient: 'linear-gradient(90deg, #0C2340, #C8102E)' },
    'Spurs': { primary: '#C4CED4', secondary: '#000000', gradient: 'linear-gradient(90deg, #C4CED4, #000000)' },
    'Nuggets': { primary: '#0E2240', secondary: '#FEC524', gradient: 'linear-gradient(90deg, #0E2240, #FEC524)' },
    'Timberwolves': { primary: '#0C2340', secondary: '#236192', gradient: 'linear-gradient(90deg, #0C2340, #236192)' },
    'Thunder': { primary: '#007AC1', secondary: '#EF3B24', gradient: 'linear-gradient(90deg, #007AC1, #EF3B24)' },
    'Trail Blazers': { primary: '#E03A3E', secondary: '#000000', gradient: 'linear-gradient(90deg, #E03A3E, #000000)' },
    'Jazz': { primary: '#002B5C', secondary: '#00471B', gradient: 'linear-gradient(90deg, #002B5C, #00471B)' },
    'Clippers': { primary: '#C8102E', secondary: '#1D428A', gradient: 'linear-gradient(90deg, #C8102E, #1D428A)' },
    'Kings': { primary: '#5A2D81', secondary: '#63727A', gradient: 'linear-gradient(90deg, #5A2D81, #63727A)' },
    'Suns': { primary: '#1D1160', secondary: '#E56020', gradient: 'linear-gradient(90deg, #1D1160, #E56020)' },
    
    // WNBA Teams
    'Aces': { primary: '#C8102E', secondary: '#000000', gradient: 'linear-gradient(90deg, #C8102E, #000000)' },
    'Liberty': { primary: '#86CEBC', secondary: '#000000', gradient: 'linear-gradient(90deg, #86CEBC, #000000)' },
    'Sky': { primary: '#418FDE', secondary: '#FDD023', gradient: 'linear-gradient(90deg, #418FDE, #FDD023)' },
    'Storm': { primary: '#2C5234', secondary: '#FE5000', gradient: 'linear-gradient(90deg, #2C5234, #FE5000)' },
    'Sun': { primary: '#E03A3E', secondary: '#F57C00', gradient: 'linear-gradient(90deg, #E03A3E, #F57C00)' },
    'Dream': { primary: '#E03A3E', secondary: '#53565A', gradient: 'linear-gradient(90deg, #E03A3E, #53565A)' },
    'Fever': { primary: '#E03A3E', secondary: '#FDBB30', gradient: 'linear-gradient(90deg, #E03A3E, #FDBB30)' },
    'Lynx': { primary: '#236192', secondary: '#9EA2A2', gradient: 'linear-gradient(90deg, #236192, #9EA2A2)' },
    'Mercury': { primary: '#201747', secondary: '#E56020', gradient: 'linear-gradient(90deg, #201747, #E56020)' },
    'Mystics': { primary: '#E03A3E', secondary: '#002B5C', gradient: 'linear-gradient(90deg, #E03A3E, #002B5C)' },
    'Wings': { primary: '#C4CED4', secondary: '#002B5C', gradient: 'linear-gradient(90deg, #C4CED4, #002B5C)' }
  }
  
  // Find team colors by partial name match or common variations
  const teamNameLower = teamName.toLowerCase()
  const teamKey = Object.keys(teamColors).find(key => {
    const keyLower = key.toLowerCase()
    return teamNameLower.includes(keyLower) || 
           keyLower.includes(teamNameLower) ||
           // Handle specific mappings
           (teamNameLower.includes('lakers') && keyLower === 'lakers') ||
           (teamNameLower.includes('warriors') && keyLower === 'warriors') ||
           (teamNameLower.includes('celtics') && keyLower === 'celtics') ||
           (teamNameLower.includes('bulls') && keyLower === 'bulls') ||
           (teamNameLower.includes('heat') && keyLower === 'heat') ||
           (teamNameLower.includes('knicks') && keyLower === 'knicks') ||
           (teamNameLower.includes('nets') && keyLower === 'nets') ||
           (teamNameLower.includes('sixers') && keyLower === '76ers') ||
           (teamNameLower.includes('76ers') && keyLower === '76ers') ||
           (teamNameLower.includes('raptors') && keyLower === 'raptors') ||
           (teamNameLower.includes('bucks') && keyLower === 'bucks') ||
           (teamNameLower.includes('cavaliers') && keyLower === 'cavaliers') ||
           (teamNameLower.includes('pistons') && keyLower === 'pistons') ||
           (teamNameLower.includes('pacers') && keyLower === 'pacers') ||
           (teamNameLower.includes('hawks') && keyLower === 'hawks') ||
           (teamNameLower.includes('hornets') && keyLower === 'hornets') ||
           (teamNameLower.includes('magic') && keyLower === 'magic') ||
           (teamNameLower.includes('wizards') && keyLower === 'wizards') ||
           (teamNameLower.includes('mavericks') && keyLower === 'mavericks') ||
           (teamNameLower.includes('rockets') && keyLower === 'rockets') ||
           (teamNameLower.includes('grizzlies') && keyLower === 'grizzlies') ||
           (teamNameLower.includes('pelicans') && keyLower === 'pelicans') ||
           (teamNameLower.includes('spurs') && keyLower === 'spurs') ||
           (teamNameLower.includes('nuggets') && keyLower === 'nuggets') ||
           (teamNameLower.includes('timberwolves') && keyLower === 'timberwolves') ||
           (teamNameLower.includes('thunder') && keyLower === 'thunder') ||
           (teamNameLower.includes('trail blazers') && keyLower === 'trail blazers') ||
           (teamNameLower.includes('jazz') && keyLower === 'jazz') ||
           (teamNameLower.includes('clippers') && keyLower === 'clippers') ||
           (teamNameLower.includes('kings') && keyLower === 'kings') ||
           (teamNameLower.includes('suns') && keyLower === 'suns') ||
           // WNBA teams
           (teamNameLower.includes('aces') && keyLower === 'aces') ||
           (teamNameLower.includes('liberty') && keyLower === 'liberty') ||
           (teamNameLower.includes('sky') && keyLower === 'sky') ||
           (teamNameLower.includes('storm') && keyLower === 'storm') ||
           (teamNameLower.includes('sun') && keyLower === 'sun') ||
           (teamNameLower.includes('dream') && keyLower === 'dream') ||
           (teamNameLower.includes('fever') && keyLower === 'fever') ||
           (teamNameLower.includes('lynx') && keyLower === 'lynx') ||
           (teamNameLower.includes('mercury') && keyLower === 'mercury') ||
           (teamNameLower.includes('mystics') && keyLower === 'mystics') ||
           (teamNameLower.includes('wings') && keyLower === 'wings')
  })
  
  if (teamKey) {
    return teamColors[teamKey]
  }
  
  // Default colors based on league
  if (league === 'WNBA') {
    return { primary: '#E03A3E', secondary: '#53565A', gradient: 'linear-gradient(90deg, #E03A3E, #53565A)' }
  } else if (league === 'Custom') {
    return { primary: '#8B5CF6', secondary: '#A855F7', gradient: 'linear-gradient(90deg, #8B5CF6, #A855F7)' }
  } else {
    return { primary: '#1e293b', secondary: '#475569', gradient: 'linear-gradient(90deg, #1e293b, #475569)' }
  }
}

function TeamsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [teams, setTeams] = useState<TeamWithPlayers[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [league, setLeague] = useState<string>('')
  const [page, setPage] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Initialize from URL parameters
  useEffect(() => {
    const urlLeague = searchParams?.get('league') || ''
    setLeague(urlLeague)
    setPage(1)
    setIsInitialized(true)
  }, [searchParams])

  useEffect(() => {
    // Only fetch data after initialization
    if (!isInitialized) return

    // Debounce search to reduce API calls
    const timeoutId = setTimeout(() => {
      const fetchTeamsWithPlayers = async () => {
        setLoading(true)
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: '12', // Reduced from 20 to 12 for better performance
            ...(search && { search }),
            ...(league && { league }),
          })

          const response = await fetch(`/api/teams-with-players?${params}`)
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data: TeamsResponse = await response.json()
          const teamsWithPlayers = data.teams || []

          setTeams(teamsWithPlayers)
          setPagination(data.pagination || {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0
          })
        } catch (error) {
          console.error('Error fetching teams:', error)
          setTeams([])
          setPagination({
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0
          })
        } finally {
          setLoading(false)
        }
      }

      fetchTeamsWithPlayers()
    }, search ? 500 : 0) // 500ms debounce for search, immediate for other changes

    return () => clearTimeout(timeoutId)
  }, [page, search, league, isInitialized])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleLeagueChange = useCallback((value: string) => {
    const newLeague = value === 'all' ? '' : value
    setLeague(newLeague)
    setPage(1)
    
    // Update URL to reflect the league change
    const newUrl = newLeague ? `/teams?league=${newLeague}` : '/teams'
    router.push(newUrl)
  }, [router])

  // Use getTeamColors directly since it's already optimized
  
  const statsContent = useMemo(() => {
    if (league === 'Custom') {
      return (
        <>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-purple-600">{pagination?.total || 0}</div>
            <div className="text-gray-700 text-sm">Custom Teams</div>
          </motion.div>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-purple-600">⭐</div>
            <div className="text-gray-700 text-sm">Community Created</div>
          </motion.div>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-purple-600">🎨</div>
            <div className="text-gray-700 text-sm">Unique Designs</div>
          </motion.div>
        </>
      )
    } else if (league === 'NBA') {
      return (
        <>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">{pagination?.total || 0}</div>
            <div className="text-gray-700 text-sm">NBA Teams</div>
          </motion.div>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">🏀</div>
            <div className="text-gray-700 text-sm">Professional League</div>
          </motion.div>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">30</div>
            <div className="text-gray-700 text-sm">Total in League</div>
          </motion.div>
        </>
      )
    } else if (league === 'WNBA') {
      return (
        <>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">{pagination?.total || 0}</div>
            <div className="text-gray-700 text-sm">WNBA Teams</div>
          </motion.div>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">🏀</div>
            <div className="text-gray-700 text-sm">Women's League</div>
          </motion.div>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">13</div>
            <div className="text-gray-700 text-sm">Total in League</div>
          </motion.div>
        </>
      )
    } else {
      return (
        <>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">{pagination?.total || 0}</div>
            <div className="text-gray-700 text-sm">Total Teams</div>
          </motion.div>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">30</div>
            <div className="text-gray-700 text-sm">NBA Teams</div>
          </motion.div>
          <motion.div variants={statsVariants} className="text-center">
            <div className="text-2xl font-bold text-kentucky-blue-600">13</div>
            <div className="text-gray-700 text-sm">WNBA Teams</div>
          </motion.div>
        </>
      )
    }
  }, [league, pagination?.total])

  // Only render after initialization to prevent race conditions
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kentucky-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Header Section */}
      <motion.section 
        className="relative min-h-[40vh] bg-white text-gray-900 flex items-center justify-center overflow-hidden border-b pt-32"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-kentucky-blue-600 to-kentucky-blue-800 bg-clip-text text-transparent">
              Team Directory
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 mt-2">
              {league === 'Custom' 
                ? 'Discover custom teams created by our community' 
                : 'Explore NBA and WNBA teams, their history, and current rosters'
              }
            </p>
            
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {statsContent}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Filters Section - Modern Style */}
      <motion.section 
        className="py-6 bg-gradient-to-r from-gray-50 to-white shadow-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {/* Filter Header */}
            <motion.div 
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-kentucky-blue-500 to-blue-600 p-2 rounded-xl">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Find Basketball Teams</h3>
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-700">
                <div>
                  🏆
                </div>
                <span className="font-medium">{pagination?.total || 0} teams available</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Search */}
              <motion.div 
                className="lg:col-span-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Teams</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-kentucky-blue-500 w-5 h-5" />
                  <Input
                    placeholder="Search by team name, city, or abbreviation..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-kentucky-blue-500 rounded-xl font-medium"
                  />
                </div>
              </motion.div>

              {/* League Filter */}
              <motion.div 
                className="lg:col-span-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">League</label>
                <Select value={league || 'all'} onValueChange={handleLeagueChange}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-kentucky-blue-500 rounded-xl font-medium">
                    <SelectValue placeholder="All Leagues" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="font-medium text-gray-900 hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <span>🏆</span>
                        All Leagues
                      </div>
                    </SelectItem>
                    <SelectItem value="NBA" className="font-medium text-gray-900 hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🏀</span>
                        NBA
                      </div>
                    </SelectItem>
                    <SelectItem value="WNBA" className="font-medium text-gray-900 hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">🏀</span>
                        WNBA
                      </div>
                    </SelectItem>
                    <SelectItem value="Custom" className="font-medium text-gray-900 hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600">⭐</span>
                        Custom Teams
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Teams Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-6">
                      <Skeleton className="h-8 w-3/4 mb-4" />
                      <Skeleton className="h-1 w-full mb-6" />
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div key={j} className="flex items-center gap-3">
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                key="teams"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {teams.map((team) => (
                  <motion.div
                    key={team.id}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        {/* Team Header */}
                        <div className="mb-4">
                          <Link href={`/teams/${team.id}`} className="hover:text-kentucky-blue-600 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                              <Image
                                src={
                                  team.logo_url && 
                                  !team.logo_url.includes('example.com') && 
                                  team.logo_url !== '' 
                                    ? team.logo_url 
                                    : '/placeholder-team.svg'
                                }
                                alt={`${team.name} logo`}
                                width={32}
                                height={32}
                                className="object-contain flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  if (target.src !== '/placeholder-team.svg') {
                                    target.src = '/placeholder-team.svg'
                                  }
                                }}
                              />
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                  {team.city} {team.name}
                                </h3>
                                <p className="text-xs text-gray-700 mt-1">Click for details</p>
                              </div>
                            </div>
                          </Link>
                          <div 
                            className="h-1 w-full rounded-full mb-4"
                            style={{
                              background: getTeamColors(team.name, team.league).gradient
                            }}
                          />
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={`${
                                  team.league === 'NBA' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : team.league === 'WNBA'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-violet-100 text-violet-800'
                                } font-semibold`}
                              >
                                {team.league}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {team.abbreviation}
                              </Badge>
                            </div>
                            {team.conference && team.conference !== team.league && (
                              <span className="text-sm text-gray-600 font-medium">
                                {team.conference} Conference
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Full Roster */}
                        {team.players && team.players.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                              Full Roster ({team.players.length} players)
                            </h4>
                            <div className="space-y-2">
                              {team.players.map((player) => (
                                <Link 
                                  key={player.id} 
                                  href={`/players/${player.id}`}
                                  className="block py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-bold text-gray-700 min-w-[1.5rem]">
                                        #{player.jersey_number}
                                      </span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {player.name}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-600 font-medium">
                                      {player.position}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                              Team Info
                            </h4>
                            <div className="py-3 px-3 rounded-lg bg-gray-50 border border-gray-200">
                              <div className="text-center text-gray-700">
                                No roster available
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!loading && pagination?.totalPages > 1 && (
            <motion.div 
              className="flex justify-center items-center gap-4 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination?.totalPages || 0) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(
                    (pagination?.totalPages || 0) - 4,
                    page - 2
                  )) + i
                  
                  if (pageNum > (pagination?.totalPages || 0)) return null
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={pageNum === page ? "bg-kentucky-blue-600 hover:bg-kentucky-blue-700" : ""}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setPage(Math.min(pagination?.totalPages || 0, page + 1))}
                disabled={page === (pagination?.totalPages || 0)}
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kentucky-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    }>
      <TeamsPageContent />
    </Suspense>
  )
}