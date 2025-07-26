'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, Users, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Navigation from '@/components/layout/navigation'
import Footer from '@/components/layout/footer'

interface Player {
  id: string
  name: string
  position: string
  jersey_number: number | null
  photo_url: string
  height: string | null
  weight: string | null
  teams: {
    id: string
    name: string
    abbreviation: string
    logo_url: string
    league: string
  }
  season_stats?: Record<string, any>
}

interface PlayersResponse {
  players: Player[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Team colors mapping (same as teams page)
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
  
  // Find team colors by partial name match
  const teamNameLower = teamName.toLowerCase()
  const teamKey = Object.keys(teamColors).find(key => {
    const keyLower = key.toLowerCase()
    return teamNameLower.includes(keyLower) || keyLower.includes(teamNameLower)
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
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -10,
    scale: 1.05,
    transition: {
      type: "spring" as const,
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

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [league, setLeague] = useState<string>('')
  const [position, setPosition] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchPlayers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(league && { league }),
        ...(position && { position }),
      })

      const response = await fetch(`/api/players?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: PlayersResponse = await response.json()

      setPlayers(data.players || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      })
    } catch (error) {
      console.error('Error fetching players:', error)
      setPlayers([])
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [page, search, league, position])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleLeagueChange = (value: string) => {
    setLeague(value === 'all' ? '' : value)
    setPage(1)
  }

  const handlePositionChange = (value: string) => {
    setPosition(value === 'all' ? '' : value)
    setPage(1)
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />
      
      {/* Header Section */}
      <motion.section 
        className="relative min-h-[60vh] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ marginTop: '-8rem' }}
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto mt-48"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-kentucky-blue-400 to-kentucky-blue-600 bg-clip-text text-transparent">
              Player Directory
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Discover comprehensive profiles of NBA and WNBA players
            </p>
            
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={statsVariants} className="text-center">
                <div className="text-3xl font-bold text-kentucky-blue-400">{pagination?.total || 0}</div>
                <div className="text-gray-400">Total Players</div>
              </motion.div>
              <motion.div variants={statsVariants} className="text-center">
                <div className="text-3xl font-bold text-kentucky-blue-400">30</div>
                <div className="text-gray-400">NBA Teams</div>
              </motion.div>
              <motion.div variants={statsVariants} className="text-center">
                <div className="text-3xl font-bold text-kentucky-blue-400">12</div>
                <div className="text-gray-400">WNBA Teams</div>
              </motion.div>
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Find Basketball Players</h3>
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏀
                </motion.div>
                <span className="font-medium">{pagination?.total || 0} players available</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* Search */}
              <motion.div 
                className="lg:col-span-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Players</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-kentucky-blue-500 w-5 h-5" />
                  <Input
                    placeholder="Search by name, team, position..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-kentucky-blue-500 rounded-xl font-medium"
                  />
                </div>
              </motion.div>

              {/* League Filter */}
              <motion.div 
                className="lg:col-span-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">League</label>
                <Select value={league || 'all'} onValueChange={handleLeagueChange}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-kentucky-blue-500 rounded-xl font-medium">
                    <SelectValue placeholder="All Leagues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>🏆</span>
                        All Leagues
                      </div>
                    </SelectItem>
                    <SelectItem value="NBA" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">🏀</span>
                        NBA
                      </div>
                    </SelectItem>
                    <SelectItem value="WNBA" className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600">🏀</span>
                        WNBA
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Position Filter */}
              <motion.div 
                className="lg:col-span-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
                <Select value={position || 'all'} onValueChange={handlePositionChange}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-kentucky-blue-500 rounded-xl font-medium">
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-medium">All Positions</SelectItem>
                    <SelectItem value="PG" className="font-medium">Point Guard</SelectItem>
                    <SelectItem value="SG" className="font-medium">Shooting Guard</SelectItem>
                    <SelectItem value="SF" className="font-medium">Small Forward</SelectItem>
                    <SelectItem value="PF" className="font-medium">Power Forward</SelectItem>
                    <SelectItem value="C" className="font-medium">Center</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Players Grid */}
      <section className="py-12 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Skeleton className="w-full h-80" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                key="players"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="group"
                  >
                    <Link href={`/players/${player.id}?from=players`}>
                      <Card className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-0">
                          {/* Player Image */}
                          <div 
                            className="relative h-80 overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${getTeamColors(player.teams.name, player.teams.league).primary}, ${getTeamColors(player.teams.name, player.teams.league).secondary})`
                            }}
                          >
                            <Image
                              src={player.photo_url}
                              alt={player.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/placeholder-player.svg'
                              }}
                            />
                            
                            {/* League Badge */}
                            <div className="absolute top-4 left-4">
                              <Badge 
                                variant="secondary" 
                                className={`${
                                  player.teams.league === 'NBA' 
                                    ? 'bg-nba-accent text-white' 
                                    : 'bg-wnba-accent text-white'
                                } font-semibold`}
                              >
                                {player.teams.league}
                              </Badge>
                            </div>

                            {/* Jersey Number */}
                            {player.jersey_number && (
                              <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {player.jersey_number}
                                </span>
                              </div>
                            )}

                            {/* Team Logo Overlay */}
                            <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                              <Image
                                src={player.teams.logo_url}
                                alt={player.teams.name}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                          </div>

                          {/* Player Info */}
                          <div className="p-6">
                            <h3 className="font-bold text-xl mb-2 group-hover:text-kentucky-blue-600 transition-colors">
                              {player.name}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <Image
                                src={player.teams.logo_url}
                                alt={player.teams.name}
                                width={20}
                                height={20}
                                className="object-contain"
                              />
                              <span className="text-sm font-medium text-gray-600">
                                {player.teams.abbreviation}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {player.position}
                              </Badge>
                            </div>

                            {/* Physical Stats */}
                            <div className="flex justify-between text-sm text-gray-500 mb-4">
                              {player.height && (
                                <div>
                                  <div className="font-medium">Height</div>
                                  <div>{player.height}</div>
                                </div>
                              )}
                              {player.weight && (
                                <div>
                                  <div className="font-medium">Weight</div>
                                  <div>{player.weight}</div>
                                </div>
                              )}
                            </div>

                            {/* Season Stats Preview */}
                            {player.season_stats && (
                              <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                                {player.season_stats.pts && (
                                  <div className="text-center">
                                    <div className="font-bold text-kentucky-blue-600">{player.season_stats.pts}</div>
                                    <div className="text-xs text-brand-grey-500">PPG</div>
                                  </div>
                                )}
                                {player.season_stats.reb && (
                                  <div className="text-center">
                                    <div className="font-bold text-brand-black-700">{player.season_stats.reb}</div>
                                    <div className="text-xs text-brand-grey-500">RPG</div>
                                  </div>
                                )}
                                {player.season_stats.ast && (
                                  <div className="text-center">
                                    <div className="font-bold text-brand-grey-600">{player.season_stats.ast}</div>
                                    <div className="text-xs text-brand-grey-500">APG</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
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