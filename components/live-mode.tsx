"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Mic, MicOff, Loader2 } from "lucide-react"
import { TheoLiveAvatar } from "./theo-live-avatar"
import { useVoiceConversation } from "@/lib/use-voice-conversation"
import { useEffect } from "react"

interface LiveModeProps {
  isOpen: boolean
  onClose: () => void
}

export function LiveMode({ isOpen, onClose }: LiveModeProps) {
  const {
    conversationState,
    messages,
    recordingTime,
    isTalking,
    startListening,
    stopListening,
    cancelListening,
    error,
  } = useVoiceConversation()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Limpar ao fechar
  useEffect(() => {
    if (!isOpen && conversationState === "listening") {
      cancelListening()
    }
  }, [isOpen, conversationState, cancelListening])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-gradient-to-br from-theo-purple/10 via-theo-lavanda-light to-theo-coral/10 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-4 md:inset-8 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-theo-lavanda-light">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-theo-purple animate-pulse" />
              <h2 className="text-xl font-bold text-gray-900">
                Modo Live com Theo
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
            {/* Avatar do Theo */}
            <motion.div
              className="mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TheoLiveAvatar isTalking={isTalking} size="xl" />
            </motion.div>

            {/* Status Indicator */}
            <motion.div
              className="mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {conversationState === "listening" && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <span className="text-lg font-medium text-gray-900">
                      Ouvindo você...
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}
              {conversationState === "processing" && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-theo-purple" />
                  <span className="text-lg font-medium text-gray-900">
                    Theo está pensando...
                  </span>
                </div>
              )}
              {conversationState === "speaking" && (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-theo-purple"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  <span className="text-lg font-medium text-gray-900">
                    Theo está falando...
                  </span>
                </div>
              )}
              {conversationState === "idle" && messages.length === 0 && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg font-medium text-gray-900">
                    Olá! Estou pronto para conversar.
                  </span>
                  <span className="text-sm text-gray-600">
                    Segure o botão abaixo e fale comigo
                  </span>
                </div>
              )}
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Conversation History */}
            <div className="w-full max-w-2xl space-y-4 flex-1 overflow-y-auto">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-theo-purple text-white"
                          : "bg-theo-lavanda text-gray-900"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <span
                        className={`text-xs mt-1 block ${
                          message.role === "user"
                            ? "text-white/70"
                            : "text-gray-600"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer - Push to Talk Button */}
          <div className="p-6 border-t border-gray-200 bg-theo-lavanda-light">
            <div className="flex justify-center">
              {conversationState === "listening" ? (
                <motion.button
                  onMouseUp={stopListening}
                  onTouchEnd={stopListening}
                  className="relative w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl flex items-center justify-center transition-all"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Solte para enviar"
                >
                  <MicOff className="h-10 w-10" />
                  
                  {/* Pulso animado */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  
                  <span className="absolute -bottom-8 text-sm font-medium text-gray-900">
                    Solte para enviar
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  onMouseDown={startListening}
                  onTouchStart={startListening}
                  disabled={
                    conversationState === "processing" ||
                    conversationState === "speaking"
                  }
                  className={`relative w-24 h-24 rounded-full shadow-2xl flex items-center justify-center transition-all ${
                    conversationState === "idle"
                      ? "bg-theo-purple hover:bg-theo-purple-dark text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  whileTap={conversationState === "idle" ? { scale: 0.95 } : {}}
                  aria-label="Segurar para falar"
                >
                  {conversationState === "processing" ||
                  conversationState === "speaking" ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : (
                    <Mic className="h-10 w-10" />
                  )}
                  
                  <span className="absolute -bottom-8 text-sm font-medium text-gray-900">
                    {conversationState === "idle"
                      ? "Segurar para falar"
                      : conversationState === "processing"
                      ? "Processando..."
                      : "Theo falando..."}
                  </span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

