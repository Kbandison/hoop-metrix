'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Edit,
  Trash2,
  User,
  Search,
  Filter,
  Loader2,
  Save,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import PlayerHeadshotUpload from '@/components/admin/player-headshot-upload'

interface Player {
  id: string
  name: string
  team_id: string
  league: string
  position?: string
  jersey_number?: number
  height?: string
  weight?: string
  birth_date?: string
  photo_url?: string
  bio?: string
  season_stats?: any
  career_stats?: any
  is_active: boolean
  teams: {
    id: string
    name: string
    city: string
    league: string
    abbreviation: string
  }
  created_at?: string
  updated_at?: string
}

interface Team {
  id: string
  name: string
  city: string
  abbreviation: string
  league: string
}

interface PlayerManagerProps {
  onRefresh?: () => void
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ onRefresh }) => {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    team_id: '',
    league: 'Custom',
    position: '',
    jersey_number: '',
    height: '',
    weight: '',
    birth_date: '',
    photo_url: '',
    bio: ''
  })

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/players')
      const data = await response.json()
      
      if (data.success) {
        setPlayers(data.players)
      } else {
        console.error('Failed to fetch players:', data.error)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/admin/teams')
      const data = await response.json()
      
      if (data.success) {
        setTeams(data.teams)
      } else {
        console.error('Failed to fetch teams:', data.error)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  useEffect(() => {
    fetchPlayers()
    fetchTeams()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const payload = {
        ...formData,
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
        birth_date: formData.birth_date || null
      }

      let response
      if (editingPlayer) {
        response = await fetch('/api/admin/players', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPlayer.id, ...payload })
        })
      } else {
        response = await fetch('/api/admin/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const data = await response.json()
      
      if (data.success) {
        await fetchPlayers()
        onRefresh?.()
        setIsDialogOpen(false)
        resetForm()
      } else {
        console.error('Failed to save player:', data.error)
      }
    } catch (error) {
      console.error('Error saving player:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/players?id=${playerId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchPlayers()
        onRefresh?.()
      } else {
        console.error('Failed to delete player:', data.error)
      }
    } catch (error) {
      console.error('Error deleting player:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      team_id: '',
      league: 'Custom',
      position: '',
      jersey_number: '',
      height: '',
      weight: '',
      birth_date: '',
      photo_url: '',
      bio: ''
    })
    setEditingPlayer(null)
  }

  const openEditDialog = (player: Player) => {
    setEditingPlayer(player)
    setFormData({
      name: player.name,
      team_id: player.team_id,
      league: player.league,
      position: player.position || '',
      jersey_number: player.jersey_number?.toString() || '',
      height: player.height || '',
      weight: player.weight || '',
      birth_date: player.birth_date || '',
      photo_url: player.photo_url || '',
      bio: player.bio || ''
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase()) ||
                         player.teams.name.toLowerCase().includes(search.toLowerCase()) ||
                         player.teams.city.toLowerCase().includes(search.toLowerCase())
    const matchesLeague = leagueFilter === 'all' || player.league === leagueFilter
    const matchesTeam = teamFilter === 'all' || player.team_id === teamFilter
    // Only show players from custom teams (team IDs starting with 'custom_')
    const isFromCustomTeam = player.team_id.startsWith('custom_')
    return matchesSearch && matchesLeague && matchesTeam && isFromCustomTeam
  })

  const getLeagueBadgeColor = (league: string) => {
    switch (league) {
      case 'NBA':
        return 'bg-blue-100 text-blue-800'
      case 'WNBA':
        return 'bg-purple-100 text-purple-800'
      case 'Custom':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'G':
        return 'bg-orange-100 text-orange-800'
      case 'F':
        return 'bg-green-100 text-green-800'
      case 'C':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-kentucky-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Custom Player Management</h2>
          <p className="text-gray-600">Create and manage players for custom teams only</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openCreateDialog}
              className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlayer ? 'Edit Player' : 'Create New Player'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Player Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="LeBron James"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="team_id">Team *</Label>
                  <Select value={formData.team_id} onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(team => team.id.startsWith('custom_')).map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.city} {team.name} ({team.league})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="league">League *</Label>
                  <Input
                    id="league"
                    value="Custom"
                    readOnly
                    className="bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Custom players are automatically assigned to the Custom league</p>
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="G">Guard (G)</SelectItem>
                      <SelectItem value="F">Forward (F)</SelectItem>
                      <SelectItem value="C">Center (C)</SelectItem>
                      <SelectItem value="G-F">Guard-Forward</SelectItem>
                      <SelectItem value="F-C">Forward-Center</SelectItem>
                      <SelectItem value="F-G">Forward-Guard</SelectItem>
                      <SelectItem value="C-F">Center-Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jersey_number">Jersey Number</Label>
                  <Input
                    id="jersey_number"
                    type="number"
                    value={formData.jersey_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, jersey_number: e.target.value }))}
                    placeholder="23"
                    min="0"
                    max="99"
                  />
                </div>
              </div>

              {/* Physical Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="6-8"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="250 lbs"
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Media */}
              <div>
                <PlayerHeadshotUpload
                  value={formData.photo_url}
                  onChange={(value) => setFormData(prev => ({ ...prev, photo_url: value }))}
                  playerId={editingPlayer?.id || 'new-player'}
                />
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Player biography and career highlights..."
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingPlayer ? 'Update Player' : 'Create Player'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={leagueFilter} onValueChange={setLeagueFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Custom Players</SelectItem>
            <SelectItem value="Custom">Custom League</SelectItem>
          </SelectContent>
        </Select>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-[200px]">
            <Users className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Custom Teams</SelectItem>
            {teams.filter(team => team.id.startsWith('custom_')).map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.city} {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredPlayers.map((player) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {player.photo_url && (
                        <img
                          src={player.photo_url}
                          alt={`${player.name} photo`}
                          className="w-12 h-12 object-cover rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg text-gray-900">{player.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {player.teams.city} {player.teams.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getLeagueBadgeColor(player.league)}>
                        {player.league}
                      </Badge>
                      {player.jersey_number && (
                        <Badge variant="outline" className="text-xs">
                          #{player.jersey_number}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Player Details */}
                  <div className="space-y-2">
                    {player.position && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Position:</span>
                        <Badge className={getPositionColor(player.position)} variant="outline">
                          {player.position}
                        </Badge>
                      </div>
                    )}
                    {player.height && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Height:</span>
                        <span className="font-medium text-gray-900">{player.height}</span>
                      </div>
                    )}
                    {player.weight && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium text-gray-900">{player.weight}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(player)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Player</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {player.name}? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(player.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Player
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No players found matching your criteria</p>
        </div>
      )}
    </div>
  )
}

export default PlayerManager