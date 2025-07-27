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
import { PlayerImage } from '@/components/ui/player-image'

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
  founded?: number | null
  championships?: number
  playoff_appearances?: number
  arena?: string
  location?: string
  website?: string
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
    three_pct?: number
  } | null
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
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
}

// Team colors mapping (same as teams listing page)
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
  } else {
    return { primary: '#1e293b', secondary: '#475569', gradient: 'linear-gradient(90deg, #1e293b, #475569)' }
  }
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
    
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
      
      {/* Hero Section */}
      <div 
        className="relative min-h-[65vh] text-white overflow-hidden pt-32 pb-16"
        style={{
          background: `linear-gradient(135deg, ${getTeamColors(team.name, team.league).primary}dd, ${getTeamColors(team.name, team.league).secondary}dd, #1e293bdd)`
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
              transition={{ delay: 0.2, type: "spring" as const, stiffness: 100 }}
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
                  transition={{ delay: 0.5, type: "spring" as const }}
                >
                  <span className="text-white font-bold text-lg">
                    {team.league}
                  </span>
                </motion.div>

                {/* Championships */}
                {team.championships && team.championships > 0 && (
                  <motion.div 
                    className="absolute bottom-6 right-6 bg-yellow-600/20 backdrop-blur-sm rounded-full p-3 border border-yellow-400/30"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" as const }}
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
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-2xl font-bold">{team.championships || 0}</span>
                  </div>
                  <p className="text-white/80 text-xs">Championships</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-2xl font-bold">{team.playoff_appearances || 0}</span>
                  </div>
                  <p className="text-white/80 text-xs">Playoff Apps</p>
                </div>
              </motion.div>
              
              {/* Additional Team Info */}
              <motion.div 
                className="space-y-3 mt-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {team.division && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Division:</span>
                      <span className="text-white font-medium text-sm">{team.division}</span>
                    </div>
                  </div>
                )}
                
                {team.arena && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Arena:</span>
                      <span className="text-white font-medium text-sm">{team.arena}</span>
                    </div>
                  </div>
                )}
                
                {team.location && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Location:</span>
                      <span className="text-white font-medium text-sm">{team.location}</span>
                    </div>
                  </div>
                )}
                
                {team.website && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Website:</span>
                      <a 
                        href={team.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200 font-medium text-sm underline"
                      >
                        Official Site
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Players Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white text-gray-900">
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
                      <div 
                        className="relative h-64 overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${getTeamColors(team.name, team.league).primary}, ${getTeamColors(team.name, team.league).secondary})`
                        }}
                      >
                        <PlayerImage
                          playerId={player.id}
                          playerName={player.name}
                          league={team?.league || 'NBA'}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
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
                              <span className="text-sm text-gray-700">
                                {player.height}
                              </span>
                            )}
                            {player.age && (
                              <span className="text-sm text-gray-700">
                                Age {player.age}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Player Stats */}
                        {player.season_stats && (
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{player.season_stats.pts?.toFixed(1) || '0.0'}</div>
                              <div className="text-xs text-gray-700">PPG</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{player.season_stats.reb?.toFixed(1) || '0.0'}</div>
                              <div className="text-xs text-gray-700">RPG</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">{player.season_stats.ast?.toFixed(1) || '0.0'}</div>
                              <div className="text-xs text-gray-700">APG</div>
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
              <p className="text-gray-700 text-lg">No players available for this team.</p>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  )
}