"use client"

import { motion } from "framer-motion"
import { Video, VideoOff } from "lucide-react"

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>
  isStreaming: boolean
  isRecording?: boolean
  className?: string
}

export function VideoPreview({
  videoRef,
  isStreaming,
  isRecording = false,
  className = "",
}: VideoPreviewProps) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gray-900 ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]" // Mirror horizontally
        playsInline
        muted
      />

      {/* Overlay quando não está streamando */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white">
          <VideoOff className="h-12 w-12 mb-3 opacity-50" />
          <span className="text-sm opacity-70">Câmera desligada</span>
        </div>
      )}

      {/* Indicador de gravação */}
      {isRecording && isStreaming && (
        <motion.div
          className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-white"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span>GRAVANDO</span>
        </motion.div>
      )}

      {/* Status da câmera */}
      {isStreaming && !isRecording && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-theo-purple text-white px-3 py-1.5 rounded-full text-xs font-medium">
          <Video className="h-3 w-3" />
          <span>CÂMERA ATIVA</span>
        </div>
      )}

      {/* Border decorativo */}
      <div className="absolute inset-0 pointer-events-none border-2 border-theo-purple/30 rounded-2xl" />
    </div>
  )
}

