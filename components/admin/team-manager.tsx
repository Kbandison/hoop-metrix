'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Edit,
  Trash2,
  Users,
  Trophy,
  Calendar,
  MapPin,
  Search,
  Filter,
  Loader2,
  Save,
  X
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

interface Team {
  id: string
  name: string
  city: string
  abbreviation: string
  league: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  conference?: string
  division?: string
  founded?: number
  championships?: number
  playoff_appearances?: number
  player_count: number
  created_at?: string
  updated_at?: string
}

interface TeamManagerProps {
  onRefresh?: () => void
}

const TeamManager: React.FC<TeamManagerProps> = ({ onRefresh }) => {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    abbreviation: '',
    league: 'NBA',
    logo_url: '',
    primary_color: '',
    secondary_color: '',
    conference: '',
    division: ''
  })

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/teams')
      const data = await response.json()
      
      if (data.success) {
        setTeams(data.teams)
      } else {
        console.error('Failed to fetch teams:', data.error)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const payload = { ...formData }

      let response
      if (editingTeam) {
        response = await fetch('/api/admin/teams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTeam.id, ...payload })
        })
      } else {
        response = await fetch('/api/admin/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const data = await response.json()
      
      if (data.success) {
        await fetchTeams()
        onRefresh?.()
        setIsDialogOpen(false)
        resetForm()
      } else {
        console.error('Failed to save team:', data.error)
      }
    } catch (error) {
      console.error('Error saving team:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (teamId: string) => {
    try {
      const response = await fetch(`/api/admin/teams?id=${teamId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchTeams()
        onRefresh?.()
      } else {
        console.error('Failed to delete team:', data.error)
      }
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      abbreviation: '',
      league: 'NBA',
      logo_url: '',
      primary_color: '',
      secondary_color: '',
      conference: '',
      division: ''
    })
    setEditingTeam(null)
  }

  const openEditDialog = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      city: team.city,
      abbreviation: team.abbreviation,
      league: team.league,
      logo_url: team.logo_url || '',
      primary_color: team.primary_color || '',
      secondary_color: team.secondary_color || '',
      conference: team.conference || '',
      division: team.division || ''
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(search.toLowerCase()) ||
                         team.city.toLowerCase().includes(search.toLowerCase()) ||
                         team.abbreviation.toLowerCase().includes(search.toLowerCase())
    const matchesLeague = leagueFilter === 'all' || team.league === leagueFilter
    // Only show custom teams (teams with IDs starting with 'custom_')
    const isCustomTeam = team.id.startsWith('custom_')
    return matchesSearch && matchesLeague && isCustomTeam
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
          <h2 className="text-2xl font-bold text-gray-900">Custom Team Management</h2>
          <p className="text-gray-600">Create and manage custom teams (Official NBA/WNBA teams are read-only)</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openCreateDialog}
              className="bg-kentucky-blue-600 hover:bg-kentucky-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Team
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Lakers"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Los Angeles"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="abbreviation">Abbreviation *</Label>
                  <Input
                    id="abbreviation"
                    value={formData.abbreviation}
                    onChange={(e) => setFormData(prev => ({ ...prev, abbreviation: e.target.value.toUpperCase() }))}
                    placeholder="LAL"
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="league">League *</Label>
                  <Select value={formData.league} onValueChange={(value) => setFormData(prev => ({ ...prev, league: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NBA">NBA</SelectItem>
                      <SelectItem value="WNBA">WNBA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Visual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://yourdomain.com/logo.png (leave empty for default)"
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <Input
                    id="primary_color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#552583"
                  />
                </div>
                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <Input
                    id="secondary_color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="#FDB927"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="conference">Conference</Label>
                  <Input
                    id="conference"
                    value={formData.conference}
                    onChange={(e) => setFormData(prev => ({ ...prev, conference: e.target.value }))}
                    placeholder="Western"
                  />
                </div>
                <div>
                  <Label htmlFor="division">Division</Label>
                  <Input
                    id="division"
                    value={formData.division}
                    onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                    placeholder="Pacific"
                  />
                </div>
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
                      {editingTeam ? 'Update Team' : 'Create Team'}
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
            placeholder="Search teams..."
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
            <SelectItem value="all">All Custom Teams</SelectItem>
            <SelectItem value="NBA">Custom NBA</SelectItem>
            <SelectItem value="WNBA">Custom WNBA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTeams.map((team) => (
            <motion.div
              key={team.id}
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
                      {team.logo_url && (
                        <img
                          src={team.logo_url}
                          alt={`${team.name} logo`}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg text-gray-900">
                          {team.city} {team.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{team.abbreviation}</p>
                      </div>
                    </div>
                    <Badge className={getLeagueBadgeColor(team.league)}>
                      {team.league}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-kentucky-blue-600">
                        {team.player_count}
                      </div>
                      <div className="text-xs text-gray-500">Players</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-kentucky-blue-600">
                        {team.league}
                      </div>
                      <div className="text-xs text-gray-500">League</div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(team.conference || team.division) && (
                    <div className="text-sm text-gray-600">
                      {team.conference && team.division
                        ? `${team.conference} Conference, ${team.division} Division`
                        : team.conference || team.division
                      }
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(team)}
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
                          <AlertDialogTitle>Delete Team</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {team.city} {team.name}? 
                            This will also delete all {team.player_count} players on this team. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(team.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Team
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

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No teams found matching your criteria</p>
        </div>
      )}
    </div>
  )
}

export default TeamManager