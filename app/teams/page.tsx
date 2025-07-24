'use client'

import { useState, useEffect } from 'react'
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
  founded: number | null
  championships: number
  playoff_appearances: number
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

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithPlayers[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [league, setLeague] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    const fetchTeamsWithPlayers = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(search && { search }),
          ...(league && { league }),
        })

        const response = await fetch(`/api/teams?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: TeamsResponse = await response.json()
        const teamsData = data.teams || []

        // Fetch players for each team
        const teamsWithPlayers = await Promise.all(
          teamsData.map(async (team) => {
            try {
              const playersResponse = await fetch(`/api/teams/${team.id}/players`)
              if (playersResponse.ok) {
                const playersData = await playersResponse.json()
                return { ...team, players: playersData.players || [] }
              }
              return { ...team, players: [] }
            } catch (error) {
              console.error(`Error fetching players for team ${team.id}:`, error)
              return { ...team, players: [] }
            }
          })
        )

        setTeams(teamsWithPlayers)
        setPagination(data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        })
      } catch (error) {
        console.error('Error fetching teams:', error)
        setTeams([])
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

    fetchTeamsWithPlayers()
  }, [page, search, league])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleLeagueChange = (value: string) => {
    setLeague(value === 'all' ? '' : value)
    setPage(1)
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
              Explore NBA and WNBA teams, their history, and current rosters
            </p>
            
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={statsVariants} className="text-center">
                <div className="text-2xl font-bold text-kentucky-blue-600">{pagination?.total || 0}</div>
                <div className="text-gray-500 text-sm">Total Teams</div>
              </motion.div>
              <motion.div variants={statsVariants} className="text-center">
                <div className="text-2xl font-bold text-kentucky-blue-600">30</div>
                <div className="text-gray-500 text-sm">NBA Teams</div>
              </motion.div>
              <motion.div variants={statsVariants} className="text-center">
                <div className="text-2xl font-bold text-kentucky-blue-600">12</div>
                <div className="text-gray-500 text-sm">WNBA Teams</div>
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
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Find Basketball Teams</h3>
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆
                </motion.div>
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
                {Array.from({ length: 6 }).map((_, i) => (
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
                    className="group"
                  >
                    <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        {/* Team Header */}
                        <div className="mb-4">
                          <Link href={`/teams/${team.id}`} className="hover:text-kentucky-blue-600 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                              <Image
                                src={team.logo_url}
                                alt={`${team.name} logo`}
                                width={32}
                                height={32}
                                className="object-contain flex-shrink-0"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/placeholder-team.svg'
                                }}
                              />
                              <h3 className="text-2xl font-bold text-gray-900">
                                {team.city} {team.name}
                              </h3>
                            </div>
                          </Link>
                          <div 
                            className="h-1 w-full rounded-full mb-4"
                            style={{
                              background: team.primary_color 
                                ? `linear-gradient(90deg, ${team.primary_color}, ${team.secondary_color || team.primary_color})`
                                : 'linear-gradient(90deg, #1e293b, #475569)'
                            }}
                          />
                          <div className="flex items-center gap-2 mb-4">
                            <Badge 
                              variant="secondary" 
                              className={`${
                                team.league === 'NBA' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              } font-semibold`}
                            >
                              {team.league}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {team.abbreviation}
                            </Badge>
                            {team.championships > 0 && (
                              <div className="flex items-center gap-1 text-yellow-600">
                                <Trophy className="h-4 w-4" />
                                <span className="text-sm font-semibold">{team.championships}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Players List */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                            Current Roster
                          </h4>
                          {team.players && team.players.length > 0 ? (
                            team.players.map((player) => (
                              <Link 
                                key={player.id} 
                                href={`/players/${player.id}?from=teams`}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group/player"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-mono text-gray-500 w-8">
                                    #{player.jersey_number}
                                  </span>
                                  <span className="font-medium text-gray-900 group-hover/player:text-kentucky-blue-600 transition-colors">
                                    {player.name}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {player.position}
                                </Badge>
                              </Link>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm italic">No players available</p>
                          )}
                        </div>
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