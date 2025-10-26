"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TextToSpeechButtonProps {
  text: string
  className?: string
}

export function TextToSpeechButton({ text, className = "" }: TextToSpeechButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const hasStartedRef = useRef(false)

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleClick = async () => {
    // Se já está falando, parar
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      hasStartedRef.current = false
      return
    }

    // Verificar suporte do navegador
    if (!window.speechSynthesis) {
      toast.error("Seu navegador não suporta síntese de voz")
      return
    }

    try {
      setIsLoading(true)

      // Cancelar qualquer fala anterior
      window.speechSynthesis.cancel()

      // Aguardar um pouco para garantir que cancelou
      await new Promise(resolve => setTimeout(resolve, 100))

      // Criar nova utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Configurar voz em português
      const voices = window.speechSynthesis.getVoices()
      const ptBRVoice = voices.find(
        voice => voice.lang === "pt-BR" || voice.lang.startsWith("pt")
      )
      
      if (ptBRVoice) {
        utterance.voice = ptBRVoice
      }

      // Configurações de voz
      utterance.lang = "pt-BR"
      utterance.rate = 0.95 // Velocidade natural
      utterance.pitch = 1.05 // Tom ligeiramente mais alto (amigável)
      utterance.volume = 1

      // Event listeners
      utterance.onstart = () => {
        setIsLoading(false)
        setIsPlaying(true)
        hasStartedRef.current = true
      }

      utterance.onend = () => {
        setIsPlaying(false)
        hasStartedRef.current = false
      }

      utterance.onerror = (event) => {
        console.error("Erro ao reproduzir áudio:", event)
        setIsPlaying(false)
        setIsLoading(false)
        hasStartedRef.current = false
        
        // Só mostrar erro se realmente foi um erro crítico
        if (event.error !== "canceled" && event.error !== "interrupted") {
          toast.error("Erro ao reproduzir áudio. Tente novamente.")
        }
      }

      // Iniciar síntese
      window.speechSynthesis.speak(utterance)

      // Fallback: se não começar em 2s, resetar
      setTimeout(() => {
        if (!hasStartedRef.current) {
          setIsLoading(false)
          toast.error("Não foi possível iniciar a reprodução")
        }
      }, 2000)

    } catch (err) {
      console.error("Erro ao sintetizar voz:", err)
      setIsLoading(false)
      setIsPlaying(false)
      toast.error("Erro ao processar síntese de voz")
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
        isPlaying
          ? "bg-theo-purple text-white"
          : "bg-theo-lavanda text-theo-purple hover:bg-theo-lavanda-dark"
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileTap={{ scale: isLoading ? 1 : 0.95 }}
      aria-label={isPlaying ? "Parar reprodução" : "Ouvir resposta"}
      title={isPlaying ? "Parar" : "Ouvir esta resposta"}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isPlaying ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <VolumeX className="h-3.5 w-3.5" />
        </motion.div>
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      <span>{isPlaying ? "Pausar" : "Ouvir"}</span>
    </motion.button>
  )
}

