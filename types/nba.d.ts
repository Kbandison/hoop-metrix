declare module 'nba' {
  interface PlayerStats {
    [key: string]: any
  }

  interface Team {
    teamId: number
    abbreviation: string
    teamName: string
    simpleName: string
    location: string
    [key: string]: any
  }

  interface Player {
    playerId: number
    firstName: string
    lastName: string
    playerSlug: string
    teamId: number
    jersey: string
    position: string
    height: string
    weight: string
    birthDate: string
    experience: string
    college: string
    [key: string]: any
  }

  interface NBAData {
    teams(): Promise<Team[]>
    players(teamId?: number): Promise<Player[]>
    playerProfile(playerId: number): Promise<any>
    playerStats(playerId: number): Promise<PlayerStats>
  }

  const nba: {
    data: NBAData
    teams: Team[]
    players: Player[]
    getCurrentSeason(): number
  }

  export = nba
}