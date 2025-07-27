'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Ruler, Weight, Trophy, TrendingUp, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlayerImage } from '@/components/ui/player-image'

// Team colors mapping function
const getTeamColors = (teamName: string, league: string) => {
  const teamColors: Record<string, { primary: string; secondary: string }> = {
    // NBA Teams
    'Lakers': { primary: '#552583', secondary: '#FDB927' },
    'Warriors': { primary: '#1D428A', secondary: '#FFC72C' },
    'Celtics': { primary: '#007A33', secondary: '#BA9653' },
    'Bulls': { primary: '#CE1141', secondary: '#000000' },
    'Heat': { primary: '#98002E', secondary: '#F9A01B' },
    'Knicks': { primary: '#006BB6', secondary: '#F58426' },
    'Nets': { primary: '#000000', secondary: '#FFFFFF' },
    '76ers': { primary: '#006BB6', secondary: '#ED174C' },
    'Raptors': { primary: '#CE1141', secondary: '#000000' },
    'Bucks': { primary: '#00471B', secondary: '#EEE1C6' },
    'Cavaliers': { primary: '#860038', secondary: '#FDBB30' },
    'Pistons': { primary: '#C8102E', secondary: '#006BB6' },
    'Pacers': { primary: '#002D62', secondary: '#FDBB30' },
    'Hawks': { primary: '#E03A3E', secondary: '#C1D32F' },
    'Hornets': { primary: '#1D1160', secondary: '#00788C' },
    'Magic': { primary: '#0077C0', secondary: '#C4CED4' },
    'Wizards': { primary: '#002B5C', secondary: '#E31837' },
    'Mavericks': { primary: '#00538C', secondary: '#002F5F' },
    'Rockets': { primary: '#CE1141', secondary: '#000000' },
    'Grizzlies': { primary: '#5D76A9', secondary: '#12173F' },
    'Pelicans': { primary: '#0C2340', secondary: '#C8102E' },
    'Spurs': { primary: '#C4CED4', secondary: '#000000' },
    'Nuggets': { primary: '#0E2240', secondary: '#FEC524' },
    'Timberwolves': { primary: '#0C2340', secondary: '#236192' },
    'Thunder': { primary: '#007AC1', secondary: '#EF3B24' },
    'Trail Blazers': { primary: '#E03A3E', secondary: '#000000' },
    'Jazz': { primary: '#002B5C', secondary: '#00471B' },
    'Clippers': { primary: '#C8102E', secondary: '#1D428A' },
    'Kings': { primary: '#5A2D81', secondary: '#63727A' },
    'Suns': { primary: '#1D1160', secondary: '#E56020' },
    
    // WNBA Teams
    'Aces': { primary: '#C8102E', secondary: '#000000' },
    'Liberty': { primary: '#86CEBC', secondary: '#000000' },
    'Sky': { primary: '#418FDE', secondary: '#FDD023' },
    'Storm': { primary: '#2C5234', secondary: '#FE5000' },
    'Sun': { primary: '#E03A3E', secondary: '#F57C00' },
    'Dream': { primary: '#E03A3E', secondary: '#53565A' },
    'Fever': { primary: '#E03A3E', secondary: '#FDBB30' },
    'Lynx': { primary: '#236192', secondary: '#9EA2A2' },
    'Mercury': { primary: '#201747', secondary: '#E56020' },
    'Mystics': { primary: '#E03A3E', secondary: '#002B5C' },
    'Wings': { primary: '#C4CED4', secondary: '#002B5C' }
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
    return { primary: '#E03A3E', secondary: '#53565A' }
  } else {
    return { primary: '#1e293b', secondary: '#475569' }
  }
}

interface PlayerData {
  player: {
    id: string
    name: string
    position: string
    jersey_number: number | null
    height: string | null
    weight: string | null
    birth_date: string | null
    photo_url: string
    bio: string | null
    season_stats: Record<string, any> | null
    career_stats: Record<string, any> | null
    teams: {
      id: string
      name: string
      abbreviation: string
      city: string
      league: string
      logo_url: string
      primary_color: string | null
      secondary_color: string | null
    }
  }
  similarPlayers: Array<{
    id: string
    name: string
    photo_url: string
    position: string
    teams: {
      abbreviation: string
      logo_url: string
    }
  }>
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 100 }
  }
}

const statsVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, delay: 0.2 }
  }
}

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const [data, setData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)

  // Determine back navigation based on where user came from
  const getBackNavigation = () => {
    const from = searchParams.get('from')
    const teamId = searchParams.get('teamId')
    
    switch (from) {
      case 'team':
        return {
          href: teamId ? `/teams/${teamId}` : '/teams',
          label: teamId ? 'Back to Team' : 'Back to Teams'
        }
      case 'teams':
        return {
          href: '/teams',
          label: 'Back to Teams'
        }
      case 'home':
        return {
          href: '/',
          label: 'Back to Home'
        }
      case 'players':
      default:
        return {
          href: '/players',
          label: 'Back to Players'
        }
    }
  }

  const backNav = getBackNavigation()

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players/${resolvedParams.id}`)
        if (response.ok) {
          const playerData = await response.json()
          setData(playerData)
        }
      } catch (error) {
        console.error('Error fetching player:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-80 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Player Not Found</h1>
          <Link href="/players">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Players
            </Button>
          </Link>
          </div>
        </div>
      </div>
    )
  }

  const { player, similarPlayers } = data

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  return (
    <motion.div
      className="min-h-screen"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.5 }}
    >
      {/* Navigation */}
      
      {/* Hero Section */}
      <div 
        className="relative min-h-[65vh] text-white overflow-hidden pt-32 pb-16"
        style={{
          background: player.teams.primary_color 
            ? `linear-gradient(135deg, ${player.teams.primary_color}, ${player.teams.secondary_color || player.teams.primary_color}, #1e293b)`
            : `linear-gradient(135deg, ${getTeamColors(player.teams.name, player.teams.league).primary}, ${getTeamColors(player.teams.name, player.teams.league).secondary}, #1e293b)`
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
            className="mb-6"
          >
            <Link href={backNav.href}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backNav.label}
              </Button>
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Player Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" as const, stiffness: 100 }}
            >
              <div 
                className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20"
                style={{
                  background: player.teams.primary_color 
                    ? `linear-gradient(135deg, ${player.teams.primary_color}88, ${player.teams.secondary_color || player.teams.primary_color}88)`
                    : `linear-gradient(135deg, ${getTeamColors(player.teams.name, player.teams.league).primary}88, ${getTeamColors(player.teams.name, player.teams.league).secondary}88)`
                }}
              >
                <PlayerImage
                  playerId={player.id}
                  playerName={player.name}
                  league={player.teams.league}
                  className="object-cover w-full h-full"
                />
                
                {/* Jersey Number Overlay */}
                {player.jersey_number && (
                  <motion.div 
                    className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border-2 border-white/30"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring" as const }}
                  >
                    <span className="text-white font-bold text-2xl">
                      {player.jersey_number}
                    </span>
                  </motion.div>
                )}

                {/* Team Logo */}
                <motion.div 
                  className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" as const }}
                >
                  <Image
                    src={player.teams.logo_url}
                    alt={player.teams.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Player Info */}
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
                      player.teams.league === 'NBA' 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    } text-white font-semibold px-3 py-1`}
                  >
                    {player.teams.league}
                  </Badge>
                  <Badge variant="outline" className="border-white/50 text-white bg-white/10">
                    {player.position}
                  </Badge>
                </motion.div>

                <motion.h1 
                  className="text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {player.name}
                </motion.h1>

                <motion.div 
                  className="flex items-center gap-3 text-xl text-gray-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Image
                    src={player.teams.logo_url}
                    alt={player.teams.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span className="font-semibold">{player.teams.city} {player.teams.name}</span>
                </motion.div>
              </div>

              {/* Quick Stats */}
              <motion.div 
                className="grid grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {player.height && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Ruler className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-300">Height</span>
                    </div>
                    <div className="text-2xl font-bold">{player.height}</div>
                  </div>
                )}
                
                {player.weight && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Weight className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-300">Weight</span>
                    </div>
                    <div className="text-2xl font-bold">{player.weight}</div>
                  </div>
                )}
                
                {player.birth_date && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-300">Age</span>
                    </div>
                    <div className="text-2xl font-bold">{getAge(player.birth_date)}</div>
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-300" />
                    <span className="text-sm text-gray-300">Team</span>
                  </div>
                  <div className="text-lg font-bold">{player.teams.abbreviation}</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gradient-to-br from-slate-50 to-white text-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="stats" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="bio">Biography</TabsTrigger>
                <TabsTrigger value="career">Career</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent key="stats" value="stats" className="space-y-6">
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-kentucky-blue-600" />
                          Season Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {player.season_stats ? (
                          <motion.div 
                            className="grid grid-cols-2 md:grid-cols-4 gap-6"
                            variants={statsVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {Object.entries(player.season_stats).map(([key, value]) => (
                              <div key={key} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                                <div className="text-2xl font-bold text-kentucky-blue-600 mb-1">
                                  {typeof value === 'number' ? value.toFixed(1) : value}
                                </div>
                                <div className="text-sm text-gray-600 uppercase tracking-wider">
                                  {key.replace(/_/g, ' ')}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        ) : (
                          <p className="text-gray-700 text-center py-8">
                            No season statistics available
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent key="bio" value="bio" className="space-y-6">
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Biography</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {player.bio ? (
                          <p className="text-gray-700 leading-relaxed">{player.bio}</p>
                        ) : (
                          <p className="text-gray-700 text-center py-8">
                            No biography available
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent key="career" value="career" className="space-y-6">
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-orange-500" />
                          Career Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {player.career_stats ? (
                          <motion.div 
                            className="grid grid-cols-2 md:grid-cols-4 gap-6"
                            variants={statsVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            {Object.entries(player.career_stats).map(([key, value]) => (
                              <div key={key} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                  {typeof value === 'number' ? value.toFixed(1) : value}
                                </div>
                                <div className="text-sm text-gray-600 uppercase tracking-wider">
                                  {key.replace(/_/g, ' ')}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        ) : (
                          <p className="text-gray-700 text-center py-8">
                            No career statistics available
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image
                      src={player.teams.logo_url}
                      alt={player.teams.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    Team Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-700 mb-1">Full Name</div>
                    <div className="font-semibold">{player.teams.city} {player.teams.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 mb-1">League</div>
                    <Badge className={
                      player.teams.league === 'NBA' 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    }>
                      {player.teams.league}
                    </Badge>
                  </div>
                  {player.birth_date && (
                    <div>
                      <div className="text-sm text-gray-700 mb-1">Birth Date</div>
                      <div className="font-semibold">{formatDate(player.birth_date)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Similar Players */}
            {similarPlayers.length > 0 && (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      Similar Players
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {similarPlayers.slice(0, 4).map((similarPlayer) => (
                      <Link key={similarPlayer.id} href={`/players/${similarPlayer.id}`}>
                        <motion.div 
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <PlayerImage
                              playerId={similarPlayer.id}
                              playerName={similarPlayer.name}
                              league={player.teams.league}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{similarPlayer.name}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-700">
                              <Image
                                src={similarPlayer.teams.logo_url}
                                alt="team logo"
                                width={14}
                                height={14}
                                className="object-contain"
                              />
                              <span>{similarPlayer.teams.abbreviation}</span>
                              <span>•</span>
                              <span>{similarPlayer.position}</span>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  )
}