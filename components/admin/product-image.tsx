'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'

interface ProductImageProps {
  src?: string
  alt: string
  productId: string
}

export default function ProductImage({ src, alt, productId }: ProductImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // If no src or has error, show placeholder
  if (!src || hasError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Package className="h-16 w-16 text-gray-400" />
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={handleError}
        onLoad={handleLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </>
  )
}