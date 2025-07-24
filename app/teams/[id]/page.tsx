'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Trophy, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Navigation from '@/components/layout/navigation'

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
  height?: string
  weight?: string
  photo_url?: string
  age?: number
  season_stats?: {
    pts: number
    reb: number
    ast: number
    fg_pct?: number
    ft_pct?: number
    three_pt_pct?: number
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
    y: 20
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true)
      try {
        // Fetch team details
        const teamResponse = await fetch(`/api/teams/${resolvedParams.id}`)
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeam(teamData)
        }

        // Fetch team players
        const playersResponse = await fetch(`/api/teams/${resolvedParams.id}/players`)
        if (playersResponse.ok) {
          const playersData = await playersResponse.json()
          setPlayers(playersData.players || [])
        }
      } catch (error) {
        console.error('Error fetching team data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8" style={{ marginTop: '8rem' }}>
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-6 w-2/3" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-8 w-32 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center" style={{ marginTop: '8rem' }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Team not found</h1>
          <Link href="/teams">
            <Button>Back to Teams</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <div 
        className="relative min-h-[65vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden pt-32 pb-16"
        style={{
          background: team.primary_color 
            ? `linear-gradient(135deg, ${team.primary_color}dd, ${team.secondary_color || team.primary_color}dd, #1e293bdd)`
            : undefined
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/basketball-pattern.svg')] bg-repeat opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link href="/teams">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams
              </Button>
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Team Logo */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            >
              <div className="relative h-80 lg:h-[400px] bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Image
                  src={team.logo_url}
                  alt={team.name}
                  width={240}
                  height={240}
                  className="object-contain filter drop-shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-team.svg'
                  }}
                  priority
                />
                
                {/* League Badge */}
                <motion.div 
                  className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <span className="text-white font-bold text-lg">
                    {team.league}
                  </span>
                </motion.div>

                {/* Championships */}
                {team.championships > 0 && (
                  <motion.div 
                    className="absolute bottom-6 right-6 bg-yellow-600/20 backdrop-blur-sm rounded-full p-3 border border-yellow-400/30"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      <span className="text-yellow-400 font-bold text-lg">{team.championships}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Team Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div>
                <motion.div 
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Badge 
                    className={`${
                      team.league === 'NBA' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white font-semibold px-3 py-1 text-sm`}
                  >
                    {team.league}
                  </Badge>
                  <Badge variant="outline" className="text-white border-white/30">
                    {team.abbreviation}
                  </Badge>
                </motion.div>

                <motion.h1 
                  className="text-4xl lg:text-6xl font-bold mb-4 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {team.city} {team.name}
                </motion.h1>

                <motion.div 
                  className="flex items-center gap-4 text-white/80 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {team.founded && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>Est. {team.founded}</span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Team Stats */}
              <motion.div 
                className="grid grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <span className="text-3xl font-bold">{team.championships}</span>
                  </div>
                  <p className="text-white/80 text-sm">Championships</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6 text-blue-400" />
                    <span className="text-3xl font-bold">{team.playoff_appearances}</span>
                  </div>
                  <p className="text-white/80 text-sm">Playoff Apps</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Current Roster</h2>
            <p className="text-gray-600 text-lg">Meet the players representing {team.city} {team.name}</p>
          </motion.div>
          
          {players.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  variants={cardVariants}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <Link href={`/players/${player.id}?from=team&teamId=${resolvedParams.id}`}>
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
                      {/* Player Photo */}
                      <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                        <Image
                          src={player.photo_url || '/placeholder-player.svg'}
                          alt={player.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-player.svg'
                          }}
                        />
                        
                        {/* Jersey Number Overlay */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">#{player.jersey_number}</span>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        {/* Player Info */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-kentucky-blue-600 transition-colors mb-2">
                            {player.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-sm">
                              {player.position}
                            </Badge>
                            {player.height && (
                              <span className="text-sm text-gray-500">
                                {player.height}
                              </span>
                            )}
                            {player.age && (
                              <span className="text-sm text-gray-500">
                                Age {player.age}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Player Stats */}
                        {player.season_stats && (
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{player.season_stats.pts}</div>
                              <div className="text-xs text-gray-500">PPG</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{player.season_stats.reb}</div>
                              <div className="text-xs text-gray-500">RPG</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{player.season_stats.ast}</div>
                              <div className="text-xs text-gray-500">APG</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No players available for this team.</p>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  )
}