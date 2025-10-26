"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Loader2, X } from "lucide-react"
import { useAudioRecorder } from "@/lib/use-audio-recorder"
import { toast } from "sonner"

interface AudioRecorderButtonProps {
  onTranscription: (text: string) => void
  className?: string
}

export function AudioRecorderButton({ onTranscription, className = "" }: AudioRecorderButtonProps) {
  const {
    recordingState,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  } = useAudioRecorder()

  const [isTranscribing, setIsTranscribing] = useState(false)

  const handleClick = async () => {
    if (recordingState === "idle") {
      await startRecording()
    } else if (recordingState === "recording") {
      const audioBlob = await stopRecording()
      
      if (audioBlob) {
        setIsTranscribing(true)
        
        try {
          // Enviar áudio para transcrição
          const formData = new FormData()
          formData.append("audio", audioBlob, "recording.webm")

          const response = await fetch("/api/transcribe-audio", {
            method: "POST",
            body: formData,
          })

          const data = await response.json()

          if (data.success && data.data.transcription) {
            onTranscription(data.data.transcription)
            toast.success("Áudio transcrito com sucesso!")
          } else if (data.fallback) {
            // Serviço indisponível - permitir digitação manual
            toast.error("Transcrição de áudio temporariamente indisponível. Digite sua mensagem.")
          } else {
            toast.error(data.error || "Erro ao transcrever áudio")
          }
        } catch (err) {
          console.error("Erro ao transcrever:", err)
          toast.error("Erro ao processar áudio. Tente novamente.")
        } finally {
          setIsTranscribing(false)
        }
      }
    }
  }

  const handleCancel = () => {
    cancelRecording()
    toast.info("Gravação cancelada")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isRecording = recordingState === "recording"
  const isProcessing = recordingState === "processing" || isTranscribing

  return (
    <div className={`relative ${className}`}>
      {/* Indicador de gravação */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white border-2 border-theo-purple rounded-2xl shadow-theo-lg px-4 py-3 flex items-center gap-3 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {/* Onda de áudio animada */}
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-theo-purple rounded-full"
                  animate={{
                    height: ["8px", "16px", "8px"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Tempo de gravação */}
            <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
              {formatTime(recordingTime)}
            </span>

            {/* Botão cancelar */}
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cancelar gravação"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão de microfone */}
      <motion.button
        onClick={handleClick}
        disabled={isProcessing}
        className={`relative p-2 rounded-lg transition-all ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 text-white"
            : isProcessing
            ? "bg-gray-300 cursor-not-allowed"
            : "text-theo-purple hover:bg-theo-lavanda"
        }`}
        whileTap={!isProcessing ? { scale: 0.95 } : {}}
        aria-label={
          isRecording
            ? "Parar gravação"
            : isProcessing
            ? "Processando..."
            : "Gravar áudio"
        }
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <MicOff className="h-5 w-5" />
          </motion.div>
        ) : (
          <Mic className="h-5 w-5" />
        )}

        {/* Pulso de gravação */}
        {isRecording && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-red-500"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.button>

      {/* Mensagem de erro */}
      {error && (
        <motion.div
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm text-red-700 whitespace-nowrap z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

