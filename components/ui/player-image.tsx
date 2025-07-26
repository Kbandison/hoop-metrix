'use client'

import { useState } from 'react'

interface PlayerImageProps {
  playerId: string
  playerName: string
  league: string
  className?: string
  width?: number
  height?: number
}

export function PlayerImage({ 
  playerId, 
  playerName, 
  league, 
  className = "", 
  width, 
  height 
}: PlayerImageProps) {
  const [hasError, setHasError] = useState(false)
  
  const handleError = () => {
    setHasError(true)
  }
  
  const imageUrl = hasError 
    ? '/placeholder-player.png'
    : `https://cdn.${league.toLowerCase()}.com/headshots/${league.toLowerCase()}/latest/1040x760/${playerId}.png`
  
  const style = width && height ? { width, height } : {}
  
  return (
    <img
      src={imageUrl}
      alt={playerName}
      className={className}
      style={style}
      onError={handleError}
    />
  )
}