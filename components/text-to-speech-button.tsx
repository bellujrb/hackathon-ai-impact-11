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
  const [useGoogleTTS, setUseGoogleTTS] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Parar áudio quando texto mudar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }, [text])

  const playWithGoogleTTS = async () => {
    try {
      setIsLoading(true)

      // Chamar API de Text-to-Speech
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (!data.success) {
        // Se Google TTS falhar, usar fallback
        if (data.fallback) {
          console.log("Google TTS indisponível, usando Web Speech API")
          setUseGoogleTTS(false)
          await playWithWebSpeech()
          return
        }
        throw new Error(data.error || "Erro ao gerar áudio")
      }

      // Criar áudio a partir do base64
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.data.audio), c => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      )
      const audioUrl = URL.createObjectURL(audioBlob)

      // Criar elemento de áudio
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => {
        setIsLoading(false)
        setIsPlaying(true)
      }

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlaying(false)
        setIsLoading(false)
        URL.revokeObjectURL(audioUrl)
        toast.error("Erro ao reproduzir áudio")
      }

      await audio.play()

    } catch (err) {
      console.error("Erro ao usar Google TTS:", err)
      setIsLoading(false)
      
      // Tentar fallback para Web Speech
      if (useGoogleTTS) {
        console.log("Tentando fallback para Web Speech API")
        setUseGoogleTTS(false)
        await playWithWebSpeech()
      } else {
        toast.error("Erro ao reproduzir áudio")
      }
    }
  }

  const playWithWebSpeech = async () => {
    try {
      setIsLoading(true)

      if (!window.speechSynthesis) {
        toast.error("Seu navegador não suporta síntese de voz")
        setIsLoading(false)
        return
      }

      // Cancelar qualquer fala anterior
      window.speechSynthesis.cancel()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Criar utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Tentar voz em português
      const voices = window.speechSynthesis.getVoices()
      const ptBRVoice = voices.find(
        voice => voice.lang === "pt-BR" || voice.lang.startsWith("pt")
      )
      
      if (ptBRVoice) {
        utterance.voice = ptBRVoice
      }

      utterance.lang = "pt-BR"
      utterance.rate = 0.95
      utterance.pitch = 1.05
      utterance.volume = 1

      utterance.onstart = () => {
        setIsLoading(false)
        setIsPlaying(true)
      }

      utterance.onend = () => {
        setIsPlaying(false)
      }

      utterance.onerror = (event) => {
        console.error("Erro Web Speech:", event)
        setIsPlaying(false)
        setIsLoading(false)
        
        if (event.error !== "canceled" && event.error !== "interrupted") {
          toast.error("Erro ao reproduzir áudio")
        }
      }

      window.speechSynthesis.speak(utterance)

      // Timeout de segurança
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          toast.error("Não foi possível iniciar a reprodução")
        }
      }, 2000)

    } catch (err) {
      console.error("Erro ao usar Web Speech:", err)
      setIsLoading(false)
      toast.error("Erro ao processar síntese de voz")
    }
  }

  const handleClick = async () => {
    // Se já está tocando, parar
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
      return
    }

    // Iniciar reprodução
    if (useGoogleTTS) {
      await playWithGoogleTTS()
    } else {
      await playWithWebSpeech()
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
