'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Link as LinkIcon, 
  X, 
  FileImage,
  AlertCircle,
  Check,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PlayerHeadshotUploadProps {
  value: string
  onChange: (value: string) => void
  playerId?: string
}

export default function PlayerHeadshotUpload({ value, onChange, playerId = 'preview' }: PlayerHeadshotUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  // Upload file and get URL
  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)

      // In a real app, you'd upload to your server or cloud storage
      // For demo purposes, we'll create a local blob URL
      const imageUrl = URL.createObjectURL(file)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onChange(imageUrl)
      setUrlInput(imageUrl)
      
      // In production, you'd do something like:
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData
      // })
      // const data = await response.json()
      // onChange(data.url)
      
    } catch (error) {
      setUploadError('Failed to upload headshot. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Handle URL input
  const handleUrlChange = (url: string) => {
    setUrlInput(url)
    onChange(url)
    setUploadError(null)
  }

  // Clear image
  const handleClear = () => {
    onChange('')
    setUrlInput('')
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Validate URL format
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Player Headshot</Label>
      
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        {/* URL Input Tab */}
        <TabsContent value="url" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="photo-url" className="text-sm">Headshot URL</Label>
            <div className="flex gap-2">
              <Input
                id="photo-url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/player-photo.jpg"
                className={`flex-1 ${
                  urlInput && !isValidUrl(urlInput) 
                    ? 'border-red-300 focus:border-red-500' 
                    : ''
                }`}
              />
              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {urlInput && !isValidUrl(urlInput) && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Please enter a valid URL
              </p>
            )}
          </div>
        </TabsContent>

        {/* File Upload Tab */}
        <TabsContent value="upload" className="space-y-3">
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive
                ? 'border-kentucky-blue-500 bg-kentucky-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />

            <div className="flex flex-col items-center gap-3 text-center">
              <AnimatePresence mode="wait">
                {uploading ? (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kentucky-blue-600"></div>
                    <p className="text-sm text-gray-600">Uploading headshot...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload-prompt"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`p-3 rounded-full ${
                      dragActive ? 'bg-kentucky-blue-100' : 'bg-gray-100'
                    }`}>
                      <User className={`h-6 w-6 ${
                        dragActive ? 'text-kentucky-blue-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {dragActive ? 'Drop player headshot here' : 'Click to upload headshot or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB (Portrait photos work best)
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-600 text-sm"
            >
              <AlertCircle className="h-4 w-4" />
              {uploadError}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Headshot Preview */}
      {value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <Label className="text-sm font-medium">Headshot Preview</Label>
          <div className="relative h-32 w-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border mx-auto">
            <img
              src={value}
              alt="Player headshot preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-xs font-medium">Failed to load</div>'
                }
              }}
            />
            <div className="absolute top-2 right-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {isValidUrl(value) && (
            <div className="flex items-center justify-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              Valid headshot URL
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}